import { defaultClientConfig, type ChainLoyaltyClientConfig } from "./config";
import {
  type ApiErrorResponse,
  type ApiResponse,
  type EventIngestionRequest,
  type EventIngestionResponse,
  type LeaderboardResponse,
  type NonceRequest,
  type NonceResponse,
  type ReferralCreateResponse,
  type RewardBalance,
  type RewardsHistoryResponse,
  type VerifySignatureRequest,
  type WalletSession,
  type LootboxConfig,
  type SpinCommitResponse,
  type SpinRevealResponse,
} from "../types";
import { ChainLoyaltyError } from "../types";
import { retryWithBackoff } from "../utils";

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  idempotencyKey?: string;
  tokenOverride?: string;
}

export class ChainLoyaltyClient {
  private readonly config: ChainLoyaltyClientConfig;

  constructor(config: ChainLoyaltyClientConfig) {
    if (!config.baseUrl) {
      throw new Error("baseUrl is required");
    }
    this.config = config;
  }

  async requestNonce(payload: NonceRequest): Promise<NonceResponse> {
    const response = await this.request<NonceResponse>(
      "/api/v1/wallet/nonce",
      {
        method: "POST",
        body: payload,
      },
    );
    return response;
  }

  async verifySignature(payload: VerifySignatureRequest): Promise<WalletSession> {
    const response = await this.request<WalletSession>(
      "/api/v1/wallet/verify",
      {
        method: "POST",
        body: payload,
      },
    );
    return response;
  }

  async ingestEvent(
    payload: EventIngestionRequest,
    idempotencyKey?: string,
  ): Promise<EventIngestionResponse> {
    const response = await this.request<any>(
      "/api/v1/events",
      {
        method: "POST",
        body: {
          wallet_address: payload.walletAddress,
          event_type: payload.eventType,
          metadata: payload.metadata,
        },
        idempotencyKey,
      },
    );
    return {
      eventId: response.event_id,
      accepted: response.status === "success",
    };
  }

  async getRewardBalance(walletAddress: string): Promise<RewardBalance> {
    const response = await this.request<any>(
      `/api/v1/rewards/${walletAddress}/stats`,
      {
        method: "GET",
      },
    );
    return {
      walletAddress: response.wallet_address,
      pointsBalance: response.total_points,
      badges: response.badges || [],
    };
  }

  async getRewardHistory(
    walletAddress: string,
    page = 1,
    pageSize = 20,
  ): Promise<RewardsHistoryResponse> {
    const response = await this.request<any[]>(
      `/api/v1/rewards/${walletAddress}/history?page=${page}&pageSize=${pageSize}`,
      {
        method: "GET",
      },
    );
    return {
      items: response.map((item: any) => ({
        id: item.id,
        walletAddress: item.wallet_address,
        rewardType: item.reward_type,
        amount: item.amount,
        reason: item.reason,
        createdAt: item.created_at,
      })),
      pagination: { page, pageSize, total: response.length, hasNextPage: false }
    };
  }

  async getLeaderboard(page = 1, pageSize = 20): Promise<LeaderboardResponse> {
    const response = await this.request<any[]>(
      `/api/v1/rewards/leaderboard?limit=${pageSize}&page=${page}`,
      {
        method: "GET",
      },
    );
    return {
      items: response.map((item: any) => ({
        rank: item.rank,
        walletAddress: item.full_wallet || item.wallet,
        score: item.points,
      })),
      pagination: { page, pageSize, total: response.length, hasNextPage: false }
    };
  }

  async createReferralCode(walletAddress: string): Promise<ReferralCreateResponse> {
    const response = await this.request<any>(
      `/api/v1/referrals/code/${walletAddress}`,
      {
        method: "GET",
      },
    );
    return {
      referralCode: response.referral_code,
      referralLink: "",
    };
  }

  async getLootboxConfig(lootboxId: number | string): Promise<LootboxConfig> {
    return await this.request<LootboxConfig>(
      `/api/v1/gamification/lootbox/${lootboxId}/config`,
      {
        method: "GET",
      },
    );
  }

  async commitSpin(walletAddress: string, lootboxId: number | string): Promise<SpinCommitResponse> {
    return await this.request<SpinCommitResponse>(
      `/api/v1/gamification/spin/commit?wallet_address=${walletAddress}&lootbox_id=${lootboxId}`,
      {
        method: "POST",
      },
    );
  }

  async revealSpin(walletAddress: string, salt: string): Promise<SpinRevealResponse> {
    return await this.request<SpinRevealResponse>(
      `/api/v1/gamification/spin/reveal?wallet_address=${walletAddress}&salt_hex=${salt}`,
      {
        method: "POST",
      },
    );
  }

  private async request<T>(path: string, options: RequestOptions): Promise<T> {
    const {
      timeoutMs,
      retries,
      retryBaseDelayMs,
      retryMaxDelayMs,
    } = this.getResolvedConfig();

    const shouldRetry = (error: unknown): boolean => {
      if (!(error instanceof ChainLoyaltyError)) {
        return true;
      }
      if (error.status === undefined) {
        return true;
      }
      return error.status >= 500 || error.status === 429;
    };

    return retryWithBackoff(
      async () => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), timeoutMs);

        try {
          const response = await fetch(`${this.config.baseUrl}${path}`, {
            method: options.method ?? "GET",
            headers: this.buildHeaders(options),
            body: options.body ? JSON.stringify(options.body) : undefined,
            signal: controller.signal,
          });

          const json = (await response.json().catch(() => ({}))) as
            | Partial<ApiErrorResponse>
            | T;

          if (!response.ok) {
            const apiError = json as Partial<ApiErrorResponse>;
            throw new ChainLoyaltyError({
              code: apiError.error?.code ?? "REQUEST_FAILED",
              message:
                apiError.error?.message ??
                `Request failed with status ${response.status}`,
              status: response.status,
              requestId: apiError.requestId,
              details: apiError.error?.details,
            });
          }

          return json as T;
        } catch (error) {
          if (error instanceof DOMException && error.name === "AbortError") {
            throw new ChainLoyaltyError({
              code: "REQUEST_TIMEOUT",
              message: "Request timed out",
            });
          }
          if (error instanceof ChainLoyaltyError) {
            throw error;
          }
          throw new ChainLoyaltyError({
            code: "NETWORK_ERROR",
            message: "Network request failed",
            details: error,
          });
        } finally {
          clearTimeout(timeout);
        }
      },
      {
        retries,
        baseDelayMs: retryBaseDelayMs,
        maxDelayMs: retryMaxDelayMs,
        shouldRetry,
      },
    );
  }

  private buildHeaders(options: RequestOptions): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (this.config.apiKey) {
      headers["x-api-key"] = this.config.apiKey;
    }

    const token = options.tokenOverride ?? this.config.accessToken;
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    if (options.idempotencyKey) {
      headers["Idempotency-Key"] = options.idempotencyKey;
    }

    return headers;
  }

  private getResolvedConfig() {
    return {
      timeoutMs: this.config.timeoutMs ?? defaultClientConfig.timeoutMs,
      retries: this.config.retries ?? defaultClientConfig.retries,
      retryBaseDelayMs:
        this.config.retryBaseDelayMs ?? defaultClientConfig.retryBaseDelayMs,
      retryMaxDelayMs:
        this.config.retryMaxDelayMs ?? defaultClientConfig.retryMaxDelayMs,
    };
  }
}
