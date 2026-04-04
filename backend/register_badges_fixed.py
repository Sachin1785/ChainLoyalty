"""
register_badges_fixed.py
========================
Registers all DB badge types on-chain with max_supply=1000.

Since the contract does not allow updating max_supply after registration,
and on-chain badge type ID=1 was registered with max_supply=0 (broken),
this script registers all DB badges fresh. They will receive sequential
on-chain IDs starting from nextBadgeTypeId.

After running, it prints the correct on-chain ID to use for each DB badge.

Usage:
    uv run python register_badges_fixed.py
"""
import time
from sqlmodel import Session, select
from database import engine, BadgeType
from lib.blockchain import badge_contract, w3, account, PRIVATE_KEY, CHAIN_ID, tx_lock

MAX_SUPPLY = 1000


def sim_register(name, desc, uri, transferable, program_id):
    try:
        result = badge_contract.functions.registerBadgeType(
            name, desc, uri, MAX_SUPPLY, transferable, program_id
        ).call({'from': account.address})
        return True, result
    except Exception as e:
        return False, str(e)


def send_register(name, desc, uri, transferable, program_id):
    fn = badge_contract.functions.registerBadgeType(
        name, desc, uri, MAX_SUPPLY, transferable, program_id
    )
    with tx_lock:
        nonce = w3.eth.get_transaction_count(account.address, 'pending')
        tx = fn.build_transaction({
            'chainId': CHAIN_ID,
            'gas': 300000,
            'gasPrice': w3.eth.gas_price,
            'nonce': nonce,
        })
        signed = w3.eth.account.sign_transaction(tx, private_key=PRIVATE_KEY)
        tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)

    tx_hex = w3.to_hex(tx_hash)
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=60)
    return tx_hex, receipt.status


def main():
    print("=" * 60)
    print("ChainLoyalty - Register Badge Types On-Chain (max_supply=1000)")
    print("=" * 60)

    current = badge_contract.functions.nextBadgeTypeId().call() - 1
    print(f"Already on-chain: {current} badge type(s)")
    print(f"  (IDs 1..{current} are taken; new ones start from {current+1})")
    print()

    with Session(engine) as s:
        badges = s.exec(select(BadgeType).where(BadgeType.is_active == True)).all()
        badges = list(badges)

    print(f"DB badges: {len(badges)}")
    print()

    results = []
    for b in badges:
        uri = b.metadata_uri or f"https://chainloyalty.app/badges/{b.id}"
        print(f"-> DB id={b.id} name={b.name!r}")

        # 1. Simulate
        ok, sim_result = sim_register(b.name, b.description, uri, b.transferable, b.program_id)
        if not ok:
            print(f"   [SIM FAIL] {sim_result[:150]}")
            print(f"   Skipping...")
            results.append((b, None))
            continue
        predicted_id = sim_result
        print(f"   Sim OK -> predicted on-chain ID: {predicted_id}")

        # 2. Send TX
        tx_hex, status = send_register(b.name, b.description, uri, b.transferable, b.program_id)
        actual_id = badge_contract.functions.nextBadgeTypeId().call() - 1

        if status == 1:
            print(f"   TX OK  -> actual on-chain ID: {actual_id}  tx={tx_hex}")
            results.append((b, actual_id))
        else:
            print(f"   TX FAIL (status=0) tx={tx_hex}")
            results.append((b, None))

        time.sleep(2)

    print()
    print("=" * 60)
    print("Results:")
    for b, onchain_id in results:
        status = f"on-chain ID = {onchain_id}" if onchain_id else "FAILED - not registered"
        print(f"  DB id={b.id} ({b.name!r}) -> {status}")
    print()
    print("Use the on-chain ID when calling the mint endpoint.")
    print("e.g.  uv run python mint_badge_test.py <wallet> <onchain_id>")


if __name__ == "__main__":
    main()
