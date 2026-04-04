export type EventType =
  | "subscription_started"
  | "referral_signed_up"
  | "feature_used"
  | "milestone_reached"
  | "purchase_completed";

export type RuleType = "threshold" | "frequency" | "conditional";

export type RewardType = "points" | "badge" | "probabilistic";

export interface ApiResponse<T> {
  data: T;
  requestId?: string;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  requestId?: string;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  hasNextPage: boolean;
}

export interface WalletSession {
  walletAddress: string;
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}

export interface NonceRequest {
  walletAddress: string;
}

export interface NonceResponse {
  nonce: string;
  message: string;
}

export interface VerifySignatureRequest {
  walletAddress: string;
  signature: string;
  message: string;
}

export interface EventIngestionRequest {
  walletAddress: string;
  eventType: EventType;
  metadata?: Record<string, unknown>;
  timestamp?: string;
}

export interface EventIngestionResponse {
  eventId: string;
  accepted: boolean;
}

export interface RewardBalance {
  walletAddress: string;
  pointsBalance: number;
  badges: string[];
}

export interface RewardHistoryItem {
  id: string;
  walletAddress: string;
  rewardType: RewardType;
  amount?: number;
  badgeName?: string;
  reason: string;
  createdAt: string;
}

export interface RewardsHistoryResponse {
  items: RewardHistoryItem[];
  pagination: PaginationMeta;
}

export interface LeaderboardEntry {
  rank: number;
  walletAddress: string;
  score: number;
}

export interface LeaderboardResponse {
  items: LeaderboardEntry[];
  pagination: PaginationMeta;
}

export interface ReferralCreateResponse {
  referralCode: string;
  referralLink: string;
}

export interface LootboxPrize {
  type: string;
  amount: number;
  label: string;
  weight_bps: number;
  color?: string;
}

export interface LootboxConfig {
  name: string;
  points_cost: number;
  cooldown: number;
  prizes: LootboxPrize[];
}

export interface SpinCommitResponse {
  salt: string;
}

export interface SpinRevealResponse {
  prize_label: string;
  tx_hash: string;
}
