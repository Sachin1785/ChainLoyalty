# Tier Progress Widget

Displays a visual indicator of a user's progress through predefined VIP or loyalty tiers based on their total points.

It automatically calculates their current tier, next tier, and the percentage progress in between based on their points balance.

## Usage

```tsx
import { ChainLoyaltyClient, TierProgressWidget } from 'loyaltychain-sdk';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();
const client = new ChainLoyaltyClient({ baseUrl: '...', apiKey: '...' });

const loyaltyTiers = [
  { name: "Bronze", minPoints: 0, color: "#CD7F32" },
  { name: "Silver", minPoints: 1000, color: "#C0C0C0" },
  { name: "Gold", minPoints: 5000, color: "#FFD700" }
];

export default function Example() {
  return (
    <QueryClientProvider client={queryClient}>
      <TierProgressWidget 
        client={client} 
        walletAddress="0xYourAddress..." 
        tiers={loyaltyTiers}
        title="Your VIP Status" 
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
| tiers | `Tier[]` | Array of tier objects ({ name, minPoints, color? }). Lowest first. | required |
| title | `string` | The title for the widget. | `"VIP Status"` |
| theme | `object` | Customize colors and fonts. | - |
| onConnect | `(address: string) => void` | Callback for when the user clicks to connect a wallet. | - |
