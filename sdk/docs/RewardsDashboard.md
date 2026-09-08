# RewardsDashboard Component

The `RewardsDashboard` is a comprehensive view including point balances, achievement counts, and a chronological history of earned rewards.

## Usage

```tsx
import { RewardsDashboard, ChainLoyaltyClient } from 'loyaltychain-sdk';

const client = new ChainLoyaltyClient({
  baseUrl: 'https://api.chainloyalty.com',
  apiKey: 'YOUR_API_KEY'
});

export function App() {
  return (
    <RewardsDashboard 
      client={client}
      walletAddress="0x..."
      historyPageSize={5}
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `client` | `ChainLoyaltyClient` | Required | Instance of the ChainLoyalty client. |
| `walletAddress` | `string` | Required | Target user wallet address. Falls back to "Connect Wallet" button if empty. |
| `onConnect` | `(address: string) => void` | `undefined` | Callback function when the "Connect Wallet" button is clicked. |
| `historyPageSize` | `number` | `5` | Number of recent activity items to list. |
| `title` | `string` | `"My Rewards"` | Dashboard header. |
| `theme` | `RewardsDashboardTheme` | See below | Visual style overrides. |

## Theme Customization

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `background` | `string` | `"#ffffff"` | Main dashboard container color. |
| `foreground` | `string` | `"#000000"` | Title and label color. |
| `border` | `string` | `"#000000"` | Primary stroke color. |
| `accent` | `string` | `"#8ED670"` | Color used for the primary stat block. |
| `statBg` | `string` | `"#f3f4f6"` | (Deprecated: currently uses cardBase) |
| `cardBase` | `string` | `"#ffffff"` | Background of embedded cards. |
| `tableRowBg` | `string` | `"#ffffff"` | Activity item row color. |
| `tableRowAltBg` | `string` | `"#f9f9f9"` | Alternating row color. |
