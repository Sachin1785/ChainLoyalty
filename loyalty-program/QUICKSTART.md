# LoyaltyBadge - Quick Start Guide

## 5-Minute Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_ADMIN_ADDRESSES=0xYourWalletAddress
```

### 3. Start Development Server
```bash
npm run dev
```

Visit: `http://localhost:3000`

## Project Structure at a Glance

```
📦 loyalty-program
├── 🎨 app/                          # Pages & routing
│   ├── page.tsx                     # Landing page
│   ├── admin/dashboard/page.tsx     # Admin panel
│   └── user/loyalty-hub/page.tsx    # User rewards
│
├── ⚙️ components/                    # React components
│   ├── admin/                       # Admin features
│   ├── user/                        # User features
│   └── shared/                      # Reusable UI
│
├── 🔧 lib/                           # Business logic
│   ├── hooks/                       # Custom hooks
│   ├── types/                       # TypeScript types
│   ├── store/                       # State management
│   └── utils/                       # Utilities
│
└── 📝 public/                        # Static assets
```

## Key Pages

### Landing Page (`/`)
- Feature showcase
- "Get Started" CTA
- Responsive design

### Admin Dashboard (`/admin/dashboard`)
- Badge management
- Points configuration
- Prize setup
- Business rules
- Lootbox management

### User Loyalty Hub (`/user/loyalty-hub`)
- Account stats
- Badge showcase
- Spin-to-win game
- Activity tracking

## Core Concepts

### 1. Wallet Authentication
User signs a message with MetaMask to prove ownership.

```typescript
// In your app
const { connect, session } = useWallet()
// Call connect() → Shows MetaMask popup
// User signs message → Session created
```

### 2. State Management
Global state with Zustand (zero-boilerplate Redux alternative).

```typescript
// Authentication
const session = useAuthStore(state => state.session)

// User data
const stats = useUserStore(state => state.stats)
```

### 3. Component Reusability
All UI is in `components/shared/ui.tsx`

```typescript
<Button variant="primary" onClick={handleClick}>
  Click Me
</Button>

<Card className="p-6">
  Content here
</Card>

<Input label="Name" placeholder="John Doe" />
```

## Common Tasks

### Add a New Badge Type

1. Go to Admin Dashboard → Badge Registry tab
2. Click "New Badge"
3. Fill form:
   - Name: "Power User"
   - Description: "Completed 10 transactions"
   - Max Supply: 1000
   - Metadata URI: `https://example.com/badge-1.json`
   - Transferable: OFF (soulbound)
4. Click "Register Badge"

### Configure Spin Rewards

1. Admin Dashboard → Prize Builder tab
2. Add prizes with weights (must total 10,000):
   - 100 Points: 4000 bps (40%)
   - Badge: 3000 bps (30%)
   - 0.1 ETH: 2000 bps (20%)
   - Token: 1000 bps (10%)
3. Real-time validation shows progress
4. Click "Save Prize Configuration"

### Create Automation Rule

1. Admin Dashboard → Rules Engine tab
2. Click "Create Rule"
3. Set:
   - Trigger: "User Purchase > $100"
   - Condition: "Customer tier = VIP"
   - Action: "Award 500 Points + Badge"
4. Save rule

## API Endpoints Needed

Your backend should provide:

```
GET  /users/{address}/stats        → UserStats
GET  /users/{address}/badges       → Badge[]
GET  /badges                       → Badge[]
POST /badges/register              → { id, ... }
GET  /lootboxes                    → LootboxType[]
POST /lootboxes/register           → { id, ... }
GET  /prizes                       → Prize[]
POST /prizes/update-weights        → success
POST /spin/commit                  → { commitmentHash }
POST /spin/reveal                  → SpinResult
POST /badges/claim                 → success
GET  /rules                        → Rule[]
POST /rules                        → { id, ... }
```

## Styling

Built with Tailwind CSS. Key classes:

```
Colors:       blue-600, purple-500, yellow-400
Layouts:      flex, grid, space-y-4
Responsive:   md:, lg:, sm: prefixes
Dark mode:    dark: prefix
```

Example:
```jsx
<div className="flex items-center gap-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
  Content
</div>
```

## Debugging

### Check Component State
```typescript
// In browser console
// useAuthStore, useUserStore are global
```

### API Calls
Check Network tab in DevTools for:
- Request headers (includes signature)
- Response data
- Error messages

### Build Errors
```bash
npm run build  # Full type checking
```

## Deployment

```bash
# Production build
npm run build

# Deploy to Vercel
npm i -g vercel
vercel --prod

# Or Docker
docker build -t loyalty-badge .
docker run -p 3000:3000 loyalty-badge
```

## Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `NEXT_PUBLIC_API_URL` | Backend endpoint | `http://localhost:3001/api` |
| `NEXT_PUBLIC_ADMIN_ADDRESSES` | Admin wallets | `0x123...,0x456...` |

## Performance Tips

1. **Keep components small** - Easier to optimize
2. **Use `useWallet()` once** - Session stored globally
3. **Refetch only when needed** - Use `refetch()` in hooks
4. **Lazy load heavy components** - Use Next.js dynamic imports

## Browser DevTools

### React DevTools
- Inspect component props
- Track re-renders
- Check hooks state

### Ethers.js
- Sign messages manually
- Inspect wallet connection
- Test contract calls

## Troubleshooting

### "No wallet found"
- Install MetaMask
- Make sure you're on a supported network

### API errors
- Check `.env.local` configuration
- Ensure backend is running
- Check CORS settings

### Styles not appearing
- Clear `.next` folder: `rm -rf .next`
- Rebuild: `npm run build`

## Next Steps

1. **Set up backend** - Create API endpoints
2. **Connect smart contracts** - Deploy ERC20, NFT contracts
3. **Deploy frontend** - To Vercel or hosting service
4. **Test end-to-end** - Connect wallet, earn badges, spin

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [ethers.js](https://docs.ethers.org/)
- [Zustand](https://github.com/pmndrs/zustand)

## Support

- Check `ARCHITECTURE.md` for in-depth design
- Review example components in `components/`
- Check `lib/hooks/` for custom hooks
