---
name: LoyaltyChain SDK UI Components
description: Best practices, context, and prop definitions for all React UI components in the loyaltychain-sdk.
---

# LoyaltyChain SDK UI Components Context

This file serves as a reference guide for integrating and modifying the frontend components from the `loyaltychain-sdk`. 

## Global SDK Setup
All components rely on the `ChainLoyaltyClient` from the SDK, which requires an initialized TanStack `QueryClientProvider` at the app root.

```tsx
import { ChainLoyaltyClient } from "loyaltychain-sdk";
const client = new ChainLoyaltyClient({ baseUrl: "API_URL", apiKey: "API_KEY" });
```

---

## Shared Props
Nearly all high-level components accept these standard props:
- `client` (`ChainLoyaltyClient`): Required. The API client instance.
- `walletAddress` (`string`): The user's wallet. If empty/null, the component falls back to a "Connect Wallet" CTA.
- `onConnect` (`(address: string) => void`): Callback triggered when the fallback CTA is used.
- `theme` (`object`): Partial override of Neo-Brutalism aesthetic (background, foreground, border, shadow, accent, cardBase).

---

## Component Reference

### 1. `RewardsDashboard`
Displays user's point balances and chronological reward history.
- **Key Props**: `historyPageSize` (default: 5)
- **Use Case**: Main dashboard header. Shows a quick "Points Balance" and recent activity.

### 2. `Leaderboard`
Displays the top point-earners with a stylized top-3 podium.
- **Key Props**: `page`, `pageSize`, `showPodium` (boolean).
- **Use Case**: Fostering competition among users based on all-time points.

### 3. `SpinWidget`
Interactive "Spin-to-Win" wheel relying on the backend `commitSpin`/`revealSpin` cryptographic flow.
- **Key Props**: `lootboxId` (number|string), `wheelColors` (array of hex strings).
- **Callbacks**: `onSpinSuccess(prize: string)`, `onSpinError(err: Error)`.
- **Use Case**: Gamified random reward drops. Requires user to have sufficient points to burn if configured.

### 4. `ReferralWidget`
Generates and displays unique referral codes using the backend `/api/v1/referrals/code` endpoint.
- **Key Props**: `referralRewardText` (promo caption below the code).
- **Use Case**: Virality and organic growth.

### 5. `QuestBoardWidget`
Gamified checklist comparing static quests against the user's `RewardHistory` (by checking if the `reason` string matches the quest).
- **Key Props**: `quests: Quest[]`
  - `Quest = { id, title, description, rewardPoints, icon, actionUrl }`
- **Use Case**: Guiding new users through onboard actions or daily tasks.

### 6. `TierProgressWidget`
Visual progress bar that calculates the user's VIP ranking based on total points.
- **Key Props**: `tiers: Tier[]`
  - `Tier = { name, minPoints, color }`
- **Use Case**: Long-term retention via status tracking.

### 7. `AchievementShowcaseWidget`
Gallery displaying available badges. Checks `RewardHistory` (where `rewardType === 'badge'`) to render unlocked badges in color and locked ones in grayscale.
- **Key Props**: `availableBadges: BadgeDef[]`
  - `BadgeDef = { id, name, description, imageUrl }`
- **Use Case**: Visual brag-board for NFT/Badge drop campaigns.

### 8. `RewardStoreWidget`
A point-redemption marketplace to purchase static items. Uses `client.purchaseStoreItem`.
- **Key Props**: `items: StoreItem[]`
  - `StoreItem = { id, name, description, cost, imageUrl }`
- **Callbacks**: `onPurchaseSuccess(item, txHash)`, `onPurchaseError(err)`.
- **Use Case**: Allowing users to burn accumulated points for real/digital prizes.

---

## Design Philosophy: Neo-Brutalism
- **Inline Styles**: Designed with 0 external CSS dependencies.
- **Aesthetic**: Uses thick borders (`3px solid #000`), hard shadows (`6px 6px 0 0 black`), and high-contrast pastel/accent combinations.
- **Customization**: Passing a `theme={{ accent: "#ff0000" }}` prop to any component dynamically overrides the internal hex codes.
