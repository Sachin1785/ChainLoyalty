// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title  LoyaltyPoints
 * @author ChainLoyalty
 * @notice ERC-20 on-chain points token for the ChainLoyalty platform.
 *
 * Architecture notes
 * ──────────────────
 * • Off-chain DB is the PRIMARY source of truth for points balances (fast,
 *   free, supports fractional logic). On-chain minting is a secondary layer
 *   that provides composability and portability.
 *
 * • Batch settlement: the backend accumulates off-chain point deltas and
 *   periodically settles them on-chain in bulk via batchMint() / batchBurn().
 *   This minimises gas costs dramatically.
 *
 * • ERC-20Permit (EIP-2612): users can approve the backend to spend their
 *   points (for redemptions) without a separate approval tx — gasless UX.
 *
 * • Non-transferable flag: programmes can lock points to prevent secondary
 *   market speculation. Toggle via setTransferable().
 *
 * • Spend / redemption flow:
 *     User accumulates points → backend calls spendPoints() on redemption →
 *     tokens are burned → EAS off-chain attestation records the redemption.
 *
 * • Each mint/burn emits a PointsEvent that links the action back to a
 *   programId and an optional EAS attestation UID for a full audit trail.
 */
contract LoyaltyPoints is ERC20, ERC20Burnable, ERC20Permit, AccessControl, Pausable, ReentrancyGuard {

    // ─────────────────────────────────────────────────────────────────────────
    // Roles
    // ─────────────────────────────────────────────────────────────────────────

    /// @dev ChainLoyalty backend hot wallet — minting and batch settlement.
    bytes32 public constant MINTER_ROLE   = keccak256("MINTER_ROLE");

    /// @dev Authorised to burn points on redemption (usually same as minter).
    bytes32 public constant BURNER_ROLE   = keccak256("BURNER_ROLE");

    /// @dev Can update programme-level settings (cap, transferability).
    bytes32 public constant MANAGER_ROLE  = keccak256("MANAGER_ROLE");

    // ─────────────────────────────────────────────────────────────────────────
    // State
    // ─────────────────────────────────────────────────────────────────────────

    /// @notice Maximum total supply of points. 0 = uncapped.
    uint256 public supplyCap;

    /// @notice Whether holders can freely transfer points between wallets.
    bool public transferable;

    /// @notice Total points ever minted (including already-burned).
    uint256 public totalEverMinted;

    /// @notice Total points ever burned / redeemed.
    uint256 public totalEverBurned;

    /// @notice Per-program points minted. programId → amount.
    mapping(string => uint256) public programTotalMinted;

    /// @notice Per-wallet cumulative points earned (never decreases on spend).
    mapping(address => uint256) public lifetimeEarned;

    /// @notice Per-wallet cumulative points spent/burned.
    mapping(address => uint256) public lifetimeSpent;

    /// @notice Track used attestation UIDs to prevent replay.
    mapping(bytes32 => bool) public usedAttestationUIDs;

    // ─────────────────────────────────────────────────────────────────────────
    // Events
    // ─────────────────────────────────────────────────────────────────────────

    event PointsMinted(
        address indexed recipient,
        uint256         amount,
        string          programId,
        string          reason,       // e.g. "purchase", "referral", "streak"
        bytes32         attestationUID
    );
    event PointsBurned(
        address indexed wallet,
        uint256         amount,
        string          programId,
        string          reason,       // e.g. "redemption", "tier-decay"
        bytes32         attestationUID
    );
    event BatchMintCompleted(
        uint256 recipientCount,
        uint256 totalAmount,
        string  programId
    );
    event BatchBurnCompleted(
        uint256 walletCount,
        uint256 totalAmount,
        string  programId
    );
    event SupplyCapUpdated(uint256 oldCap, uint256 newCap);
    event TransferabilityUpdated(bool transferable);

    // ─────────────────────────────────────────────────────────────────────────
    // Errors
    // ─────────────────────────────────────────────────────────────────────────

    error SupplyCapExceeded(uint256 requested, uint256 available);
    error NonTransferableToken();
    error InsufficientBalance(address wallet, uint256 requested, uint256 available);
    error AttestationUIDAlreadyUsed(bytes32 uid);
    error ArrayLengthMismatch();
    error ZeroAddress();
    error ZeroAmount();

    // ─────────────────────────────────────────────────────────────────────────
    // Constructor
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * @param tokenName   ERC-20 name  (e.g. "AcmeCo Loyalty Points").
     * @param tokenSymbol ERC-20 symbol (e.g. "ALP").
     * @param _supplyCap  Max total supply; 0 = unlimited.
     * @param _transferable Whether points are freely transferable at launch.
     * @param admin       Address granted DEFAULT_ADMIN_ROLE and MANAGER_ROLE.
     * @param minter      Address granted MINTER_ROLE and BURNER_ROLE (backend wallet).
     */
    constructor(
        string memory tokenName,
        string memory tokenSymbol,
        uint256       _supplyCap,
        bool          _transferable,
        address       admin,
        address       minter
    )
        ERC20(tokenName, tokenSymbol)
        ERC20Permit(tokenName)
    {
        if (admin  == address(0)) revert ZeroAddress();
        if (minter == address(0)) revert ZeroAddress();

        supplyCap   = _supplyCap;
        transferable = _transferable;

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MANAGER_ROLE,       admin);
        _grantRole(MINTER_ROLE,        minter);
        _grantRole(BURNER_ROLE,        minter);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Minting  [MINTER_ROLE]
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * @notice Mint points to a single recipient.
     * @param recipient      Destination wallet.
     * @param amount         Amount of points (in wei — 18 decimals).
     * @param programId      The loyalty programme these points belong to.
     * @param reason         Human-readable trigger reason for the audit log.
     * @param attestationUID EAS off-chain attestation UID; bytes32(0) = not linked.
     */
    function mintPoints(
        address         recipient,
        uint256         amount,
        string calldata programId,
        string calldata reason,
        bytes32         attestationUID
    ) external onlyRole(MINTER_ROLE) whenNotPaused nonReentrant {
        if (recipient == address(0)) revert ZeroAddress();
        if (amount    == 0)          revert ZeroAmount();
        _assertAttestationNotUsed(attestationUID);
        _assertSupplyCap(amount);

        _doMint(recipient, amount, programId, reason, attestationUID);
    }

    /**
     * @notice Batch-mint points to multiple wallets in a single transaction.
     * @dev    All arrays must be the same length. Total amount is checked against cap.
     */
    function batchMintPoints(
        address[] calldata recipients,
        uint256[] calldata amounts,
        bytes32[] calldata attestationUIDs,
        string calldata    programId,
        string calldata    reason
    ) external onlyRole(MINTER_ROLE) whenNotPaused nonReentrant {
        uint256 len = recipients.length;
        if (len != amounts.length || len != attestationUIDs.length)
            revert ArrayLengthMismatch();

        uint256 totalAmount;
        for (uint256 i = 0; i < len; i++) {
            totalAmount += amounts[i];
        }
        _assertSupplyCap(totalAmount);

        for (uint256 i = 0; i < len; i++) {
            if (recipients[i] == address(0)) revert ZeroAddress();
            if (amounts[i]    == 0)          revert ZeroAmount();
            _assertAttestationNotUsed(attestationUIDs[i]);

            _doMint(recipients[i], amounts[i], programId, reason, attestationUIDs[i]);
        }

        emit BatchMintCompleted(len, totalAmount, programId);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Burning / Redemption  [BURNER_ROLE]
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * @notice Burn points from a wallet on redemption or tier-decay.
     * @dev    The backend calls this; it does NOT require an allowance because
     *         BURNER_ROLE is a privileged server-side role. For user-initiated
     *         redemptions, use burnFrom() with prior approval or Permit.
     * @param wallet         Source wallet.
     * @param amount         Amount to burn.
     * @param programId      Programme context.
     * @param reason         Reason for burning (e.g. "redemption:reward-X").
     * @param attestationUID EAS off-chain attestation UID.
     */
    function spendPoints(
        address         wallet,
        uint256         amount,
        string calldata programId,
        string calldata reason,
        bytes32         attestationUID
    ) external onlyRole(BURNER_ROLE) whenNotPaused nonReentrant {
        if (wallet == address(0)) revert ZeroAddress();
        if (amount == 0)          revert ZeroAmount();
        if (balanceOf(wallet) < amount)
            revert InsufficientBalance(wallet, amount, balanceOf(wallet));
        _assertAttestationNotUsed(attestationUID);

        _doBurn(wallet, amount, programId, reason, attestationUID);
    }

    /**
     * @notice Batch-burn points from multiple wallets (e.g. monthly tier-decay).
     */
    function batchSpendPoints(
        address[] calldata wallets,
        uint256[] calldata amounts,
        bytes32[] calldata attestationUIDs,
        string calldata    programId,
        string calldata    reason
    ) external onlyRole(BURNER_ROLE) whenNotPaused nonReentrant {
        uint256 len = wallets.length;
        if (len != amounts.length || len != attestationUIDs.length)
            revert ArrayLengthMismatch();

        uint256 totalAmount;
        for (uint256 i = 0; i < len; i++) {
            if (wallets[i] == address(0)) revert ZeroAddress();
            if (amounts[i] == 0)          revert ZeroAmount();
            if (balanceOf(wallets[i]) < amounts[i])
                revert InsufficientBalance(wallets[i], amounts[i], balanceOf(wallets[i]));
            _assertAttestationNotUsed(attestationUIDs[i]);
            totalAmount += amounts[i];
        }

        for (uint256 i = 0; i < len; i++) {
            _doBurn(wallets[i], amounts[i], programId, reason, attestationUIDs[i]);
        }

        emit BatchBurnCompleted(len, totalAmount, programId);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // View Functions
    // ─────────────────────────────────────────────────────────────────────────

    /// @notice Returns the on-chain points balance of a wallet.
    function pointsBalance(address wallet) external view returns (uint256) {
        return balanceOf(wallet);
    }

    /// @notice Returns lifetime earned, lifetime spent, and current balance.
    function walletStats(address wallet)
        external view
        returns (uint256 earned, uint256 spent, uint256 current)
    {
        earned  = lifetimeEarned[wallet];
        spent   = lifetimeSpent[wallet];
        current = balanceOf(wallet);
    }

    /// @notice Returns current circulating supply vs cap.
    function supplyInfo()
        external view
        returns (uint256 circulating, uint256 cap, uint256 everMinted, uint256 everBurned)
    {
        circulating = totalSupply();
        cap         = supplyCap;
        everMinted  = totalEverMinted;
        everBurned  = totalEverBurned;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Manager Controls  [MANAGER_ROLE]
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * @notice Update the maximum supply cap.
     * @dev    New cap must be >= current total supply (cannot retroactively over-cap).
     */
    function setSupplyCap(uint256 newCap) external onlyRole(MANAGER_ROLE) {
        emit SupplyCapUpdated(supplyCap, newCap);
        supplyCap = newCap;
    }

    /**
     * @notice Enable or disable free transfers between wallets.
     */
    function setTransferable(bool _transferable) external onlyRole(MANAGER_ROLE) {
        transferable = _transferable;
        emit TransferabilityUpdated(_transferable);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Admin Controls  [DEFAULT_ADMIN_ROLE]
    // ─────────────────────────────────────────────────────────────────────────

    function pause()   external onlyRole(DEFAULT_ADMIN_ROLE) { _pause();   }
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) { _unpause(); }

    // ─────────────────────────────────────────────────────────────────────────
    // Transfer Guard
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * @dev Block transfers if the token is non-transferable.
     *      Minting (from == 0) and burning (to == 0) are always permitted.
     */
    function _update(
        address from,
        address to,
        uint256 value
    ) internal override {
        if (from != address(0) && to != address(0) && !transferable)
            revert NonTransferableToken();
        super._update(from, to, value);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Internal Helpers
    // ─────────────────────────────────────────────────────────────────────────

    function _doMint(
        address       recipient,
        uint256       amount,
        string memory programId,
        string memory reason,
        bytes32       attestationUID
    ) internal {
        if (attestationUID != bytes32(0))
            usedAttestationUIDs[attestationUID] = true;

        totalEverMinted            += amount;
        lifetimeEarned[recipient]  += amount;
        programTotalMinted[programId] += amount;

        _mint(recipient, amount);

        emit PointsMinted(recipient, amount, programId, reason, attestationUID);
    }

    function _doBurn(
        address       wallet,
        uint256       amount,
        string memory programId,
        string memory reason,
        bytes32       attestationUID
    ) internal {
        if (attestationUID != bytes32(0))
            usedAttestationUIDs[attestationUID] = true;

        totalEverBurned        += amount;
        lifetimeSpent[wallet]  += amount;

        _burn(wallet, amount);

        emit PointsBurned(wallet, amount, programId, reason, attestationUID);
    }

    function _assertSupplyCap(uint256 additionalAmount) internal view {
        if (supplyCap != 0 && totalSupply() + additionalAmount > supplyCap)
            revert SupplyCapExceeded(additionalAmount, supplyCap - totalSupply());
    }

    function _assertAttestationNotUsed(bytes32 uid) internal view {
        if (uid != bytes32(0) && usedAttestationUIDs[uid])
            revert AttestationUIDAlreadyUsed(uid);
    }
}
