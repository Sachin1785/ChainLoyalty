'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Zap, Trophy, X, ChevronRight, Loader2, Sparkles, Wallet, Coffee, Cookie, Ticket } from 'lucide-react';
import { useAccount } from 'wagmi';

const COLORS = ["#3E2723", "#5D4037", "#795548", "#8D6E63", "#A1887F", "#BCAAA4"];

export function LoyaltyWidget() {
  const { address, isConnected } = useAccount();
  const [isOpen, setIsOpen] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [lootbox, setLootbox] = useState<any>(null);
  
  const [isSpinning, setIsSpinning] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'spinning' | 'revealed'>('idle');
  const [rotation, setRotation] = useState(0);
  const [spinResult, setSpinResult] = useState<any>(null);

  // Fetch stats and vouchers
  const fetchData = async () => {
    if (!address) return;
    try {
      const [statsRes, lbRes] = await Promise.all([
        fetch(`http://127.0.0.1:8000/api/v1/rewards/${address}/stats?program_id=default`),
        fetch(`http://127.0.0.1:8000/api/v1/gamification/lootboxes?program_id=brewbound`)
      ]);
      
      const statsData = await statsRes.json();
      const lbData = await lbRes.json();
      
      setStats(statsData);
      setLootbox(lbData[0]); // Using the Barista's Choice Spin
      
      // Filter for brewbound vouchers (now stored as 'badge' NFTs but include 'Code:')
      const brewVouchers = statsData.recent_activity?.filter((a: any) => 
        (a.type === 'voucher' || a.type === 'badge') && a.reason.includes('Code:')
      ) || [];
      setVouchers(brewVouchers);

    } catch (e) {
      console.error("Failed to fetch data", e);
    }
  };

  useEffect(() => {
    if (isConnected && address) {
      fetchData();
    }
  }, [isConnected, address]);

  const handleSpin = async () => {
    if (!address || (stats?.total_points < 50) || !lootbox) return;
    
    setIsSpinning(true);
    setPhase('spinning');
    setSpinResult(null);
    
    try {
      // 1. Commit
      const commitRes = await fetch(`http://127.0.0.1:8000/api/v1/gamification/spin/commit?wallet_address=${address}&lootbox_id=${lootbox.id}&program_id=brewbound`, {
        method: 'POST'
      });
      const commitData = await commitRes.json();
      
      if (!commitRes.ok) {
        throw new Error(commitData.detail || "Commit failed");
      }

      const { salt } = commitData;

      // 2. Animate local rotation
      const extraRot = 360 * 5 + Math.random() * 360;
      setRotation(prev => prev + extraRot);

      // 3. Reveal after animation
      setTimeout(async () => {
        try {
          const revealRes = await fetch(`http://127.0.0.1:8000/api/v1/gamification/spin/reveal?wallet_address=${address}&salt_hex=${salt}&lootbox_id=${lootbox.id}&program_id=brewbound`, {
            method: 'POST'
          });
          const result = await revealRes.json();
          if (!revealRes.ok) throw new Error(result.detail || "Reveal failed");
          
          setSpinResult(result);
          setPhase('revealed');
          setIsSpinning(false);
          fetchData(); // Refresh balance and vouchers
        } catch (e: any) {
          console.error("Reveal error:", e);
          alert(e.message || "Failed to reveal prize.");
          setIsSpinning(false);
          setPhase('idle');
        }
      }, 4000);

    } catch (e: any) {
      console.error("Commit error:", e);
      alert(e.message || "Failed to start spin.");
      setIsSpinning(false);
      setPhase('idle');
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-96 bg-white/90 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl overflow-hidden mb-2"
          >
            {/* Header */}
            <div className="p-6 bg-[#3E2723] text-white relative">
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                  <Coffee size={24} />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-xl leading-none">Brewbound Rewards</h3>
                  <p className="text-[10px] uppercase tracking-widest opacity-70 mt-1">Status: {address?.slice(0,6)}...{address?.slice(-4)}</p>
                </div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="max-h-[500px] overflow-y-auto p-6 space-y-6">
              {!isConnected ? (
                <div className="text-center py-10">
                   <Wallet size={40} className="mx-auto mb-4 opacity-20" />
                   <p className="text-sm font-medium text-gray-500">Connect wallet to unlock the wheel</p>
                </div>
              ) : (
                <>
                  {/* Stats Row */}
                  <div className="flex gap-4">
                    <div className="flex-1 bg-amber-50 p-4 rounded-2xl border border-amber-100">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800/60 block mb-1">Points</span>
                      <div className="flex items-center gap-1">
                        <Zap size={14} className="text-amber-600 fill-amber-600" />
                        <span className="text-xl font-serif font-bold text-[#3E2723]">{stats?.total_points || 0}</span>
                      </div>
                    </div>
                    <div className="flex-1 bg-brown-50 p-4 rounded-2xl border border-gray-100 text-right">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">My Vouchers</span>
                      <div className="flex items-center gap-1 justify-end">
                        <span className="text-xl font-serif font-bold text-[#3E2723]">{vouchers.length}</span>
                        <Ticket size={14} className="text-[#3E2723]" />
                      </div>
                    </div>
                  </div>

                  {/* Spinner Area */}
                  <div className="bg-muted/30 rounded-3xl p-6 border border-border flex flex-col items-center">
                    <div className="relative mb-6">
                      {/* Pointer */}
                      <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 z-10 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[20px] border-t-[#3E2723]" />
                      
                      {/* Wheel SVG */}
                      <motion.div
                        animate={{ rotate: rotation }}
                        transition={{ duration: phase === 'spinning' ? 4 : 0, ease: "circOut" }}
                        className="w-48 h-48 rounded-full border-4 border-[#3E2723] shadow-lg overflow-hidden relative bg-white"
                      >
                        <svg viewBox="0 0 100 100" className="w-full h-full">
                          {lootbox?.prizes?.map((prize: any, i: number) => {
                            const startAngle = (i * 360) / lootbox.prizes.length;
                            const endAngle = ((i + 1) * 360) / lootbox.prizes.length;
                            const toRad = (deg: number) => (deg * Math.PI) / 180;
                            const x1 = 50 + 50 * Math.cos(toRad(startAngle - 90));
                            const y1 = 50 + 50 * Math.sin(toRad(startAngle - 90));
                            const x2 = 50 + 50 * Math.cos(toRad(endAngle - 90));
                            const y2 = 50 + 50 * Math.sin(toRad(endAngle - 90));
                            const midAngle = (startAngle + endAngle) / 2;
                            const tx = 50 + 35 * Math.cos(toRad(midAngle - 90));
                            const ty = 50 + 35 * Math.sin(toRad(midAngle - 90));
                            
                            return (
                              <g key={i}>
                                <path
                                  d={`M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`}
                                  fill={COLORS[i % COLORS.length]}
                                  stroke="#3E2723"
                                  strokeWidth="0.5"
                                />
                                <text
                                  x={tx} y={ty}
                                  textAnchor="middle"
                                  fontSize="4"
                                  fill="white"
                                  fontWeight="bold"
                                  transform={`rotate(${midAngle + 90}, ${tx}, ${ty})`}
                                >
                                  {prize.label.split(" ")[0]}
                                </text>
                              </g>
                            );
                          })}
                        </svg>
                      </motion.div>
                    </div>

                    {phase === 'revealed' && spinResult ? (
                      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                         <Sparkles className="text-amber-500 mx-auto mb-1" />
                         <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">You Won!</p>
                         <p className="text-lg font-serif font-bold text-[#3E2723] mb-2">{spinResult.prize_label}</p>
                         {spinResult.voucher_code && (
                           <div className="bg-white border-2 border-dashed border-[#3E2723] p-2 rounded-lg font-mono text-xs font-bold mb-4">
                             {spinResult.voucher_code}
                           </div>
                         )}
                         <button onClick={() => setPhase('idle')} className="text-[10px] font-bold text-gray-400 hover:text-[#3E2723] underline underline-offset-4">CLOSE</button>
                      </motion.div>
                    ) : (
                      <button
                        onClick={handleSpin}
                        disabled={isSpinning || (stats?.total_points < 50)}
                        className="w-full bg-[#3E2723] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                      >
                         {isSpinning ? <Loader2 className="animate-spin" /> : <Zap size={18} />}
                         <span>SPIN FOR 50 PTS</span>
                      </button>
                    )}
                  </div>

                  {/* Vouchers List */}
                  {vouchers.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">My Coffee Vouchers</h4>
                      <div className="space-y-2">
                        {vouchers.map((v, i) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-2xl shadow-sm">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-amber-50 rounded-full flex items-center justify-center text-amber-700">
                                {v.reason.includes('Cookie') ? <Cookie size={16} /> : <Coffee size={16} />}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-[#3E2723] leading-none mb-1">{v.reason.split(' (Code:')[0]}</p>
                                <p className="text-[10px] font-mono font-black text-amber-800">{v.reason.match(/Code: (.*)\)/)?.[1]}</p>
                              </div>
                            </div>
                            <span className="text-[8px] bg-green-100 text-green-700 font-black px-2 py-1 rounded-full uppercase">Valid</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            
            <div className="p-4 bg-gray-50 text-center border-t border-gray-100">
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Powered by ChainLoyalty Infrastructure</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-[#3E2723] text-white rounded-full shadow-2xl flex items-center justify-center border-4 border-white/20 relative"
      >
        {isOpen ? <X size={24} /> : <Coffee size={24} />}
        {isConnected && vouchers.length > 0 && !isOpen && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold">
            {vouchers.length}
          </span>
        )}
      </motion.button>
    </div>
  );
}
