import requests
import json
import time
import sys

API_BASE = "http://localhost:8000/api/v1"
# The wallet address from the demo app
WALLET = "0xa410ff126fa698f122341b19b343c6bc083656c9"

def trigger_event(event, metadata={}):
    print(f"🚀 Triggering event: {event}...")
    try:
        # Note: The backend ingest_event function uses query params for wallet_address and event_type
        # mapping to: def ingest_event(wallet_address: str, event_type: str, ...)
        res = requests.post(
            f"{API_BASE}/events",
            params={"wallet_address": WALLET, "event_type": event},
            json=metadata
        )
        if res.status_code != 200:
            print(f"❌ Error {res.status_code}: {res.text}")
            return
            
        data = res.json()
        rewards = data.get("rewards_triggered", [])
        if rewards:
            print(f"✅ Success! Rewards Triggered:")
            for r in rewards:
                print(f"   🏆 {r['name']} (+{r['value']} {r['type']})")
        else:
            print("ℹ️ Event recorded, but no rules were triggered.")
    except Exception as e:
        print(f"❌ Network Error: {e}")

if __name__ == "__main__":
    print(f"--- ChainLoyalty Ingestion Script ---")
    print(f"Target Wallet: {WALLET}\n")

    # 1. Signup bonus (100 points)
    trigger_event("signup")
    
    # 2. Power User Badge (Triggers rule 'Power User Badge')
    # Metadata required: {"feature_name": "advanced_search"}
    trigger_event("feature_used", {"feature_name": "advanced_search"})
    
    # 3. Big purchase points (50 points)
    # Metadata required: {"min_amount": 10}
    trigger_event("purchase", {"amount": 500})

    print(f"\n✨ Ingestion complete. Refresh your dashboard to see updated points and badges!")
