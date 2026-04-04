'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { NeoCard } from "@/components/ui/NeoCard";
import { NeoBadge } from "@/components/ui/NeoBadge";
import { ConnectWallet } from "@/components/ConnectWallet";
import { useAuth } from "@/lib/auth-context";
import { Zap, Target, Users } from "lucide-react";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-12 lg:p-24 relative overflow-hidden">
      {/* Decorative shapes */}
      <div className="absolute top-10 right-10 w-32 h-32 border-4 border-black bg-neo-pink rotate-12 hidden md:block" />
      <div className="absolute bottom-20 left-10 w-0 h-0 border-l-[60px] border-l-transparent border-b-[100px] border-b-neo-blue border-r-[60px] border-r-transparent -rotate-12 hidden md:block" />

      {/* Navbar */}
      <nav className="w-full max-w-6xl mb-16 flex justify-between items-center z-10">
        <div className="text-2xl font-black italic tracking-tighter">
          CHAIN<span style={{ WebkitTextStroke: '2px black', color: 'transparent' }}>LOYALTY</span>
        </div>
        <ConnectWallet />
      </nav>

      {/* Hero */}
      <div className="max-w-4xl text-center z-10">
        <NeoBadge variant="black" className="mb-6 rotate-[-2deg] inline-block">⚡ Built on Monad Testnet</NeoBadge>
        <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-none mb-8">
          Turn Product <span className="bg-neo-red text-white px-2">Events</span><br />
          Into On-Chain <span className="bg-neo-green px-2">Value</span>
        </h1>
        <p className="text-xl md:text-2xl font-bold max-w-2xl mx-auto mb-12">
          Plug-and-play loyalty infrastructure for Web3 apps.
          Build powerful referral engines and gamified rewards in minutes.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <ConnectWallet />
          <p className="font-bold text-sm opacity-60">or connect your wallet to get started →</p>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 max-w-6xl w-full z-10">
        <NeoCard className="p-8 flex flex-col gap-4 bg-neo-blue">
          <div className="w-12 h-12 bg-white border-2 border-black flex items-center justify-center rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <Zap className="text-black" />
          </div>
          <h3 className="text-2xl font-black">Instant Rules</h3>
          <p className="font-bold">Set up reward triggers for any application event using our no-code builder.</p>
        </NeoCard>
        <NeoCard className="p-8 flex flex-col gap-4 bg-neo-pink">
          <div className="w-12 h-12 bg-white border-2 border-black flex items-center justify-center rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <Target className="text-black" />
          </div>
          <h3 className="text-2xl font-black">Loyalty NFTs</h3>
          <p className="font-bold">Mint ERC-1155 badges on Monad. Tradeable, soulbound, or redeemable.</p>
        </NeoCard>
        <NeoCard className="p-8 flex flex-col gap-4 bg-neo-green">
          <div className="w-12 h-12 bg-white border-2 border-black flex items-center justify-center rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <Users className="text-black" />
          </div>
          <h3 className="text-2xl font-black">Viral Referrals</h3>
          <p className="font-bold">Web3-native referral tracking with on-chain attribution and automated payouts.</p>
        </NeoCard>
      </div>

      <footer className="mt-32 pb-12 text-center font-black uppercase tracking-widest text-sm z-10">
        Built on Monad Testnet · ChainLoyalty 2026
      </footer>
    </main>
  );
}
