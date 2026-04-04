"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Zap, 
  Sparkles, 
  Trophy, 
  Clock, 
  Lock, 
  ArrowRight,
  Database,
  ShieldCheck,
  RotateCw,
  Gift,
  Star,
  Activity
} from "lucide-react";

type SpinPhase = 'idle' | 'committing' | 'waiting' | 'revealing' | 'result' | 'cooldown';

export function SpinnableVault() {
  const [phase, setPhase] = useState<SpinPhase>('idle');
  const [cooldown, setCooldown] = useState(0);
  const [result, setResult] = useState<string | null>(null);

  const startSpin = () => {
    if (phase !== 'idle') return;
    setPhase('committing');
    
    setTimeout(() => {
      setPhase('waiting');
      setTimeout(() => {
        setPhase('revealing');
        setTimeout(() => {
          setPhase('result');
          setResult('RARE GENESIS NFT');
        }, 2500);
      }, 3000);
    }, 1200);
  };

  const reset = () => {
    setPhase('cooldown');
    setCooldown(60); 
    setResult(null);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown(c => c - 1), 1000);
    } else if (cooldown === 0 && phase === 'cooldown') {
      setPhase('idle');
    }
    return () => clearInterval(timer);
  }, [cooldown, phase]);

  return (
    <div className="neo-card bg-white p-10 min-h-[420px] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Decorative Machine Elements */}
      <div className="absolute top-0 left-0 w-full h-4 bg-[#FFC801] border-b-[3px] border-black grid grid-cols-12 gap-0">
         {[...Array(12)].map((_, i) => <div key={i} className="border-r-[2px] border-black" />)}
      </div>

      <div className="relative z-10 text-center w-full flex flex-col items-center">
        {phase === 'idle' && (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-8">
            <div className="relative flex items-center justify-center">
              <div className="w-32 h-32 bg-[#FFC801] border-[4px] border-black rounded-[30px] flex items-center justify-center shadow-[8px_8px_0px_#000] rotate-3">
                 <Gift size={64} className="-rotate-12" />
              </div>
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-[#7ED348] border-[3px] border-black rounded-full flex items-center justify-center shadow-[4px_4px_0px_#000]">
                 <Star size={24} fill="white" color="white" />
              </div>
            </div>
            
            <div>
               <h3 className="text-4xl font-black italic uppercase tracking-tighter mb-2">The Vault</h3>
               <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Connect_Commit_Reveal</p>
            </div>
            
            <button 
              onClick={startSpin}
              className="neo-btn bg-[#FFC801] text-black text-xl px-12 py-5"
            >
              Spin Machine
            </button>
            <p className="text-[10px] font-black text-gray-500">Requires 500 Legacy Points</p>
          </motion.div>
        )}

        {(phase === 'committing' || phase === 'waiting') && (
          <div className="space-y-8 flex flex-col items-center">
            <div className="relative">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="w-48 h-48 border-[6px] border-black rounded-full border-t-[#6E9CDE] border-r-[#7ED348] border-b-[#E84D31] border-l-[#FFC801] shadow-[8px_8px_0px_#000]"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-16 h-16 bg-white border-[3px] border-black rounded-full flex items-center justify-center">
                    <Database size={24} className="animate-bounce" />
                 </div>
              </div>
            </div>
            <div className="space-y-2">
               <div className="text-xl font-black italic uppercase italic tracking-tighter">
                  {phase === 'committing' ? "Encrypting_Phase" : "Random_Seeding"}
               </div>
               <p className="text-[10px] font-bold text-gray-400 max-w-[240px] leading-tight">Waiting for block confirmation from the Ethereum Attestation Service...</p>
            </div>
          </div>
        )}

        {phase === 'revealing' && (
          <div className="relative h-64 w-full flex items-center justify-center">
            <motion.div 
              animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 0.5 }}
              className="text-6xl font-black italic uppercase tracking-tighter drop-shadow-[4px_4px_0px_#000]"
            >
              CRYSTALLIZING
            </motion.div>
          </div>
        )}

        {phase === 'result' && (
          <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-10">
            <div className="relative">
              <div className="w-48 h-48 bg-[#7ED348] border-[4px] border-black rounded-[40px] shadow-[12px_12px_0px_#000] flex items-center justify-center relative z-10">
                <Sparkles size={80} color="white" />
              </div>
              <div className="absolute -top-6 -left-6 w-16 h-16 bg-white border-[3px] border-black rounded-full flex items-center justify-center shadow-[4px_4px_0px_#000] z-20">
                 <Trophy size={32} />
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                 <div className="text-sm font-black uppercase italic tracking-widest text-[#7ED348] mb-1 underline">Vault_Unlocked</div>
                 <h4 className="text-4xl font-black italic uppercase tracking-tighter">{result}</h4>
              </div>
              
              <div className="flex gap-4">
                <button className="neo-btn flex-1 bg-[#7ED348] text-white" onClick={reset}>
                  Claim Reward
                </button>
                <div className="neo-card bg-white !p-4 flex items-center justify-center !rounded-xl">
                  <ShieldCheck size={28} />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {phase === 'cooldown' && (
          <div className="space-y-8 flex flex-col items-center">
            <div className="w-24 h-24 bg-gray-100 border-[3px] border-black rounded-full flex items-center justify-center shadow-[4px_4px_0px_#000]">
               <Clock size={48} className="text-gray-400" />
            </div>
            <div className="space-y-4 max-w-sm">
               <h3 className="text-2xl font-black uppercase italic tracking-tighter">Regenerating_Vault</h3>
               <p className="text-xs font-bold text-gray-500 leading-relaxed uppercase">The machine needs time to recalibrate its resonance for the next attendee.</p>
               
               <div className="h-12 w-full bg-white border-[3px] border-black rounded-2xl shadow-[4px_4px_0px_#000] overflow-hidden flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-[#FFC801] origin-left border-r-[3px] border-black" style={{ transform: `scaleX(${cooldown / 60})` }} />
                  <span className="relative font-black text-sm uppercase italic tracking-widest">{cooldown}s Remaining</span>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
