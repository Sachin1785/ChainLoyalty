# Spin Widget

The `SpinWidget` is an interactive "Spin-to-Win" wheel that users can engage with to earn rewards like points, badges, or NFTs. It handles the full on-chain commit-reveal cycle.

## Usage

```tsx
import { SpinWidget, ChainLoyaltyClient } from 'loyaltychain-sdk';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();
const client = new ChainLoyaltyClient({
  baseUrl: 'https://api.chainloyalty.com',
  apiKey: 'YOUR_API_KEY'
});

export default function Example() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="max-w-md mx-auto">
        <SpinWidget 
          client={client}
          walletAddress="0x1234abcd..."
          title="Monthly Reward Wheel"
          lootboxId={1}
          onSpinSuccess={(prize) => alert(`You won ${prize}!`)}
        />
      </div>
    </QueryClientProvider>
  );
}
```

## Props

| Property | Type | Description | Default |
|----------|------|-------------|---------|
| client | `ChainLoyaltyClient` | Instance of the ChainLoyalty client. | required |
| walletAddress | `string` | User's wallet address. | required |
| lootboxId | `number \| string` | ID of the prize pool configuration. | `1` |
| title | `string` | Header text. | `"Spin & Win"` |
| theme | `SpinWidgetTheme` | Custom style configuration. | - |
| onSpinSuccess | `(prize: string) => void` | Callback fired when the reveal completes. | - |
| onSpinError | `(err: Error) => void` | Callback fired on failure. | - |

## Theme

| Variable | Description |
|----------|-------------|
| `--background` | Section background |
| `--foreground` | Main text color |
| `--border` | Line color (thickness is 4px) |
| `--accent` | Error/Accent color |
| `--wheelColors` | Array of hex codes for wheel segments |
| `--shadow` | Hard-edge drop shadow |
| `--primaryButtonBg` | Spin button background |
| `--primaryButtonText` | Spin button label color |
| `--cardBase` | The interior card background |