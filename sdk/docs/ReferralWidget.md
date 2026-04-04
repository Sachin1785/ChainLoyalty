# ReferralWidget Component

The `ReferralWidget` provides an interface for users to generate, view, and easy-copy their unique referral codes to share with friends.

## Usage

```tsx
import { ReferralWidget, ChainLoyaltyClient } from 'loyaltychain-sdk';

const client = new ChainLoyaltyClient({
  baseUrl: 'https://api.chainloyalty.com',
  apiKey: 'YOUR_API_KEY'
});

export function App() {
  return (
    <ReferralWidget 
      client={client}
      walletAddress="0x..."
      referralRewardText="Share the love. Get 500 points."
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `client` | `ChainLoyaltyClient` | Required | Instance of the ChainLoyalty client. |
| `walletAddress` | `string` | Required | User's wallet to associate the code with. |
| `title` | `string` | `"Your Referral Code"` | Header text. |
| `referralRewardText`| `string` | `"Earn 200 pts per referral!"` | Promo sub-caption below the code. |
| `theme` | `ReferralWidgetTheme` | See below | Style overrides. |

## Theme Customization

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `background` | `string` | `"#fdf2f8"` | Primary background color. |
| `foreground` | `string` | `"#000000"` | Text color. |
| `border` | `string` | `"#000000"` | Border color. |
| `shadow` | `string` | `"8px 8px 0 0 black"` | Card elevation shadow. |
| `inputBg` | `string` | `"#ffffff"` | Background of the code display box. |
| `accent` | `string` | `"#ec4899"` | Color used for highlight text in promo. |
