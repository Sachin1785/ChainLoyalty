# Rewards Dashboard

A dashboard showing current loyalty points and available/claimed rewards.

The Rewards Dashboard integrates seamlessly into your user profile page, connecting directly to the Chain Loyalty API to display rewards and interact with them.

## Usage

```tsx
import { ChainLoyaltyClient, RewardsDashboard } from 'loyaltychain-sdk';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();
const client = new ChainLoyaltyClient({ baseUrl: '...', apiKey: '...' });

export default function Example() {
  return (
    <QueryClientProvider client={queryClient}>
      <RewardsDashboard 
        client={client} 
        walletAddress="0xYourWallet" 
        title="My Rewards"
      />
    </QueryClientProvider>
  )
}
```

## Props

| Property | Type | Description | Default |
|----------|------|-------------|---------|
| client | \`ChainLoyaltyClient\` | The SDK API client instance. | required |
| walletAddress | \`string\` | The address of the connected user. | required |
| title | \`string\` | The title for the dashboard. | \`"Rewards"\` |
