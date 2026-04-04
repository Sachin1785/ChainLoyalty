import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  ChainLoyaltyClient,
  Leaderboard,
  RewardsDashboard,
  useSubmitEvent,
} from "loyaltychain-sdk";

const queryClient = new QueryClient();

const client = new ChainLoyaltyClient({
  baseUrl: "https://api.chainloyalty.dev",
  apiKey: "demo-api-key",
});

const walletAddress = "0x1234...abcd";

function DemoActions() {
  const submitEvent = useSubmitEvent(client);

  return (
    <button
      onClick={() => {
        submitEvent.mutate({
          payload: {
            walletAddress,
            eventType: "feature_used",
            metadata: { feature: "ai_referral_generator" },
            timestamp: new Date().toISOString(),
          },
          idempotencyKey: `evt-${Date.now()}`,
        });
      }}
    >
      Trigger Feature Event
    </button>
  );
}

export function ChainLoyaltyDemo() {
  return (
    <QueryClientProvider client={queryClient}>
      <div style={{ display: "grid", gap: 16, maxWidth: 960, margin: "24px auto" }}>
        <DemoActions />

        <RewardsDashboard
          client={client}
          walletAddress={walletAddress}
          title="My Rewards"
          theme={{
            background: "#f8fafc",
            foreground: "#0f172a",
            accent: "#0ea5e9",
          }}
        />

        <Leaderboard
          client={client}
          page={1}
          pageSize={10}
          title="Top Loyal Users"
          theme={{
            background: "#fff7ed",
            foreground: "#111827",
            accent: "#f97316",
          }}
        />
      </div>
    </QueryClientProvider>
  );
}
