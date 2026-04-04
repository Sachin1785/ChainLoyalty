from sqlmodel import Session, select
from database import engine, BadgeType

def seed_proper_badges():
    with Session(engine) as session:
        # 1. Look for existing Bronze, Silver, Gold badges
        badges_to_update = {
            "Bronze": {
                "description": "Foundational achievement tier. Awarded for completing initial onboarding and your first valid transaction.",
                "point_value": 50
            },
            "Silver": {
                "description": "Recognition for sustained protocol engagement. Awarded to users who maintain active participation over 30 days.",
                "point_value": 250
            },
            "Gold": {
                "description": "Elite status reserved for top-tier contributors. Recognition for significant volume and ecosystem leadership.",
                "point_value": 1000
            },
            "Platinum": {
                "description": "Legendary tier status. Reserved for the most dedicated protocol explorers who have reached the absolute peak of participation and engagement.",
                "point_value": 5000
            }
        }

        for name, data in badges_to_update.items():
            statement = select(BadgeType).where(BadgeType.name == name)
            badge = session.exec(statement).first()
            
            if badge:
                print(f"[seed] Updating existing badge: {name}")
                badge.description = data["description"]
                badge.point_value = data["point_value"]
                session.add(badge)
            else:
                print(f"[seed] Creating new badge: {name}")
                new_badge = BadgeType(
                    name=name,
                    description=data["description"],
                    point_value=data["point_value"],
                    metadata_uri="https://gateway.pinata.cloud/ipfs/Qm...", # Placeholder
                    program_id="default",
                    is_active=True
                )
                session.add(new_badge)
        
        session.commit()
        print("[seed] Badge descriptions updated successfully.")

if __name__ == "__main__":
    seed_proper_badges()
