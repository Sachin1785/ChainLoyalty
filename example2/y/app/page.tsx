"use client";
import React, { useState, useMemo } from "react";
import {
  ChainLoyaltyClient,
  SpinWidget,
  Leaderboard,
  ReferralWidget,
  RewardsDashboard,
  ConnectWalletButton,
} from "loyaltychain-sdk";

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
            <ReferralWidget 
              client={client} 
              walletAddress={walletAddress} 
              theme={{ background: "#ffffff" }}
              onConnect={setWalletAddress}
            />
            <div className="bg-white border-4 border-black p-6 rounded-2xl shadow-[8px_8px_0_0_black] flex flex-col justify-center items-center text-center">
              <h3 className="font-black text-xl uppercase mb-2">More coming soon</h3>
              <p className="font-bold text-gray-500 text-sm">We are porting more components daily!</p>
            </div>
          </div>

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
