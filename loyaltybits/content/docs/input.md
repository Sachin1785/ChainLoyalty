# Input

A text input field component for capturing user input in forms.

The Input component provides a styled text input field with support for various HTML5 input types and accessibility features.

## Usage

```tsx
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function Example() {
  return (
    <div className="space-y-2 w-96">
      <Label htmlFor="email">Email</Label>
      <Input 
        id="email"
        type="email" 
        placeholder="Enter your email"
      />
      <Label htmlFor="password">Password</Label>
      <Input 
        id="password"
        type="password" 
        placeholder="Enter your password"
      />
    </div>
  )
}
```

## Props

| Property | Type | Description | Default |
|----------|------|-------------|---------|
| type | `string` | HTML5 input type | `"text"` |
| placeholder | `string` | Placeholder text | - |
| disabled | `boolean` | Whether the input is disabled | `false` |
| required | `boolean` | Whether the input is required | `false` |
| className | `string` | Additional CSS classes | - |

## Input Types Supported

- text
- email
- password
- number
- tel
- url
- search
- date
- time
- datetime-local
- month
- week

## Theme

| Variable | Description |
|----------|-------------|
| `--input` | Input background color |
| `--foreground` | Input text color |
| `--border` | Input border color |
| `--ring` | Input focus ring color |
