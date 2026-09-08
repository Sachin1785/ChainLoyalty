/**
 * Theme configuration for each component's customizable color tokens.
 * Keys match the component's theme prop keys exactly.
 * This drives the color palette UI in the preview panel.
 */

export interface ThemeToken {
  key: string;
  label: string;
  default: string;
}

export const COMPONENT_THEME_CONFIG: Record<string, ThemeToken[]> = {
  leaderboard: [
    { key: 'background', label: 'Background', default: '#ffffff' },
    { key: 'foreground', label: 'Text', default: '#000000' },
    { key: 'border', label: 'Border', default: '#000000' },
    { key: 'accent', label: 'Accent', default: '#FFD703' },
    { key: 'cardBase', label: 'Card Base', default: '#f9fafb' },
    { key: 'podiumCol1', label: '1st Place', default: '#FFD703' },
    { key: 'podiumCol2', label: '2nd Place', default: '#C0C0C0' },
    { key: 'podiumCol3', label: '3rd Place', default: '#CD7F32' },
  ],
  'rewards-dashboard': [
    { key: 'background', label: 'Background', default: '#ffffff' },
    { key: 'foreground', label: 'Text', default: '#000000' },
    { key: 'border', label: 'Border', default: '#000000' },
    { key: 'accent', label: 'Accent', default: '#FFD703' },
    { key: 'cardBase', label: 'Card Base', default: '#f9fafb' },
    { key: 'statBg', label: 'Stat Bg', default: '#f3f4f6' },
    { key: 'shadow', label: 'Shadow (CSS)', default: '#000000' },
  ],
  'referral-widget': [
    { key: 'background', label: 'Background', default: '#fffbeb' },
    { key: 'foreground', label: 'Text', default: '#000000' },
    { key: 'border', label: 'Border', default: '#000000' },
    { key: 'accent', label: 'Accent', default: '#FFD703' },
    { key: 'cardBase', label: 'Card Base', default: '#ffffff' },
    { key: 'inputBg', label: 'Input Bg', default: '#f3f4f6' },
  ],
  'spin-widget': [
    { key: 'background', label: 'Background', default: '#ffffff' },
    { key: 'foreground', label: 'Text', default: '#000000' },
    { key: 'border', label: 'Border', default: '#000000' },
    { key: 'accent', label: 'Accent', default: '#FFD703' },
    { key: 'cardBase', label: 'Card Base', default: '#f9fafb' },
    { key: 'primaryButtonBg', label: 'Button Bg', default: '#FFD703' },
  ],
  'connect-wallet-button': [
    { key: 'background', label: 'Background', default: '#FFD703' },
    { key: 'foreground', label: 'Text', default: '#000000' },
    { key: 'border', label: 'Border', default: '#000000' },
  ],
  'connect-metamask-siwe-button': [
    { key: 'background', label: 'Background', default: '#FF6B00' },
    { key: 'foreground', label: 'Text', default: '#ffffff' },
    { key: 'border', label: 'Border', default: '#000000' },
  ],
  'achievement-showcase-widget': [
    { key: 'background', label: 'Background', default: '#faf5ff' },
    { key: 'foreground', label: 'Text', default: '#000000' },
    { key: 'border', label: 'Border', default: '#000000' },
    { key: 'cardBase', label: 'Card Base', default: '#ffffff' },
    { key: 'accent', label: 'Accent', default: '#FFD703' },
  ],
  'quest-board-widget': [
    { key: 'background', label: 'Background', default: '#f0fdf4' },
    { key: 'foreground', label: 'Text', default: '#000000' },
    { key: 'border', label: 'Border', default: '#000000' },
    { key: 'cardBase', label: 'Card Base', default: '#ffffff' },
    { key: 'accent', label: 'Accent', default: '#FFD703' },
    { key: 'completedGreen', label: 'Completed', default: '#8ED670' },
  ],
  'reward-store-widget': [
    { key: 'background', label: 'Background', default: '#f0f9ff' },
    { key: 'foreground', label: 'Text', default: '#000000' },
    { key: 'border', label: 'Border', default: '#000000' },
    { key: 'cardBase', label: 'Card Base', default: '#ffffff' },
    { key: 'accent', label: 'Accent', default: '#FFD703' },
    { key: 'insufficientFundsBg', label: 'Disabled Btn', default: '#9ca3af' },
  ],
  'tier-progress-widget': [
    { key: 'background', label: 'Background', default: '#f8fafc' },
    { key: 'foreground', label: 'Text', default: '#000000' },
    { key: 'border', label: 'Border', default: '#000000' },
    { key: 'cardBase', label: 'Card Base', default: '#ffffff' },
    { key: 'accent', label: 'Progress Bar', default: '#FFD703' },
  ],
};
