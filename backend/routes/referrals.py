from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from database import engine, User, RewardHistory, Rule
from lib.blockchain import mint_points, w3
from typing import Dict, Any, Optional
import uuid

router = APIRouter(prefix="/api/v1/referrals", tags=["referrals"])

def get_session():
    with Session(engine) as session:
        yield session

@router.post("/verify")
def verify_referral(wallet_address: str, referral_code: str, program_id: str = "default", session: Session = Depends(get_session)):
    """
    Verify a referral code and link the new user to the referrer.
    """
    # 1. Check if user already exists in this program
    user = session.exec(select(User).where(User.wallet_address == wallet_address, User.program_id == program_id)).first()
    if user and user.referred_by:
        raise HTTPException(status_code=400, detail="User already has a referrer")

    # 2. Find the referrer in the same program
    referral_code_clean = referral_code.strip().lower()
    referrer = session.exec(select(User).where(User.referral_code == referral_code_clean, User.program_id == program_id)).first()
    if not referrer:
        raise HTTPException(status_code=404, detail="Invalid referral code")

    if referrer.wallet_address == wallet_address:
        raise HTTPException(status_code=400, detail="Cannot refer yourself")

    # 3. Create or update user
    is_new_user = False
    if not user:
        is_new_user = True
        user = User(
            wallet_address=wallet_address,
            referred_by=referrer.wallet_address,
            program_id=program_id
        )
        session.add(user)
    else:
        user.referred_by = referrer.wallet_address
        session.add(user)

    session.commit()
    
    # 4. Trigger Rewards (On-chain) based on Rules
    # We look for a rule with event_type="REFERRAL" and program_id
    referral_rule = session.exec(select(Rule).where(
        Rule.event_type == "REFERRAL",
        Rule.program_id == program_id,
        Rule.is_active == True
    )).first()
    
    # Default values if no rule exists
    reward_amount = referral_rule.reward_value if referral_rule else 500
    
    rewards = []
    
    try:
        from lib.blockchain import sign_reward_certificate
        
        # Reward Referrer
        print(f"[referrals] Sending {reward_amount} points to referrer: {referrer.wallet_address}")
        tx_referrer = mint_points(referrer.wallet_address, reward_amount, program_id, f"Referral Success: {wallet_address[:8]}")
        ref_reward = RewardHistory(
            wallet_address=referrer.wallet_address,
            program_id=program_id,
            reward_type="points",
            amount=reward_amount,
            reason=f"Referral Bonus for inviting {wallet_address[:8]}",
            tx_hash=tx_referrer,
            status="minted",
            certificate_json=sign_reward_certificate(referrer.wallet_address, reward_amount, f"Referral: {wallet_address[:8]}", program_id)
        )
        session.add(ref_reward)
        rewards.append({"type": "referrer", "value": reward_amount, "tx": tx_referrer})

        # Reward Referee
        print(f"[referrals] Sending {reward_amount} points to referee: {wallet_address}")
        tx_referee = mint_points(wallet_address, reward_amount, program_id, f"Joined via Referral: {referral_code}")
        joint_reward = RewardHistory(
            wallet_address=wallet_address,
            program_id=program_id,
            reward_type="points",
            amount=reward_amount,
            reason=f"Sign-up Bonus via Referral {referral_code}",
            tx_hash=tx_referee,
            status="minted",
            certificate_json=sign_reward_certificate(wallet_address, reward_amount, f"Referral: {referral_code}", program_id)
        )
        session.add(joint_reward)
        rewards.append({"type": "referee", "value": reward_amount, "tx": tx_referee})
        
        session.commit()
    except Exception as e:
        print(f"[referrals] Reward minting failed: {e}")
    except Exception as e:
        print(f"[referrals] Reward minting failed: {e}")

    return {
        "status": "success",
        "referrer": referrer.wallet_address,
        "referral_code": referral_code,
        "rewards_minted": rewards
    }

@router.get("/code/{wallet_address}")
def get_referral_code(wallet_address: str, program_id: str = "default", session: Session = Depends(get_session)):
    """
    Fetch or create a user's referral code.
    """
    user = session.exec(select(User).where(User.wallet_address == wallet_address, User.program_id == program_id)).first()
    if not user:
        user = User(wallet_address=wallet_address, program_id=program_id)
        session.add(user)
        session.commit()
        session.refresh(user)
        
    return {"referral_code": user.referral_code}

@router.get("/{wallet_address}/list")
def list_referrals(wallet_address: str, program_id: str = "default", session: Session = Depends(get_session)):
    """
    Get the list of wallets referred by this user.
    """
    referrals = session.exec(
        select(User)
        .where(User.referred_by == wallet_address, User.program_id == program_id)
        .order_by(User.created_at.desc())
    ).all()
    
    return [
        {
            "wallet_address": r.wallet_address,
            "created_at": r.created_at
        } for r in referrals
    ]

