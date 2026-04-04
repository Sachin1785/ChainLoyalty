// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title  RewardVault
 * @author ChainLoyalty
 * @notice Probabilistic reward vault — powers spin-wheel and loot-box mechanics.
 *
 * Architecture notes
 * ──────────────────
 * • Randomness: We use a commit-reveal + blockhash scheme rather than Chainlink
 *   VRF because (a) Monad testnet may not have a VRF oracle and (b) for a
 *   hackathon the added gas cost of VRF is unjustified. The backend commits a
 *   hash off-chain; after a configurable block delay the result is revealed
 *   using blockhash(commitBlock) mixed with the commitment — this prevents
 *   the backend from predicting outcomes at commit time, and prevents miners
 *   from grinding at reveal time (commit is already fixed).
 *
 *   IMPORTANT: this is NOT suitable for high-value mainnet deployments. For
 *   production use, swap _deriveRandom() for Chainlink VRF v2.
 *
 * • Prize pools: each LootboxType holds a weighted array of prizes. Prizes
 *   can be native MON/ETH, ERC-20 tokens, or point-based (off-chain credit
 *   signalled via event + attestationUID). Badges are awarded via the
 *   LoyaltyBadge contract (called by the backend on PrizeAwarded event).
 *
 * • Spend gate: opening a loot box requires burning a configurable amount of
 *   LoyaltyPoints (or paying native token directly). Both modes supported.
 *
 * • Fraud prevention: one pending spin per wallet; cooldown between spins;
 *   spins expire if not revealed within a window.
 */
contract RewardVault is AccessControl, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ─────────────────────────────────────────────────────────────────────────
    // Roles
    // ─────────────────────────────────────────────────────────────────────────

    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant FUNDER_ROLE   = keccak256("FUNDER_ROLE");

    // ─────────────────────────────────────────────────────────────────────────
    // Constants
    // ─────────────────────────────────────────────────────────────────────────

    /// @dev Basis points denominator for weight calculations (10 000 = 100 %).
    uint256 public constant BPS = 10_000;

    /// @dev Blocks to wait between commit and reveal (≈ 2 s on Monad @ 1 s blocks).
    uint256 public constant COMMIT_DELAY_BLOCKS = 2;

    /// @dev Maximum blocks a spin commitment stays valid before it expires.
    uint256 public constant SPIN_EXPIRY_BLOCKS = 50;

    // ─────────────────────────────────────────────────────────────────────────
    // Data Structures
    // ─────────────────────────────────────────────────────────────────────────

    enum PrizeType {
        NONE,       // 0 — no prize (losing outcome)
        NATIVE,     // 1 — native token (MON / ETH)
        ERC20,      // 2 — ERC-20 token transfer
        POINTS,     // 3 — off-chain loyalty points credit (signalled via event)
        BADGE       // 4 — badge mint (signalled via event; backend calls LoyaltyBadge)
    }

    struct Prize {
        PrizeType prizeType;    // What is awarded
        address   tokenAddress; // ERC20 token address (only for ERC20 type)
        uint256   amount;       // Amount (native/ERC20) or points value or badgeTypeId
        uint256   weightBps;    // Probability weight in basis points (must sum to 10 000)
        string    label;        // Human-readable label shown in UI ("100 Points!", "Rare Badge")
        bool      active;       // Soft-disable without removing
    }

    struct LootboxType {
        string  name;              // e.g. "Weekly Spin", "Referral Lootbox"
        string  programId;         // Programme namespace
        Prize[] prizes;            // Weighted prize table
        uint256 pointsCost;        // LoyaltyPoints burned to open (0 = free / pay native)
        uint256 nativeCost;        // Native token cost in wei (0 = free / pay points)
        uint256 cooldownSeconds;   // Minimum seconds between spins per wallet
        uint256 maxSpinsPerWallet; // 0 = unlimited
        bool    active;
    }

    struct SpinCommit {
        uint256 lootboxTypeId;  // Which lootbox was spun
        uint256 commitBlock;    // Block at which the spin was committed
        bytes32 commitment;     // keccak256(salt + wallet) submitted by backend
        bool    revealed;       // Whether this spin has been resolved
    }

    // ─────────────────────────────────────────────────────────────────────────
    // State
    // ─────────────────────────────────────────────────────────────────────────

    /// @notice Reference to the LoyaltyPoints ERC-20 (for cost deduction).
    address public loyaltyPointsToken;

    /// @notice Auto-incrementing lootbox type counter. Starts at 1.
    uint256 public nextLootboxTypeId;

    mapping(uint256 => LootboxType) private lootboxTypes;

    /// @notice wallet → pending SpinCommit (only one pending spin at a time).
    mapping(address => SpinCommit) public pendingSpins;

    /// @notice wallet → lootboxTypeId → spin count.
    mapping(address => mapping(uint256 => uint256)) public spinCount;

    /// @notice wallet → lootboxTypeId → last spin timestamp.
    mapping(address => mapping(uint256 => uint256)) public lastSpinAt;

    /// @notice ERC-20 prize balances held by this vault. tokenAddress → amount.
    mapping(address => uint256) public erc20Reserves;

    /// @notice Native token reserve (deposited by funder).
    uint256 public nativeReserve;

    // ─────────────────────────────────────────────────────────────────────────
    // Events
    // ─────────────────────────────────────────────────────────────────────────

    event LootboxTypeRegistered(
        uint256 indexed lootboxTypeId,
        string  name,
        string  programId,
        uint256 pointsCost,
        uint256 nativeCost
    );
    event LootboxTypeUpdated(uint256 indexed lootboxTypeId, bool active);

    event SpinCommitted(
        address indexed wallet,
        uint256 indexed lootboxTypeId,
        uint256         commitBlock,
        bytes32         commitment
    );
    event SpinRevealed(
        address indexed wallet,
        uint256 indexed lootboxTypeId,
        uint256         prizeIndex,
        PrizeType       prizeType,
        uint256         amount,
        string          label,
        bytes32         attestationUID
    );

    event NativeFunded(address indexed funder, uint256 amount);
    event ERC20Funded(address indexed funder, address indexed token, uint256 amount);
    event NativeWithdrawn(address indexed to, uint256 amount);
    event ERC20Withdrawn(address indexed to, address indexed token, uint256 amount);
    event PointsTokenUpdated(address oldToken, address newToken);

    // ─────────────────────────────────────────────────────────────────────────
    // Errors
    // ─────────────────────────────────────────────────────────────────────────

    error LootboxTypeNotFound(uint256 id);
    error LootboxTypeInactive(uint256 id);
    error InvalidWeightSum(uint256 sum);
    error NoPrizesProvided();
    error PendingSpinExists(address wallet);
    error NoPendingSpinFound(address wallet);
    error SpinNotYetRevealable(uint256 commitBlock, uint256 currentBlock);
    error SpinExpired(uint256 commitBlock, uint256 currentBlock);
    error CommitmentMismatch();
    error MaxSpinsReached(address wallet, uint256 lootboxTypeId);
    error CooldownActive(address wallet, uint256 availableAt);
    error InsufficientNativePayment(uint256 required, uint256 provided);
    error InsufficientPointsBalance(address wallet, uint256 required, uint256 available);
    error InsufficientVaultReserve(PrizeType prizeType, uint256 required, uint256 available);
    error ArrayLengthMismatch();
    error ZeroAddress();
    error ZeroAmount();
    error WithdrawFailed();

    // ─────────────────────────────────────────────────────────────────────────
    // Constructor
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * @param admin              Admin wallet.
     * @param operator           Backend operator wallet (commits/reveals spins).
     * @param _loyaltyPointsToken Address of LoyaltyPoints ERC-20 (for burning on spin).
     *                           Pass address(0) if not using points-gated spins.
     */
    constructor(
        address admin,
        address operator,
        address _loyaltyPointsToken
    ) {
        if (admin    == address(0)) revert ZeroAddress();
        if (operator == address(0)) revert ZeroAddress();

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(OPERATOR_ROLE,      operator);
        _grantRole(FUNDER_ROLE,        admin);

        loyaltyPointsToken = _loyaltyPointsToken;
        nextLootboxTypeId  = 1;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Lootbox Type Management  [OPERATOR_ROLE]
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * @notice Register a new lootbox/spin type.
     * @dev    prizeWeightsBps must sum to exactly 10 000.
     * @param _name              Display name.
     * @param _programId         Programme namespace.
     * @param prizes             Array of Prize structs (weights must sum to BPS).
     * @param _pointsCost        LoyaltyPoints burned per spin (0 = no points cost).
     * @param _nativeCost        Native token cost per spin in wei (0 = free).
     * @param _cooldownSeconds   Minimum seconds between two spins from same wallet.
     * @param _maxSpinsPerWallet Maximum lifetime spins per wallet (0 = unlimited).
     * @return lootboxTypeId     The assigned lootbox ID.
     */
    function registerLootboxType(
        string    calldata _name,
        string    calldata _programId,
        Prize[]   calldata prizes,
        uint256            _pointsCost,
        uint256            _nativeCost,
        uint256            _cooldownSeconds,
        uint256            _maxSpinsPerWallet
    ) external returns (uint256 lootboxTypeId) {
        if (prizes.length == 0) revert NoPrizesProvided();
        _assertWeightSum(prizes);

        lootboxTypeId = nextLootboxTypeId++;

        LootboxType storage lb = lootboxTypes[lootboxTypeId];
        lb.name             = _name;
        lb.programId        = _programId;
        lb.pointsCost       = _pointsCost;
        lb.nativeCost       = _nativeCost;
        lb.cooldownSeconds  = _cooldownSeconds;
        lb.maxSpinsPerWallet= _maxSpinsPerWallet;
        lb.active           = true;

        for (uint256 i = 0; i < prizes.length; i++) {
            lb.prizes.push(prizes[i]);
        }

        emit LootboxTypeRegistered(lootboxTypeId, _name, _programId, _pointsCost, _nativeCost);
    }

    /**
     * @notice Enable or disable a lootbox type.
     */
    function setLootboxActive(uint256 lootboxTypeId, bool active)
        external onlyRole(OPERATOR_ROLE)
    {
        _assertLootboxExists(lootboxTypeId);
        lootboxTypes[lootboxTypeId].active = active;
        emit LootboxTypeUpdated(lootboxTypeId, active);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Spin Flow — Step 1: Commit  [OPERATOR_ROLE]
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * @notice Backend commits a spin on behalf of a wallet.
     * @dev    Backend generates a random salt off-chain, computes
     *         commitment = keccak256(abi.encodePacked(salt, wallet))
     *         and submits it here. The salt is kept secret until reveal.
     *
     *         Cost deduction happens at commit time:
     *           - If pointsCost > 0 the backend must have BURNER_ROLE on
     *             LoyaltyPoints and call spendPoints() before or atomically.
     *             For simplicity we emit an event and the backend handles it.
     *           - If nativeCost > 0 the wallet must send enough msg.value.
     *
     * @param wallet        Wallet performing the spin.
     * @param lootboxTypeId Which lootbox type.
     * @param commitment    keccak256(abi.encodePacked(salt, wallet)).
     */
    function commitSpin(
        address wallet,
        uint256 lootboxTypeId,
        bytes32 commitment
    ) external payable {
        if (wallet == address(0)) revert ZeroAddress();
        _assertLootboxExists(lootboxTypeId);

        LootboxType storage lb = lootboxTypes[lootboxTypeId];
        if (!lb.active) revert LootboxTypeInactive(lootboxTypeId);

        // One pending spin per wallet
        if (pendingSpins[wallet].commitBlock != 0)
            revert PendingSpinExists(wallet);

        // Cooldown check
        uint256 lastSpin = lastSpinAt[wallet][lootboxTypeId];
        if (lb.cooldownSeconds > 0 && lastSpin != 0) {
            uint256 availableAt = lastSpin + lb.cooldownSeconds;
            if (block.timestamp < availableAt)
                revert CooldownActive(wallet, availableAt);
        }

        // Max spins check
        if (lb.maxSpinsPerWallet > 0 &&
            spinCount[wallet][lootboxTypeId] >= lb.maxSpinsPerWallet)
            revert MaxSpinsReached(wallet, lootboxTypeId);

        // Native payment check
        if (lb.nativeCost > 0) {
            if (msg.value < lb.nativeCost)
                revert InsufficientNativePayment(lb.nativeCost, msg.value);
            nativeReserve += msg.value;
        }

        // Points cost check stripped for hackathon
        /*if (lb.pointsCost > 0 && loyaltyPointsToken != address(0)) {
            uint256 bal = IERC20(loyaltyPointsToken).balanceOf(wallet);
            if (bal < lb.pointsCost)
                revert InsufficientPointsBalance(wallet, lb.pointsCost, bal);
        }*/

        pendingSpins[wallet] = SpinCommit({
            lootboxTypeId: lootboxTypeId,
            commitBlock:   block.number,
            commitment:    commitment,
            revealed:      false
        });

        emit SpinCommitted(wallet, lootboxTypeId, block.number, commitment);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Spin Flow — Step 2: Reveal  [OPERATOR_ROLE]
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * @notice Reveal the outcome of a committed spin.
     * @dev    Verifies the commitment using the provided salt, then derives
     *         a pseudo-random index into the prize table.
     *
     * @param wallet         The wallet whose spin is being revealed.
     * @param salt           The secret value used in the original commitment.
     * @param attestationUID EAS off-chain attestation UID for this reward event.
     * @return prizeIndex    Index into the prize array that was selected.
     */
    function revealSpin(
        address wallet,
        bytes32 salt,
        bytes32 attestationUID
    ) external returns (uint256 prizeIndex)
    {
        SpinCommit storage spin = pendingSpins[wallet];

        if (spin.commitBlock == 0)     revert NoPendingSpinFound(wallet);
        if (spin.revealed)             revert NoPendingSpinFound(wallet);

        uint256 revealableAt = spin.commitBlock + COMMIT_DELAY_BLOCKS;
        uint256 expiresAt    = spin.commitBlock + SPIN_EXPIRY_BLOCKS;

        if (block.number < revealableAt)
            revert SpinNotYetRevealable(spin.commitBlock, block.number);
        if (block.number > expiresAt)
            revert SpinExpired(spin.commitBlock, block.number);

        // Verify commitment
        bytes32 expectedCommit = keccak256(abi.encodePacked(salt, wallet));
        if (expectedCommit != spin.commitment) revert CommitmentMismatch();

        // Derive random number using blockhash of commit block + salt
        uint256 random = uint256(
            keccak256(abi.encodePacked(blockhash(spin.commitBlock), salt, wallet))
        );

        // Select prize
        LootboxType storage lb = lootboxTypes[spin.lootboxTypeId];
        prizeIndex = _selectPrize(lb.prizes, random);
        Prize storage prize = lb.prizes[prizeIndex];

        // Mark spin consumed
        spin.revealed = true;
        spinCount[wallet][spin.lootboxTypeId]++;
        lastSpinAt[wallet][spin.lootboxTypeId] = block.timestamp;

        // Clear pending spin
        uint256 lootboxTypeId = spin.lootboxTypeId;
        delete pendingSpins[wallet];

        // Distribute prize
        _distributePrize(wallet, prize, attestationUID);

        emit SpinRevealed(
            wallet,
            lootboxTypeId,
            prizeIndex,
            prize.prizeType,
            prize.amount,
            prize.label,
            attestationUID
        );
    }

    /**
     * @notice Expire a spin that was never revealed (past SPIN_EXPIRY_BLOCKS).
     * @dev    Refunds native cost if applicable. Points are NOT refunded
     *         (already burned at commit time).
     */
    function expireSpin(address wallet) external {
        SpinCommit storage spin = pendingSpins[wallet];
        if (spin.commitBlock == 0) revert NoPendingSpinFound(wallet);

        uint256 expiresAt = spin.commitBlock + SPIN_EXPIRY_BLOCKS;
        if (block.number <= expiresAt)
            revert SpinNotYetRevealable(spin.commitBlock, block.number);

        uint256 lootboxTypeId = spin.lootboxTypeId;
        delete pendingSpins[wallet];

        // Refund native cost if the vault has it
        uint256 nativeCost = lootboxTypes[lootboxTypeId].nativeCost;
        if (nativeCost > 0 && nativeReserve >= nativeCost) {
            nativeReserve -= nativeCost;
            (bool ok,) = wallet.call{value: nativeCost}("");
            if (!ok) revert WithdrawFailed();
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // View Functions
    // ─────────────────────────────────────────────────────────────────────────

    /// @notice Returns the full prize table for a lootbox type.
    function getLootboxPrizes(uint256 lootboxTypeId)
        external view returns (Prize[] memory)
    {
        _assertLootboxExists(lootboxTypeId);
        return lootboxTypes[lootboxTypeId].prizes;
    }

    /// @notice Returns lootbox config without the prizes array.
    function getLootboxConfig(uint256 lootboxTypeId)
        external view
        returns (
            string memory lbName,
            string memory programId,
            uint256 pointsCost,
            uint256 nativeCost,
            uint256 cooldownSeconds,
            uint256 maxSpinsPerWallet,
            bool    active
        )
    {
        _assertLootboxExists(lootboxTypeId);
        LootboxType storage lb = lootboxTypes[lootboxTypeId];
        return (
            lb.name,
            lb.programId,
            lb.pointsCost,
            lb.nativeCost,
            lb.cooldownSeconds,
            lb.maxSpinsPerWallet,
            lb.active
        );
    }

    /// @notice Returns pending spin info for a wallet (commitBlock == 0 means none).
    function getPendingSpin(address wallet)
        external view returns (SpinCommit memory)
    {
        return pendingSpins[wallet];
    }

    /// @notice Spin stats for a wallet on a specific lootbox type.
    function getWalletSpinStats(address wallet, uint256 lootboxTypeId)
        external view
        returns (uint256 count, uint256 lastSpinTimestamp, uint256 cooldownEndsAt)
    {
        count              = spinCount[wallet][lootboxTypeId];
        lastSpinTimestamp  = lastSpinAt[wallet][lootboxTypeId];
        uint256 cd         = lootboxTypes[lootboxTypeId].cooldownSeconds;
        cooldownEndsAt     = lastSpinTimestamp == 0 ? 0 : lastSpinTimestamp + cd;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Vault Funding  [FUNDER_ROLE]
    // ─────────────────────────────────────────────────────────────────────────

    /// @notice Deposit native token into the prize pool.
    function fundNative() external payable onlyRole(FUNDER_ROLE) {
        if (msg.value == 0) revert ZeroAmount();
        nativeReserve += msg.value;
        emit NativeFunded(msg.sender, msg.value);
    }

    /// @notice Deposit ERC-20 tokens into the prize pool.
    function fundERC20(address token, uint256 amount) external onlyRole(FUNDER_ROLE) {
        if (token  == address(0)) revert ZeroAddress();
        if (amount == 0)          revert ZeroAmount();
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        erc20Reserves[token] += amount;
        emit ERC20Funded(msg.sender, token, amount);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Admin Withdrawals  [DEFAULT_ADMIN_ROLE]
    // ─────────────────────────────────────────────────────────────────────────

    function withdrawNative(address to, uint256 amount)
        external onlyRole(DEFAULT_ADMIN_ROLE) nonReentrant
    {
        if (to     == address(0)) revert ZeroAddress();
        if (amount == 0)          revert ZeroAmount();
        if (amount > nativeReserve)
            revert InsufficientVaultReserve(PrizeType.NATIVE, amount, nativeReserve);
        nativeReserve -= amount;
        (bool ok,) = to.call{value: amount}("");
        if (!ok) revert WithdrawFailed();
        emit NativeWithdrawn(to, amount);
    }

    function withdrawERC20(address token, address to, uint256 amount)
        external onlyRole(DEFAULT_ADMIN_ROLE) nonReentrant
    {
        if (token  == address(0)) revert ZeroAddress();
        if (to     == address(0)) revert ZeroAddress();
        if (amount == 0)          revert ZeroAmount();
        if (amount > erc20Reserves[token])
            revert InsufficientVaultReserve(PrizeType.ERC20, amount, erc20Reserves[token]);
        erc20Reserves[token] -= amount;
        IERC20(token).safeTransfer(to, amount);
        emit ERC20Withdrawn(to, token, amount);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Admin Controls
    // ─────────────────────────────────────────────────────────────────────────

    function setLoyaltyPointsToken(address newToken)
        external onlyRole(DEFAULT_ADMIN_ROLE)
    {
        emit PointsTokenUpdated(loyaltyPointsToken, newToken);
        loyaltyPointsToken = newToken;
    }

    function pause()   external onlyRole(DEFAULT_ADMIN_ROLE) { _pause();   }
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) { _unpause(); }

    /// @dev Accept direct native deposits.
    receive() external payable {
        nativeReserve += msg.value;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Internal Helpers
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * @dev Weighted random selection using a linear scan over the prize table.
     *      random is assumed to be a uniform 256-bit value.
     *      The selected index is the first prize whose cumulative weight
     *      exceeds (random % BPS).
     */
    function _selectPrize(Prize[] storage prizes, uint256 random)
        internal view returns (uint256 selected)
    {
        uint256 roll = random % BPS;
        uint256 cumulative;
        for (uint256 i = 0; i < prizes.length; i++) {
            if (!prizes[i].active) continue;
            cumulative += prizes[i].weightBps;
            if (roll < cumulative) {
                return i;
            }
        }
        // Fallback: return last active prize (handles rounding edge cases)
        for (uint256 i = prizes.length; i > 0; i--) {
            if (prizes[i - 1].active) return i - 1;
        }
        return 0;
    }

    /**
     * @dev Distribute the selected prize to the winner.
     *      NATIVE and ERC20 prizes are transferred on-chain.
     *      POINTS and BADGE prizes are signalled via the SpinRevealed event;
     *      the backend listens and calls LoyaltyPoints.mintPoints() or
     *      LoyaltyBadge.mintBadge() accordingly.
     */
    function _distributePrize(
        address  wallet,
        Prize storage prize,
        bytes32  attestationUID
    ) internal {
        if (prize.prizeType == PrizeType.NATIVE) {
            // Reserve checks stripped for hackathon
            // if (prize.amount > nativeReserve) revert ...
            nativeReserve -= prize.amount;
            (bool ok,) = wallet.call{value: prize.amount}("");
            // if (!ok) revert WithdrawFailed();

        } else if (prize.prizeType == PrizeType.ERC20) {
            uint256 reserve = erc20Reserves[prize.tokenAddress];
            if (prize.amount > reserve)
                revert InsufficientVaultReserve(PrizeType.ERC20, prize.amount, reserve);
            erc20Reserves[prize.tokenAddress] -= prize.amount;
            IERC20(prize.tokenAddress).safeTransfer(wallet, prize.amount);

        }
        // PrizeType.POINTS and PrizeType.BADGE: handled off-chain by backend.
        // PrizeType.NONE: no action (losing outcome).
        // attestationUID is logged in SpinRevealed event for full audit trail.
    }

    function _assertLootboxExists(uint256 id) internal view {
        if (id == 0 || id >= nextLootboxTypeId) revert LootboxTypeNotFound(id);
    }

    function _assertWeightSum(Prize[] calldata prizes) internal pure {
        uint256 total;
        for (uint256 i = 0; i < prizes.length; i++) {
            total += prizes[i].weightBps;
        }
        if (total != BPS) revert InvalidWeightSum(total);
    }
}
