# ChainLoyalty SDK

The ultimate **Loyalty-as-a-Service** toolkit for Web3. Drop-in, themeable, and high-performance loyalty components for any React application (Next.js, Vite, etc.).

Built with a **Neo-Brutalism** aesthetic, zero external CSS dependencies, and lightweight TypeScript logic.

[![npm version](https://img.shields.io/npm/v/loyaltychain-sdk.svg)](https://www.npmjs.com/package/loyaltychain-sdk)
![license](https://img.shields.io/badge/license-MIT-blue.svg)

---

## 🏗️ Features

- 🎯 **Points & XP**: Track and display user progress in real-time.
- 🏆 **Leaderboards**: Fully themeable rankings with podium support.
- 🎡 **Gamification**: Interactive "Spin-to-Win" reward wheels.
- 🔗 **Referrals**: One-click referral code generation and management.
- 🛡️ **Auto-Wallet Detection**: Components automatically show a "Connect Wallet" CTA if no address is provided.
- 🎨 **Neo-Brutalism Design**: High-contrast, bold design that stands out.

---

## 📦 Installation

```bash
npm install loyaltychain-sdk
# or
yarn add loyaltychain-sdk
```

---

## 🚀 Quick Start

### 1. Initialize the Client

The `ChainLoyaltyClient` is the core bridge between your frontend and the loyalty engine.

```tsx
import { ChainLoyaltyClient } from "loyaltychain-sdk";

const client = new ChainLoyaltyClient({
  baseUrl: "http://localhost:8000", // Your loyalty backend API
  apiKey: "optional-api-key",
});
```

### 2. Wrap with QueryClientProvider

The components use `@tanstack/react-query` internally for state management.

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <YourApp />
    </QueryClientProvider>
  );
}
```

### 3. Add a Component

```tsx
import { Leaderboard } from "loyaltychain-sdk";

<Leaderboard 
  client={client} 
  title="Top Players" 
  showPodium={true} 
/>
```

---

## 🧩 Components

### 1. `RewardsDashboard`
Displays user's total points, recent activities, and claimed items.
- **Key Props**: `walletAddress`, `onConnect`, `theme`.
- **Docs**: [RewardsDashboard.md](./docs/RewardsDashboard.md)

### 2. `SpinWidget`
An interactive "Spin-to-Win" wheel. Users spend points to gain random rewards (Tokens, Badges, etc.).
- **Key Props**: `walletAddress`, `lootboxId`, `wheelColors`.
- **Docs**: [SpinWidget.md](./docs/SpinWidget.md)

### 3. `Leaderboard`
Real-time ranking of all users in your program.
- **Key Props**: `limit`, `showPodium`, `accentColor`.
- **Docs**: [Leaderboard.md](./docs/Leaderboard.md)

### 4. `ReferralWidget`
Generates unique referral codes and copyable links for users.
- **Key Props**: `walletAddress`, `onConnect`.
- **Docs**: [ReferralWidget.md](./docs/ReferralWidget.md)

---

## 🎨 Theming

All components support a `theme` prop that allows you to change the aesthetic to match your brand.

```tsx
<Leaderboard 
  theme={{
    accent: "#FFD703",      // Primary color (e.g. Yellow)
    border: "#000000",      // Stroke color
    shadow: "4px 4px 0 0 black", // Neo-Brutalism shadow
    cardBase: "#ffffff",    // Background color
  }}
/>
```

---

## 🔌 Wallet Connectivity

If you pass an empty `walletAddress` string, the components will automatically enter a **Fallback State**. They will render a button that triggers the `onConnect` callback prop.

```tsx
<RewardsDashboard 
  walletAddress={userWallet || ""} 
  onConnect={(newAddress) => {
    // Handle login flow (e.g. MetaMask or SIWE)
    console.log("Connecting user:", newAddress);
  }}
/>
```

---

## 🛠️ SDK Client API

You can also use the client directly for custom logic:

```ts
// Submit a custom event (e.g. 'purchase', 'login', 'social_share')
await client.ingestEvent("0x123...", "purchase", { amount: 500 });

// Fetch leaderboard manually
const topUsers = await client.getLeaderboard(1, 10);

// Get user stats
const stats = await client.getUserStats("0x123...");
```

---

## 📄 License

MIT © [ChainLoyalty](https://github.com/Prasham/LoyaltyChain)
