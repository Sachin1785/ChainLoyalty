"use client";
import React, { useState, useMemo } from "react";
import {
  ChainLoyaltyClient,
  SpinWidget,
  Leaderboard,
  ReferralWidget,
  RewardsDashboard,
  ConnectWalletButton,
  QuestBoardWidget,
  TierProgressWidget,
  AchievementShowcaseWidget,
  RewardStoreWidget,
} from "loyaltychain-sdk";

const DEMO_QUESTS = [
  { id: "sign-up", title: "Welcome to ChainLoyalty", description: "Sign up and create your account.", rewardPoints: 100, icon: "👋" },
  { id: "purchase", title: "Make a Purchase", description: "Buy any item from our store.", rewardPoints: 500, icon: "🛍️", actionUrl: "#" },
  { id: "referral", title: "Refer a Friend", description: "Get a friend to sign up using your code.", rewardPoints: 1000, icon: "🤝" }
];

const DEMO_TIERS = [
  { name: "Bronze", minPoints: 0, color: "#cd7f32" },
  { name: "Silver", minPoints: 1000, color: "#c0c0c0" },
  { name: "Gold", minPoints: 5000, color: "#FFD703" },
  { name: "Platinum", minPoints: 10000, color: "#a0b2c6" }
];

const DEMO_BADGES = [
  { id: "badge", name: "First Spin", description: "Spun the wheel for the first time", imageUrl: "https://api.dicebear.com/9.x/shapes/svg?seed=spin" },
  { id: "early_adopter", name: "Early Adopter", description: "Joined during the beta phase", imageUrl: "https://api.dicebear.com/9.x/shapes/svg?seed=early" },
  { id: "whale", name: "Points Whale", description: "Accumulated over 10,000 pts", imageUrl: "https://api.dicebear.com/9.x/shapes/svg?seed=whale" },
];

const DEMO_STORE_ITEMS = [
  { id: "discount_10", name: "10% Off Coupon", description: "Get 10% off your next purchase.", cost: 500, imageUrl: "https://api.dicebear.com/9.x/icons/svg?seed=discount&icon=tag" },
  { id: "free_shipping", name: "Free Shipping", description: "Free shipping on orders over $50.", cost: 1000, imageUrl: "https://api.dicebear.com/9.x/icons/svg?seed=shipping&icon=truck" },
];

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string>("");

  const client = useMemo(() => new ChainLoyaltyClient({
    baseUrl: "http://localhost:8000",
    apiKey: "test-api-key",
  }), []);

  return (
    <div className="min-h-screen bg-[#f1f5f9] p-8 font-sans">
      <header className="max-w-6xl mx-auto mb-12 flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-black uppercase tracking-tighter text-black">Loyalty SDK <span className="text-[#FFD703]">DEMO</span></h1>
          <p className="font-bold text-gray-500">Testing our Neo-Brutalism SDK components</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <ConnectWalletButton 
            onConnect={(addr) => setWalletAddress(addr)}
            label={walletAddress ? `Connected: ${walletAddress.slice(0, 6)}...` : "Connect to Demo"}
          />
          {walletAddress && (
            <button 
              onClick={() => setWalletAddress("")}
              className="text-xs font-black underline uppercase hover:text-red-500"
            >
              Sign out
            </button>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Dashboard & Referral */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          <RewardsDashboard 
            client={client} 
            walletAddress={walletAddress} 
            title="Account Snapshot" 
            onConnect={setWalletAddress}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <TierProgressWidget 
              client={client}
              walletAddress={walletAddress}
              tiers={DEMO_TIERS}
              onConnect={setWalletAddress}
            />
            <ReferralWidget 
              client={client} 
              walletAddress={walletAddress} 
              theme={{ background: "#ffffff" }}
              onConnect={setWalletAddress}
            />
          </div>

          <QuestBoardWidget 
            client={client}
            walletAddress={walletAddress}
            quests={DEMO_QUESTS}
            onConnect={setWalletAddress}
          />

          <RewardStoreWidget 
            client={client}
            walletAddress={walletAddress}
            items={DEMO_STORE_ITEMS}
            onConnect={setWalletAddress}
            onPurchaseSuccess={(item) => alert(`Purchased ${item.name} successfully!`)}
          />

          <AchievementShowcaseWidget 
            client={client}
            walletAddress={walletAddress}
            availableBadges={DEMO_BADGES}
            onConnect={setWalletAddress}
          />

          <SpinWidget 
            client={client} 
            walletAddress={walletAddress} 
            title="The Grand Prize Wheel"
            theme={{ 
              cardBase: "#ffffff",
              wheelColors: ["#FFD703", "#FEBDD2", "#A7F3D0", "#FFEDD5"] 
            }}
            onConnect={setWalletAddress}
          />
        </div>

        {/* Right Column - Leaderboard */}
        <div className="lg:col-span-4">
          <Leaderboard 
            client={client} 
            title="Top Rankers"
            showPodium={true} 
            theme={{ 
              accent: "#FFD703",
              border: "#000000",
              shadow: "4px 4px 0 0 black"
            }}
          />
        </div>
      </main>
      
      <footer className="max-w-6xl mx-auto mt-20 border-t-4 border-black pt-8 pb-16 opacity-50">
        <p className="font-black uppercase tracking-widest text-sm">© 2026 ChainLoyalty - Built with Antigravity Agentic SDK</p>
      </footer>
    </div>
  );
}
