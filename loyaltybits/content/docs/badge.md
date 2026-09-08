# Badge

A small label component for displaying status, categories, or tags.

Badges are compact components used to highlight important information or categorize items. They're perfect for displaying status indicators, tags, or chips.

## Usage

```tsx
import { Badge } from "@/components/ui/badge"

export default function Example() {
  return (
    <div className="flex gap-2 flex-wrap">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  )
}
```

## Props

| Property | Type | Description | Default |
|----------|------|-------------|---------|
| variant | `"default" \| "secondary" \| "destructive" \| "outline"` | Badge style variant | `"default"` |
| children | `React.ReactNode` | Badge content | - |
| className | `string` | Additional CSS classes | - |

## Variants

### Default
Solid badge with primary color. Use for positive or neutral status.

### Secondary
Secondary colored badge. Good for alternative information.

### Destructive
Red/warning color badge. Use for errors or alerts.

### Outline
Bordered badge with transparent background.

## Use Cases

- Display user roles or permissions
- Show post tags or categories
- Indicate status (Active, Inactive, Pending)
- Label items in lists

## Theme

| Variable | Description |
|----------|-------------|
| `--primary` | Default badge background |
| `--destructive` | Destructive badge background |
| `--border` | Outline badge border color |
