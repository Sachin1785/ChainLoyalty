# Connect Wallet Button

A customizable Connect Wallet button that integrates directly with MetaMask and requests SIWE (Sign In With Ethereum) for the ChainLoyalty platform. You can use this as an easy integration for your dApp to authenticate users into your loyalty system.

## Usage

```tsx
import { ConnectWalletButton, ChainLoyaltyClient } from 'loyaltychain-sdk';

const client = new ChainLoyaltyClient({
  baseUrl: 'https://api.chainloyalty.com',
  apiKey: 'YOUR_API_KEY'
});

export default function Example() {
  return (
    <div className="flex justify-center items-center p-12">
      <ConnectWalletButton 
        client={client}
        onSuccess={(address) => console.log('Connected', address)}
        onError={(err) => console.error('Connection failed', err)}
      />
    </div>
  );
}
```

## Props

| Property | Type | Description | Default |
|----------|------|-------------|---------|
| client | `ChainLoyaltyClient` | Instance of the ChainLoyalty client. | required |
| onSuccess | `(address: string) => void` | Callback fired when wallet is connected and signed in. | - |
| onError | `(error: Error) => void` | Callback fired on connection failure. | - |
| theme | `ConnectWalletTheme` | Custom style configuration. | - |
