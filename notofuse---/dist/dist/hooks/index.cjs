"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/hooks/index.ts
var hooks_exports = {};
__export(hooks_exports, {
  useChainLoyaltyMutation: () => useChainLoyaltyMutation,
  useChainLoyaltyQuery: () => useChainLoyaltyQuery,
  useLeaderboard: () => useLeaderboard,
  useRewardBalance: () => useRewardBalance,
  useRewardHistory: () => useRewardHistory,
  useSubmitEvent: () => useSubmitEvent
});
module.exports = __toCommonJS(hooks_exports);

// src/hooks/useChainLoyaltyMutation.ts
var import_react_query = require("@tanstack/react-query");
function useChainLoyaltyMutation(mutationFn, options) {
  return (0, import_react_query.useMutation)({
    mutationFn,
    ...options ?? {}
  });
}

// src/hooks/useChainLoyaltyQuery.ts
var import_react_query2 = require("@tanstack/react-query");
function useChainLoyaltyQuery(queryKey, queryFn, options) {
  return (0, import_react_query2.useQuery)({
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  useChainLoyaltyMutation,
  useChainLoyaltyQuery,
  useLeaderboard,
  useRewardBalance,
  useRewardHistory,
  useSubmitEvent
});
//# sourceMappingURL=index.cjs.map