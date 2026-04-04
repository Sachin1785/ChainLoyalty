from sqlmodel import Session, select
from database import engine, BadgeType, SQLModel

def restore_badges():
    # Ensure tables exist
    SQLModel.metadata.create_all(engine)
    
    with Session(engine) as session:
        badges = [
            BadgeType(
                name="test",
                description="Test badge and loyalty and etc.",
                metadata_uri="http://localhost:8000/uploads/badger_test_1712219999.png",
                max_supply=1000,
                onchain_id=1, # Re-link to existing on-chain badge
                program_id="default"
            ),
            BadgeType(
                name="pls work",
                description="hmm",
                metadata_uri="http://localhost:8000/uploads/badge-876a9117-9097-44c0-9f5b-999ce0aa6.jpeg",
                max_supply=1000,
                onchain_id=3, # Link to ID 3 which we registered successfully
                program_id="default"
            ),
            BadgeType(
                name="varshil",
                description="Cool badge",
                metadata_uri="http://localhost:8000/uploads/varshil.png",
                max_supply=1000,
                program_id="default"
            )
        ]
        
        for b in badges:
            existing = session.exec(select(BadgeType).where(BadgeType.name == b.name)).first()
            if not existing:
                session.add(b)
                print(f"✅ Added {b.name}")
        
        session.commit()

if __name__ == "__main__":
    restore_badges()
