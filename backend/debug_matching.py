from database import Session, engine, Rule, Event
session = Session(engine)
rules = session.query(Rule).all()
events = session.query(Event).all()
print("Rules in DB:")
for r in rules:
    print(f"ID={r.id}, Name={r.name}, Trigger={r.event_type}, Reward={r.reward_type}, Cond={r.condition_json}")

print("\nEvents in DB:")
for e in events:
    print(f"ID={e.id}, Type={e.event_type}, Wallet={e.wallet_address}, Metadata={e.metadata_json}")
