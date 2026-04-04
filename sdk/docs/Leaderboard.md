# Leaderboard Component

The `Leaderboard` widget displays the top point-earners of your loyalty program. It includes a stylish "Podium" for the top 3 users and a detailed rankings list with custom themes.

## Usage

```tsx
import { Leaderboard, ChainLoyaltyClient } from 'loyaltychain-sdk';

const client = new ChainLoyaltyClient({
  baseUrl: 'https://api.chainloyalty.com',
  apiKey: 'YOUR_API_KEY'
});

export function App() {
  return (
    <Leaderboard 
      client={client}
      title="Elite Earners"
      pageSize={10}
      showPodium={true} 
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `client` | `ChainLoyaltyClient` | Required | Instance of the ChainLoyalty client. |
| `page` | `number` | `1` | The page of results to fetch. |
| `pageSize` | `number` | `10` | Number of items per page. |
| `title` | `string` | `"Leaderboard"` | Header text for the widget. |
| `showPodium` | `boolean` | `true` | Whether to display the Top-3 winners podium. |
| `theme` | `LeaderboardTheme` | See below | Custom color and font overrides. |
| `className` | `string` | `undefined` | Optional CSS class. |
| `style` | `React.CSSProperties` | `undefined` | Inline styles for the container. |

## Theme Customization

You can pass a partial `theme` object to match the widget to your branding.

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `background` | `string` | `"#ffffff"` | Container background color. |
| `foreground` | `string` | `"#000000"` | Base text color. |
| `border` | `string` | `"#000000"` | Border color for cards and podiums. |
| `accent` | `string` | `"#FFD703"` | Primary accent color (used for rank text). |
| `shadow` | `string` | `"8px 8px 0 0 black"` | Box shadow style. |
| `fontFamily` | `string` | `"ui-sans-serif, system-ui..."` | Custom typography. |
| `podiumCol1` | `string` | `"#FFD703"` | Background for 1st place podium. |
| `podiumCol2` | `string` | `"#f3f4f6"` | Background for 2nd place podium. |
| `podiumCol3` | `string` | `"#FEBDD2"` | Background for 3rd place podium. |
| `tableRowBg` | `string` | `"#ffffff"` | Regular leaderboard row color. |
| `tableRowAltBg` | `string` | `"#f9f9f9"` | Alternating row color. |
