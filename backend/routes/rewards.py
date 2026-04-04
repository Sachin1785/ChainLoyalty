from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, func
from database import engine, RewardHistory, User, Rule
from lib.blockchain import generate_claim_signature
from typing import List

router = APIRouter(prefix="/api/v1/rewards", tags=["rewards"])

def get_session():
    with Session(engine) as session:
        yield session

@router.get("/{wallet_address}/stats")
def get_user_stats(wallet_address: str, program_id: str = "default", session: Session = Depends(get_session)):
    """
    Get aggregated loyalty stats for a user (Points, Badges, Referrals, Activity).
    """
    user = session.exec(select(User).where(User.wallet_address == wallet_address, User.program_id == program_id)).first()
    if not user:
        # Create user automatically on first dashboard visit
        user = User(wallet_address=wallet_address, program_id=program_id)
        session.add(user)
        # Give a small welcome bonus
        welcome_bonus = RewardHistory(
            wallet_address=wallet_address,
            program_id=program_id,
            reward_type="points",
            amount=100,
            reason="Welcome Bonus",
            status="minted" # Welcome bonus is virtual for now
        )
        session.add(welcome_bonus)
        session.commit()
        session.refresh(user)

    # 1. Aggregate points
    points_total = session.exec(
        select(func.sum(RewardHistory.amount))
        .where(RewardHistory.wallet_address == wallet_address, RewardHistory.program_id == program_id, RewardHistory.reward_type == "points")
    ).one_or_none() or 0

    # 2. Get badges (all entries of type 'badge')
    badges = session.exec(
        select(RewardHistory)
        .where(RewardHistory.wallet_address == wallet_address, RewardHistory.program_id == program_id, RewardHistory.reward_type == "badge")
    ).all()

    # 3. Get referral count
    referral_count = session.exec(
        select(func.count(User.id))
        .where(User.referred_by == wallet_address, User.program_id == program_id)
    ).one()

    # 4. Get recent activity (latest 5)
    activity = session.exec(
        select(RewardHistory)
        .where(RewardHistory.wallet_address == wallet_address, RewardHistory.program_id == program_id)
        .order_by(RewardHistory.created_at.desc())
        .limit(5)
    ).all()

    return {
        "wallet_address": wallet_address,
        "total_points": points_total,
        "redeemed_points": 0, # To be implemented with spend logic
        "badge_count": len(badges),
        "badges": [{"id": b.id, "reward_type": b.reward_type, "amount": b.amount, "reason": b.reason, "created_at": b.created_at, "status": b.status, "certificate": b.certificate_json} for b in badges],
        "referral_count": referral_count,
        "referral_code": user.referral_code,
        "recent_activity": [{"id": a.id, "type": a.reward_type, "amount": a.amount, "reason": a.reason, "created_at": a.created_at, "status": a.status, "certificate": a.certificate_json} for a in activity]
    }

@router.get("/certificate/{reward_id}")
def get_certificate(reward_id: int, session: Session = Depends(get_session)):
    """
    Retrieve the signed off-chain certificate for a specific reward.
    """
    reward = session.exec(select(RewardHistory).where(RewardHistory.id == reward_id)).first()
    if not reward or not reward.certificate_json:
        raise HTTPException(status_code=404, detail="Certificate not found")
        
    return reward.certificate_json

@router.get("/leaderboard")
def get_leaderboard(limit: int = 10, program_id: str = "default", session: Session = Depends(get_session)):
    """
    Get top users by total points.
    """
    # Sum points per wallet
    results = session.exec(
        select(RewardHistory.wallet_address, func.sum(RewardHistory.amount).label("total_points"))
        .where(RewardHistory.program_id == program_id, RewardHistory.reward_type == "points")
        .group_by(RewardHistory.wallet_address)
        .order_by(func.sum(RewardHistory.amount).desc())
        .limit(limit)
    ).all()
    
    # Enrich with badge counts
    leaderboard = []
    for i, (wallet, points) in enumerate(results):
        badge_count = session.exec(
            select(func.count(RewardHistory.id))
            .where(RewardHistory.wallet_address == wallet, RewardHistory.reward_type == "badge")
        ).one()
        leaderboard.append({
            "rank": i + 1,
            "wallet": f"{wallet[:6]}...{wallet[-4:]}",
            "full_wallet": wallet,
            "points": points,
            "badges": badge_count
        })
        
    return leaderboard


@router.post("/{wallet_address}/claim/{badge_id}")
def get_claim_payload(wallet_address: str, badge_id: int, session: Session = Depends(get_session)):
    """
    Generate the cryptographic signature required for on-chain badge claiming.
    """
    # 1. Verify existence of the earned reward in DB
    reward = session.exec(select(RewardHistory).where(
        RewardHistory.wallet_address == wallet_address,
        RewardHistory.id == badge_id,
        RewardHistory.reward_type == "badge"
    )).first()

    if not reward:
        raise HTTPException(status_code=404, detail="Earned badge not found")

    if reward.status == "claimed":
        raise HTTPException(status_code=400, detail="Badge already claimed")

    # 2. Get the BadgeTypeId (amount field stores it in our current schema)
    badge_type_id = reward.amount

    # 3. Generate signature
    # expires_at = 0 (never) for now
    payload = generate_claim_signature(wallet_address, badge_type_id)
    if not payload:
        raise HTTPException(status_code=500, detail="EIP-712 signature generation failed. Check backend configuration.")

    # 4. Mark as claimed (ideally we wait for on-chain confirmation, but for now we mark when sig is issued)
    reward.status = "claimed"
    session.add(reward)
    session.commit()

    return {
        "wallet": wallet_address,
        "badge_type_id": badge_type_id,
        "signature": payload["signature"],
        "attestation_uid": payload["attestationUID"],
        "nonce": payload["nonce"],
        "expires_at": payload["expiresAt"]
    }

@router.get("/{wallet_address}/history")
def get_history(wallet_address: str, session: Session = Depends(get_session)):
    """
    Get detailed reward history for a user.
    """
    history = session.exec(
        select(RewardHistory)
        .where(RewardHistory.wallet_address == wallet_address)
        .order_by(RewardHistory.created_at.desc())
    ).all()
    
    return history
