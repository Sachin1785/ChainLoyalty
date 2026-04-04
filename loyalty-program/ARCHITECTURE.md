# LoyaltyBadge Architecture Guide

## Overview

LoyaltyBadge is a full-stack loyalty program management system built with Next.js. It provides:

1. **Merchant Admin Dashboard** - Configure badges, points, lootboxes, and business rules
2. **User Loyalty Widget** - Embeddable component for user engagement
3. **Blockchain Integration** - EIP-712 authentication and NFT-based rewards

## Design Patterns

### 1. Authentication Architecture

**EIP-712 Personal Sign Flow**

```
User → [Connect Wallet] → [Sign Message] → [Verify Signature] → [Create Session]
                              ↓
                     Personal_sign(message)
                              ↓
                     Store signature in cookie
```

**Message Structure**
```
Welcome to LoyaltyBadge!
Sign this message to authenticate your wallet.

Wallet Address: 0x...
Issued At: 2024-04-04T12:00:00Z
Statement: I authorize this signature for secure wallet authentication.
```

**Implementation Files**
- `lib/utils/auth.ts` - Message generation and signature verification
- `lib/hooks/index.ts` - `useWallet()` hook for wallet interactions
- `components/shared/WalletConnect.tsx` - UI for wallet connection

### 2. State Management

**Zustand Stores**

```typescript
// Authentication State
useAuthStore
  - session: WalletSession | null
  - setSession(session)
  - clearSession()

// User Data
useUserStore
  - stats: UserStats | null
  - badges: Badge[]
  - setStats(stats)
  - updateStats(updates)

// Admin UI
useAdminStore
  - selectedBadgeId: string | null
  - setSelectedBadgeId(id)
```

**Why Zustand?**
- Lightweight (no provider wrapper needed for read-only stores)
- TypeScript support
- Subscriptions for reactive updates
- No boilerplate

### 3. Component Architecture

**Layered Approach**

```
Pages (app/)
    ↓
Layout Components
    ↓
Feature Components (admin/, user/)
    ↓
Shared UI Components (shared/ui.tsx)
```

**Component Types**

1. **Pages** - Route handlers (`page.tsx`)
2. **Layouts** - Shared structure (Navigation, footer)
3. **Features** - Domain-specific (BadgeRegistry, SpinToWin)
4. **UI** - Reusable primitives (Button, Card, Input)

### 4. Data Flow

**User Dashboard Flow**

```
[User Page Component]
       ↓
 useWallet() → Get session
 useUserData() → Fetch stats/badges
       ↓
[Render Components]
   ├─ UserStatsOverview (stats)
   ├─ SpinToWin (lootboxes)
   └─ BadgeShowcase (badges)
```

**Admin Configuration Flow**

```
[Admin Dashboard]
    ↓ (Tab Selection)
[Component Selection]
    ├─ BadgeRegistry → registerBadge() → API
    ├─ PrizeTableBuilder → updatePrizeWeights() → API
    └─ RulesEngine → createRule() → API
```

### 5. API Client Architecture

**Axios Interceptors**

```typescript
apiClient.interceptors.request.use((config) => {
  // Add session to every request
  const session = getStoredSession()
  config.headers.Authorization = `Bearer ${session.signature}`
  config.headers['X-Wallet-Address'] = session.address
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 → clear session → redirect to login
  }
)
```

### 6. Type Safety

**TypeScript Types** (`lib/types/index.ts`)

```typescript
// Core entities
Badge, LoyaltyPoints, LootboxType, Prize, SpinResult

// Rules system
Rule, TriggerNode, ConditionNode, ActionNode

// User data
UserStats, WalletSession

// Network types
Request/Response wrappers
```

**Benefits**
- Compile-time type checking
- IDE autocompletion
- Self-documenting code

## Feature Implementations

### Badge Registry

**Component**: `components/admin/BadgeRegistry.tsx`

**Flow**
1. Fetch badges from API
2. Display grid with edit/delete CTA
3. Modal for creating new badge
4. Submit to backend via `registerBadge()`

**Key Details**
- Transferable toggle (soulbound badges)
- Metadata URI pointing to IPFS or external storage
- Max supply management

### Spin-to-Win Mechanism

**Component**: `components/user/SpinToWin.tsx`

**Two-Phase Process**

```
Phase 1: COMMIT
├─ User selects lootbox
├─ Frontend calls commitSpin()
├─ Backend generates commitment hash
└─ 3-4 block delay for randomness

Phase 2: REVEAL
├─ revealSpin() called after delay
├─ Backend decodes result
├─ Frontend shows result animation
└─ EAS attestation stored on-chain
```

**Why Two-Phase?**
- Prevents front-running
- Fair randomness on blockchain
- Verifiable proof of results

### Prize Table Builder

**Component**: `components/admin/PrizeTableBuilder.tsx`

**Key Feature**: Weighted Basis Points

```typescript
// Total must equal 10,000 (100%)
prizes: [
  { label: "100 Points", weightBps: 4000 },  // 40%
  { label: "Badge", weightBps: 3000 },       // 30%
  { label: "0.1 ETH", weightBps: 2000 },     // 20%
  { label: "ERC20 Token", weightBps: 1000 }  // 10%
]
// Sum = 10,000 ✓
```

**Validation**
- Real-time weight calculation
- Visual progress bar
- Save disabled until valid

### Business Rules Engine

**Component**: `components/admin/RulesEngine.tsx`

**Rule Structure**

```typescript
{
  id: string,
  name: "Welcome Bonus",
  trigger: { type: "USER_PURCHASE", value: ">100" },
  conditions: [
    { field: "amount", operator: "gt", value: 100 },
    { field: "tier", operator: "eq", value: "vip" }
  ],
  actions: [
    { type: "GRANT_POINTS", payload: { amount: 500 } },
    { type: "AWARD_BADGE", payload: { badgeId: "xyz" } }
  ],
  enabled: true
}
```

## Performance Optimizations

### 1. Code Splitting

```typescript
// Automatic route-based code splitting
- /admin/dashboard → admin components only
- /user/loyalty-hub → user components only
```

### 2. Image Optimization

```typescript
// Use next/image for automatic optimization
<Image src={badge.image} alt={badge.name} />
```

### 3. Data Fetching

```typescript
// Client-side with caching
useUserData() → fetch on mount → cache result
// Manual refetch available
```

### 4. CSS Optimization

- Tailwind CSS purges unused styles in production
- CSS-in-JS avoided for better performance

## Security Considerations

### 1. Authentication

- No private keys stored
- Signatures verified server-side
- Session stored in HTTP-only cookie
- CSRF protection via same-site cookies

### 2. Input Validation

- Client-side validation in forms
- Server-side validation in API
- Type checking via TypeScript

### 3. API Security

- CORS configuration
- Rate limiting (recommended)
- Input sanitization
- Output encoding

### 4. Smart Contract Interaction

- No contract deployment in frontend
- Only read calls (view functions)
- Transaction signing on user's wallet

## Deployment Considerations

### Environment Configuration

```bash
# Production
NEXT_PUBLIC_API_URL=https://api.loyalty.app
NEXT_PUBLIC_ADMIN_ADDRESSES=0xProduction...

# Staging
NEXT_PUBLIC_API_URL=https://staging-api.loyalty.app
NEXT_PUBLIC_ADMIN_ADDRESSES=0xStaging...
```

### Build Optimization

```bash
npm run build
# Output: .next/ (optimized)
# Size: ~2.5mb (with dependencies)
```

### Deployment Platforms

**Recommended**: Vercel (Next.js native)

```bash
npm i -g vercel
vercel --prod
```

## Database Requirements (Backend)

The frontend expects a backend with:

1. **User Collection**
   - address (wallet)
   - pointsBalance
   - lifetimeEarned
   - lifetimeSpent
   - totalSpins

2. **Badge Collection**
   - id, name, description
   - metadataUri, maxSupply
   - transferable

3. **Prize Collection**
   - type, label, value
   - weightBps

4. **Rules Collection**
   - trigger, conditions, actions
   - enabled status

## Testing Strategy

### Unit Tests

```typescript
// Test hooks
test('useWallet connects wallet', async () => {
  // Mock MetaMask
  // Test connect flow
})

// Test utilities
test('generateAuthMessage creates valid message', () => {
  // Verify message format
})
```

### Integration Tests

```typescript
// Test component flow
test('BadgeRegistry saves badge', async () => {
  // Render component
  // Fill form
  // Submit
  // Verify API call
})
```

### E2E Tests

```typescript
// Full user journeys
test('User connects wallet and spins', async () => {
  // Go to /user/loyalty-hub
  // Connect wallet
  // Select lootbox
  // Click spin
  // Verify result
})
```

## Future Architecture Enhancements

### 1. Multi-Chain Support

```typescript
// Support multiple networks
chains: {
  ethereum: { chainId: 1, rpc: "..." },
  polygon: { chainId: 137, rpc: "..." }
}
```

### 2. WebSocket Real-Time Updates

```typescript
// Live stats updates
const ws = new WebSocket('wss://api.loyalty.app')
ws.onmessage = (event) => {
  // Update store with new data
}
```

### 3. IPFS Integration

```typescript
// Store metadata on IPFS
const ipfsHash = await uploadToIPFS(badgeMetadata)
const metadataUri = `ipfs://${ipfsHash}`
```

### 4. Wallet Connect V2

```typescript
// Support WalletConnect protocol
import WalletConnectProvider from "@walletconnect/web3-provider"
```

## Troubleshooting

### Common Issues

1. **"No Ethereum provider found"**
   - User doesn't have MetaMask installed
   - Solution: Show install link

2. **"Session expired"**
   - API returns 401
   - Solution: Show re-connect prompt

3. **"Insufficient balance"**
   - User doesn't have enough points for spin
   - Solution: Disable spin button, show required balance

4. **CORS errors**
   - Frontend and backend on different domains
   - Solution: Configure CORS in backend

## Contributing

When adding new features:

1. Create component in appropriate directory
2. Add types to `lib/types/index.ts`
3. Create hook if needed in `lib/hooks/`
4. Use existing UI components from `components/shared/ui.tsx`
5. Follow existing code style and patterns
6. Test with `npm run build`

---

**Architecture Last Updated**: April 4, 2024
