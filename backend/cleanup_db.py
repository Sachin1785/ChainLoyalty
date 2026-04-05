from sqlmodel import Session, select
from database import engine, User, Event, RewardHistory
from lib.blockchain import w3

def cleanup_db():
    print("🧹 Starting Database Normalization...")
    with Session(engine) as session:
        # 1. Normalize Users
        users = session.exec(select(User)).all()
        for user in users:
            old_addr = user.wallet_address
            new_addr = w3.to_checksum_address(old_addr)
            if old_addr != new_addr:
                print(f"   👤 Normalizing User: {old_addr} -> {new_addr}")
                user.wallet_address = new_addr
                session.add(user)
        
        # Note: If multiple User records exist for the same normalized address, we might need a more complex merge.
        # But for now let's just normalize.

        # 2. Normalize Events
        events = session.exec(select(Event)).all()
        for event in events:
            old_addr = event.wallet_address
            new_addr = w3.to_checksum_address(old_addr)
            if old_addr != new_addr:
                event.wallet_address = new_addr
                session.add(event)

        # 3. Normalize RewardHistory
        rewards = session.exec(select(RewardHistory)).all()
        for reward in rewards:
            old_addr = reward.wallet_address
            new_addr = w3.to_checksum_address(old_addr)
            if old_addr != new_addr:
                # print(f"   💰 Normalizing Reward {reward.id}: {old_addr} -> {new_addr}")
                reward.wallet_address = new_addr
                session.add(reward)

        session.commit()
        print("✅ Normalization complete.")

if __name__ == "__main__":
    cleanup_db()
