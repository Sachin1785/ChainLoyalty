from lib.blockchain import w3, account
import sys

def get_revert_reason(tx_hash):
    print(f"🔍 Analyzing failed transaction: {tx_hash}")
    try:
        tx = w3.eth.get_transaction(tx_hash)
        receipt = w3.eth.get_transaction_receipt(tx_hash)
        
        if receipt.status == 1:
            print("✅ Transaction actually succeeded. Explorer might be lagging.")
            return

        print("❌ Transaction failed. Attempting to simulate and find revert reason...")
        
        # Simulate call
        try:
            w3.eth.call({
                'to': tx['to'],
                'from': tx['from'],
                'value': tx['value'],
                'data': tx['input'],
                'gas': tx['gas'],
                'gasPrice': tx['gasPrice']
            }, receipt.blockNumber)
        except Exception as e:
            print(f"💡 Revert Reason: {e}")
            
    except Exception as e:
        print(f"❌ Error during diagnostic: {e}")

if __name__ == "__main__":
    hashes = [
        "0x23680311f01ba007d26fa859c807193a725ff239785ea0a94b8b6b4019c0d00f",
        "0x6179533330c9fc4868796384348f6a4c66757f5a19ff67e8304309cff326d41d"
    ]
    for h in hashes:
        get_revert_reason(h)
