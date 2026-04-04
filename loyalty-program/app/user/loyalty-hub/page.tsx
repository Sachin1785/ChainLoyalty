"use client";

import { Navigation } from "@/components/shared/Navigation";
import { IdentityIsland } from "@/components/user/IdentityIsland";
import { BadgeCarousel } from "@/components/user/BadgeCarousel";
import { SpinnableVault } from "@/components/user/SpinnableVault";
import { useWallet } from "@/lib/hooks";
import { Wallet, Sparkles, Trophy, Star, Activity, ArrowRight, LogOut } from "lucide-react";
import { motion } from "framer-motion";

export default function LoyaltyHub() {
  const { isConnected, connect, disconnect, session } = useWallet();

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#FFC801] flex flex-col">
        <Navigation />
        <main className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute top-20 left-10 w-40 h-40 bg-[#6E9CDE] border-[4px] border-black rounded-full shadow-[8px_8px_0px_#000] rotate-12 flex items-center justify-center">
             <Trophy size={64} color="white" />
          </div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-[#7ED348] border-[4px] border-black rounded-[40px] shadow-[8px_8px_0px_#000] -rotate-12 flex items-center justify-center">
             <Star size={64} color="white" />
          </div>

          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="neo-card bg-white p-12 text-center max-w-xl space-y-8 relative z-10"
          >
            <div className="w-24 h-24 bg-[#E84D31] border-[4px] border-black rounded-3xl flex items-center justify-center text-white mx-auto shadow-[8px_8px_0px_#000] rotate-3 transition-transform hover:rotate-0">
              <Wallet size={48} />
            </div>
            <div>
              <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-4 leading-none">
                Access Your <br /> Loyalty Hub
              </h2>
              <p className="text-lg font-bold text-gray-500 uppercase leading-relaxed max-w-sm mx-auto">
                Connect your wallet to reveal your achievements & unlock the vault rewards
              </p>
            </div>
            <button 
              onClick={connect} 
              className="neo-btn bg-[#FFC801] text-black text-2xl px-12 py-6 w-full flex items-center justify-center gap-4 group"
            >
              Connect Wallet <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
            </button>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F1E7] flex flex-col">
      <Navigation />
      
      {/* Page Header */}
      <div className="bg-[#FFC801] border-b-[6px] border-black py-16 px-6 relative overflow-hidden">
         <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
               <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-none mb-4">
                 Your Deck
               </h1>
               <p className="text-xl font-bold uppercase tracking-widest text-black/60">
                 Active_Identity_Protocol_{session?.address?.slice(0, 5)} ... {session?.address?.slice(-4)}
               </p>
            </div>
            <button 
               onClick={() => disconnect()}
               className="neo-btn bg-[#E84D31] text-white px-8 py-4 flex items-center gap-3 text-lg font-black uppercase italic shadow-[6px_6px_0px_#000] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_#000] active:translate-y-[2px] active:shadow-[4px_4px_0px_#000] transition-all"
            >
               Disconnect Link <LogOut size={24} strokeWidth={3} />
            </button>
         </div>
         {/* Decorative Dots */}
         <div className="absolute top-0 right-0 w-64 h-64 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(black 2px, transparent 2px)', backgroundSize: '24px 24px' }} />
      </div>

      <main className="flex-1 p-6 lg:p-12 relative">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Top Row: Identity & Status */}
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <IdentityIsland />
            </div>
            <div className="space-y-8">
               <div className="neo-card bg-white p-8 group overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-2 h-full bg-[#7ED348]" />
                  <div className="flex items-center gap-4 mb-4">
                     <div className="w-12 h-12 bg-[#7ED348] border-[3px] border-black rounded-xl flex items-center justify-center shadow-[4px_4px_0px_#000]">
                        <Activity size={24} color="white" />
                     </div>
                     <h3 className="text-2xl font-black uppercase italic tracking-tighter">Live Status</h3>
                  </div>
                  <div className="space-y-4">
                     <div className="flex justify-between items-center border-b-[2px] border-black/5 pb-2">
                        <span className="text-[10px] font-black uppercase text-gray-400">Validator</span>
                        <span className="text-xs font-black uppercase">ETH-SYNC-01</span>
                     </div>
                     <div className="flex justify-between items-center border-b-[2px] border-black/5 pb-2">
                        <span className="text-[10px] font-black uppercase text-gray-400">Latency</span>
                        <span className="text-xs font-black uppercase text-[#7ED348]">12ms (FAST)</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase text-gray-400">Block Height</span>
                        <span className="text-xs font-black uppercase">#19,234,812</span>
                     </div>
                  </div>
               </div>

               <div className="neo-card bg-[#E84D31] p-8 text-white">
                  <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-4">Daily Quest</h3>
                  <p className="text-sm font-bold uppercase leading-relaxed mb-6 italic">Deploy a Logic Nebula rule to earn +500 XP immediately!</p>
                  <button className="neo-btn bg-white text-black w-full !text-xs !py-3">
                     Explore Forge 
                  </button>
               </div>
            </div>
          </div>

          {/* Middle Row: Vault & Badges */}
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-4">
               <div className="flex items-center gap-3 px-4">
                  <div className="w-8 h-8 bg-[#6E9CDE] border-[2px] border-black rounded-lg flex items-center justify-center">
                     <Star size={16} fill="white" color="white" />
                  </div>
                  <h2 className="text-3xl font-black uppercase italic tracking-tighter">Reward Vault</h2>
               </div>
               <SpinnableVault />
            </div>
            <div className="space-y-4">
                <div className="flex items-center gap-3 px-4">
                  <div className="w-8 h-8 bg-[#FFC801] border-[2px] border-black rounded-lg flex items-center justify-center">
                     <Trophy size={16} />
                  </div>
                  <h2 className="text-3xl font-black uppercase italic tracking-tighter">Achievement Deck</h2>
               </div>
               <BadgeCarousel />
            </div>
          </div>
        </div>

        {/* Floating Decorative Notes */}
        <div className="neo-note bottom-10 left-10 rotate-3 hidden xl:block">
           <div className="flex items-center gap-2 mb-1">
              <Sparkles size={14} className="text-[#FFC801]" />
              <span className="text-[10px] font-black uppercase">Tips_Log</span>
           </div>
           <p className="text-[10px] font-black leading-tight uppercase text-left">PRO_TIP: MULTIPLIER_STACKS_WITH_MINT_BADGES!</p>
        </div>
      </main>
    </div>
  );
}
