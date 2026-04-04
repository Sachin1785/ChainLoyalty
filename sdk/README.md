# ChainLoyalty SDK

TypeScript SDK and React Query hooks for integrating with ChainLoyalty registry APIs.

## Prerequisites

- Wrap your app with React Query's QueryClientProvider.
- Use a valid ChainLoyalty registry base URL.

## Install

```bash
npm install loyaltychain-sdk
```

## Client Usage

```ts
import { ChainLoyaltyClient } from "loyaltychain-sdk";

const client = new ChainLoyaltyClient({
  baseUrl: "https://api.chainloyalty.dev",
  apiKey: "your-api-key",
});

const nonce = await client.requestNonce({ walletAddress: "0xabc..." });
```

## React Hooks Usage

```ts
import { useRewardBalance } from "loyaltychain-sdk";

const rewards = useRewardBalance(client, walletAddress);
```

## Widgets & Components

This SDK includes several drop-in React components that can be used to add loyalty features to your site in seconds.

| Component | Documentation | Description |
| :--- | :--- | :--- |
| **SpinWidget** | [docs/SpinWidget.md](docs/SpinWidget.md) | Interactive on-chain reward wheel. |
| **Leaderboard** | [docs/Leaderboard.md](docs/Leaderboard.md) | Rankings with podiums and theming. |
| **ReferralWidget** | [docs/ReferralWidget.md](docs/ReferralWidget.md) | Code generation and copy-to-clipboard. |
| **RewardsDashboard** | [docs/RewardsDashboard.md](docs/RewardsDashboard.md) | Balances and activity history. |

## Quick Start

```tsx
import { Leaderboard, RewardsDashboard } from "loyaltychain-sdk";

<RewardsDashboard client={client} walletAddress={walletAddress} />
<Leaderboard client={client} page={1} pageSize={10} />
```

Both components are responsive and can be themed via theme/style props.

## End-to-End Example

See `examples/minimal-integration.tsx` for a full integration sample with:

- QueryClientProvider setup
- SDK client initialization
- Event submission mutation
- RewardsDashboard + Leaderboard rendering

## Supported Reward Types

- points
- badge
- probabilistic
