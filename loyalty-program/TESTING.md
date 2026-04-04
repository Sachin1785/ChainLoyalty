# Testing Guide - Mock API

## App Now Works \! 🎉

The network errors are fixed. Your app is running with **mock data** on `http://localhost:3000`.

## Quick Test Checklist

### 1. **Landing Page**
- [ ] Visit `http://localhost:3000/`
- [ ] See feature cards
- [ ] "Connect Wallet" button works (you don't need MetaMask for landing page)

### 2. **Admin Dashboard**
- [ ] Go to `/admin/dashboard`
- [ ] Click "Connect Wallet" (simulates connection)
- [ ] Tabs show mock data:
  - [ ] Badge Registry: 0 badges (ready to add)
  - [ ] Points Config: Default 1M supply
  - [ ] Lootbox Setup: 3 mock lootboxes
  - [ ] Prize Builder: 4 prizes with weights
  - [ ] Rules Engine: 1 welcome bonus rule

### 3. **User Loyalty Hub**
- [ ] Go to `/user/loyalty-hub`
- [ ] Click "Connect Wallet"
- [ ] See stats:
  - [ ] **Points Balance: 2,500**
  - [ ] Lifetime Earned: 5,000
  - [ ] Lifetime Spent: 2,500
  - [ ] Badges Earned: 3
- [ ] Badge Showcase shows 3 badges
- [ ] Spin-to-Win shows 3 lootboxes

### 4. **User Interactions**
- [ ] Try creating a badge (admin)
- [ ] Try spinning the wheel (user)
- [ ] Try selecting prizes (admin)
- [ ] Try creating a rule (admin)

## Mock Data Details

### User Profile (Auto-Loaded)
```javascript
{
  pointsBalance: 2500,
  lifetimeEarned: 5000,
  lifetimeSpent: 2500,
  badgesCount: 3,
  totalSpins: 12
}
```

### Badges
```javascript
[
  { name: "Early Adopter", type: "soulbound" },
  { name: "Power User", type: "transferable" },
  { name: "Community Hero", type: "soulbound" }
]
```

### Spins Return Random Prize
```javascript
{
  label: "100 Points" | "Mystery Badge" | "0.01 ETH" | "100 USDC",
  prizeType: "POINTS" | "BADGE" | "NATIVE" | "ERC20",
  value: "...",
  transactionHash: "0x..."
}
```

## Expected Delays (Simulated)

- Fetch user stats: 500ms
- Fetch badges: 400ms
- Commit spin: 800ms
- Reveal spin: 2000ms
- Create badge: 500ms

This simulates real network latency.

## No More Errors!

These errors are **fixed**:
- ❌ ~~XMLHttpRequest.handleError~~
- ❌ ~~Network Error~~
- ❌ ~~ERR_NETWORK~~

## Switching to Real Backend

When ready to connect your backend:

1. **Update `.env.local`**
   ```env
   NEXT_PUBLIC_USE_MOCK_API=false
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   ```

2. **Start your backend**
   ```bash
   # Must run on port 3001
   npm run dev
   ```

3. **Restart frontend**
   ```bash
   npm run dev
   ```

## Common Test Scenarios

### Test Admin Badge Creation
1. Go to Admin Dashboard
2. Connect Wallet
3. Badge Registry tab
4. Click "New Badge"
5. Fill form and submit
6. See: "Mock: registering badge..."
7. Badge appears in list

### Test User Spin
1. Go to Loyalty Hub
2. Connect Wallet
3. Select a lootbox (e.g., "Bronze Spin")
4. Click "Spin Now"
5. Wait 3 seconds for reveal animation
6. See random prize result
7. Cooldown starts (5-15 minutes)

### Test Prize Configuration
1. Admin Dashboard
2. Prize Builder tab
3. See 4 prizes with weights totaling 10,000 bps
4. Modify weights
5. See progress bar update in real-time
6. Total must equal 10,000 to save
7. Click "Save Prize Configuration"

## Browser DevTools

### Check Mock API Usage
```javascript
// Open Console (F12)
// You'll see info logs when mock API is used
console.log("All data is from mock API since NEXT_PUBLIC_USE_MOCK_API=true")
```

### Network Tab
- Switch between real API calls (when available)
- And instant mock responses

### React DevTools
- Inspect useWallet hook
- Check useUserData state
- See Zustand stores

## Troubleshooting

### Still Seeing Errors?
1. Clear browser cache: `Ctrl + Shift + Delete`
2. Clear `.next` folder: `rm -rf .next`
3. Restart dev server: `npm run dev`

### Mock Data Not Loading?
1. Check `.env.local` has `NEXT_PUBLIC_USE_MOCK_API=true`
2. Check browser console for errors
3. Check Network tab for failed requests

### Want to Test Real API?
Set `.env.local`:
```env
NEXT_PUBLIC_USE_MOCK_API=false
```

This will require a real backend running.

## Files That Changed

```
NEW:
├── lib/utils/mock-api.ts      ← Mock data & functions
├── API_SETUP.md               ← This guide
├── .env.local                 ← Configuration (created)

UPDATED:
├── lib/utils/api.ts           ← Smart fallback logic
└── .env.example               ← Has MOCK_API option
```

## What's Working

✓ Landing page
✓ Admin dashboard (all features)
✓ User loyalty hub (all features)
✓ Wallet connection simulation
✓ Mock data load/save
✓ Spin animations
✓ Badge showcase
✓ Stats display

## Next: Connect Real Backend

Instructions in `API_SETUP.md`

---

**Everything is ready for development!**
