# Reward Store Widget

An interactive store component displaying digital items that users can buy with their earned loyalty points. 

The Widget automatically checks the user's current point balance and handles the UI states for whether they can afford an item. It hooks into the purchase API endpoint when "Buy" is clicked.

## Usage

```tsx
import { ChainLoyaltyClient, RewardStoreWidget } from 'loyaltychain-sdk';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();
const client = new ChainLoyaltyClient({ baseUrl: '...', apiKey: '...' });

const storeItems = [
  { id: "item_1", name: "Discord Role", description: "Exclusive Discord VIP Role", cost: 500 },
  { id: "item_2", name: "10% Discount Coupon", description: "Get a 10% off coupon code", cost: 1000 }
];

export default function Example() {
  return (
    <QueryClientProvider client={queryClient}>
      <RewardStoreWidget 
        client={client} 
        walletAddress="0xYourAddress..." 
        items={storeItems}
        title="Redeem Rewards"
        onPurchaseSuccess={(item, tx) => alert(`Bought ${item.name} in tx ${tx}`)}
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
| items | `StoreItem[]` | Array of items ({ id, name, description, cost, imageUrl? }). | required |
| title | `string` | The title for the widget. | `"Rewards Store"` |
| theme | `object` | Customize colors and fonts. | - |
| onConnect | `(address: string) => void` | Callback for when the user clicks to connect a wallet. | - |
| onPurchaseSuccess | `(item: StoreItem, txHash: string) => void` | Callback for successful purchases. | - |
| onPurchaseError | `(error: any) => void` | Callback for failed purchases. | - |
