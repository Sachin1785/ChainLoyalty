---
title: Connect MetaMask SIWE Button
description: A specialized MetaMask Connect button that automatically initiates a SIWE (Sign In With Ethereum) flow.
---

import { ConnectMetaMaskSIWEButton } from 'loyaltychain-sdk/components/ConnectMetaMaskSIWEButton';

<ComponentPreview name="connect-metamask-siwe-button" />

This button streamlines the process of connecting specifically to MetaMask and immediately launching the Sign-In with Ethereum (SIWE) signature flow. This is ideal for dApps that explicitly require Ethereum-based authentication.

## Features
- Direct MetaMask integration.
- Built-in SIWE (Sign In With Ethereum) flow execution.
- Configurable SIWE API Endpoint.
- Automatic handling of JWT responses.

## Installation

```bash
npm install loyaltychain-sdk
```

## Usage

```tsx
import { ConnectMetaMaskSIWEButton } from "loyaltychain-sdk/components/ConnectMetaMaskSIWEButton";

export default function Example() {
  return (
    <ConnectMetaMaskSIWEButton 
      siweApiUrl="http://localhost:8000"
      onConnect={(address, jwt) => {
        console.log("Connected as", address);
        console.log("Session JWT", jwt);
      }}
    />
  );
}
```
