# RewardStoreWidget Component

The `RewardStoreWidget` renders a redeemable item catalog and handles purchases using the SDK client.

## Usage

```tsx
import { RewardStoreWidget, ChainLoyaltyClient } from 'loyaltychain-sdk';

const client = new ChainLoyaltyClient({
  baseUrl: 'https://api.chainloyalty.com',
  apiKey: 'YOUR_API_KEY',
});

const storeItems = [
  {
    id: 'hoodie-001',
    name: 'Limited Hoodie',
    description: 'Black hoodie with loyalty branding.',
    cost: 2500,
    imageUrl: 'https://cdn.example.com/store/hoodie.png',
  },
];

export function App() {
  return (
    <RewardStoreWidget
      client={client}
      walletAddress="0x..."
      items={storeItems}
      onPurchaseSuccess={(item, txHash) => {
        console.log('Purchased', item.id, txHash);
      }}
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `client` | `ChainLoyaltyClient` | Required | SDK client instance. |
| `walletAddress` | `string` | Required | User wallet address. If empty, connect prompt is shown. |
| `items` | `StoreItem[]` | Required | Store items that can be redeemed. |
| `title` | `string` | `"Rewards Store"` | Widget title. |
| `theme` | `RewardStoreTheme` | See below | Style overrides. |
| `onConnect` | `(address: string) => void` | `undefined` | Optional connect callback. |
| `onPurchaseSuccess` | `(item: StoreItem, txHash: string) => void` | `undefined` | Fired on successful purchase. |
| `onPurchaseError` | `(error: any) => void` | `undefined` | Fired if purchase fails. |
| `className` | `string` | `""` | Optional CSS class. |
| `style` | `React.CSSProperties` | `{}` | Inline container styles. |

## StoreItem Type

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Unique item id. |
| `name` | `string` | Item display name. |
| `description` | `string` | Item description. |
| `cost` | `number` | Required points to purchase. |
| `imageUrl` | `string` | Optional item image URL. |

## Theme Customization

| Property | Type | Default |
| :--- | :--- | :--- |
| `background` | `string` | `"#f0f9ff"` |
| `foreground` | `string` | `"#000000"` |
| `border` | `string` | `"#000000"` |
| `shadow` | `string` | `"6px 6px 0 0 black"` |
| `cardBase` | `string` | `"#ffffff"` |
| `accent` | `string` | `"#FFD703"` |
| `insufficientFundsBg` | `string` | `"#9ca3af"` |
| `fontFamily` | `string` | System sans stack |
