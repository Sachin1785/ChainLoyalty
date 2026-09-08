# Leaderboard

Displays a ranked list of users based on loyalty points.

The Leaderboard block from the Loyalty SDK is fully customizable via its \`theme\` and \`style\` properties. It automatically fetches pages using the provided \`client\`.

## Usage

```tsx
import { ChainLoyaltyClient, Leaderboard } from 'loyaltychain-sdk';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();
const client = new ChainLoyaltyClient({ baseUrl: '...', apiKey: '...' });

export default function Example() {
  return (
    <QueryClientProvider client={queryClient}>
      <Leaderboard client={client} title="Weekly Top Performers" />
    </QueryClientProvider>
  )
}
```

## Props

| Property | Type | Description | Default |
|----------|------|-------------|---------|
| client | \`ChainLoyaltyClient\` | The SDK API client instance. | required |
| page | \`number\` | The initial page number. | \`1\` |
| pageSize | \`number\` | The number of users per page. | \`10\` |
| title | \`string\` | The title for the leaderboard. | \`"Leaderboard"\` |
| theme | \`object\` | Customize colors and fonts. | - |
