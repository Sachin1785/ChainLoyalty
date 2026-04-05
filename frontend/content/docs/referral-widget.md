# Referral Widget

The `ReferralWidget` provides an interface for users to generate, view, and easy-copy their unique referral codes to share with friends.

## Usage

```tsx
import { ReferralWidget, ChainLoyaltyClient } from 'loyaltychain-sdk';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();
const client = new ChainLoyaltyClient({
  baseUrl: 'https://api.chainloyalty.com',
  apiKey: 'YOUR_API_KEY'
});

export default function Example() {
  return (
    <QueryClientProvider client={queryClient}>
      <ReferralWidget 
        client={client}
        walletAddress="0x1234abcd..."
        referralRewardText="Share the love. Get 500 points."
      />
    </QueryClientProvider>
  );
}
```

## Props

| Property | Type | Description | Default |
|----------|------|-------------|---------|
| client | `ChainLoyaltyClient` | Instance of the ChainLoyalty client. | required |
| walletAddress | `string` | User's wallet to associate the code with. | required |
| title | `string` | Header text. | `"Your Referral Code"` |
| referralRewardText | `string` | Promo sub-caption below the code. | `"Earn 200 pts per referral!"` |
| theme | `ReferralWidgetTheme` | Style overrides. | - |

## Theme

| Variable | Description |
|----------|-------------|
| `--background` | Primary background color |
| `--foreground` | Text color |
| `--border` | Border color |
| `--shadow` | Card elevation shadow |
| `--inputBg` | Background of the code display box |
| `--accent` | Highlight text in promo |