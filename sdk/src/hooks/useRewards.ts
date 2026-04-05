import { type ChainLoyaltyClient } from "../client";
import { useChainLoyaltyQuery } from "./useChainLoyaltyQuery";

export function useRewardBalance(
  client: ChainLoyaltyClient,
  walletAddress: string,
  enabled = true,
) {
  return useChainLoyaltyQuery(
    ["chainloyalty", "rewards", "balance", walletAddress],
    () => client.getRewardBalance(walletAddress),
    {
      enabled: enabled && Boolean(walletAddress),
    },
  );
}

export function useRewardHistory(
  client: ChainLoyaltyClient,
  walletAddress: string,
  page = 1,
  pageSize = 20,
  enabled = true,
) {
  return useChainLoyaltyQuery(
    ["chainloyalty", "rewards", "history", walletAddress, page, pageSize],
    () => client.getRewardHistory(walletAddress, page, pageSize),
    {
      enabled: enabled && Boolean(walletAddress),
    },
  );
}
