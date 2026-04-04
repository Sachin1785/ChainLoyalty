from sqlmodel import Session, select
from database import engine, Rule, create_db_and_tables

def seed_rules():
    # Ensure tables exist
    create_db_and_tables()
    
    with Session(engine) as session:
        # 1. Check if rules already exist
        existing_rules = session.exec(select(Rule)).all()
        if existing_rules:
            print("[seeder] Rules already exist. Skipping seeding.")
            return

        # 2. Add sample rules
        rules = [
            Rule(
                name="Welcome Bonus",
                event_type="signup",
                condition_json={},
                reward_type="points",
                reward_value=100
            ),
            Rule(
                name="First Purchase Reward",
                event_type="purchase",
                condition_json={"min_amount": 10},
                reward_type="points",
                reward_value=50
            ),
            Rule(
                name="Referral Star",
                event_type="referral_completed",
                condition_json={},
                reward_type="points",
                reward_value=250
            ),
            Rule(
                name="Power User Badge",
                event_type="feature_used",
                condition_json={"required_metadata": {"feature_name": "advanced_search"}},
                reward_type="badge",
                reward_value=1, # Badge ID
                automatic_mint=True
            ),
            Rule(
                name="Loyalty Milestone",
                event_type="milestone_reached",
                condition_json={"milestone_id": 5},
                reward_type="badge",
                reward_value=2,
                automatic_mint=False # Requires manual claim
            )
        ]

        session.add_all(rules)
        session.commit()
        print(f"[seeder] Seeded {len(rules)} rules.")

if __name__ == "__main__":
    seed_rules()
