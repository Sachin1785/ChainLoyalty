# Button

A versatile button component with multiple variants and sizes for various use cases.

The Button component is the foundation of interactive elements in your application. It supports multiple variants (solid, outline, ghost), sizes (sm, md, lg), and states (default, hover, disabled).

## Usage

```tsx
import { Button } from "@/components/ui/button"

export default function Example() {
  return (
    <div className="flex gap-4">
      <Button>Default</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button size="lg">Large</Button>
      <Button disabled>Disabled</Button>
    </div>
  )
}
```

## Props

| Property | Type | Description | Default |
|----------|------|-------------|---------|
| variant | `"default" \| "destructive" \| "outline" \| "secondary" \| "ghost" \| "link"` | The button style variant | `"default"` |
| size | `"sm" \| "md" \| "lg"` | The button size | `"md"` |
| disabled | `boolean` | Whether the button is disabled | `false` |
| children | `React.ReactNode` | Button content | - |

## Variants

### Default
The solid default button with full background color. Best for primary actions.

### Outline
A button with a border and transparent background. Good for secondary actions.

### Ghost
A button with no background or border. Ideal for tertiary actions.

### Destructive
Used for dangerous actions like delete. Displays in a warning color.

## Theme

| Variable | Description |
|----------|-------------|
| `--primary` | Primary button background color |
| `--primary-foreground` | Primary button text color |
| `--destructive` | Destructive action color |
| `--border` | Button border color |
