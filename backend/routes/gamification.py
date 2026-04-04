from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from database import engine, RewardHistory, User
from lib.blockchain import vault_contract, w3, generate_claim_signature, PRIVATE_KEY, CHAIN_ID, account
import os
import secrets

router = APIRouter(prefix="/api/v1/gamification", tags=["gamification"])

def get_session():
    with Session(engine) as session:
        yield session

@router.get("/lootbox/{lootbox_id}/config")
def get_lootbox_config(lootbox_id: int):
    """
    Fetch lootbox prizes and costs from the contract.
    """
    if not vault_contract:
        raise HTTPException(status_code=500, detail="RewardVault not configured")
    
    try:
        config = vault_contract.functions.getLootboxConfig(lootbox_id).call()
        prizes = vault_contract.functions.getLootboxPrizes(lootbox_id).call()
        
        # PrizeType mapping from contract enum
        # NONE, NATIVE, ERC20, POINTS, BADGE
        prize_types = ["NONE", "NATIVE", "ERC20", "POINTS", "BADGE"]
        
        formatted_prizes = []
        for p in prizes:
            formatted_prizes.append({
                "type": prize_types[p[0]],
                "token_address": p[1],
                "amount": p[2],
                "weight_bps": p[3],
                "label": p[4],
                "active": p[5]
            })

        return {
            "id": lootbox_id,
            "name": config[0],
            "program_id": config[1],
            "points_cost": config[2],
            "native_cost": config[3],
            "cooldown": config[4],
            "max_spins": config[5],
            "prizes": formatted_prizes
        }
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Lootbox not found: {str(e)}")

@router.post("/spin/commit")
def commit_spin(wallet_address: str, lootbox_id: int, session: Session = Depends(get_session)):
    """
    Inititiate a lootbox spin by committing a salt hash.
    The backend generates a salt and submits the commit to RewardVault.
    """
    if not vault_contract or not PRIVATE_KEY:
        raise HTTPException(status_code=500, detail="RewardVault not configured")

    from lib.blockchain import w3
    wallet_address = w3.to_checksum_address(wallet_address)
    
    # 1. Check and spend points if necessary
    try:
        config = vault_contract.functions.getLootboxConfig(lootbox_id).call()
        points_cost = config[2] # in normal point units, e.g. 500

        if points_cost > 0:
            from sqlmodel import func
            # A. Check DB balance
            user_points = session.exec(
                select(func.sum(RewardHistory.amount))
                .where(RewardHistory.wallet_address == wallet_address, RewardHistory.reward_type == "points")
            ).one_or_none() or 0
            
            if user_points < points_cost:
                raise HTTPException(status_code=400, detail=f"Insufficient points. Need {points_cost}, have {user_points}")

            # B. Trigger on-chain burn
            from lib.blockchain import spend_points
            tx_burn = spend_points(wallet_address, points_cost, reason=f"Spin LBox #{lootbox_id}")
            if not tx_burn:
                raise HTTPException(status_code=500, detail="On-chain point burn failed")

            # C. Record in DB
            from lib.blockchain import sign_reward_certificate
            spend = RewardHistory(
                wallet_address=wallet_address,
                program_id=config[1],
                reward_type="points",
                amount=-points_cost,
                reason=f"Spin Wheel Cost (LBox #{lootbox_id})",
                tx_hash=tx_burn,
                status="spent",
                certificate_json=sign_reward_certificate(wallet_address, -points_cost, f"Spent for Spin #{lootbox_id}", config[1])
            )
            session.add(spend)
            session.commit()
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        print(f"[gamification] Cost verification failed: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Cost verification failed: {str(e)}")

    # 2. Generate salt and commitment
    # commitment = keccak256(abi.encodePacked(salt, wallet))
    salt = secrets.token_bytes(32)
    wallet_checksum = w3.to_checksum_address(wallet_address)
    commitment = w3.solidity_keccak(['bytes32', 'address'], [salt, wallet_checksum])
    
    from lib.blockchain import tx_lock
    # 3. Call commitSpin on contract via operator role
    try:
        with tx_lock:
            nonce = w3.eth.get_transaction_count(account.address, 'pending')
            tx = vault_contract.functions.commitSpin(
                wallet_checksum,
                lootbox_id,
                commitment
            ).build_transaction({
                'chainId': CHAIN_ID,
                'gas': 300000,
                'gasPrice': w3.eth.gas_price,
                'nonce': nonce,
            })

            signed_tx = w3.eth.account.sign_transaction(tx, private_key=PRIVATE_KEY)
            tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)

        
        return {
            "status": "committed",
            "tx_hash": w3.to_hex(tx_hash),
            "salt": salt.hex(),
            "wallet": wallet_address
        }
    except Exception as e:
        print(f"[gamification] Commit transaction failed: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Commit failed: {str(e)}")

@router.post("/spin/reveal")
def reveal_spin(wallet_address: str, salt_hex: str):
    """
    Reveal the result of a committed spin after block delay.
    """
    if not vault_contract or not PRIVATE_KEY:
        raise HTTPException(status_code=500, detail="RewardVault not configured")

    try:
        salt = bytes.fromhex(salt_hex)
        from lib.blockchain import tx_lock
        with tx_lock:
            nonce = w3.eth.get_transaction_count(account.address, 'pending')
            
            # attestation_uid = 0 bytes
            tx = vault_contract.functions.revealSpin(
                w3.to_checksum_address(wallet_address),
                salt,
                b'\x00' * 32
            ).build_transaction({
                'chainId': CHAIN_ID,
                'gas': 400000,
                'gasPrice': w3.eth.gas_price,
                'nonce': nonce,
            })

            signed_tx = w3.eth.account.sign_transaction(tx, private_key=PRIVATE_KEY)
            tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
        
        # 1. Wait for receipt and parse event (Monad is fast!)
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        logs = vault_contract.events.SpinRevealed().process_receipt(receipt)
        
        prize_label = "Unknown Reward"
        if logs:
            event_data = logs[0].args
            prize_type_int = event_data.prizeType # 0:None, 3:Points, 4:Badge
            amount = event_data.amount
            prize_label = event_data.label
            
            # 2. Sync with database
            with Session(engine) as session:
                from lib.blockchain import sign_reward_certificate
                reward = RewardHistory(
                    wallet_address=wallet_address,
                    program_id="default",
                    reward_type="points" if prize_type_int == 3 else ("badge" if prize_type_int == 4 else "none"),
                    amount=amount,
                    reason=f"Spin Win: {prize_label}",
                    tx_hash=w3.to_hex(tx_hash),
                    certificate_json=sign_reward_certificate(wallet_address, amount, f"Win: {prize_label}", "default")
                )
                session.add(reward)
                session.commit()

        return {
            "status": "revealed",
            "tx_hash": w3.to_hex(tx_hash),
            "prize_label": prize_label,
            "wallet": wallet_address
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Reveal failed: {str(e)}")
