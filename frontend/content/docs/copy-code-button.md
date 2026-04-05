---
title: Copy Code Button
description: A button to copy code snippets directly to clipboard.
---

import { CopyCodeButton } from 'loyaltychain-sdk';

<ComponentPreview name="copy-code-button" />

A simple but highly functional component for copying snippets of code or referral codes directly to the user's clipboard.

## Features
- Provides visual feedback upon successful copy.
- Can be easily customized for text or icons.
- Built-in accessibility.

## Installation

```bash
npm install loyaltychain-sdk
```

## Usage

```tsx
import { CopyCodeButton } from "loyaltychain-sdk";

export default function Example() {
  return (
    <CopyCodeButton code="YOUR_CODE_123" />
  );
}
```
