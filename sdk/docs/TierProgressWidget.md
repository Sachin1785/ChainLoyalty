# TierProgressWidget Component

The `TierProgressWidget` visualizes a user's current loyalty tier and progress toward the next tier.

## Usage

```tsx
import { TierProgressWidget, ChainLoyaltyClient } from 'loyaltychain-sdk';

const client = new ChainLoyaltyClient({
  baseUrl: 'https://api.chainloyalty.com',
  apiKey: 'YOUR_API_KEY',
});

const tiers = [
  { name: 'Bronze', minPoints: 0, color: '#cd7f32' },
  { name: 'Silver', minPoints: 1000, color: '#c0c0c0' },
  { name: 'Gold', minPoints: 3000, color: '#ffd700' },
];

export function App() {
  return (
    <TierProgressWidget
      client={client}
      walletAddress="0x..."
      tiers={tiers}
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `client` | `ChainLoyaltyClient` | Required | SDK client instance. |
| `walletAddress` | `string` | Required | User wallet address. If empty, connect prompt is shown. |
| `tiers` | `Tier[]` | Required | Tier thresholds (`minPoints`) used for progress math. |
| `title` | `string` | `"VIP Status"` | Widget title. |
| `theme` | `TierProgressTheme` | See below | Style overrides. |
| `onConnect` | `(address: string) => void` | `undefined` | Optional connect callback. |
| `className` | `string` | `""` | Optional CSS class. |
| `style` | `React.CSSProperties` | `{}` | Inline container styles. |

## Tier Type

| Field | Type | Description |
| :--- | :--- | :--- |
| `name` | `string` | Tier display name. |
| `minPoints` | `number` | Minimum points required for this tier. |
| `color` | `string` | Optional color for active progress bar. |

## Theme Customization

| Property | Type | Default |
| :--- | :--- | :--- |
| `background` | `string` | `"#f8fafc"` |
| `foreground` | `string` | `"#000000"` |
| `border` | `string` | `"#000000"` |
| `shadow` | `string` | `"6px 6px 0 0 black"` |
| `cardBase` | `string` | `"#ffffff"` |
| `accent` | `string` | `"#FFD703"` |
| `fontFamily` | `string` | System sans stack |
