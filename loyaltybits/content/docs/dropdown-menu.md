# Dropdown Menu

A menu component that opens on interaction, displaying a list of actionable items.

The Dropdown Menu is built on Radix UI and provides accessible, keyboard-navigable menu options. Perfect for navigation, actions, or user preferences.

## Usage

```tsx
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreVertical } from "lucide-react"

export default function Example() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreVertical className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Edit</DropdownMenuItem>
        <DropdownMenuItem>Duplicate</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

## Props

| Property | Type | Description | Default |
|----------|------|-------------|---------|
| open | `boolean` | Controlled open state | - |
| onOpenChange | `(open: boolean) => void` | Callback when open state changes | - |
| defaultOpen | `boolean` | Initial open state | `false` |

## Subcomponents

### DropdownMenuTrigger
The element that triggers the menu opening. Use `asChild` to apply to custom buttons.

### DropdownMenuContent
The menu content container with positioning and styling.

### DropdownMenuItem
Individual menu item. Supports icons and disabled state.

### DropdownMenuSeparator
Visual separator between menu items.

### DropdownMenuLabel
Optional label for grouping menu items.

### DropdownMenuCheckboxItem
Menu item with checkbox for toggleable options.

## Accessibility

- Full keyboard navigation (Arrow keys, Enter, Escape)
- ARIA labels and roles
- Screen reader support
- Focus management

## Theme

| Variable | Description |
|----------|-------------|
| `--popover` | Menu background color |
| `--popover-foreground` | Menu text color |
| `--accent` | Hover state background |
