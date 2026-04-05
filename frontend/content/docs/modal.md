# Modal Dialog

A dialog component for focused user interactions and important decisions.

The Modal Dialog component (built on Radix UI's Dialog) provides a solid foundation for displaying important content that requires user focus and action.

## Usage

```tsx
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export default function Example() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. Please confirm your choice.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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

### DialogTrigger
The element that opens the dialog. Use `asChild` for custom triggers.

### DialogContent
Main dialog container with backdrop and styling.

### DialogHeader
Container for title and description.

### DialogTitle
Semantic heading for the dialog.

### DialogDescription
Additional descriptive text.

### DialogFooter
Footer section for actions/buttons.

## Features

- Focus trap within dialog
- Click outside to close (customizable)
- ESC key to close
- Scroll lock on body
- ARIA compliant

## Use Cases

- Confirmations
- Forms
- Alerts
- Preferences
- Detailed information

## Theme

| Variable | Description |
|----------|-------------|
| `--background` | Dialog background |
| `--foreground` | Dialog text color |
| `--border` | Dialog border color |
