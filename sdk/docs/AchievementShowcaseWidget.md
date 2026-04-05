# AchievementShowcaseWidget Component

The `AchievementShowcaseWidget` shows earned vs locked badges based on reward history and your configured badge catalog.

## Usage

```tsx
import { AchievementShowcaseWidget, ChainLoyaltyClient } from 'loyaltychain-sdk';

const client = new ChainLoyaltyClient({
  baseUrl: 'https://api.chainloyalty.com',
  apiKey: 'YOUR_API_KEY',
});

const badges = [
  {
    id: 'early_adopter',
    name: 'Early Adopter',
    description: 'Joined during beta launch.',
    imageUrl: 'https://cdn.example.com/badges/early-adopter.png',
  },
];

export function App() {
  return (
    <AchievementShowcaseWidget
      client={client}
      walletAddress="0x..."
      availableBadges={badges}
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `client` | `ChainLoyaltyClient` | Required | SDK client instance. |
| `walletAddress` | `string` | Required | User wallet address. If empty, connect prompt is shown. |
| `availableBadges` | `BadgeDef[]` | Required | List of all badges that can be shown. |
| `title` | `string` | `"My Badges"` | Widget title. |
| `theme` | `AchievementShowcaseTheme` | See below | Style overrides. |
| `onConnect` | `(address: string) => void` | `undefined` | Optional connect callback. |
| `className` | `string` | `""` | Optional CSS class. |
| `style` | `React.CSSProperties` | `{}` | Inline container styles. |

## BadgeDef Type

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Unique badge id. |
| `name` | `string` | Badge display name. |
| `description` | `string` | Badge tooltip or helper text. |
| `imageUrl` | `string` | Badge image URL. |

## Theme Customization

| Property | Type | Default |
| :--- | :--- | :--- |
| `background` | `string` | `"#faf5ff"` |
| `foreground` | `string` | `"#000000"` |
| `border` | `string` | `"#000000"` |
| `shadow` | `string` | `"6px 6px 0 0 black"` |
| `cardBase` | `string` | `"#ffffff"` |
| `accent` | `string` | `"#FFD703"` |
| `fontFamily` | `string` | System sans stack |
