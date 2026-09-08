# ConnectMetaMaskSIWEButton Component

The `ConnectMetaMaskSIWEButton` handles wallet connection plus SIWE (Sign-In With Ethereum) challenge/verify flow and returns a JWT from your backend.

## Usage

```tsx
import { ConnectMetaMaskSIWEButton } from 'loyaltychain-sdk/components/ConnectMetaMaskSIWEButton';

export function Example() {
  return (
    <ConnectMetaMaskSIWEButton
      siweApiUrl="https://api.yourdomain.com"
      onConnect={(address, token) => {
        console.log('Connected wallet:', address);
        console.log('SIWE JWT:', token);
      }}
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `onConnect` | `(address: string, siweJwt: string) => void` | Required | Called after successful SIWE verification. |
| `siweApiUrl` | `string` | Required | Backend base URL expected to expose `/siwe/nonce` and `/siwe/verify`. |
| `label` | `string` | `"Sign-In With Ethereum"` | Button label before sign-in. |
| `style` | `React.CSSProperties` | `undefined` | Inline style overrides. |
| `className` | `string` | `undefined` | Optional CSS class. |

## Backend Requirements

Your backend should implement:

- `GET /siwe/nonce` -> `{ nonce: string }`
- `POST /siwe/verify` with `{ message, signature }` -> `{ token: string }`

## Behavior Notes

- Requests accounts from injected wallet provider.
- Builds a SIWE-style message and signs with `personal_sign`.
- On success, button shows a truncated signed-in wallet address.
