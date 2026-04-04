from sqlmodel import Session, select
from database import engine, Rule, User, SQLModel
from lib.blockchain import vault_contract, PRIVATE_KEY, w3, account, CHAIN_ID
import os

def seed_rules():
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        # 1. Clear existing rules
        session.exec(select(Rule)).all()
        # rules = session.exec(select(Rule)).all()
        # for r in rules: session.delete(r)
        
        default_rules = [
            Rule(
                name="Welcome Bonus",
                event_type="signup",
                reward_type="points",
                reward_value=100,
                condition_json={}
            ),
            Rule(
                name="Big Purchase Reward",
                event_type="purchase",
                reward_type="points",
                reward_value=500,
                condition_json={"min_amount": 1000}
            ),
            Rule(
                name="Loyal Shopper (5th Purchase)",
                event_type="purchase",
                reward_type="badge",
                reward_value=2, # Badge Type ID 2
                condition_json={"frequency": 5}
            ),
            Rule(
                name="Referral Success",
                event_type="referral",
                reward_type="points",
                reward_value=200,
                condition_json={}
            )
        ]
        
        for rule in default_rules:
            existing = session.exec(select(Rule).where(Rule.name == rule.name)).first()
            if not existing:
                session.add(rule)
        
        session.commit()
        print("✅ Rules seeded.")

def setup_lootbox():
    """
    Configure Lootbox 1 in the RewardVault contract using registerLootboxType.
    """
    if not vault_contract or not PRIVATE_KEY:
        print("❌ Vault contract or PK not configured.")
        return

    try:
        # Check if any lootbox exists (nextLootboxTypeId starts at 1)
        # If we have at least one, we skip seeding for the demo.
        try:
            config = vault_contract.functions.getLootboxConfig(1).call()
            if config[0]:
                print(f"✅ Lootbox 1 already setup: {config[0]}")
                return
        except:
            pass # ID 1 not found, proceed to register
            
        print("🚀 Registering Genesis Lootbox on-chain...")
        
        # Prize data for registerLootboxType
        # PrizeType: 0:NONE, 1:NATIVE, 2:ERC20, 3:POINTS, 4:BADGE
        # Prize struct: (type, tokenAddr, amount, weightBps, label, active)
        prizes = [
            (3, "0x0000000000000000000000000000000000000000", 250, 4000, "250 Points", True),
            (3, "0x0000000000000000000000000000000000000000", 1000, 1000, "1000 Points", True),
            (4, "0x0000000000000000000000000000000000000000", 3, 2000, "Rare Badge", True),
            (0, "0x0000000000000000000000000000000000000000", 0, 3000, "Try Again", True),
        ]
        
        nonce = w3.eth.get_transaction_count(account.address)
        
        # registerLootboxType(name, programId, prizes, pointsCost, nativeCost, cooldown, maxSpins)
        tx = vault_contract.functions.registerLootboxType(
            "Genesis Lootbox",
            "default",
            prizes,
            500, # 500 points
            0,   # 0 native cost
            60,  # 60s cooldown
            100  # 100 max spins
        ).build_transaction({
            'chainId': CHAIN_ID,
            'gas': 800000,
            'gasPrice': w3.eth.gas_price,
            'nonce': nonce,
        })
        
        signed_tx = w3.eth.account.sign_transaction(tx, private_key=PRIVATE_KEY)
        tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
        print(f"✅ Lootbox registered! Tx: {w3.to_hex(tx_hash)}")
            
    except Exception as e:
        print(f"❌ Setup error: {e}")

if __name__ == "__main__":
    seed_rules()
    setup_lootbox()
