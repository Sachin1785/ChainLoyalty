export interface ChainLoyaltyClientConfig {
  baseUrl: string;
  apiKey?: string;
  accessToken?: string;
  timeoutMs?: number;
  retries?: number;
  retryBaseDelayMs?: number;
  retryMaxDelayMs?: number;
}

export const defaultClientConfig: Required<
  Pick<
    ChainLoyaltyClientConfig,
    "timeoutMs" | "retries" | "retryBaseDelayMs" | "retryMaxDelayMs"
  >
> = {
  timeoutMs: 10000,
  retries: 2,
  retryBaseDelayMs: 250,
  retryMaxDelayMs: 2000,
};
