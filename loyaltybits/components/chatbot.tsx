'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

// ─── Component Knowledge Base ───────────────────────────────────────────────

const COMPONENT_KB: Record<string, { description: string; usage: string; props: string; category: string; slug: string }> = {
  button: {
    slug: 'button', category: 'Forms',
    description: 'A versatile button component with multiple variants: default, outline, destructive, and ghost. Supports size variants (sm, md, lg) and disabled state.',
    usage: `import { Button } from '@/components/ui/button'\n<Button>Default</Button>\n<Button variant="outline">Outline</Button>\n<Button variant="destructive">Destructive</Button>\n<Button variant="ghost">Ghost</Button>`,
    props: '`variant` (default|outline|destructive|ghost), `size` (sm|md|lg), `disabled` (boolean), `onClick` (function)',
  },
  card: {
    slug: 'card', category: 'Layout',
    description: 'A flexible container with header, content, and footer sections. Great for grouping related information.',
    usage: `import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'\n<Card>\n  <CardHeader><CardTitle>Title</CardTitle></CardHeader>\n  <CardContent>Content here</CardContent>\n</Card>`,
    props: '`className` (string), `style` (CSSProperties). Sub-components: CardHeader, CardTitle, CardDescription, CardContent, CardFooter.',
  },
  input: {
    slug: 'input', category: 'Forms',
    description: 'A styled text input field for form submissions. Supports all standard HTML input types.',
    usage: `import { Input } from '@/components/ui/input'\n<Input type="email" placeholder="Enter email" />`,
    props: '`type` (text|email|password|number...), `placeholder` (string), `value`, `onChange`, `disabled`',
  },
  badge: {
    slug: 'badge', category: 'Display',
    description: 'A small label for displaying status, tags, or categories. Supports default, secondary, and destructive variants.',
    usage: `import { Badge } from '@/components/ui/badge'\n<Badge>Default</Badge>\n<Badge variant="secondary">Secondary</Badge>`,
    props: '`variant` (default|secondary|destructive), `className`',
  },
  'dropdown-menu': {
    slug: 'dropdown-menu', category: 'Navigation',
    description: 'A menu component that opens on interaction, built with Radix UI. Supports nested items, separators, and keyboard navigation.',
    usage: `import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'\n<DropdownMenu>\n  <DropdownMenuTrigger>Open</DropdownMenuTrigger>\n  <DropdownMenuContent>\n    <DropdownMenuItem>Item 1</DropdownMenuItem>\n  </DropdownMenuContent>\n</DropdownMenu>`,
    props: 'Trigger, Content, Item, Label, Separator sub-components. Fully accessible with keyboard navigation.',
  },
  tabs: {
    slug: 'tabs', category: 'Navigation',
    description: 'Organizes content into separate switchable views. Built on Radix UI Tabs for full accessibility.',
    usage: `import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'\n<Tabs defaultValue="tab1">\n  <TabsList>\n    <TabsTrigger value="tab1">Tab 1</TabsTrigger>\n  </TabsList>\n  <TabsContent value="tab1">Content</TabsContent>\n</Tabs>`,
    props: '`defaultValue` (string), `value` (controlled), `onValueChange` (callback)',
  },
  leaderboard: {
    slug: 'leaderboard', category: 'Display',
    description: 'Displays a ranked list of users based on loyalty points. Shows a visual podium for top 3 and a full ranking table. Requires ChainLoyaltyClient.',
    usage: `import { ChainLoyaltyClient, Leaderboard } from 'loyaltychain-sdk'\nimport { QueryClient, QueryClientProvider } from '@tanstack/react-query'\n<QueryClientProvider client={queryClient}>\n  <Leaderboard client={client} title="Top Users" />\n</QueryClientProvider>`,
    props: '`client` (ChainLoyaltyClient, required), `page` (number, default 1), `pageSize` (number, default 10), `title` (string), `theme` (LeaderboardTheme), `showPodium` (boolean)',
  },
  'rewards-dashboard': {
    slug: 'rewards-dashboard', category: 'Display',
    description: 'A dashboard showing the current user\'s total points, badges earned, and recent reward activity history.',
    usage: `import { ChainLoyaltyClient, RewardsDashboard } from 'loyaltychain-sdk'\n<QueryClientProvider client={queryClient}>\n  <RewardsDashboard client={client} walletAddress="0x..." title="My Rewards" />\n</QueryClientProvider>`,
    props: '`client` (ChainLoyaltyClient, required), `walletAddress` (string, required), `title` (string), `historyPageSize` (number), `theme` (RewardsDashboardTheme), `onConnect` (callback)',
  },
  'referral-widget': {
    slug: 'referral-widget', category: 'Display',
    description: 'An interactive widget that generates and displays the user\'s referral code with a copy-to-clipboard button.',
    usage: `import { ReferralWidget } from 'loyaltychain-sdk'\n<ReferralWidget client={client} walletAddress="0x..." referralRewardText="Get 200 pts per referral!" />`,
    props: '`client` (required), `walletAddress` (required), `referralRewardText` (string), `theme`, `onConnect`',
  },
  'spin-widget': {
    slug: 'spin-widget', category: 'Feedback',
    description: 'An interactive spin-to-win wheel for gamified rewards. Uses a commit-reveal scheme for provably fair randomness. Shows prize odds and animates the wheel.',
    usage: `import { SpinWidget } from 'loyaltychain-sdk'\n<SpinWidget\n  client={client}\n  walletAddress="0x..."\n  lootboxId={1}\n  onSpinSuccess={(prize) => console.log(prize)}\n/>`,
    props: '`client` (required), `walletAddress` (required), `lootboxId` (number, default 1), `title` (string), `theme`, `onSpinSuccess`, `onSpinError`, `onConnect`',
  },
  'connect-wallet-button': {
    slug: 'connect-wallet-button', category: 'Feedback',
    description: 'A neo-brutalist styled button that triggers MetaMask wallet connection via eth_requestAccounts. Standalone, no Wagmi required.',
    usage: `import { ConnectWalletButton } from 'loyaltychain-sdk'\n<ConnectWalletButton onConnect={(address) => console.log(address)} label="Connect Wallet" />`,
    props: '`onConnect` (required, callback with address string), `label` (string), `theme` (ConnectWalletButtonTheme)',
  },
  'copy-code-button': {
    slug: 'copy-code-button', category: 'Forms',
    description: 'A button that copies a code string to the clipboard with visual feedback. Shows a checkmark animation on success.',
    usage: `import { CopyCodeButton } from 'loyaltychain-sdk'\n<CopyCodeButton code="npm install loyaltychain-sdk" />`,
    props: '`code` (string, required) — the text to be copied to clipboard.',
  },
  'connect-metamask-siwe-button': {
    slug: 'connect-metamask-siwe-button', category: 'Feedback',
    description: 'A specialized MetaMask connect button that automatically initiates SIWE (Sign In With Ethereum) after wallet connection. Returns a JWT session token.',
    usage: `import { ConnectMetaMaskSIWEButton } from 'loyaltychain-sdk/components/ConnectMetaMaskSIWEButton'\n<ConnectMetaMaskSIWEButton\n  siweApiUrl="https://your-api.com"\n  onConnect={(address, jwt) => console.log(address, jwt)}\n/>`,
    props: '`siweApiUrl` (string, required), `onConnect` ((address, jwt) => void, required), `label` (string), `theme`',
  },
  'achievement-showcase-widget': {
    slug: 'achievement-showcase-widget', category: 'Display',
    description: 'Displays a grid of badge cards that a user can earn. Unlocked badges are highlighted in green, locked ones are greyed out. Checks reward history to determine earned state.',
    usage: `import { AchievementShowcaseWidget } from 'loyaltychain-sdk'\nconst badges = [\n  { id: "early_adopter", name: "Early Adopter", description: "...", imageUrl: "..." }\n]\n<AchievementShowcaseWidget client={client} walletAddress="0x..." availableBadges={badges} />`,
    props: '`client` (required), `walletAddress` (required), `availableBadges` (BadgeDef[], required: {id, name, description, imageUrl}), `title` (string), `theme`, `onConnect`',
  },
  'quest-board-widget': {
    slug: 'quest-board-widget', category: 'Display',
    description: 'Displays a list of quests/tasks with point rewards. Completed quests are checked off (green background, strikethrough) based on reward history. Supports action links to go complete a quest.',
    usage: `import { QuestBoardWidget } from 'loyaltychain-sdk'\nconst quests = [\n  { id: "follow_twitter", title: "Follow Twitter", description: "...", rewardPoints: 50, icon: "🐦", actionUrl: "..." }\n]\n<QuestBoardWidget client={client} walletAddress="0x..." quests={quests} />`,
    props: '`client` (required), `walletAddress` (required), `quests` (Quest[]: {id, title, description, rewardPoints, icon?, actionUrl?}), `title` (string), `theme`, `onConnect`',
  },
  'reward-store-widget': {
    slug: 'reward-store-widget', category: 'Display',
    description: 'An interactive points redemption store. Shows the user\'s current balance, lists purchasable items with costs, and handles purchase transactions. Items are greyed out if user cannot afford them.',
    usage: `import { RewardStoreWidget } from 'loyaltychain-sdk'\nconst items = [\n  { id: "item_1", name: "Discord Role", description: "...", cost: 500 }\n]\n<RewardStoreWidget client={client} walletAddress="0x..." items={items} onPurchaseSuccess={(item, tx) => {}} />`,
    props: '`client` (required), `walletAddress` (required), `items` (StoreItem[]: {id, name, description, cost, imageUrl?}), `title` (string), `theme`, `onPurchaseSuccess`, `onPurchaseError`, `onConnect`',
  },
  'tier-progress-widget': {
    slug: 'tier-progress-widget', category: 'Display',
    description: 'Shows a user\'s current loyalty tier and progress toward the next one via an animated progress bar. Tiers are sorted by minPoints and color-coded.',
    usage: `import { TierProgressWidget } from 'loyaltychain-sdk'\nconst tiers = [\n  { name: "Bronze", minPoints: 0, color: "#CD7F32" },\n  { name: "Silver", minPoints: 1000, color: "#C0C0C0" },\n  { name: "Gold",   minPoints: 5000, color: "#FFD700" },\n]\n<TierProgressWidget client={client} walletAddress="0x..." tiers={tiers} />`,
    props: '`client` (required), `walletAddress` (required), `tiers` (Tier[]: {name, minPoints, color?}), `title` (string), `theme`, `onConnect`',
  },
}

// ─── Intent Matching ─────────────────────────────────────────────────────────

function findComponent(query: string): string | null {
  const q = query.toLowerCase()
  const aliases: Record<string, string> = {
    'spin': 'spin-widget', 'wheel': 'spin-widget', 'lootbox': 'spin-widget',
    'leader': 'leaderboard', 'ranking': 'leaderboard', 'rank': 'leaderboard',
    'reward': 'rewards-dashboard', 'dashboard': 'rewards-dashboard', 'points': 'rewards-dashboard',
    'referral': 'referral-widget', 'invite': 'referral-widget',
    'connect wallet': 'connect-wallet-button', 'metamask': 'connect-metamask-siwe-button',
    'siwe': 'connect-metamask-siwe-button', 'sign in': 'connect-metamask-siwe-button',
    'copy': 'copy-code-button', 'clipboard': 'copy-code-button',
    'achievement': 'achievement-showcase-widget', 'badges': 'achievement-showcase-widget',
    'quest': 'quest-board-widget', 'task': 'quest-board-widget',
    'store': 'reward-store-widget', 'shop': 'reward-store-widget', 'purchase': 'reward-store-widget',
    'tier': 'tier-progress-widget', 'vip': 'tier-progress-widget', 'progress': 'tier-progress-widget',
    'btn': 'button', 'button': 'button', 'input': 'input', 'card': 'card',
    'badge': 'badge', 'tab': 'tabs', 'dropdown': 'dropdown-menu', 'menu': 'dropdown-menu',
  }
  for (const [alias, key] of Object.entries(aliases)) {
    if (q.includes(alias)) return key
  }
  for (const key of Object.keys(COMPONENT_KB)) {
    if (q.includes(key)) return key
  }
  return null
}

function generateResponse(userMessage: string): string {
  const q = userMessage.toLowerCase().trim()

  // Greetings
  if (/^(hi|hey|hello|howdy|sup|yo)\b/.test(q)) {
    return `Hey there! 👋 I'm the **ReactBits assistant**. I have full knowledge of all ${Object.keys(COMPONENT_KB).length} components in this library.\n\nYou can ask me things like:\n- *"How do I use the Leaderboard?"*\n- *"What props does SpinWidget take?"*\n- *"Show me the Quest Board usage"*\n- *"List all components"*`
  }

  // List all
  if (/list|all components|what components|show all|available/.test(q)) {
    const byCategory = Object.values(COMPONENT_KB).reduce((acc, c) => {
      if (!acc[c.category]) acc[c.category] = []
      acc[c.category].push(`• **${c.slug}**`)
      return acc
    }, {} as Record<string, string[]>)
    return Object.entries(byCategory).map(([cat, items]) => `**${cat}**\n${items.join('\n')}`).join('\n\n')
  }

  // Install / setup
  if (/install|setup|get started|npm|package/.test(q)) {
    return `**Getting Started with the SDK**\n\n\`\`\`bash\nnpm install loyaltychain-sdk @tanstack/react-query\n\`\`\`\n\nThen wrap your app:\n\`\`\`tsx\nimport { ChainLoyaltyClient } from 'loyaltychain-sdk'\nimport { QueryClient, QueryClientProvider } from '@tanstack/react-query'\n\nconst client = new ChainLoyaltyClient({ baseUrl: 'https://your-api.com', apiKey: 'your-key' })\nconst queryClient = new QueryClient()\n\nfunction App() {\n  return (\n    <QueryClientProvider client={queryClient}>\n      {/* SDK components go here */}\n    </QueryClientProvider>\n  )\n}\n\`\`\``
  }

  // Theme / customization
  if (/theme|color|customiz|style/.test(q)) {
    const comp = findComponent(q)
    if (comp && COMPONENT_KB[comp]) {
      const c = COMPONENT_KB[comp]
      return `**Theming the ${comp}**\n\nAll SDK components accept a \`theme\` prop. You can override any color:\n\n\`\`\`tsx\n<${comp.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join('')}\n  theme={{\n    background: '#1a1a2e',\n    foreground: '#ffffff',\n    border: '#6c63ff',\n    accent: '#ff6584',\n    cardBase: '#16213e',\n  }}\n/>\n\`\`\`\n\nUse the **color palette** in the Preview tab on this page to visually customize it live!`
    }
    return `**Theming Components**\n\nAll SDK components accept a \`theme\` prop with color tokens:\n- \`background\` — Widget background\n- \`foreground\` — Text color\n- \`border\` — Border color\n- \`accent\` — Highlight/accent color\n- \`cardBase\` — Card inner background\n- \`shadow\` — Box shadow CSS\n\nUse the live **color palette** in the Preview tab on any doc page to customize interactively!`
  }

  // Props questions
  if (/prop|option|param|argument|accept/.test(q)) {
    const comp = findComponent(q)
    if (comp && COMPONENT_KB[comp]) {
      const c = COMPONENT_KB[comp]
      return `**Props for \`${comp}\`**\n\n${c.props}`
    }
  }

  // Usage / example / how to
  if (/how|usage|example|code|snippet|import|use/.test(q)) {
    const comp = findComponent(q)
    if (comp && COMPONENT_KB[comp]) {
      const c = COMPONENT_KB[comp]
      return `**${comp} — Usage Example**\n\n\`\`\`tsx\n${c.usage}\n\`\`\`\n\n*${c.description}*`
    }
  }

  // Direct component lookup
  const comp = findComponent(q)
  if (comp && COMPONENT_KB[comp]) {
    const c = COMPONENT_KB[comp]
    return `**${comp}** *(${c.category})*\n\n${c.description}\n\n\`\`\`tsx\n${c.usage}\n\`\`\`\n\n**Props:** ${c.props}\n\n👉 [View full docs](/docs/${c.slug})`
  }

  // Fallback
  return `I'm not sure about that. Try asking:\n- *"How do I use [component name]?"*\n- *"What props does [component] take?"*\n- *"List all components"*\n- *"How do I customize colors?"*\n\nAvailable components: ${Object.keys(COMPONENT_KB).join(', ')}`
}

// ─── Message Renderer ────────────────────────────────────────────────────────

function renderMarkdown(text: string) {
  const lines = text.split('\n')
  const elements: React.ReactNode[] = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (line.startsWith('```')) {
      const lang = line.slice(3)
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      elements.push(
        <pre key={i} className="bg-black/40 border border-white/10 rounded-lg p-3 text-xs font-mono text-green-300 overflow-x-auto my-2 whitespace-pre-wrap">{codeLines.join('\n')}</pre>
      )
    } else if (line.startsWith('**') && line.endsWith('**') && !line.slice(2, -2).includes('**')) {
      elements.push(<p key={i} className="font-bold text-white text-sm mt-2 mb-1">{line.slice(2, -2)}</p>)
    } else if (line.startsWith('• ')) {
      elements.push(<p key={i} className="text-white/80 text-sm pl-2">• {formatInline(line.slice(2))}</p>)
    } else if (line.startsWith('- ')) {
      elements.push(<p key={i} className="text-white/80 text-sm pl-2">• {formatInline(line.slice(2))}</p>)
    } else if (line === '') {
      elements.push(<div key={i} className="h-1" />)
    } else {
      elements.push(<p key={i} className="text-white/80 text-sm leading-relaxed">{formatInline(line)}</p>)
    }
    i++
  }
  return elements
}

function formatInline(text: string) {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`|\[.*?\]\(.*?\))/)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>
    if (part.startsWith('`') && part.endsWith('`')) return <code key={i} className="bg-white/10 text-cyan-300 px-1 rounded text-xs font-mono">{part.slice(1, -1)}</code>
    if (part.match(/^\[.*?\]\(.*?\)$/)) {
      const m = part.match(/^\[(.*?)\]\((.*?)\)$/)
      if (m) return <a key={i} href={m[2]} className="text-cyan-400 underline hover:text-cyan-300">{m[1]}</a>
    }
    return part
  })
}

// ─── Main Chatbot Component ──────────────────────────────────────────────────

interface Message { role: 'user' | 'bot'; text: string; id: number }

export function ChatBot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: `Hi! 👋 I'm the **ReactBits assistant**. Ask me anything about the components — usage, props, theming, setup, etc.`, id: 0 }
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const idRef = useRef(1)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100)
  }, [open])

  const send = useCallback(() => {
    const text = input.trim()
    if (!text) return
    const userMsg: Message = { role: 'user', text, id: idRef.current++ }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setTyping(true)
    setTimeout(() => {
      const response = generateResponse(text)
      setMessages(prev => [...prev, { role: 'bot', text: response, id: idRef.current++ }])
      setTyping(false)
    }, 400 + Math.random() * 300)
  }, [input])

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
        style={{ background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', boxShadow: '0 0 24px rgba(6,182,212,0.5)' }}
        aria-label={open ? 'Close chat' : 'Open chat'}
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
        {/* Pulse ring */}
        {!open && <span className="absolute inset-0 rounded-full animate-ping opacity-30" style={{ background: '#06b6d4' }} />}
      </button>

      {/* Chat Panel */}
      <div
        className={`fixed bottom-24 right-6 z-50 w-[360px] max-h-[560px] rounded-2xl flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right ${open ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-90 opacity-0 pointer-events-none'}`}
        style={{ background: 'rgba(10,10,20,0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(6,182,212,0.3)', boxShadow: '0 24px 64px rgba(0,0,0,0.7), 0 0 40px rgba(6,182,212,0.15)' }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10" style={{ background: 'linear-gradient(90deg, rgba(6,182,212,0.15), rgba(59,130,246,0.15))' }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-base" style={{ background: 'linear-gradient(135deg, #06b6d4, #3b82f6)' }}>🤖</div>
          <div>
            <p className="text-white font-semibold text-sm leading-none">LoyaltyKit Assistant</p>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-400 text-xs">online</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${msg.role === 'bot' ? 'bg-gradient-to-br from-cyan-500 to-blue-500 text-white' : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'}`}>
                {msg.role === 'bot' ? '🤖' : '👤'}
              </div>
              <div className={`max-w-[80%] rounded-2xl px-3 py-2.5 ${msg.role === 'user' ? 'rounded-tr-sm text-white text-sm' : 'rounded-tl-sm'}`}
                style={msg.role === 'user' ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' } : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                {msg.role === 'bot' ? renderMarkdown(msg.text) : <p className="text-sm leading-relaxed">{msg.text}</p>}
              </div>
            </div>
          ))}
          {typing && (
            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-xs">🤖</div>
              <div className="rounded-2xl rounded-tl-sm px-4 py-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex gap-1 items-center">
                  {[0, 1, 2].map(i => <span key={i} className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick suggestions */}
        <div className="px-4 pb-2 flex gap-2 flex-wrap">
          {['List all components', 'How to install?', 'How to theme?'].map(s => (
            <button key={s} onClick={() => {
              const userMsg: Message = { role: 'user', text: s, id: idRef.current++ }
              setMessages(prev => [...prev, userMsg])
              setTyping(true)
              setTimeout(() => {
                setMessages(prev => [...prev, { role: 'bot', text: generateResponse(s), id: idRef.current++ }])
                setTyping(false)
              }, 400 + Math.random() * 200)
            }}
              className="text-xs px-2.5 py-1 rounded-full border border-white/10 text-white/50 hover:text-white hover:border-cyan-500/50 transition-colors truncate"
              style={{ background: 'rgba(255,255,255,0.03)' }}
            >{s}</button>
          ))}
        </div>

        {/* Input */}
        <div className="flex items-center gap-2 px-4 pb-4 pt-1">
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask about any component..."
            className="flex-1 rounded-xl px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30 transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', caretColor: '#06b6d4' }}
            onFocus={e => { e.currentTarget.style.borderColor = 'rgba(6,182,212,0.5)' }}
            onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
          />
          <button
            onClick={send}
            disabled={!input.trim() || typing}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #06b6d4, #3b82f6)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </>
  )
}
