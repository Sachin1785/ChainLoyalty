# Quest Board Widget

Displays a list of active quests or tasks for the user to complete, tracking which ones have already been accomplished based on reward history.

The Quest Board allows you to define tasks, point rewards, and action links. Completed quests are automatically checked off.

## Usage

```tsx
import { ChainLoyaltyClient, QuestBoardWidget } from 'loyaltychain-sdk';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();
const client = new ChainLoyaltyClient({ baseUrl: '...', apiKey: '...' });

const myQuests = [
  { id: "follow_twitter", title: "Follow us on Twitter", description: "Follow @ourproject", rewardPoints: 50, icon: "🐦", actionUrl: "https://twitter.com" },
  { id: "join_discord", title: "Join Discord", description: "Join our community server", rewardPoints: 100, icon: "💬", actionUrl: "https://discord.com" }
];

export default function Example() {
  return (
    <QueryClientProvider client={queryClient}>
      <QuestBoardWidget 
        client={client} 
        walletAddress="0xYourAddress..." 
        quests={myQuests}
        title="Weekly Quests" 
      />
    </QueryClientProvider>
  )
}
```

## Props

| Property | Type | Description | Default |
|----------|------|-------------|---------|
| client | `ChainLoyaltyClient` | The SDK API client instance. | required |
| walletAddress | `string` | The wallet address of the user. | required |
| quests | `Quest[]` | Array of quests ({ id, title, description, rewardPoints, icon?, actionUrl? }). | required |
| title | `string` | The title for the widget. | `"Active Quests"` |
| theme | `object` | Customize colors and fonts. | - |
| onConnect | `(address: string) => void` | Callback for when the user clicks to connect a wallet. | - |
