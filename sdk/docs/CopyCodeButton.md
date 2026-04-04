# CopyCodeButton Component

The `CopyCodeButton` is a lightweight helper button that copies a provided code snippet or text value to the clipboard.

## Usage

```tsx
import { CopyCodeButton } from 'loyaltychain-sdk';

export function Example() {
  return (
    <CopyCodeButton
      code="npm install loyaltychain-sdk"
      label="Copy install command"
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `code` | `string` | Required | Text to copy to clipboard. |
| `label` | `string` | `"Copy code"` | Button label shown in idle state. |

## Behavior Notes

- Button text changes to `Copied!` for about 1.2s after a successful copy.
- If clipboard write fails, the button remains in its normal state.
