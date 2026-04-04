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
    const response = await this.request<ApiResponse<NonceResponse>>(
      "/v1/wallet/nonce",
      {
        method: "POST",
        body: payload,
      },
    );
    return response.data;
  }

  async verifySignature(payload: VerifySignatureRequest): Promise<WalletSession> {
    const response = await this.request<ApiResponse<WalletSession>>(
      "/v1/wallet/verify",
      {
        method: "POST",
        body: payload,
      },
    );
    return response.data;
  }

  async ingestEvent(
    payload: EventIngestionRequest,
    idempotencyKey?: string,
  ): Promise<EventIngestionResponse> {
    const response = await this.request<ApiResponse<EventIngestionResponse>>(
      "/v1/events",
      {
        method: "POST",
        body: payload,
        idempotencyKey,
      },
    );
    return response.data;
  }

  async getRewardBalance(walletAddress: string): Promise<RewardBalance> {
    const response = await this.request<ApiResponse<RewardBalance>>(
      `/v1/rewards/${walletAddress}/balance`,
      {
        method: "GET",
      },
    );
    return response.data;
  }

  async getRewardHistory(
    walletAddress: string,
    page = 1,
    pageSize = 20,
  ): Promise<RewardsHistoryResponse> {
    const response = await this.request<ApiResponse<RewardsHistoryResponse>>(
      `/v1/rewards/${walletAddress}/history?page=${page}&pageSize=${pageSize}`,
      {
        method: "GET",
      },
    );
    return response.data;
  }

  async getLeaderboard(page = 1, pageSize = 20): Promise<LeaderboardResponse> {
    const response = await this.request<ApiResponse<LeaderboardResponse>>(
      `/v1/leaderboard?page=${page}&pageSize=${pageSize}`,
      {
        method: "GET",
      },
    );
    return response.data;
  }

  async createReferralCode(walletAddress: string): Promise<ReferralCreateResponse> {
    const response = await this.request<ApiResponse<ReferralCreateResponse>>(
      "/v1/referrals/code",
      {
        method: "POST",
        body: { walletAddress },
      },
    );
    return response.data;
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
