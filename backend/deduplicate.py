from sqlmodel import Session, select, func
from database import engine, User, RewardHistory
from lib.blockchain import w3

def deduplicate():
    with Session(engine) as session:
        # Find all addresses that have more than one user profile
        dupes = session.exec(
            select(User.wallet_address, func.count(User.id))
            .group_by(User.wallet_address)
            .having(func.count(User.id) > 1)
        ).all()
        
        for addr, count in dupes:
            print(f"⚠️ Found {count} duplicate profiles for {addr}. Cleanup starting...")
            # Keep the oldest profile (smallest ID)
            users = session.exec(
                select(User)
                .where(User.wallet_address == addr)
                .order_by(User.id.asc())
            ).all()
            
            winner = users[0]
            to_delete = users[1:]
            
            for d in to_delete:
                print(f"   🗑️ Removing duplicate ID {d.id}")
                session.delete(d)
        
        session.commit()
    print("✨ De-duplication complete.")

if __name__ == "__main__":
    deduplicate()
