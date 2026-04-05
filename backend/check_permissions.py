from lib.blockchain import points_contract, badge_contract, vault_contract, account, w3
import json

def check_roles():
    print(f"🔍 Checking permissions for account: {account.address}")
    
    # MINTER_ROLE = keccak256("MINTER_ROLE")
    MINTER_ROLE = w3.keccak(text="MINTER_ROLE")
    BURNER_ROLE = w3.keccak(text="BURNER_ROLE")
    OPERATOR_ROLE = w3.keccak(text="OPERATOR_ROLE")
    
    contracts = [
        ("LoyaltyPoints", points_contract, [MINTER_ROLE, BURNER_ROLE]),
        ("LoyaltyBadge", badge_contract, [MINTER_ROLE]),
        ("RewardVault", vault_contract, [OPERATOR_ROLE])
    ]
    
    for name, contract, roles in contracts:
        if not contract:
            print(f"❌ {name}: Contract not configured.")
            continue
            
        print(f"\n--- {name} ({contract.address}) ---")
        for role in roles:
            role_hex = role.hex()
            has_role = contract.functions.hasRole(role, account.address).call()
            print(f"Role {role_hex[:10]}...: {'✅ GRANTED' if has_role else '❌ MISSING'}")

if __name__ == "__main__":
    check_roles()
