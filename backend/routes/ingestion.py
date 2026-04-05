from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, func
from database import engine, Event, User, Rule, RewardHistory
from typing import Dict, Any, Optional
import uuid
from lib.blockchain import mint_points


router = APIRouter(prefix="/api/v1/events", tags=["ingestion"])

def get_session():
    with Session(engine) as session:
        yield session

@router.post("")
def ingest_event(wallet_address: str, event_type: str, program_id: str = "default", metadata: Dict[str, Any] = {}, session: Session = Depends(get_session)):
    """
    Ingest a product event and evaluate it against rules.
    Supports multi-tenancy via program_id.
    """
    from lib.blockchain import w3
    wallet_address = w3.to_checksum_address(wallet_address)
    
    # 1. Ensure user exists or create them
    user = session.exec(select(User).where(User.wallet_address == wallet_address, User.program_id == program_id)).first()
    if not user:
        user = User(wallet_address=wallet_address, program_id=program_id)
        session.add(user)
        session.commit()
        session.refresh(user)

    # 2. Store the event
    event = Event(wallet_address=wallet_address, event_type=event_type, program_id=program_id, metadata_json=metadata)
    session.add(event)
    session.commit()
    session.refresh(event)

    # 3. Evaluate rules
    rules = session.exec(select(Rule).where(
        Rule.event_type == event_type, 
        Rule.program_id == program_id,
        Rule.is_active == True
    )).all()
    
    triggered_rewards = []
    for rule in rules:
        condition = rule.condition_json
        match = True
        
        # A. Threshold-based (e.g. min_amount)
        if "min_amount" in condition:
            if metadata.get("amount", 0) < condition["min_amount"]:
                match = False
        
        # B. Frequency-based (e.g. 5th purchase)
        if match and "frequency" in condition:
            count = session.exec(select(func.count(Event.id)).where(
                Event.event_type == event_type,
                Event.wallet_address == wallet_address,
                Event.program_id == program_id
            )).one()
            if count % condition["frequency"] != 0:
                match = False

        # C. Conditional (e.g. specific metadata value)
        if match and "required_metadata" in condition:
            for key, val in condition["required_metadata"].items():
                if metadata.get(key) != val:
                    match = False
                    break
        
        if match:
            # 1. Prepare reward entry
            tx_hash = None
            status = "earned"
            actual_reward_value = rule.reward_value

            if "points_multiplier" in condition and rule.reward_type == "points":
                amount = float(metadata.get("amount", 0))
                multiplier = float(condition["points_multiplier"])
                actual_reward_value = int(amount * multiplier)

            if rule.reward_type == "points":
                # Trigger on-chain mint
                tx_hash = mint_points(wallet_address, actual_reward_value, program_id, f"Rule: {rule.name}")
                status = "minted" if tx_hash else "earned"
            elif rule.reward_type == "badge" and rule.automatic_mint:
                # Trigger on-chain badge mint (Direct-to-Wallet)
                from lib.blockchain import batch_mint_badges
                tx_hash = batch_mint_badges([wallet_address], [actual_reward_value], program_id)
                status = "minted" if tx_hash else "earned"

            # Generate off-chain certificate
            from lib.blockchain import sign_reward_certificate
            certificate = sign_reward_certificate(wallet_address, actual_reward_value, f"Rule: {rule.name}", program_id)

            reward = RewardHistory(
                wallet_address=wallet_address,
                program_id=program_id,
                reward_type=rule.reward_type,
                amount=actual_reward_value,
                reason=f"Rule triggered: {rule.name}",
                tx_hash=tx_hash,
                status=status,
                certificate_json=certificate
            )
            session.add(reward)
            triggered_rewards.append({
                "type": rule.reward_type,
                "value": actual_reward_value,
                "name": rule.name,
                "tx_hash": tx_hash
            })

    session.commit()
    
    return {
        "status": "success",
        "event_id": event.id,
        "rewards_triggered": triggered_rewards
    }

