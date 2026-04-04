# LoyaltyBadge - Loyalty Program Management Platform

A comprehensive Next.js application for managing Web3-powered loyalty programs with NFT badges, points systems, and gamified rewards.

## Features

### Admin Dashboard
- **Badge Registry**: Create and manage NFT badges (soulbound or transferable)
- **Points Configuration**: Configure token supply, name, and transfer settings
- **Lootbox Setup**: Create spinning lootboxes with customizable costs and cooldowns
- **Prize Table Builder**: Manage weighted probability distributions for rewards
- **Business Rules Engine**: Visual workflow builder for automated reward triggers

### User Loyalty Hub
- **Stats Overview**: Display points balance, lifetime earnings, and badge count
- **Badge Showcase**: Grid layout of earned achievements
- **Spin-to-Win**: Gamified reward mechanism with commit-reveal pattern
- **Gasless Claiming**: EIP-712 signature-based badge claims
- **Audit Trail**: Integration with EAS attestations

## Project Structure

```
├── app/
│   ├── page.tsx                 # Landing page
│   ├── admin/
│   │   └── dashboard/page.tsx   # Admin control center
│   ├── user/
│   │   └── loyalty-hub/page.tsx # User rewards interface
│   └── layout.tsx               # Root layout
├── components/
│   ├── admin/                   # Admin-specific components
│   │   ├── BadgeRegistry.tsx
│   │   ├── PointsConfiguration.tsx
│   │   ├── LootboxSetup.tsx
│   │   ├── PrizeTableBuilder.tsx
│   │   └── RulesEngine.tsx
│   ├── user/                    # User-facing components
│   │   ├── UserStatsOverview.tsx
│   │   ├── BadgeShowcase.tsx
│   │   └── SpinToWin.tsx
│   └── shared/                  # Reusable UI components
│       ├── ui.tsx               # Button, Card, Input, Modal, etc.
│       ├── Navigation.tsx       # Navigation bar
│       └── WalletConnect.tsx    # Wallet connection
├── lib/
│   ├── hooks/                   # Custom React hooks
│   │   └── index.ts             # useWallet, useUserData, useAdmin
│   ├── store/                   # Zustand state management
│   │   └── index.ts
│   ├── types/                   # TypeScript definitions
│   │   └── index.ts
│   └── utils/
│       ├── auth.ts              # EIP-712 authentication
│       └── api.ts               # API client with interceptors
```

## Getting Started

### Installation

```bash
# Navigate to project directory
cd loyalty-program

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

### Configuration

Create `.env.local` with:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_ADMIN_ADDRESSES=0x1234...,0x5678...
```

### Running the Application

```bash
# Development
npm run dev

# Production build
npm run build
npm start
```

Visit `http://localhost:3000`

## Technology Stack

- **Framework**: Next.js 16 with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Web3**: ethers.js v6
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Authentication**: EIP-712 (personal_sign)

## Key Components

### Admin Dashboard
- Create and manage NFT badges
- Configure token parameters
- Design lootbox mechanics
- Set weighted prize distributions
- Build automation rules

### User Widget
- View loyalty stats
- Browse earned badges
- Participate in spins
- Claim rewards gaslessly

## Authentication Flow

1. User clicks "Connect Wallet"
2. User signs EIP-712 message
3. Signature stored securely
4. Signature sent with all API requests

## API Integration

The application expects a backend with these endpoints:

- `GET /api/users/{address}/stats` - User statistics
- `GET /api/badges` - All available badges
- `POST /api/badges/register` - Register new badge
- `GET /api/prizes` - Get prize configuration
- `POST /api/spin/commit` - Start spin
- `POST /api/spin/reveal` - Reveal spin result
- `POST /api/rules` - Create business rules

## Styling

Professional gradient-based design with:
- Blue gradients for primary UI
- Purple accents
- Dark mode support
- Responsive mobile-first layout

## Development

```bash
# Type checking
npm run build

# Development with hot reload
npm run dev
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API endpoint |
| `NEXT_PUBLIC_ADMIN_ADDRESSES` | Admin wallet addresses |

## Browser Support

- Modern browsers with MetaMask support
- Chrome, Firefox, Safari, Edge (latest versions)

## Security

- EIP-712 signed authentication
- Input validation on all forms
- No hardcoded secrets
- Environment-based configuration

---

**Built with modern Web3 UX best practices**
