from datetime import datetime
from typing import Optional, List, Dict, Any
from sqlmodel import SQLModel, Field, create_engine, Session, select, JSON
from pathlib import Path

# Database setup
DATABASE_FILE = "chainloyalty.db"
DATABASE_URL = f"sqlite:///{DATABASE_FILE}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session

# --- Models ---

def generate_referral_code():
    import uuid
    return str(uuid.uuid4())[:8]

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    wallet_address: str = Field(index=True) # Unique per program_id ideally
    referral_code: str = Field(default_factory=generate_referral_code, unique=True)
    referred_by: Optional[str] = None  # wallet address of referrer
    program_id: str = Field(default="default", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Event(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    wallet_address: str = Field(index=True)
    event_type: str = Field(index=True) # e.g. "purchase", "signup", "referral"
    program_id: str = Field(default="default", index=True)
    metadata_json: Dict[str, Any] = Field(default_factory=dict, sa_type=JSON)
    status: str = Field(default="pending") # "pending", "processed", "failed"
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Rule(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    program_id: str = Field(default="default", index=True)
    name: str = Field(unique=True)
    event_type: str = Field(index=True)
    condition_json: Dict[str, Any] = Field(default_factory=dict, sa_type=JSON) # e.g. {"min_amount": 100}
    reward_type: str = Field(default="points") # "points", "badge"
    reward_value: int = Field(default=10) # points amount or badgeTypeId
    automatic_mint: bool = Field(default=True)
    is_active: bool = Field(default=True)

class RewardHistory(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    wallet_address: str = Field(index=True)
    program_id: str = Field(default="default", index=True)
    reward_type: str # "points", "badge"
    amount: int
    reason: str
    tx_hash: Optional[str] = None
    status: str = Field(default="earned") # "earned", "minted", "claimed", "spent"
    certificate_json: Optional[Dict[str, Any]] = Field(default=None, sa_type=JSON)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class BadgeType(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    onchain_id: Optional[int] = Field(default=None) # The ID assigned by the smart contract
    program_id: str = Field(default="default", index=True)
    name: str = Field(unique=True)
    description: str
    metadata_uri: str
    max_supply: int = Field(default=1000) # Default to 1000 since 0 reverts on-chain
    transferable: bool = Field(default=False)
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
