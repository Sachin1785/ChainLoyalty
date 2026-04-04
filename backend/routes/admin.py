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
