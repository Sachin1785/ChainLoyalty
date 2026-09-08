# Tabs

Organize content into separate views that users can switch between.

The Tabs component allows content organization by topic or category. It's perfect for settings pages, documentation, or multi-step forms where content needs to be grouped logically.

## Usage

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

export default function Example() {
  return (
    <Tabs defaultValue="account">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="privacy">Privacy</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>
      
      <TabsContent value="account">
        <p>Account settings content here</p>
      </TabsContent>
      
      <TabsContent value="privacy">
        <p>Privacy settings content here</p>
      </TabsContent>
      
      <TabsContent value="notifications">
        <p>Notification preferences here</p>
      </TabsContent>
    </Tabs>
  )
}
```

## Props

| Property | Type | Description | Default |
|----------|------|-------------|---------|
| value | `string` | Current active tab | - |
| defaultValue | `string` | Initial active tab | - |
| onValueChange | `(value: string) => void` | Callback when tab changes | - |

## Subcomponents

### TabsList
Container for tab triggers. Manages layout and active state.

### TabsTrigger
Individual tab button that switches content.

### TabsContent
Content panel associated with a tab trigger.

## Features

- Keyboard navigation (Arrow keys)
- ARIA compliant
- Smooth transitions
- Customizable styling
- Vertical or horizontal layout

## Use Cases

- Settings pages
- Documentation sections
- Product features
- Form steps
- Content organization

## Theme

| Variable | Description |
|----------|-------------|
| `--background` | Tab background |
| `--foreground` | Tab text color |
| `--accent` | Active tab indicator |
| `--border` | Tab border color |
