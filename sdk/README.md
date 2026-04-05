# ChainLoyalty SDK

TypeScript SDK, React hooks, and UI components for building loyalty and gamification experiences on top of the ChainLoyalty API.

[![npm version](https://img.shields.io/npm/v/loyaltychain-sdk.svg)](https://www.npmjs.com/package/loyaltychain-sdk)
![license](https://img.shields.io/badge/license-MIT-blue.svg)

## Overview

The SDK exports three layers:

- `client` for direct API access.
- `hooks` for React Query-based data fetching and mutations.
- `components` for ready-to-use UI blocks.

It is designed for React applications using `react`, `react-dom`, and `@tanstack/react-query`.

## Installation

```bash
npm install loyaltychain-sdk
```

If you use Yarn or pnpm, install the package with your preferred package manager.

## Setup

The components rely on React Query. Wrap your app with a `QueryClientProvider` once at the top level.

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <YourApp />
    </QueryClientProvider>
  );
}
```

Create a client instance for direct API calls and pass it to the components or hooks that need it.

```tsx
import { ChainLoyaltyClient } from "loyaltychain-sdk";

const client = new ChainLoyaltyClient({
  baseUrl: "http://localhost:8000",
  apiKey: "optional-api-key",
});
```

## Usage

```tsx
import { Leaderboard } from "loyaltychain-sdk";

export function Example() {
  return (
    <Leaderboard
      client={client}
      title="Top Players"
      showPodium={true}
    />
  );
}
```

If a component accepts a `walletAddress` and you do not have one yet, pass an empty string and use `onConnect` to handle your wallet connection flow.

```tsx
<RewardsDashboard
  walletAddress={userWallet || ""}
  onConnect={(nextAddress) => {
    console.log("Connect user", nextAddress);
  }}
/>
```

## Components

The package exports the following components:

- `RewardsDashboard`
- `Leaderboard`
- `CopyCodeButton`
- `ConnectWalletButton`
- `SpinWidget`
- `ReferralWidget`
- `QuestBoardWidget`
- `TierProgressWidget`
- `AchievementShowcaseWidget`
- `RewardStoreWidget`

Component-specific notes are available in the matching files under `docs/`.

## Hooks

The hooks export includes:

- `useChainLoyaltyMutation`
- `useChainLoyaltyQuery`
- `useRewards`
- `useLeaderboard`
- `useSubmitEvent`

These hooks are intended for custom integrations when you want finer control than the prebuilt components provide.

## Client API

The client can be used directly for programmatic access:

```ts
await client.ingestEvent("0x123...", "purchase", { amount: 500 });

const topUsers = await client.getLeaderboard(1, 10);

const stats = await client.getUserStats("0x123...");
```

## Theme Support

Most visual components accept a `theme` prop so you can adjust colors and spacing to match your application.

```tsx
<Leaderboard
  theme={{
    accent: "#FFD703",
    border: "#000000",
    shadow: "4px 4px 0 0 black",
    cardBase: "#ffffff",
  }}
/>
```

## License

MIT © [ChainLoyalty](https://github.com/Prasham/LoyaltyChain)
