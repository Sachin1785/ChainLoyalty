"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Shield, 
  ChevronRight, 
  Zap, 
  Crown,
  Share2,
  Copy,
  Star,
  Activity,
  Heart
} from "lucide-react";

interface IdentityIslandProps {
  walletAddress: string;
  level: number;
  progress: number; // 0 to 100
  points: number;
  isPremium?: boolean;
}

export function IdentityIsland({ 
  walletAddress = "0x71C...3a42", 
  level = 14, 
  progress = 68, 
  points = 12450,
  isPremium = true
}: Partial<IdentityIslandProps>) {
  const shortAddress = walletAddress.slice(0, 6) + "..." + walletAddress.slice(-4);

  return (
    <div className="neo-card bg-white p-8 space-y-8 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-[#FFC801] border-b-[3px] border-l-[3px] border-black rounded-bl-full flex items-center justify-center -mr-4 -mt-4 shadow-[-4px_4px_0px_#000]">
         <Crown size={32} className="rotate-12 translate-x-1 -translate-y-1" />
      </div>

      <div className="flex items-center gap-6 relative">
        {/* Avatar / Level Indicator */}
        <div className="relative group">
           <div className="w-24 h-24 bg-[#6E9CDE] border-[4px] border-black rounded-full flex items-center justify-center shadow-[6px_6px_0px_#000] transition-transform group-hover:scale-105 group-hover:rotate-3">
              <span className="text-4xl font-black text-white italic drop-shadow-[2px_2px_0px_#000]">{level}</span>
           </div>
           <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-[#FFC801] border-[3px] border-black rounded-xl flex items-center justify-center shadow-[3px_3px_0px_#000]">
              <Star size={20} fill="black" />
           </div>
        </div>

        <div className="flex flex-col gap-2">
           <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black uppercase italic tracking-tighter">Sepideh Yazdi</h2>
              <div className="px-3 py-1 bg-[#7ED348] border-[2px] border-black rounded-full text-[10px] font-black uppercase shadow-[2px_2px_0px_#000]">
                 Legend
              </div>
           </div>
           <p className="text-xs font-bold text-gray-500 max-w-[200px]">Always pushing the boundaries of the protocol!</p>
           
           <button className="flex items-center gap-2 group">
              <code className="text-[10px] font-black bg-gray-100 border-[2px] border-black px-2 py-1 rounded shadow-[2px_2px_0px_#000] group-hover:bg-[#FFC801] transition-all">
                {shortAddress}
              </code>
              <Copy size={12} className="group-hover:scale-125 transition-transform" />
           </button>
        </div>
      </div>

      {/* Progress Section */}
      <div className="space-y-4">
         <div className="flex justify-between items-end mb-2">
            <div>
               <span className="text-[10px] font-black uppercase tracking-widest text-[#E84D31]">Exp Status</span>
               <div className="text-2xl font-bold flex items-baseline gap-1">
                  <span>{points.toLocaleString()}</span>
                  <span className="text-[10px] font-black text-gray-400">Total Points</span>
               </div>
            </div>
            <div className="text-right">
               <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Level {level}</span>
               <div className="text-xs font-bold text-[#6E9CDE]">Next at 15,000</div>
            </div>
         </div>
         
         <div className="h-6 w-full bg-white border-[3px] border-black rounded-full shadow-[4px_4px_0px_#000] overflow-hidden p-1 relative">
            <motion.div 
               initial={{ width: 0 }}
               animate={{ width: `${progress}%` }}
               transition={{ duration: 1, type: "spring" }}
               className="h-full bg-[#7ED348] border-r-[3px] border-black rounded-full"
            />
            <div className="absolute inset-0 flex items-center justify-center text-[8px] font-black uppercase tracking-tighter mix-blend-difference text-white">
               Current Progress {progress}%
            </div>
         </div>
      </div>

      {/* Action Row */}
      <div className="grid grid-cols-2 gap-4">
         <button className="neo-btn bg-[#FFC801] text-black !p-3 flex items-center justify-center gap-2 text-xs">
            <Share2 size={16} /> Share Deck
         </button>
         <button className="neo-btn bg-white text-black !p-3 flex items-center justify-center gap-2 text-xs">
            <Activity size={16} /> Activity
         </button>
      </div>

      {/* Fun Decoration Sticky Note */}
      <div className="neo-note rotate-6 -right-2 -bottom-2 w-32 hidden lg:block">
         <div className="flex items-center gap-2 mb-1">
            <Heart size={12} fill="#E84D31" color="#E84D31" />
            <span className="text-[9px] font-black uppercase">Note_42</span>
         </div>
         <p className="text-[9px] font-black leading-tight">MINTED_3_BADGES_THIS_WEEK!</p>
      </div>
    </div>
  );
}
