# QuestBoardWidget Component

The `QuestBoardWidget` displays available quests and marks quests as completed based on reward history records.

## Usage

```tsx
import { QuestBoardWidget, ChainLoyaltyClient } from 'loyaltychain-sdk';

const client = new ChainLoyaltyClient({
  baseUrl: 'https://api.chainloyalty.com',
  apiKey: 'YOUR_API_KEY',
});

const quests = [
  {
    id: 'follow-x',
    title: 'Follow us on X',
    description: 'Follow and like our launch post.',
    rewardPoints: 100,
    icon: '🎯',
    actionUrl: 'https://x.com/',
  },
];

export function App() {
  return (
    <QuestBoardWidget
      client={client}
      walletAddress="0x..."
      quests={quests}
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `client` | `ChainLoyaltyClient` | Required | SDK client instance. |
| `walletAddress` | `string` | Required | User wallet address. If empty, connect prompt is shown. |
| `quests` | `Quest[]` | Required | List of quests to display. |
| `title` | `string` | `"Active Quests"` | Section title. |
| `theme` | `QuestBoardTheme` | See below | Widget style overrides. |
| `onConnect` | `(address: string) => void` | `undefined` | Called when connect action is triggered. |
| `className` | `string` | `""` | Optional CSS class. |
| `style` | `React.CSSProperties` | `{}` | Inline container styles. |

## Quest Type

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Unique quest id. |
| `title` | `string` | Quest title. |
| `description` | `string` | Quest details. |
| `rewardPoints` | `number` | Points earned on completion. |
| `icon` | `string` | Optional icon/emoji. |
| `actionUrl` | `string` | Optional URL for CTA button. |

## Theme Customization

| Property | Type | Default |
| :--- | :--- | :--- |
| `background` | `string` | `"#f0fdf4"` |
| `foreground` | `string` | `"#000000"` |
| `border` | `string` | `"#000000"` |
| `shadow` | `string` | `"6px 6px 0 0 black"` |
| `cardBase` | `string` | `"#ffffff"` |
| `accent` | `string` | `"#FFD703"` |
| `completedGreen` | `string` | `"#8ED670"` |
| `fontFamily` | `string` | System sans stack |
