import os
import shutil
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, File, UploadFile
from sqlmodel import Session, select
from typing import List
from database import engine, Rule, BadgeType

router = APIRouter(prefix="/api/v1/admin", tags=["admin"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def get_session():
    with Session(engine) as session:
        yield session

@router.post("/badges/upload")
async def upload_badge_image(file: UploadFile = File(...)):
    """
    Upload a badge image to the local backend storage.
    """
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    return {"url": f"/uploads/{unique_filename}", "filename": unique_filename}

# --- Rules Engine ---

@router.get("/rules", response_model=List[Rule])
def get_rules(program_id: str = Query("default"), session: Session = Depends(get_session)):
    """
    Fetch all rules for the given program_id.
    """
    statement = select(Rule).where(Rule.program_id == program_id)
    rules = session.exec(statement).all()
    return rules

@router.post("/rules", response_model=Rule)
def create_rule(rule: Rule, session: Session = Depends(get_session)):
    """
    Create a new loyalty rule.
    """
    existing_rule = session.exec(select(Rule).where(Rule.name == rule.name, Rule.program_id == rule.program_id)).first()
    if existing_rule:
        raise HTTPException(status_code=400, detail="Rule with this name already exists in the program.")

    session.add(rule)
    session.commit()
    session.refresh(rule)
    return rule

@router.put("/rules/{rule_id}", response_model=Rule)
def update_rule(rule_id: int, updated_rule: Rule, session: Session = Depends(get_session)):
    """
    Update an existing rule identified by rule_id.
    """
    rule = session.get(Rule, rule_id)
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
        
    rule_data = updated_rule.dict(exclude_unset=True)
    rule_data.pop("id", None)
    
    for key, value in rule_data.items():
        setattr(rule, key, value)
        
    session.add(rule)
    session.commit()
    session.refresh(rule)
    return rule

@router.delete("/rules/{rule_id}")
def delete_rule(rule_id: int, session: Session = Depends(get_session)):
    """
    Delete a rule.
    """
    rule = session.get(Rule, rule_id)
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
        
    session.delete(rule)
    session.commit()
    return {"status": "success", "message": f"Rule {rule_id} deleted."}

# --- Badge Registry ---

@router.post("/badges", response_model=BadgeType)
def create_badge(badge: BadgeType, session: Session = Depends(get_session)):
    """
    Forge a new badge standard.
    """
    session.add(badge)
    session.commit()
    session.refresh(badge)
    return badge

@router.get("/badges", response_model=List[BadgeType])
def get_badges(program_id: str = Query("default"), session: Session = Depends(get_session)):
    """
    Fetch all available badge types for the program.
    """
    statement = select(BadgeType).where(BadgeType.program_id == program_id)
    badges = session.exec(statement).all()
    return badges

@router.delete("/badges/{badge_id}")
def delete_badge(badge_id: int, session: Session = Depends(get_session)):
    """
    Delete a badge standard.
    """
    badge = session.get(BadgeType, badge_id)
    if not badge:
        raise HTTPException(status_code=404, detail="Badge not found")
        
    session.delete(badge)
    session.commit()
    return {"status": "success"}

@router.post("/badges/mint")
def mint_badge(
    wallet_address: str,
    badge_type_id: int,
    onchain_badge_type_id: int = None,
    program_id: str = "default",
    session: Session = Depends(get_session)
):
    """
    Directly mint a badge to a wallet (Admin Only).

    - badge_type_id: The local DB badge type ID (for metadata lookup & record-keeping).
    - onchain_badge_type_id: The on-chain contract badge type ID. If omitted, falls back
      to badge_type_id. Use register_badges_fixed.py to get the correct on-chain ID.
    """
    from lib.blockchain import batch_mint_badges, sign_reward_certificate, w3
    from database import RewardHistory

    wallet_address = w3.to_checksum_address(wallet_address)

    # 1. Look up badge metadata from DB
    badge_type = session.get(BadgeType, badge_type_id)
    if not badge_type:
        raise HTTPException(status_code=404, detail=f"Badge type DB id={badge_type_id} not found")

    # 2. Determine which on-chain ID to use
    contract_id = onchain_badge_type_id if onchain_badge_type_id is not None else badge_type_id
    print(f"[admin] Minting badge on-chain ID={contract_id} ({badge_type.name}) -> {wallet_address}")

    # 3. Attempt on-chain mint
    try:
        tx_hash = batch_mint_badges([wallet_address], [contract_id], program_id)
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))

    if not tx_hash:
        raise HTTPException(status_code=500, detail="On-chain minting failed. Check account permissions and contract configuration.")

    # 4. Record in DB
    reward = RewardHistory(
        wallet_address=wallet_address,
        program_id=program_id,
        reward_type="badge",
        amount=contract_id,  # Store the on-chain badge type ID
        reason=f"Manual Mint: {badge_type.name}",
        tx_hash=tx_hash,
        status="minted",
        certificate_json=sign_reward_certificate(wallet_address, contract_id, f"Admin Mint: {badge_type.name}", program_id)
    )
    session.add(reward)
    session.commit()
    session.refresh(reward)

    return {
        "status": "success",
        "tx_hash": tx_hash,
        "reward_id": reward.id,
        "badge_name": badge_type.name,
        "db_badge_type_id": badge_type_id,
        "onchain_badge_type_id": contract_id,
        "wallet": wallet_address,
        "explorer": f"https://testnet-explorer.monad.xyz/tx/{tx_hash}"
    }
