from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, func
from database import engine, RewardHistory, User
from lib.blockchain import vault_contract, w3, generate_claim_signature, PRIVATE_KEY, CHAIN_ID, account
import os
import secrets

router = APIRouter(prefix="/api/v1/gamification", tags=["gamification"])

def get_session():
    with Session(engine) as session:
        yield session

# Shadow Lootboxes for fallback if contract is not seeded
STATIC_LOOTBOXES = {
    1: {
        "id": 1,
        "name": "Genesis Lootbox",
        "program_id": "default",
        "points_cost": 500,
        "native_cost": 0,
        "cooldown": 60,
        "max_spins": 0,
        "prizes": [
            {"type": "POINTS", "amount": 250, "weight_bps": 4000, "label": "250 Pts", "active": True},
            {"type": "NONE", "amount": 0, "weight_bps": 3000, "label": "Try Again", "active": True},
            {"type": "BADGE", "amount": 1, "weight_bps": 2000, "label": "Rare Badge", "active": True},
            {"type": "POINTS", "amount": 1000, "weight_bps": 1000, "label": "1000 Pts", "active": True},
        ]
    }
}

# Coffee-specific rewards for Brewbound
COFFEE_LOOTBOXES = {
    1: {
        "id": 1,
        "name": "Barista's Choice Spin",
        "program_id": "brewbound",
        "points_cost": 50,
        "native_cost": 0,
        "cooldown": 60,
        "max_spins": 0,
        "prizes": [
            {"type": "BADGE", "amount": 100, "weight_bps": 2000, "label": "Free Double Espresso", "active": True},
            {"type": "BADGE", "amount": 101, "weight_bps": 3000, "label": "Choc-Chip Cookie", "active": True},
            {"type": "BADGE", "amount": 102, "weight_bps": 4000, "label": "10% Discount Code", "active": True},
            {"type": "POINTS", "amount": 1000, "weight_bps": 1000, "label": "1000 Pts Jackpot!", "active": True},
        ]
    }
}

@router.get("/lootboxes")
def list_lootboxes(program_id: str = "default"):
    """
    List available lootbox configurations (standard 1-3).
    """
    # Prefer program-specific static lootboxes for this demo
    if program_id == "brewbound":
        return [v for k, v in COFFEE_LOOTBOXES.items()]

    results = []
    # 1. Try contract
    for lb_id in [1, 2, 3]:
        try:
            config = get_lootbox_config(lb_id, program_id)
            results.append(config)
        except:
            continue
    
    # 2. If empty, use static shadow lootboxes
    if not results:
        results = [v for k, v in STATIC_LOOTBOXES.items()]
        
    return results

@router.get("/lootbox/{lootbox_id}/config")
def get_lootbox_config(lootbox_id: int, program_id: str = "default"):
    """
    Fetch lootbox prizes and costs from the contract, fallback to static.
    """
    if program_id == "brewbound" and lootbox_id in COFFEE_LOOTBOXES:
        return COFFEE_LOOTBOXES[lootbox_id]

    if vault_contract:
        try:
            config = vault_contract.functions.getLootboxConfig(lootbox_id).call()
            # ... process contract result
        except:
            pass

    # Fallback to static
    if lootbox_id in STATIC_LOOTBOXES:
        return STATIC_LOOTBOXES[lootbox_id]
        
    # Re-implemented contract fetch here to maintain existing logic if possible
    try:
        config = vault_contract.functions.getLootboxConfig(lootbox_id).call()
        prizes = vault_contract.functions.getLootboxPrizes(lootbox_id).call()
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
def commit_spin(wallet_address: str, lootbox_id: int, program_id: str = "default", session: Session = Depends(get_session)):
    """
    Inititiate a lootbox spin by committing a salt hash.
    Works for both on-chain and static 'shadow' lootboxes.
    """
    from lib.blockchain import w3
    wallet_address = w3.to_checksum_address(wallet_address)
    
    # 1. Fetch config (could be static or contract)
    try:
        config = get_lootbox_config(lootbox_id, program_id)
        points_cost = config.get("points_cost", 0)

        # Spend points from the UNIFIED global pool ('default')
        user_points = session.exec(
            select(func.sum(RewardHistory.amount))
            .where(RewardHistory.wallet_address == wallet_address, RewardHistory.program_id == "default", RewardHistory.reward_type == "points")
        ).one_or_none() or 0
        
        if user_points < points_cost:
            raise HTTPException(status_code=400, detail=f"Insufficient points. Need {points_cost}, have {user_points}")

        from lib.blockchain import sign_reward_certificate
        # Log point spend against unified pool
        spend = RewardHistory(
            wallet_address=wallet_address,
            program_id="default",
            reward_type="points",
            amount=-points_cost,
            reason=f"Spin Wheel Cost (LBox #{lootbox_id} @ {program_id})",
            status="spent",
            certificate_json=sign_reward_certificate(wallet_address, -points_cost, f"Spent for LBox #{lootbox_id}", "default")
        )
        session.add(spend)
        session.commit()
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        raise HTTPException(status_code=400, detail=f"Cost verification failed: {str(e)}")

    # 2. Return salt for client to track the spin
    salt = secrets.token_bytes(32)
    return {
        "status": "committed",
        "salt": salt.hex(),
        "wallet": wallet_address
    }

@router.post("/spin/reveal")
def reveal_spin(wallet_address: str, salt_hex: str, lootbox_id: int = 1, program_id: str = "default"):
    """
    Reveal the result of a committed spin.
    For static/coffee lootboxes, it picks a result pseudorandomly from the salt.
    """
    # 1. Fetch config
    config = get_lootbox_config(lootbox_id, program_id)
    prizes = config.get("prizes", [])
    
    # 2. Deterministically pick a prize using the salt
    import hashlib
    hash_val = int(hashlib.sha256(bytes.fromhex(salt_hex)).hexdigest(), 16)
    roll = hash_val % 10000 # 0-9999 bps
    
    cumulative_weight = 0
    selected_prize = prizes[0]
    for p in prizes:
        cumulative_weight += p.get("weight_bps", 0)
        if roll < cumulative_weight:
            selected_prize = p
            break
            
    # 3. Store the reward
    with Session(engine) as session:
        from lib.blockchain import sign_reward_certificate
        
        # Award Type mapping: points, badge, or item (voucher)
        reward_type = "points"
        if selected_prize["type"] == "ITEM":
            reward_type = "voucher"
        elif selected_prize["type"] == "BADGE":
            reward_type = "badge" # Changing this enables on-chain NFT claims
            
        voucher_code = f"BREW-{secrets.token_hex(3).upper()}" if (reward_type == "voucher" or "Espresso" in selected_prize["label"] or "Cookie" in selected_prize["label"] or "Discount" in selected_prize["label"]) else None
        reason = f"Spin Result: {selected_prize['label']}"
        if voucher_code:
            reason += f" (Code: {voucher_code})"

        reward = RewardHistory(
            wallet_address=wallet_address,
            program_id="default", # Unified program_id so it appears on all dashboards!
            reward_type=reward_type,
            amount=selected_prize.get("amount", 0),
            reason=reason,
            status="minted",
            certificate_json=sign_reward_certificate(wallet_address, selected_prize.get("amount", 0), reason, "default")
        )
        session.add(reward)
        session.commit()

    return {
        "status": "revealed",
        "prize_label": selected_prize["label"],
        "reward_type": reward_type,
        "voucher_code": voucher_code,
        "wallet": wallet_address
    }
