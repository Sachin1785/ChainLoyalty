import sys
import os
from pathlib import Path

# Add the parent directory to sys.path to import from lib
sys.path.append(str(Path(__file__).parent))

from lib.blockchain import mint_points
import time

def test_rapid_mint():
    print("=== Rapid Mint Test ===")
    test_wallet = "0x000000000000000000000000000000000000dEaD"
    
    print(f"1. Sending first mint to {test_wallet}...")
    tx1 = mint_points(test_wallet, 1, "test", "Rapid Test 1")
    print(f"   TX 1 Hash: {tx1}")
    
    print(f"2. Sending second mint to {test_wallet} immediately...")
    tx2 = mint_points(test_wallet, 2, "test", "Rapid Test 2")
    print(f"   TX 2 Hash: {tx2}")
    
    if tx1 and tx2 and tx1 != tx2:
        print("\nSUCCESS: Two distinct transactions sent with sequential nonces!")
    else:
        print("\nFAILURE: Transactions failed or produced duplicate hashes.")

if __name__ == "__main__":
    test_rapid_mint()
