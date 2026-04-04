import os
import json
from web3 import Web3
from eth_account import Account
from eth_account.messages import encode_typed_data, encode_defunct
import hashlib
import time
import threading

# Global lock for transaction ordering
tx_lock = threading.Lock()

def sign_reward_certificate(recipient: str, amount: int, reason: str, program_id: str = "default"):
    """
    Generate an off-chain JSON-based reward certificate signed by the platform.
    This serves as a gasless 'proof of achievement' (off-chain attestation).
    """
    if not PRIVATE_KEY:
        return None
        
    issuer = account.address
    timestamp = int(time.time())
    
    # Message to sign
    certificate_data = {
        "recipient": recipient,
        "amount": amount,
        "reason": reason,
        "program_id": program_id,
        "timestamp": timestamp,
        "issuer": issuer
    }
    
    # Create signature of the JSON string
    msg_str = json.dumps(certificate_data, sort_keys=True)
    message = encode_defunct(text=msg_str)
    signed_message = w3.eth.account.sign_message(message, private_key=PRIVATE_KEY)
    
    return {
        "data": certificate_data,
        "signature": signed_message.signature.hex(),
        "type": "off_chain_attestation_v1"
    }

def generate_verifiable_uid(recipient: str, amount: int, reason: str):
    """
    Generate a pseudo-deterministic UID for a reward event.
    In a real app, this would be an EAS Attestation UID from a contract.
    """
    raw_str = f"{recipient}-{amount}-{reason}-{time.time()}"
    return hashlib.sha256(raw_str.encode()).digest()
from dotenv import load_dotenv
from pathlib import Path

load_dotenv()

# Configuration
RPC_URL = os.getenv("RPC_URL", "https://testnet-rpc.monad.xyz")
PRIVATE_KEY = os.getenv("PRIVATE_KEY")
CHAIN_ID = int(os.getenv("CHAIN_ID", "10143"))

# Contract Addresses
LOYALTY_POINTS_ADDR = os.getenv("LOYALTY_POINTS_ADDR")
LOYALTY_BADGE_ADDR = os.getenv("LOYALTY_BADGE_ADDR")
REWARD_VAULT_ADDR = os.getenv("REWARD_VAULT_ADDR")

# Initialize Web3
w3 = Web3(Web3.HTTPProvider(RPC_URL))
if PRIVATE_KEY:
    account = Account.from_key(PRIVATE_KEY)
    w3.eth.default_account = account.address
else:
    account = None

def load_abi(name):
    path = Path(__file__).parent / "abis" / f"{name}.json"
    with open(path, "r") as f:
        data = json.load(f)
        return data["abi"]

# Load Contracts
points_abi = load_abi("LoyaltyPoints")
badge_abi = load_abi("LoyaltyBadge")
vault_abi = load_abi("RewardVault")

points_contract = w3.eth.contract(address=LOYALTY_POINTS_ADDR, abi=points_abi) if LOYALTY_POINTS_ADDR else None
badge_contract = w3.eth.contract(address=LOYALTY_BADGE_ADDR, abi=badge_abi) if LOYALTY_BADGE_ADDR else None
vault_contract = w3.eth.contract(address=REWARD_VAULT_ADDR, abi=vault_abi) if REWARD_VAULT_ADDR else None

def mint_points(recipient, amount, program_id="default", reason="activity"):
    """
    Mint points on-chain.
    """
    if not points_contract or not PRIVATE_KEY:
        print("[blockchain] Warning: Points contract or private key not configured.")
        return None

    with tx_lock:
        nonce = w3.eth.get_transaction_count(account.address, 'pending')
        uid = generate_verifiable_uid(recipient, amount, reason)
    tx = points_contract.functions.mintPoints(
        w3.to_checksum_address(recipient),
        w3.to_wei(amount, 'ether'), # Assuming 18 decimals
        program_id,
        reason,
        uid
    ).build_transaction({
        'chainId': CHAIN_ID,
        'gas': 200000,
        'gasPrice': w3.eth.gas_price,
        'nonce': nonce,
    })

    signed_tx = w3.eth.account.sign_transaction(tx, private_key=PRIVATE_KEY)
    tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
    return w3.to_hex(tx_hash)

def spend_points(wallet, amount, program_id="default", reason="redemption"):
    """
    Burn points from a wallet on-chain (requires BURNER_ROLE).
    """
    if not points_contract or not PRIVATE_KEY:
        return None

    with tx_lock:
        nonce = w3.eth.get_transaction_count(account.address, 'pending')
        uid = generate_verifiable_uid(wallet, amount, reason)
    tx = points_contract.functions.spendPoints(
        w3.to_checksum_address(wallet),
        w3.to_wei(amount, 'ether'),
        program_id,
        reason,
        uid
    ).build_transaction({
        'chainId': CHAIN_ID,
        'gas': 200000,
        'gasPrice': w3.eth.gas_price,
        'nonce': nonce,
    })

    signed_tx = w3.eth.account.sign_transaction(tx, private_key=PRIVATE_KEY)
    tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
    return w3.to_hex(tx_hash)

def batch_mint_badges(recipients, badge_type_ids, program_id="default"):
    """
    Batch mint badges to multiple recipients (requires MINTER_ROLE).
    Waits for the receipt and raises RuntimeError if the tx reverts on-chain.
    """
    if not badge_contract or not PRIVATE_KEY:
        return None

    recipients_checksum = [w3.to_checksum_address(r) for r in recipients]
    uids = [b'\x00' * 32 for _ in recipients]
    with tx_lock:
        nonce = w3.eth.get_transaction_count(account.address, 'pending')
        tx = badge_contract.functions.batchMintBadges(
            recipients_checksum,
            badge_type_ids,
            uids,
            program_id
        ).build_transaction({
            'chainId': CHAIN_ID,
            'gas': 500000,
            'gasPrice': w3.eth.gas_price,
            'nonce': nonce,
        })

        signed_tx = w3.eth.account.sign_transaction(tx, private_key=PRIVATE_KEY)
        tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)

    tx_hex = w3.to_hex(tx_hash)
    print(f"[blockchain] batchMintBadges tx sent: {tx_hex} — waiting for receipt...")

    receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=60)
    if receipt.status != 1:
        raise RuntimeError(
            f"batchMintBadges reverted on-chain. tx={tx_hex}. "
            f"Likely cause: badge type ID not registered on-chain. "
            f"Run sync_badges_onchain.py to register badge types first."
        )

    print(f"[blockchain] batchMintBadges confirmed ✅ block={receipt.blockNumber}")
    return tx_hex

def generate_claim_signature(recipient, badge_type_id, expires_at=0):
    """
    Generate EIP-712 signature for LoyaltyBadge.claimBadge()
    """
    if not badge_contract or not PRIVATE_KEY:
        return None

    recipient_checksum = w3.to_checksum_address(recipient)
    nonce = badge_contract.functions.nonces(recipient_checksum).call()
    
    # Message data
    attestation_uid = b'\x00' * 32
    
    # Structured data for eth_account.Account.sign_typed_data
    # Note: sign_typed_data handles the hashing of the domain and message
    structured_data = {
        "types": {
            "EIP712Domain": [
                {"name": "name", "type": "string"},
                {"name": "version", "type": "string"},
                {"name": "chainId", "type": "uint256"},
                {"name": "verifyingContract", "type": "address"},
            ],
            "ClaimBadge": [
                {"name": "recipient", "type": "address"},
                {"name": "badgeTypeId", "type": "uint256"},
                {"name": "attestationUID", "type": "bytes32"},
                {"name": "nonce", "type": "uint256"},
                {"name": "expiresAt", "type": "uint256"},
            ],
        },
        "primaryType": "ClaimBadge",
        "domain": {
            "name": "ChainLoyalty",
            "version": "1",
            "chainId": CHAIN_ID,
            "verifyingContract": LOYALTY_BADGE_ADDR,
        },
        "message": {
            "recipient": recipient,
            "badgeTypeId": badge_type_id,
            "attestationUID": attestation_uid,
            "nonce": nonce,
            "expiresAt": expires_at,
        },
    }

    signed_message = Account.sign_typed_data(PRIVATE_KEY, full_message=structured_data)
    
    return {
        "signature": signed_message.signature.hex(),
        "attestationUID": "0x" + attestation_uid.hex(),
        "nonce": nonce,
        "expiresAt": expires_at
    }

