# Alert

A component for displaying important messages and notifications to users.

The Alert component is essential for drawing user attention to critical information, warnings, or system messages. It supports different severity levels and can include icons and actions.

## Usage

```tsx
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"

export default function Example() {
  return (
    <div className="space-y-4">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Heads up!</AlertTitle>
        <AlertDescription>
          This is an important message that requires your attention.
        </AlertDescription>
      </Alert>
      
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Something went wrong. Please try again.
        </AlertDescription>
      </Alert>
    </div>
  )
}
```

## Props

| Property | Type | Description | Default |
|----------|------|-------------|---------|
| variant | `"default" \| "destructive"` | Alert severity level | `"default"` |
| children | `React.ReactNode` | Alert content | - |

## Subcomponents

### AlertTitle
A semantic heading for the alert message.

### AlertDescription
Detailed description text for additional context.

## Use Cases

- System errors and warnings
- Success confirmations
- Important notifications
- Status updates
- User guidance and tips

## Theme

| Variable | Description |
|----------|-------------|
| `--destructive` | Destructive alert background |
| `--border` | Alert border color |
| `--foreground` | Alert text color |
