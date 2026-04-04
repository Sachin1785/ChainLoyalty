import requests
import json
import time

API_BASE = "http://localhost:8000/api/v1"
WALLET = "0x210f0257A119ede458d5985893527cE434518B9e" # Use your connected wallet address

def trigger_event(wallet, event, metadata={}):
    print(f"🚀 Triggering event: {event} for {wallet}...")
    try:
        res = requests.post(
            f"{API_BASE}/events",
            params={"wallet_address": wallet, "event_type": event},
            json=metadata
        )
        data = res.json()
        print(f"✅ Response ({res.status_code}):", json.dumps(data, indent=2))
        
        rewards = data.get("rewards_triggered", [])
        if rewards:
            print(f"   🏆 REWARDS TRIGGERED: {len(rewards)}")
            for r in rewards:
                print(f"      - {r['name']} (+{r['value']} {r['type']})")
        else:
            print("   ℹ️ No rewards triggered for this specific event.")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    print("--- ChainLoyalty Rewards Engine Test ---")
    
    # 1. Trigger Signup (Welcome Bonus)
    trigger_event(WALLET, "signup")
    
    time.sleep(1)
    
    # 2. Trigger Purchase below threshold
    trigger_event(WALLET, "purchase", {"amount": 500})
    
    time.sleep(1)
    
    # 3. Trigger Purchase above threshold (Big Purchase Reward)
    trigger_event(WALLET, "purchase", {"amount": 1500, "item": "Premium Hoodie"})
    
    time.sleep(1)
    
    # 4. Trigger multiple purchases to hit frequency reward
    # (The seeded rule says frequency 5)
    for i in range(10):
        trigger_event(WALLET, "purchase", {"amount": 100})
        time.sleep(0.5)

    print("\n--- Test Complete. Check your dashboard at http://localhost:3000/dashboard ---")
