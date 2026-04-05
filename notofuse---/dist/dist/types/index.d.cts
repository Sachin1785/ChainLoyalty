export { A as ApiErrorResponse, a as ApiResponse, E as EventIngestionRequest, b as EventIngestionResponse, c as EventType, L as LeaderboardEntry, d as LeaderboardResponse, e as LootboxConfig, f as LootboxPrize, N as NonceRequest, g as NonceResponse, P as PaginationMeta, R as ReferralCreateResponse, h as RewardBalance, i as RewardHistoryItem, j as RewardType, k as RewardsHistoryResponse, l as RuleType, S as SpinCommitResponse, m as SpinRevealResponse, V as VerifySignatureRequest, W as WalletSession } from '../api-smVj4T5E.cjs';

declare class ChainLoyaltyError extends Error {
    readonly code: string;
    readonly status?: number;
    readonly requestId?: string;
    readonly details?: unknown;
    constructor(params: {
        code: string;
        message: string;
        status?: number;
        requestId?: string;
        details?: unknown;
    });
}

export { ChainLoyaltyError };
