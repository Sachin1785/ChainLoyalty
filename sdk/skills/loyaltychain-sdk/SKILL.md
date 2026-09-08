---
name: loyaltychain-sdk
description: Use this skill when the user wants to add loyalty, gamification, or rewards features to a React or Next.js application using the loyaltychain-sdk. Triggers on requests like "add a leaderboard", "integrate point tracking", "add a spin wheel", "show user badges", "create a referral system", "add VIP tiers", "build a rewards store", or "embed loyalty widgets". This skill covers setting up the SDK client, selecting the right component, configuring props, and wiring backend API calls.
---

# How to Use: loyaltychain-sdk

## When to Use This Skill

Trigger this skill when the user asks to:
- Embed a **leaderboard**, **spin wheel**, **referral code**, or **rewards dashboard** in their app
- Display **user points**, **badges**, or **VIP tier progress**
- Build a **store where users spend points**
- Show **gamification quests** or tasks to complete

---

## Step 1: Check that the Backend is Running

The SDK requires a running `loyaltychain` backend.

Key backend endpoints the SDK calls:
- `GET /api/v1/rewards/{wallet}/balance` — points balance
- `GET /api/v1/rewards/{wallet}/history` — reward history
- `GET /api/v1/leaderboard` — rankings
- `GET /api/v1/referrals/code/{wallet}` — referral code
- `POST /api/v1/gamification/spin/commit` — start a spin
- `POST /api/v1/gamification/spin/reveal` — resolve a spin
- `POST /api/v1/gamification/purchase` — spend points in the store

---

## Step 2: Install the SDK

The SDK is published to npm and can be installed directly:

```bash
npm install loyaltychain-sdk
```

---

## Step 3: Initialize the Client

Always create the client with `useMemo` to avoid re-renders:

```tsx
import { ChainLoyaltyClient } from "loyaltychain-sdk";
import { useMemo } from "react";

const client = useMemo(() => new ChainLoyaltyClient({
  baseUrl: "http://localhost:8000",
}), []);
```

Wrap the app root with `QueryClientProvider` (required by all components):

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const queryClient = new QueryClient();

<QueryClientProvider client={queryClient}>
  <App />
</QueryClientProvider>
```

---

## Step 4: Pick the Right Component

| User Request | Component to Use |
|:---|:---|
| "Show user points / reward history" | `RewardsDashboard` |
| "Add a leaderboard / rankings" | `Leaderboard` |
| "Add a spin wheel / loot box" | `SpinWidget` |
| "Add referral codes" | `ReferralWidget` |
| "Show tasks / quests to earn points" | `QuestBoardWidget` |
| "Show VIP tier / status bar" | `TierProgressWidget` |
| "Show earned badges / achievements" | `AchievementShowcaseWidget` |
| "Let users spend points in a store" | `RewardStoreWidget` |

---

## Step 5: Wire the Wallet Address

All components accept a `walletAddress` string. If it's empty, they automatically show a **"Connect Wallet"** CTA. Pass `onConnect` to handle the connection:

```tsx
const [walletAddress, setWalletAddress] = useState("");

<RewardsDashboard
  client={client}
  walletAddress={walletAddress}
  onConnect={setWalletAddress}  // called when user clicks "Connect Wallet"
/>
```

---

## Step 6: Pass Component-Specific Config

### `QuestBoardWidget` — requires a `quests` array
```tsx
const quests = [
  { id: "signup", title: "Sign Up", description: "Create your account.", rewardPoints: 100, icon: "👋" },
  { id: "purchase", title: "Make a Purchase", description: "Buy something.", rewardPoints: 500, icon: "🛍️", actionUrl: "/shop" },
];
<QuestBoardWidget client={client} walletAddress={walletAddress} quests={quests} />
```
> Quest completion is detected by matching the quest `id`/`title` against strings in the user's `RewardHistory.reason` field.

### `TierProgressWidget` — requires a `tiers` array
```tsx
const tiers = [
  { name: "Bronze", minPoints: 0, color: "#cd7f32" },
  { name: "Silver", minPoints: 1000, color: "#c0c0c0" },
  { name: "Gold", minPoints: 5000, color: "#FFD703" },
];
<TierProgressWidget client={client} walletAddress={walletAddress} tiers={tiers} />
```

### `AchievementShowcaseWidget` — requires an `availableBadges` array
```tsx
const badges = [
  { id: "badge", name: "First Spin", description: "Spun the wheel.", imageUrl: "https://..." },
];
<AchievementShowcaseWidget client={client} walletAddress={walletAddress} availableBadges={badges} />
```
> Earned badges are detected by matching `badge.id` or `badge.name` against `RewardHistory.reason` where `rewardType === 'badge'`.

### `RewardStoreWidget` — requires an `items` array
```tsx
const items = [
  { id: "coupon_10", name: "10% Off", description: "One-time discount.", cost: 500 },
];
<RewardStoreWidget
  client={client}
  walletAddress={walletAddress}
  items={items}
  onPurchaseSuccess={(item, txHash) => alert(`Claimed ${item.name}!`)}
/>
```
> Purchase calls `POST /api/v1/gamification/purchase` and burns points on-chain.

---

## Step 7: Apply Custom Theming (Optional)

All components accept a `theme` prop. Key tokens:

```tsx
<Leaderboard
  client={client}
  theme={{
    accent: "#ff6b6b",       // Primary color
    border: "#000000",       // Stroke color
    shadow: "4px 4px 0 0 black", // Neo-Brutalism shadow
    cardBase: "#ffffff",     // Card background
  }}
/>
```

---

## Common Gotchas

- **New components missing after install?** Run `npm update loyaltychain-sdk` to pull the latest published version.
- **Duplicate wallet entries on leaderboard?** Run `uv run cleanup_db.py` then `uv run deduplicate.py` from the `backend/` folder. The backend now checksums all addresses at entry point.
- **400 on spin commit?** The backend uses a thread-safe `tx_lock` and `pending` nonce. If still failing, ensure the wallet has enough points to spin (check `RewardsDashboard` first).
- **Store purchase failing?** Ensure the user has >= `item.cost` points. The `RewardStoreWidget` disables the button client-side, but the blockchain will also reject insufficient balance.
