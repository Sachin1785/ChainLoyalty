// Component registry for dynamic imports and metadata
export interface ComponentMeta {
  name: string;
  title: string;
  slug: string;
  description: string;
  category: 'Forms' | 'Layout' | 'Feedback' | 'Navigation' | 'Display';
}

export const COMPONENT_REGISTRY: ComponentMeta[] = [
  {
    name: 'button',
    title: 'Button',
    slug: 'button',
    description: 'A versatile button component with multiple variants and sizes.',
    category: 'Forms',
  },
  {
    name: 'card',
    title: 'Card',
    slug: 'card',
    description: 'A flexible container for grouping content.',
    category: 'Layout',
  },
  {
    name: 'input',
    title: 'Input',
    slug: 'input',
    description: 'A text input field for form submissions.',
    category: 'Forms',
  },
  {
    name: 'badge',
    title: 'Badge',
    slug: 'badge',
    description: 'A small label component for displaying status or categories.',
    category: 'Display',
  },
  {
    name: 'dropdown-menu',
    title: 'Dropdown Menu',
    slug: 'dropdown-menu',
    description: 'A menu component that opens on interaction.',
    category: 'Navigation',
  },
  {
    name: 'tabs',
    title: 'Tabs',
    slug: 'tabs',
    description: 'Organize content into separate views.',
    category: 'Navigation',
  },
  {
    name: 'leaderboard',
    title: 'Leaderboard',
    slug: 'leaderboard',
    description: 'Displays a ranked list of users based on loyalty points.',
    category: 'Display',
  },
  {
    name: 'rewards-dashboard',
    title: 'Rewards Dashboard',
    slug: 'rewards-dashboard',
    description: 'A dashboard showing current rewards and claimed items.',
    category: 'Display',
  },
  {
    name: 'referral-widget',
    title: 'Referral Widget',
    slug: 'referral-widget',
    description: 'An interactive widget to generate and copy referral codes.',
    category: 'Display',
  },
  {
    name: 'spin-widget',
    title: 'Spin Widget',
    slug: 'spin-widget',
    description: 'An interactive "Spin-to-Win" wheel for engaging rewards.',
    category: 'Feedback',
  },
  {
    name: 'connect-wallet-button',
    title: 'Connect Wallet Button',
    slug: 'connect-wallet-button',
    description: 'A customizable Connect Wallet button integrating SIWE for authentication.',
    category: 'Feedback',
  },
  {
    name: 'copy-code-button',
    title: 'Copy Code Button',
    slug: 'copy-code-button',
    description: 'A button to copy code snippets directly to clipboard.',
    category: 'Forms',
  },
  {
    name: 'connect-metamask-siwe-button',
    title: 'Connect MetaMask SIWE Button',
    slug: 'connect-metamask-siwe-button',
    description: 'A specialized MetaMask Connect button that automatically initiates a SIWE (Sign In With Ethereum) flow.',
    category: 'Feedback',
  },
  {
    name: 'achievement-showcase-widget',
    title: 'Achievement Showcase Widget',
    slug: 'achievement-showcase-widget',
    description: 'Displays a grid of badges a user can earn, highlighting unlocked achievements based on reward history.',
    category: 'Display',
  },
  {
    name: 'quest-board-widget',
    title: 'Quest Board Widget',
    slug: 'quest-board-widget',
    description: 'Displays a list of quests/tasks with completion tracking based on reward history.',
    category: 'Display',
  },
  {
    name: 'reward-store-widget',
    title: 'Reward Store Widget',
    slug: 'reward-store-widget',
    description: 'An interactive store where users can spend loyalty points to purchase items.',
    category: 'Display',
  },
  {
    name: 'tier-progress-widget',
    title: 'Tier Progress Widget',
    slug: 'tier-progress-widget',
    description: 'Visualizes a user\'s progress through VIP loyalty tiers with an animated progress bar.',
    category: 'Display',
  },
];

export function getComponentBySlug(slug: string): ComponentMeta | undefined {
  return COMPONENT_REGISTRY.find(c => c.slug === slug);
}

export function getComponentsByCategory(category: ComponentMeta['category']): ComponentMeta[] {
  return COMPONENT_REGISTRY.filter(c => c.category === category);
}
