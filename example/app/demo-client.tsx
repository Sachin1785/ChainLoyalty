"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { ChainLoyaltyClient, Leaderboard, RewardsDashboard } from "loyaltychain-sdk";

const client = new ChainLoyaltyClient({
  baseUrl: process.env.NEXT_PUBLIC_CHAINLOYALTY_API_URL ?? "http://localhost:4000",
  apiKey: process.env.NEXT_PUBLIC_CHAINLOYALTY_API_KEY,
});

const walletAddress = process.env.NEXT_PUBLIC_WALLET_ADDRESS ?? "0x1234abcd5678ef901234abcd5678ef901234abcd";

export function DemoClient() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <div style={{ display: "grid", gap: 16 }}>
        <RewardsDashboard client={client} walletAddress={walletAddress} />
        <Leaderboard client={client} page={1} pageSize={10} />
      </div>
    </QueryClientProvider>
  );
}
