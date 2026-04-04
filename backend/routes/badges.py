from fastapi import APIRouter, Depends, Query
from sqlmodel import Session, select
from typing import List
from database import engine, BadgeType

router = APIRouter(prefix="/api/v1/badges", tags=["badges"])

def get_session():
    with Session(engine) as session:
        yield session

@router.get("", response_model=List[BadgeType])
def get_public_badges(program_id: str = Query("default"), session: Session = Depends(get_session)):
    """
    Publicly list all badge standards for the program.
    """
    statement = select(BadgeType).where(BadgeType.program_id == program_id, BadgeType.is_active == True)
    badges = session.exec(statement).all()
    return badges

@router.get("/{badge_id}/metadata")
def get_badge_metadata(badge_id: int, session: Session = Depends(get_session)):
    """
    Returns ERC-1155 compatible metadata for a badge.
    """
    badge = session.get(BadgeType, badge_id)
    if not badge:
        return {"error": "Badge not found"}
        
    # Build complete metadata object
    return {
        "name": badge.name,
        "description": badge.description,
        "image": badge.metadata_uri, # Storing the direct image URL in metadata_uri for simplicity
        "attributes": [
            {"trait_type": "Program", "value": badge.program_id},
            {"trait_type": "Transferable", "value": "Yes" if badge.transferable else "No"}
        ]
    }
