# Card

A flexible container component for grouping and organizing content.

The Card component provides a semantic container with built-in styling. It includes optional header, content, and footer sections that can be used independently or together.

## Usage

```tsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function Example() {
  return (
    <Card className="w-96">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Card content goes here. You can include any React components.</p>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button variant="outline">Cancel</Button>
        <Button>Save</Button>
      </CardFooter>
    </Card>
  )
}
```

## Props

| Property | Type | Description | Default |
|----------|------|-------------|---------|
| className | `string` | Additional CSS classes | - |
| children | `React.ReactNode` | Card content | - |

## Subcomponents

### CardHeader
Container for the card header section.

### CardTitle
Semantic heading for card titles. Uses the `<h2>` element.

### CardDescription
Secondary text for additional information.

### CardContent
Main content area of the card.

### CardFooter
Footer section, typically for actions or metadata.

## Theme

| Variable | Description |
|----------|-------------|
| `--card` | Card background color |
| `--card-foreground` | Card text color |
| `--border` | Card border color |
