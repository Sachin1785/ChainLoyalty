# ConnectWalletButton Component

The `ConnectWalletButton` is a standalone wallet-connect button for browser wallets (for example, MetaMask).

## Usage

```tsx
import { ConnectWalletButton } from 'loyaltychain-sdk';

export function Example() {
  return (
    <ConnectWalletButton
      onConnect={(address) => {
        console.log('Connected:', address);
      }}
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `onConnect` | `(address: string) => void` | Required | Called with the connected wallet address. |
| `label` | `string` | `"Connect Wallet"` | Button text when idle. |
| `theme` | `ConnectWalletButtonTheme` | See below | Visual style overrides. |
| `className` | `string` | `undefined` | Optional CSS class for wrapper styling. |
| `style` | `React.CSSProperties` | `undefined` | Inline style overrides. |

## Theme Customization

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `background` | `string` | `"#FFD703"` | Button background color. |
| `foreground` | `string` | `"#000000"` | Button text and icon color. |
| `border` | `string` | `"#000000"` | Border color. |
| `shadow` | `string` | `"4px 4px 0 0 black"` | Base box shadow style. |
| `fontFamily` | `string` | `"ui-sans-serif, system-ui, sans-serif"` | Font family used by the button. |

## Behavior Notes

- Uses `window.ethereum.request({ method: 'eth_requestAccounts' })`.
- Shows `Connecting...` while the wallet request is in progress.
- Displays an alert when no injected wallet is found.
