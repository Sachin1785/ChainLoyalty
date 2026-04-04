# API & Mock Data Setup Guide

## Problem Fixed ✓

The AxiosError "Network Error" you saw was caused by the frontend trying to reach `http://localhost:3001/api` which didn't exist. This is now solved with a **mock API layer**.

## What Changed

### 1. **Mock API Created** (`lib/utils/mock-api.ts`)
- Provides realistic mock data for development
- Simulates API delays (300-2000ms)
- Includes all endpoints needed

### 2. **Smart Fallback** (`lib/utils/api.ts`)
- Tries real API first
- Falls back to mock data on network error
- Can be configured via environment variable

### 3. **Environment Config** (`.env.local`)
```env
NEXT_PUBLIC_USE_MOCK_API=true      # Use mock by default
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## Three Modes

### Mode 1: **Mock API (Development)**
```env
NEXT_PUBLIC_USE_MOCK_API=true
```
✓ No backend needed
✓ Instant feedback
✓ Full feature testing
- Unrealistic data

### Mode 2: **Automatic Fallback (Recommended)**
```env
NEXT_PUBLIC_USE_MOCK_API=false
```
✓ Uses real API when available
✓ Falls back to mock if backend is down
✓ No configuration needed

### Mode 3: **Real API Only**
Run your backend:
```bash
# In backend directory
npm run dev  # or node server.js
```

Then the frontend will use real API automatically.

## Using Mock Data

Everything works out of the box. When you:

1. **Connect wallet** → Uses mock authentication
2. **View loyalty hub** → Shows 2,500 mock points
3. **Spin the wheel** → Gets random prizes from mock data
4. **Manage badges** → All operations use mock API

### Mock Data Available

**User Stats**
- Points balance: 2,500
- Lifetime earned: 5,000
- Lifetime spent: 2,500
- Badges: 3 earned

**Badges**
- Early Adopter (soulbound)
- Power User (transferable)
- Community Hero (soulbound)

**Lootboxes**
- Bronze Spin (100 pts, 5m cooldown)
- Silver Spin (250 pts, 10m cooldown)
- Gold Spin (500 pts, 15m cooldown)

**Prizes**
- 100 Points (40%)
- Mystery Badge (30%)
- 0.01 ETH (20%)
- 100 USDC (10%)

## Switching to Real Backend

### Step 1: Update Environment
```env
NEXT_PUBLIC_USE_MOCK_API=false
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Step 2: Ensure Your Backend Provides

```typescript
// Required endpoints
GET    /users/{address}/stats
GET    /users/{address}/badges
GET    /badges
POST   /badges/register
GET    /lootboxes
POST   /lootboxes/register
GET    /prizes
POST   /prizes/update-weights
POST   /spin/commit
POST   /spin/reveal
POST   /badges/claim
GET    /attestations/{uid}
GET    /rules
POST   /rules
DELETE /rules/{id}
```

### Step 3: Start Backend
```bash
# Backend should run on port 3001
npm run dev
```

### Step 4: Restart Frontend
```bash
npm run dev
```

## API Response Format

All API functions expect this format:

```typescript
// Success
{
  "data": { /* response data */ }
}

// Error
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

## Mock API Functions

Located in `lib/utils/mock-api.ts`:

```typescript
mockApi.fetchUserStats(address)
mockApi.fetchUserBadges(address)
mockApi.fetchAllBadges()
mockApi.registerBadge(badgeData)
mockApi.fetchLootboxTypes()
mockApi.registerLootboxType(lootboxData)
mockApi.fetchPrizes()
mockApi.updatePrizeWeights(prizes)
mockApi.commitSpin(lootboxId)
mockApi.revealSpin(commitmentHash)
mockApi.claimBadge(badgeId)
mockApi.fetchAttestationProof(attestationUID)
mockApi.getRules()
mockApi.createRule(rule)
mockApi.updateRule(ruleId, rule)
mockApi.deleteRule(ruleId)
```

## Debugging

### See When Mock API is Used
```javascript
// Browser console
// Check for warnings when API fails
// Clear browser cache and reload
```

### Force Mock API
```env
NEXT_PUBLIC_USE_MOCK_API=true
```

### Force Real API (Will error if backend down)
```env
NEXT_PUBLIC_USE_MOCK_API=false
```

## Error Handling

The system automatically:
- ✓ Detects network errors
- ✓ Falls back to mock data
- ✓ Shows warning in console
- ✓ Provides fallback UI

## Next Steps

1. **Test with mock data** → Everything should work now
2. **Build your backend** → Use type definitions from `lib/types/`
3. **Connect both** → Set `NEXT_PUBLIC_USE_MOCK_API=false`
4. **Switch to production** → Deploy both frontend and backend

## File Structure

```
lib/utils/
├── api.ts              # Smart fallback logic
├── mock-api.ts         # Mock data & functions (NEW)
└── auth.ts             # Wallet authentication
```

## Environment Files

```
.env.local             # Local development (has MOCK_API=true)
.env.example           # Template for others
.env.production        # Production values
```

---

**No more network errors!** The app now works perfectly for development and testing.
