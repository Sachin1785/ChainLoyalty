# SpinWidget Component

The `SpinWidget` is an interactive "Spin-to-Win" wheel that users can engage with to earn rewards like points, badges, or NFTs. It handles the full on-chain commit-reveal cycle.

## Usage

```tsx
import { SpinWidget, ChainLoyaltyClient } from 'loyaltychain-sdk';

const client = new ChainLoyaltyClient({
  baseUrl: 'https://api.chainloyalty.com',
  apiKey: 'YOUR_API_KEY'
});

export function App() {
  return (
    <SpinWidget 
      client={client}
      walletAddress="0x..."
      title="Monthly Reward Wheel"
      lootboxId={1}
      onSpinSuccess={(prize) => alert(`You won ${prize}!`)}
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `client` | `ChainLoyaltyClient` | Required | Instance of the ChainLoyalty client. |
| `walletAddress` | `string` | Required* | User's wallet address. If set to `null` or `""`, the widget displays a **Connect Wallet** CTA. |
| `lootboxId` | `number \| string` | `1` | ID of the prize pool configuration. |
| `title` | `string` | `"Spin & Win"` | Header text. |
| `theme` | `SpinWidgetTheme` | See below | Custom style configuration. |
| `onSpinSuccess` | `(prize: string) => void` | `undefined` | Callback fired when the reveal completes. |
| `onSpinError` | `(err: Error) => void` | `undefined` | Callback fired on failure. |

## Theme Customization

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `background` | `string` | `"#f8fafc"` | Section background. |
| `foreground` | `string` | `"#0f172a"` | Main text color. |
| `border` | `string` | `"#000000"` | Line color (thickness is 4px). |
| `accent` | `string` | `"#f43f5e"` | Error/Accent color. |
| `wheelColors` | `string[]` | `[...]` | Array of hex codes for wheel segments. |
| `shadow` | `string` | `"8px 8px 0 0 black"` | Hard-edge drop shadow. |
| `primaryButtonBg` | `string` | `"#FFD703"` | Spin button background. |
| `primaryButtonText` | `string` | `"#000000"` | Spin button label color. |
| `cardBase` | `string` | `"#ffffff"` | The interior card background. |
