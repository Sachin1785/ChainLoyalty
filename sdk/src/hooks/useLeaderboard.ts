import { type ChainLoyaltyClient } from "../client";
import { useChainLoyaltyQuery } from "./useChainLoyaltyQuery";

export function useLeaderboard(
  client: ChainLoyaltyClient,
  page = 1,
  pageSize = 20,
  enabled = true,
) {
  return useChainLoyaltyQuery(
    ["chainloyalty", "leaderboard", page, pageSize],
    () => client.getLeaderboard(page, pageSize),
    {
      enabled,
    },
  );
}
