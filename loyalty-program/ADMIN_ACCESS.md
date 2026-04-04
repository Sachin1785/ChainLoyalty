# Admin Dashboard Access - Fixed!

## What Was Wrong

The admin dashboard required:
1. Real MetaMask wallet (didn't work without it)
2. Your wallet address in `NEXT_PUBLIC_ADMIN_ADDRESSES` (too restrictive)

## Fixed!

Now it works with:
1. **Development Mode Detected** - Uses mock wallet automatically
2. **Developer Friendly** - Grants admin access to same mock wallet
3. **No Configuration Needed** - Just click "Connect (Dev)"

## How to Access Admin Dashboard Now

### Quick Start (2 steps)

1. **Visit the app**
   ```
   http://localhost:3000/admin/dashboard
   ```

2. **Click "Connect (Dev)" button**
   - ✓ Mock wallet connects automatically
   - ✓ Admin permissions granted
   - ✓ Full dashboard access

### What You'll See

When connected as admin:
- **Badge Registry Tab** - Create/manage badges
- **Points Configuration Tab** - Configure tokens
- **Lootbox Setup Tab** - Create spinning boxes
- **Prize Builder Tab** - Set weighted rewards
- **Rules Engine Tab** - Build automation rules

## Technical Details

### How Mock Wallet Works

```typescript
// When you click "Connect"
if (!MetaMask && isDevelopment) {
  // Automatically create mock session with:
  address: "0x742d35Cc6634C0532925a3b844Bc390e5dAC34dC"
  signature: "0xmock-signature-123456"
  // Admin access granted automatically
}
```

### What Changed

**File: `lib/hooks/index.ts`**
- Added mock wallet creation for development
- Improved admin check to recognize mock wallets
- Fixed address comparison (case-insensitive)

**File: `components/shared/WalletConnect.tsx`**
- Shows "Connect (Dev)" in development
- Displays "MOCK" badge when using mock wallet
- Shows helper text about mock mode

**File: `app/admin/dashboard/page.tsx`**
- Better error messages
- Dev-friendly instructions
- Clear feedback on permission issues

## Three Ways to Access Admin

### Option 1: Development Mode (Recommended)
```env
# .env.local
NEXT_PUBLIC_USE_MOCK_API=true
NODE_ENV=development
```
✓ Click "Connect (Dev)" → Instant admin access
✓ No configuration needed
✓ Perfect for testing

### Option 2: Add Your Wallet as Admin
```env
# .env.local
NEXT_PUBLIC_ADMIN_ADDRESSES=0xYourWalletAddress
```
✓ Use real MetaMask
✓ Your wallet gets admin access
✓ For production setup

### Option 3: Real Backend Auth
Deploy backend that manages admin roles
✓ Server-side permission checks
✓ Multiple admin users
✓ For production

## Status Indicators

When you connect wallet, you'll see:

**MOCK Badge** = Using development mock wallet
- Read mock data
- Test admin features
- Can't actually submit to blockchain

**No Badge** = Using real wallet
- Need to be in admin address list
- Can submit to real backend
- Production ready

## Admin Features Now Available

Click through these tabs:

### Badge Registry
- ✓ View all badges
- ✓ Create new badge (fill form + submit)
- ✓ Edit/delete badges

### Points Configuration
- ✓ Set token name (default: "Loyalty Points")
- ✓ Configure supply cap
- ✓ Enable/disable transfers

### Lootbox Setup
- ✓ View 3 sample boxes
- ✓ Create new box
- ✓ Set points cost + native cost
- ✓ Configure cooldowns

### Prize Builder
- ✓ View 4 prizes
- ✓ Edit weight percentages
- ✓ Real-time validation (max 10,000 bps)
- ✓ Save configuration

### Rules Engine
- ✓ View automation rules
- ✓ Expand rule details
- ✓ See triggers, conditions, actions
- ✓ Create/delete rules

## Video Walkthrough

### Step 1: Connect
1. Go to `/admin/dashboard`
2. Click "Connect (Dev)" button
3. Watch "MOCK" badge appear

### Step 2: Create Badge
1. Go to "Badge Registry" tab
2. Click "New Badge"
3. Fill form:
   - Name: "My Badge"
   - Description: "Test badge"
   - Max Supply: 100
   - Metadata URI: "https://example.com/badge.json"
4. Click "Register Badge"

### Step 3: Configure Prizes
1. Go to "Prize Builder" tab
2. See 4 prizes with weights
3. Adjust percentages
4. Total must equal 10,000
5. Click "Save Prize Configuration"

### Step 4: Create Rule
1. Go to "Rules Engine" tab
2. Click "Create Rule"
3. Set trigger, conditions, actions
4. Click expand to see details

## Troubleshooting

### "Admin Access Required" Message

**Problem**: You see this error after clicking "Connect"

**Solution**:
1. Make sure you're in development mode
2. Check `.env.local` has `NODE_ENV=development`
3. Clear browser cache: `Ctrl + Shift + Delete`
4. Restart dev server: `npm run dev`

### Mock Wallet Not Connecting

**Problem**: Button doesn't seem to work

**Solution**:
1. Check browser console for errors
2. Make sure `.env.local` exists
3. Try hard refresh: `Ctrl + F5`
4. Check `.env.local` is in project root

### Still Seeing "Connect Wallet" Button

**Problem**: Button is still enabled after clicking

**Solution**:
1. Check if JavaScript is enabled
2. Check browser console for errors
3. Verify `.env.local` is readable
4. Clear `.next` folder: `rm -rf .next`
5. Restart: `npm run dev`

## Production Notes

When deploying to production:

1. Remove mock wallet code (optional)
2. Set `NODE_ENV=production`
3. Use real wallet authentication
4. Backend must verify admin roles
5. Don't expose admin addresses in env

---

**Admin Dashboard Now Works!**

Click "Connect (Dev)" to get started.
