"use client";

import { useMemo, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  ChainLoyaltyClient,
  RewardsDashboard,
  Leaderboard,
  SpinWidget,
  ReferralWidget,
  QuestBoardWidget,
  TierProgressWidget,
  AchievementShowcaseWidget,
  RewardStoreWidget
} from "loyaltychain-sdk";

const queryClient = new QueryClient();

export default function Home() {
  const [walletAddress, setWalletAddress] = useState("");

  const client = useMemo(
    () =>
      new ChainLoyaltyClient({
        baseUrl: "http://localhost:8000",
      }),
    []
  );

  const quests = [
    { id: "signup", title: "Sign Up", description: "Create your account.", rewardPoints: 100, icon: "👋" },
    { id: "purchase", title: "Make a Purchase", description: "Buy something.", rewardPoints: 500, icon: "🛍️", actionUrl: "/shop" },
  ];

  const tiers = [
    { name: "Bronze", minPoints: 0, color: "#cd7f32" },
    { name: "Silver", minPoints: 1000, color: "#c0c0c0" },
    { name: "Gold", minPoints: 5000, color: "#FFD703" },
  ];

  const badges = [
    { id: "badge", name: "First Spin", description: "Spun the wheel.", imageUrl: "https://via.placeholder.com/150" },
  ];

  const items = [
    { id: "coupon_10", name: "10% Off", description: "One-time discount.", cost: 500 },
  ];

  const theme = {
    accent: "#ff6b6b",
    border: "#000000",
    shadow: "4px 4px 0 0 black",
    cardBase: "#ffffff",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col flex-1 items-center bg-zinc-50 font-sans dark:bg-black min-h-screen">
        <main className="flex flex-1 w-full max-w-5xl flex-col gap-6 py-16 px-6 bg-white dark:bg-black sm:px-10">
          <h1 className="text-3xl font-bold text-black dark:text-zinc-50 mb-8 border-b-4 border-black pb-4">
            LoyaltyChain SDK Example
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section className="col-span-1 md:col-span-2">
              <h2 className="text-xl font-bold mb-4">Dashboard & Connection</h2>
              <RewardsDashboard 
                client={client} 
                walletAddress={walletAddress} 
                onConnect={setWalletAddress} 
                theme={theme}
              />
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4">Tier Progress</h2>
              <TierProgressWidget 
                client={client} 
                walletAddress={walletAddress} 
                tiers={tiers} 
                theme={theme}
              />
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4">Referrals</h2>
              <ReferralWidget 
                client={client} 
                walletAddress={walletAddress} 
                theme={theme}
              />
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4">Achievements</h2>
              <AchievementShowcaseWidget 
                client={client} 
                walletAddress={walletAddress} 
                availableBadges={badges} 
                theme={theme}
              />
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4">Spin the Wheel</h2>
              <SpinWidget 
                client={client} 
                walletAddress={walletAddress} 
                theme={theme}
              />
            </section>

            <section className="col-span-1 md:col-span-2">
              <h2 className="text-xl font-bold mb-4">Quest Board</h2>
              <QuestBoardWidget 
                client={client} 
                walletAddress={walletAddress} 
                quests={quests} 
                theme={theme}
              />
            </section>

            <section className="col-span-1 md:col-span-2">
              <h2 className="text-xl font-bold mb-4">Reward Store</h2>
              <RewardStoreWidget
                client={client}
                walletAddress={walletAddress}
                items={items}
                onPurchaseSuccess={(item) => alert(`Claimed ${item.name}!`)}
                theme={theme}
              />
            </section>

            <section className="col-span-1 md:col-span-2">
              <h2 className="text-xl font-bold mb-4">Leaderboard</h2>
              <Leaderboard 
                client={client} 
                theme={theme}
              />
            </section>
          </div>
        </main>
      </div>
    </QueryClientProvider>
  );
}
