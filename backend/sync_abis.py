import json
import os
from pathlib import Path

# Paths
BASE_DIR = Path("D:/Hackfusion")
ARTIFACTS_DIR = BASE_DIR / "blockcahin/artifacts/contracts"
BACKEND_ABI_DIR = BASE_DIR / "backend/lib/abis"
FRONTEND_ABI_DIR = BASE_DIR / "frontend/lib/abis"

contracts = ["LoyaltyPoints", "LoyaltyBadge", "RewardVault"]

def sync_abis():
    for contract in contracts:
        # Source path (Hardhat structure: Name.sol/Name.json)
        src = ARTIFACTS_DIR / f"{contract}.sol" / f"{contract}.json"
        if not src.exists():
            print(f"❌ Could not find artifact for {contract}")
            continue
            
        with open(src, "r") as f:
            full_artifact = json.load(f)
            abi = full_artifact["abi"]
            
        # Target paths
        targets = [BACKEND_ABI_DIR / f"{contract}.json", FRONTEND_ABI_DIR / f"{contract}.json"]
        
        for target in targets:
            target.parent.mkdir(parents=True, exist_ok=True)
            with open(target, "w") as f:
                json.dump({"abi": abi}, f, indent=2)
            print(f"✅ Synced {contract} ABI to {target.relative_to(BASE_DIR)}")

if __name__ == "__main__":
    sync_abis()
