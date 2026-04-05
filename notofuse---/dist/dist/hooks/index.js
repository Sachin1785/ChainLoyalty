// src/hooks/useChainLoyaltyMutation.ts
import {
  useMutation
} from "@tanstack/react-query";
function useChainLoyaltyMutation(mutationFn, options) {
  return useMutation({
    mutationFn,
    ...options ?? {}
  });
}

// src/hooks/useChainLoyaltyQuery.ts
import {
  useQuery
} from "@tanstack/react-query";
function useChainLoyaltyQuery(queryKey, queryFn, options) {
  return useQuery({
    queryKey,
    queryFn,
    ...options ?? {}
  });
}

// src/hooks/useRewards.ts
function useRewardBalance(client, walletAddress, enabled = true) {
  return useChainLoyaltyQuery(
    ["chainloyalty", "rewards", "balance", walletAddress],
    () => client.getRewardBalance(walletAddress),
    {
      enabled: enabled && Boolean(walletAddress)
    }
  );
}
function useRewardHistory(client, walletAddress, page = 1, pageSize = 20, enabled = true) {
  return useChainLoyaltyQuery(
    ["chainloyalty", "rewards", "history", walletAddress, page, pageSize],
    () => client.getRewardHistory(walletAddress, page, pageSize),
    {
      enabled: enabled && Boolean(walletAddress)
    }
  );
}

// src/hooks/useLeaderboard.ts
function useLeaderboard(client, page = 1, pageSize = 20, enabled = true) {
  return useChainLoyaltyQuery(
    ["chainloyalty", "leaderboard", page, pageSize],
    () => client.getLeaderboard(page, pageSize),
    {
      enabled
    }
  );
}

// src/hooks/useSubmitEvent.ts
function useSubmitEvent(client) {
  return useChainLoyaltyMutation(
    ({ payload, idempotencyKey }) => client.ingestEvent(payload, idempotencyKey)
  );
}
export {
  useChainLoyaltyMutation,
  useChainLoyaltyQuery,
  useLeaderboard,
  useRewardBalance,
  useRewardHistory,
  useSubmitEvent
};
//# sourceMappingURL=index.js.map