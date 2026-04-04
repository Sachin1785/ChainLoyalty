// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title  LoyaltyBadge
 * @author ChainLoyalty
 * @notice ERC-1155 multi-type badge/achievement system using EIP-712.
 *
 * Architecture notes
 * ──────────────────
 * • ERC-1155 vs ERC-721: one contract covers ALL badge types; batch minting
 * saves gas; semi-fungible allows future quantity-based badges.
 *
 * • Off-chain EAS attestations are linked via `attestationUID` (bytes32).
 * Attestation = PROOF (verifiable anywhere).
 * Token       = ASSET (lives in wallet, shows in OpenSea, usable in dApps).
 *
 * • Soulbound by default: non-transferable unless the badge type explicitly
 * allows transfers. Minting and burning are always permitted.
 *
 * • Two minting paths:
 * 1. Backend direct-mint  → mintBadge() / batchMintBadges()  [MINTER_ROLE]
 * 2. User self-claim      → claimBadge() with EIP-712 Signature
 * (user pays own gas; backend acts as a gasless cryptographic oracle)
 */
contract LoyaltyBadge is ERC1155, ERC1155Supply, AccessControl, Pausable, ReentrancyGuard, EIP712 {

    // ─────────────────────────────────────────────────────────────────────────
    // Roles & TypeHashes
    // ─────────────────────────────────────────────────────────────────────────

    /// @dev ChainLoyalty backend hot wallet — can mint directly or sign claim payloads.
    bytes32 public constant MINTER_ROLE        = keccak256("MINTER_ROLE");

    /// @dev Can register and update badge types (admin or ops wallet).
    bytes32 public constant BADGE_MANAGER_ROLE = keccak256("BADGE_MANAGER_ROLE");

    /// @dev EIP-712 TypeHash for the off-chain claim signature
    bytes32 public constant CLAIM_TYPEHASH = keccak256(
        "ClaimBadge(address recipient,uint256 badgeTypeId,bytes32 attestationUID,uint256 nonce,uint256 expiresAt)"
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Data Structures
    // ─────────────────────────────────────────────────────────────────────────

    struct BadgeType {
        string  name;          // e.g. "Power User"
        string  description;   // Human-readable description
        string  metadataUri;   // IPFS URI → ERC-1155 metadata JSON
        uint256 maxSupply;     // 0 = unlimited
        bool    transferable;  // false = soulbound
        bool    active;        // false = minting disabled
        uint256 totalMinted;   // explicit counter (mirrors ERC1155Supply)
    }

    // ─────────────────────────────────────────────────────────────────────────
    // State
    // ─────────────────────────────────────────────────────────────────────────

    string public name;
    string public symbol;

    /// @notice Auto-incrementing badge type counter. Starts at 1 (0 = invalid).
    uint256 public nextBadgeTypeId;

    mapping(uint256  => BadgeType)   public badgeTypes;
    mapping(address  => mapping(uint256 => uint256)) public earnedAt; // wallet → badgeId → timestamp
    mapping(bytes32  => bool)        public usedAttestationUIDs;      // replay protection
    mapping(string   => uint256[])   public programBadges;            // programId → badgeTypeIds

    /// @notice Tracks the next valid nonce for each user to prevent signature replay attacks
    mapping(address  => uint256)     public nonces;

    // ─────────────────────────────────────────────────────────────────────────
    // Events
    // ─────────────────────────────────────────────────────────────────────────

    event BadgeTypeRegistered(
        uint256 indexed badgeTypeId,
        string  name,
        string  metadataUri,
        uint256 maxSupply,
        bool    transferable,
        string  programId
    );
    event BadgeTypeUpdated(uint256 indexed badgeTypeId, string metadataUri, bool active);
    event BadgeMinted(
        address indexed recipient,
        uint256 indexed badgeTypeId,
        bytes32         attestationUID,
        string          programId
    );

    event BadgeBatchMinted(address[] recipients, uint256[] badgeTypeIds, string programId);
    
    event BadgeClaimedViaSignature(
        address indexed recipient,
        uint256 indexed badgeTypeId,
        bytes32         attestationUID
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Errors
    // ─────────────────────────────────────────────────────────────────────────

    error BadgeTypeNotFound(uint256 badgeTypeId);
    error BadgeTypeInactive(uint256 badgeTypeId);
    error MaxSupplyReached(uint256 badgeTypeId, uint256 maxSupply);
    error AlreadyEarned(address recipient, uint256 badgeTypeId);
    error SoulboundToken(uint256 badgeTypeId);
    error ClaimRecipientMismatch(address caller, address expected);
    error SignatureExpired();
    error UnauthorizedSigner(address signer);
    error AttestationUIDAlreadyUsed(bytes32 attestationUID);
    error ArrayLengthMismatch();
    error ZeroAddress();

    // ─────────────────────────────────────────────────────────────────────────
    // Constructor
    // ─────────────────────────────────────────────────────────────────────────

    constructor(
        string memory _name,
        string memory _symbol,
        address       admin,
        address       minter
    ) ERC1155("") EIP712("ChainLoyalty", "1") {
        if (admin  == address(0)) revert ZeroAddress();
        if (minter == address(0)) revert ZeroAddress();

        name   = _name;
        symbol = _symbol;

        _grantRole(DEFAULT_ADMIN_ROLE,  admin);
        _grantRole(BADGE_MANAGER_ROLE,  admin);
        _grantRole(MINTER_ROLE,         minter);

        nextBadgeTypeId = 1;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Badge Type Management  [BADGE_MANAGER_ROLE]
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * @notice Register a new badge type on-chain.
     */
    function registerBadgeType(
        string calldata _name,
        string calldata _description,
        string calldata _metadataUri,
        uint256         _maxSupply,
        bool            _transferable,
        string calldata _programId
    ) external onlyRole(BADGE_MANAGER_ROLE) returns (uint256 badgeTypeId) {
        badgeTypeId = nextBadgeTypeId++;

        badgeTypes[badgeTypeId] = BadgeType({
            name:        _name,
            description: _description,
            metadataUri: _metadataUri,
            maxSupply:   _maxSupply,
            transferable:_transferable,
            active:      true,
            totalMinted: 0
        });

        programBadges[_programId].push(badgeTypeId);

        emit BadgeTypeRegistered(
            badgeTypeId, _name, _metadataUri, _maxSupply, _transferable, _programId
        );
    }

    /**
     * @notice Update the metadata URI or active status of a badge type.
     */
    function updateBadgeType(
        uint256         badgeTypeId,
        string calldata _metadataUri,
        bool            _active
    ) external onlyRole(BADGE_MANAGER_ROLE) {
        _assertBadgeTypeExists(badgeTypeId);
        badgeTypes[badgeTypeId].metadataUri = _metadataUri;
        badgeTypes[badgeTypeId].active      = _active;
        emit BadgeTypeUpdated(badgeTypeId, _metadataUri, _active);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Direct Minting  [MINTER_ROLE — ChainLoyalty backend]
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * @notice Mint a single badge to a recipient.
     */
    function mintBadge(
        address         recipient,
        uint256         badgeTypeId,
        bytes32         attestationUID,
        string calldata programId
    ) external onlyRole(MINTER_ROLE) whenNotPaused nonReentrant {
        if (recipient == address(0)) revert ZeroAddress();
        _assertBadgeTypeExists(badgeTypeId);
        _assertBadgeTypeActive(badgeTypeId);
        _assertMaxSupplyNotReached(badgeTypeId);
        _assertNotAlreadyEarned(recipient, badgeTypeId);
        _assertAttestationNotUsed(attestationUID);

        _doMint(recipient, badgeTypeId, attestationUID, programId);
    }

    /**
     * @notice Batch-mint badges — different types to different recipients in one tx.
     */
    function batchMintBadges(
        address[] calldata recipients,
        uint256[] calldata badgeTypeIds,
        bytes32[] calldata attestationUIDs,
        string calldata    programId
    ) external onlyRole(MINTER_ROLE) whenNotPaused nonReentrant {
        uint256 len = recipients.length;
        if (len != badgeTypeIds.length || len != attestationUIDs.length)
            revert ArrayLengthMismatch();

        for (uint256 i = 0; i < len; i++) {
            if (recipients[i] == address(0)) revert ZeroAddress();
            _assertBadgeTypeExists(badgeTypeIds[i]);
            _assertBadgeTypeActive(badgeTypeIds[i]);
            _assertMaxSupplyNotReached(badgeTypeIds[i]);
            _assertNotAlreadyEarned(recipients[i], badgeTypeIds[i]);
            _assertAttestationNotUsed(attestationUIDs[i]);

            _doMint(recipients[i], badgeTypeIds[i], attestationUIDs[i], programId);
        }

        emit BadgeBatchMinted(recipients, badgeTypeIds, programId);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Self-Claim Flow (EIP-712 Signature Verification)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * @notice Redeem a badge using a cryptographic signature generated off-chain by the backend.
     * @dev    The backend must sign the EIP-712 hash containing the parameters below.
     * @param recipient      Wallet authorised to claim.
     * @param badgeTypeId    Badge type being offered.
     * @param attestationUID Linked EAS off-chain attestation UID.
     * @param expiresAt      Unix timestamp for signature expiration; 0 = never expires.
     * @param signature      The cryptographic signature generated by the MINTER_ROLE wallet.
     */
    function claimBadge(
        address recipient,
        uint256 badgeTypeId,
        bytes32 attestationUID,
        uint256 expiresAt,
        bytes calldata signature
    ) external whenNotPaused nonReentrant {
        // 1. Basic Validations
        if (recipient != msg.sender) revert ClaimRecipientMismatch(msg.sender, recipient);
        if (expiresAt != 0 && block.timestamp > expiresAt) revert SignatureExpired();
        
        // 2. Fetch and Increment Nonce (Prevents replay attacks)
        uint256 currentNonce = nonces[recipient];
        nonces[recipient]++; 

        // 3. Reconstruct the EIP-712 Hash Digest
        bytes32 structHash = keccak256(
            abi.encode(
                CLAIM_TYPEHASH,
                recipient,
                badgeTypeId,
                attestationUID,
                currentNonce,
                expiresAt
            )
        );
        bytes32 digest = _hashTypedDataV4(structHash);

        // 4. Recover Signer & Verify MINTER_ROLE
        address signer = ECDSA.recover(digest, signature);
        if (!hasRole(MINTER_ROLE, signer)) revert UnauthorizedSigner(signer);

        // 5. Run Standard Mint Validations
        _assertBadgeTypeExists(badgeTypeId);
        _assertBadgeTypeActive(badgeTypeId);
        _assertMaxSupplyNotReached(badgeTypeId);
        _assertNotAlreadyEarned(msg.sender, badgeTypeId);
        _assertAttestationNotUsed(attestationUID);

        // 6. Execute Mint
        _doMint(msg.sender, badgeTypeId, attestationUID, "");

        emit BadgeClaimedViaSignature(msg.sender, badgeTypeId, attestationUID);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // View Functions
    // ─────────────────────────────────────────────────────────────────────────

    /// @notice Returns per-type metadata URI (overrides ERC1155 base uri()).
    function uri(uint256 badgeTypeId) public view override returns (string memory) {
        _assertBadgeTypeExists(badgeTypeId);
        return badgeTypes[badgeTypeId].metadataUri;
    }

    /// @notice Returns true if the wallet holds at least one of this badge type.
    function hasBadge(address wallet, uint256 badgeTypeId) external view returns (bool) {
        return balanceOf(wallet, badgeTypeId) > 0;
    }

    /// @notice Returns all badge type IDs registered under a program.
    function getBadgesForProgram(string calldata programId)
        external view returns (uint256[] memory)
    {
        return programBadges[programId];
    }

    /// @notice Returns full BadgeType struct.
    function getBadgeType(uint256 badgeTypeId)
        external view returns (BadgeType memory)
    {
        _assertBadgeTypeExists(badgeTypeId);
        return badgeTypes[badgeTypeId];
    }

    /// @notice Batch-read balances for a wallet across multiple badge types.
    function getBadgeBalances(address wallet, uint256[] calldata badgeTypeIds)
        external view returns (uint256[] memory balances)
    {
        balances = new uint256[](badgeTypeIds.length);
        for (uint256 i = 0; i < badgeTypeIds.length; i++) {
            balances[i] = balanceOf(wallet, badgeTypeIds[i]);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Soulbound Transfer Guard
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * @dev Blocks safeTransferFrom / safeBatchTransferFrom for non-transferable badges.
     * Mint (from == 0) and burn (to == 0) are always allowed.
     */
    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal override(ERC1155, ERC1155Supply) {
        if (from != address(0) && to != address(0)) {
            for (uint256 i = 0; i < ids.length; i++) {
                if (!badgeTypes[ids[i]].transferable)
                    revert SoulboundToken(ids[i]);
            }
        }
        super._update(from, to, ids, values);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Admin Controls
    // ─────────────────────────────────────────────────────────────────────────

    function pause()   external onlyRole(DEFAULT_ADMIN_ROLE) { _pause();   }
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) { _unpause(); }

    // ─────────────────────────────────────────────────────────────────────────
    // Interface Support
    // ─────────────────────────────────────────────────────────────────────────

    function supportsInterface(bytes4 interfaceId)
        public view override(ERC1155, AccessControl) returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Internal Helpers
    // ─────────────────────────────────────────────────────────────────────────

    function _doMint(
        address  recipient,
        uint256  badgeTypeId,
        bytes32  attestationUID,
        string memory programId
    ) internal {
        if (attestationUID != bytes32(0))
            usedAttestationUIDs[attestationUID] = true;

        earnedAt[recipient][badgeTypeId]   = block.timestamp;
        badgeTypes[badgeTypeId].totalMinted++;

        _mint(recipient, badgeTypeId, 1, "");
        emit BadgeMinted(recipient, badgeTypeId, attestationUID, programId);
    }

    function _assertBadgeTypeExists(uint256 id) internal view {
        if (id == 0 || id >= nextBadgeTypeId) revert BadgeTypeNotFound(id);
    }

    function _assertBadgeTypeActive(uint256 id) internal view {
        if (!badgeTypes[id].active) revert BadgeTypeInactive(id);
    }

    function _assertMaxSupplyNotReached(uint256 id) internal view {
        BadgeType storage bt = badgeTypes[id];
        if (bt.maxSupply != 0 && bt.totalMinted >= bt.maxSupply)
            revert MaxSupplyReached(id, bt.maxSupply);
    }

    function _assertNotAlreadyEarned(address wallet, uint256 id) internal view {
        if (balanceOf(wallet, id) > 0) revert AlreadyEarned(wallet, id);
    }

    function _assertAttestationNotUsed(bytes32 uid) internal view {
        if (uid != bytes32(0) && usedAttestationUIDs[uid])
            revert AttestationUIDAlreadyUsed(uid);
    }
}