"""
mint_badge_test.py
==================
Mints a specific badge type to a specific wallet via the admin API endpoint.

IMPORTANT: The on-chain badge type ID must be registered on the contract first.
Run `uv run python register_badges_fixed.py` to register all badge types.

On-chain ID mapping (current):
  DB id=1 (test)      -> on-chain ID = ? (check register_badges_fixed.py output)
  DB id=2 (pls work)  -> on-chain ID = 3
  DB id=3 (varshil)   -> on-chain ID = ? (check register_badges_fixed.py output)

Usage:
    uv run python mint_badge_test.py [wallet] [db_badge_id] [onchain_badge_id]

Examples:
    # Mint 'pls work' (DB id=2, on-chain ID=3) to a wallet:
    uv run python mint_badge_test.py 0x8e491C39aa20482c08f949944005FbD0b0574E59 2 3
"""
import requests
import sys

API_BASE = "http://localhost:8000/api/v1/admin"
DEFAULT_WALLET    = "0x8e491C39aa20482c08f949944005FbD0b0574E59"
DEFAULT_DB_ID     = 2   # 'pls work' in local DB
DEFAULT_ONCHAIN_ID = 3  # registered on-chain at ID 3


def preflight_check(onchain_id: int) -> bool:
    """Verify the badge type exists and is mintable on-chain before sending API call."""
    from lib.blockchain import badge_contract, w3, account

    onchain_count = badge_contract.functions.nextBadgeTypeId().call() - 1
    if onchain_count == 0:
        print("PRE-FLIGHT FAIL: No badge types registered on-chain.")
        print("  Run: uv run python register_badges_fixed.py")
        return False

    if onchain_id > onchain_count:
        print(f"PRE-FLIGHT FAIL: on-chain ID={onchain_id} not registered (max={onchain_count})")
        print("  Run: uv run python register_badges_fixed.py")
        return False

    try:
        info = badge_contract.functions.getBadgeType(onchain_id).call()
        print(f"Pre-flight OK: on-chain[{onchain_id}] = {info[0]!r} maxSupply={info[3]}")
    except Exception as e:
        print(f"PRE-FLIGHT FAIL: getBadgeType({onchain_id}) error: {e}")
        return False

    # Simulate mint
    wallet = w3.to_checksum_address(DEFAULT_WALLET)
    try:
        badge_contract.functions.batchMintBadges(
            [wallet], [onchain_id], [b"\x00" * 32], "default"
        ).call({"from": account.address})
        print(f"Mint simulation: OK")
    except Exception as e:
        print(f"PRE-FLIGHT FAIL: Mint simulation reverted: {e}")
        return False

    return True


def mint_badge(wallet: str, db_id: int, onchain_id: int):
    print(f"\nMinting badge  DB_id={db_id}  onchain_id={onchain_id}  -> {wallet}")

    params = {
        "wallet_address": wallet,
        "badge_type_id": db_id,
        "onchain_badge_type_id": onchain_id,
        "program_id": "default",
    }

    try:
        resp = requests.post(f"{API_BASE}/badges/mint", params=params, timeout=90)
        if resp.status_code == 200:
            data = resp.json()
            print("SUCCESS!")
            print(f"  Badge:      {data.get('badge_name')}")
            print(f"  Tx Hash:    {data.get('tx_hash')}")
            print(f"  Reward ID:  {data.get('reward_id')}")
            print(f"  Explorer:   {data.get('explorer')}")
        else:
            try:
                err = resp.json()
                print(f"FAILED (HTTP {resp.status_code}): {err.get('detail', resp.text)}")
            except Exception:
                print(f"FAILED (HTTP {resp.status_code}): {resp.text[:300]}")
    except requests.exceptions.RequestException as e:
        print(f"Network Error: {e}")


if __name__ == "__main__":
    wallet    = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_WALLET
    db_id     = int(sys.argv[2]) if len(sys.argv) > 2 else DEFAULT_DB_ID
    onchain_id = int(sys.argv[3]) if len(sys.argv) > 3 else DEFAULT_ONCHAIN_ID

    print("-" * 60)
    print("CHAINLOYALTY - ADMIN BADGE MINTING TEST")
    print("-" * 60)
    print(f"Wallet:          {wallet}")
    print(f"DB Badge ID:     {db_id}")
    print(f"On-chain ID:     {onchain_id}")
    print()

    if not preflight_check(onchain_id):
        sys.exit(1)

    mint_badge(wallet, db_id, onchain_id)
    print("-" * 60)
