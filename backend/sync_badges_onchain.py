"""
sync_badges_onchain.py
======================
Registers all badge types from the local DB onto the LoyaltyBadge smart contract.

The on-chain nextBadgeTypeId starts at 1, so each badge type registered gets
a sequential ID (1, 2, 3...) from the contract. This script prints the mapping
so you know which on-chain ID to use when minting.

Usage:
    uv run python sync_badges_onchain.py
"""
import time
from sqlmodel import Session, select
from database import engine, BadgeType
from lib.blockchain import badge_contract, w3, account, PRIVATE_KEY, CHAIN_ID, tx_lock

def register_badge_type_onchain(badge: BadgeType) -> int | None:
    """
    Calls registerBadgeType on the LoyaltyBadge contract and returns the
    new on-chain badge type ID (the emitted event value / nextBadgeTypeId - 1).
    """
    fn = badge_contract.functions.registerBadgeType(
        badge.name,
        badge.description,
        badge.metadata_uri or f"https://chainloyalty.app/badges/{badge.id}",
        badge.max_supply,   # 0 = unlimited
        badge.transferable,
        badge.program_id,
    )

    with tx_lock:
        nonce = w3.eth.get_transaction_count(account.address, "pending")
        tx = fn.build_transaction({
            "chainId": CHAIN_ID,
            "gas": 2000000,
            "gasPrice": w3.eth.gas_price,
            "nonce": nonce,
        })
        signed = w3.eth.account.sign_transaction(tx, private_key=PRIVATE_KEY)
        tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)

    print(f"  >> TX sent: {w3.to_hex(tx_hash)}")
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=60)

    if receipt.status != 1:
        print(f"  [FAIL] Transaction REVERTED (status=0)")
        return None

    # The new ID is the value of nextBadgeTypeId AFTER the call
    new_id = badge_contract.functions.nextBadgeTypeId().call() - 1
    print(f"  [OK] Registered! On-chain badge type ID = {new_id}")
    return new_id


def main():
    print("=" * 60)
    print("ChainLoyalty - Sync Badge Types -> On-Chain")
    print("=" * 60)

    current_onchain_count = badge_contract.functions.nextBadgeTypeId().call() - 1
    print(f"On-chain badge types registered: {current_onchain_count}")

    with Session(engine) as session:
        badges = session.exec(select(BadgeType).where(BadgeType.is_active == True)).all()
        badges = list(badges)

    print(f"Local DB badge types: {len(badges)}")
    print()

    # Identify which badges need registration (missing onchain_id)
    to_register = [b for b in badges if b.onchain_id is None]
    
    if not to_register:
        print("[OK] All active DB badges have an onchain_id. Nothing to sync.")
    else:
        print(f"Registering {len(to_register)} badge type(s) on-chain...")
        print()
        for badge in to_register:
            print(f"-> Registering: [{badge.id}] {badge.name}")
            new_id = register_badge_type_onchain(badge)
            if new_id is not None:
                with Session(engine) as session:
                    db_badge = session.get(BadgeType, badge.id)
                    if db_badge:
                        db_badge.onchain_id = new_id
                        session.add(db_badge)
                        session.commit()
                        print(f"  [DB] Saved onchain_id={new_id} for badge {badge.id}")
            else:
                print(f"  [WARN] Registration failed for {badge.name}. Stopping.")
                break
            time.sleep(1)

    print()
    print("=" * 60)
    print("Final Status Mapping:")
    with Session(engine) as session:
        all_badges = session.exec(select(BadgeType).where(BadgeType.is_active == True)).all()
        for b in all_badges:
            status = "[OK]" if b.onchain_id is not None else "[MISSING]"
            print(f"  {status} DB id={b.id} ({b.name}) -> on-chain id={b.onchain_id}")

    print()
    print("Use the on-chain ID when calling the mint endpoint!")


if __name__ == "__main__":
    main()
