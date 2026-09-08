# Achievement Showcase Widget

Displays a grid of badges that a user can earn, highlighting the ones they have unlocked based on their reward history.

The Achievement Showcase Widget looks at the reward history reasons to determine if a badge has been awarded to the user. It can be customized heavily with the `theme` property.

## Usage

```tsx
import { ChainLoyaltyClient, AchievementShowcaseWidget } from 'loyaltychain-sdk';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();
const client = new ChainLoyaltyClient({ baseUrl: '...', apiKey: '...' });

const myBadges = [
  { id: "beta_tester", name: "Beta Tester", description: "Participated in the beta", imageUrl: "https://example.com/badge1.png" },
  { id: "first_tx", name: "First Transaction", description: "Made your first purchase", imageUrl: "https://example.com/badge2.png" }
];

export default function Example() {
  return (
    <QueryClientProvider client={queryClient}>
      <AchievementShowcaseWidget 
        client={client} 
        walletAddress="0xYourAddress..." 
        availableBadges={myBadges}
        title="My Achievements" 
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
| availableBadges | `BadgeDef[]` | Array of badge definitions ({ id, name, description, imageUrl }). | required |
| title | `string` | The title for the widget. | `"My Badges"` |
| theme | `object` | Customize colors and fonts. | - |
| onConnect | `(address: string) => void` | Callback for when the user clicks to connect a wallet. | - |
