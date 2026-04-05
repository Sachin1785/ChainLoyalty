'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dumbbell, X, Zap, Trophy, Wallet, Coffee, Ticket,
  ChevronRight, Sparkles, ArrowRight, Star
} from 'lucide-react';
import { useAccount } from 'wagmi';

const API = 'http://127.0.0.1:8000';

// Badge tier config — maps badge label patterns to gym perks
const BADGE_PERKS = [
  {
    match: (reason: string) => reason.includes('Code:'),
    emoji: '☕',
    label: 'Brewbound Coffee Voucher',
    perk: '5% off any Stride gear',
    discount: 5,
    source: 'brewbound',
    color: 'from-amber-500 to-orange-600',
  },
  {
    match: (reason: string) => reason.toLowerCase().includes('bronze'),
    emoji: '🥉',
    label: 'Bronze Athlete Badge',
    perk: '10% off Supplements',
    discount: 10,
    source: 'stride',
    color: 'from-amber-700 to-yellow-600',
  },
  {
    match: (reason: string) => reason.toLowerCase().includes('silver'),
    emoji: '🥈',
    label: 'Silver Athlete Badge',
    perk: '15% off Equipment',
    discount: 15,
    source: 'stride',
    color: 'from-slate-400 to-slate-600',
  },
  {
    match: (reason: string) => reason.toLowerCase().includes('gold'),
    emoji: '🥇',
    label: 'Gold Athlete Badge',
    perk: '20% off Everything',
    discount: 20,
    source: 'stride',
    color: 'from-yellow-400 to-amber-500',
  },
  {
    match: (reason: string) => reason.toLowerCase().includes('platinum'),
    emoji: '💎',
    label: 'Platinum Legend',
    perk: '25% off + Early Access',
    discount: 25,
    source: 'stride',
    color: 'from-cyan-400 to-blue-600',
  },
];

export function GymLoyaltyWidget() {
  const { address, isConnected } = useAccount();
  const [isOpen, setIsOpen] = useState(false);
  const [brewStats, setBrewStats] = useState<any>(null);
  const [strideStats, setStrideStats] = useState<any>(null);
  const [activeBadges, setActiveBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const totalPoints = (brewStats?.total_points || 0) + (strideStats?.total_points || 0);

  const fetchData = async () => {
    if (!address) return;
    setLoading(true);
    try {
      const [brewRes, strideRes] = await Promise.all([
        fetch(`${API}/api/v1/rewards/${address}/stats?program_id=brewbound`),
        fetch(`${API}/api/v1/rewards/${address}/stats?program_id=stride`),
      ]);

      const brew = await brewRes.json();
      const stride = await strideRes.json();
      setBrewStats(brew);
      setStrideStats(stride);

      // Collect all badges/vouchers from both programs
      const allActivity = [
        ...(brew.recent_activity || []),
        ...(stride.recent_activity || []),
      ];

      const badges = allActivity
        .filter((a: any) => a.type === 'badge' || a.type === 'voucher')
        .map((a: any) => {
          const perk = BADGE_PERKS.find((p) => p.match(a.reason));
          return perk ? { ...a, perk } : null;
        })
        .filter(Boolean);

      setActiveBadges(badges);
    } catch (e) {
      console.error('GymWidget: failed to fetch', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && address) {
      fetchData();
    }
  }, [isConnected, address]);

  const brewPoints = brewStats?.total_points || 0;
  const stridePoints = strideStats?.total_points || 0;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            className="w-96 bg-white/95 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl overflow-hidden mb-2"
          >
            {/* Header — dark green gradient */}
            <div className="p-6 bg-gradient-to-br from-[#1a2e1a] to-[#0f4a2a] text-white relative overflow-hidden">
              {/* Subtle mesh bg */}
              <div className="absolute inset-0 opacity-10"
                style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, #4ade80 0%, transparent 50%), radial-gradient(circle at 80% 20%, #22c55e 0%, transparent 50%)' }}
              />
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-full transition-colors z-10"
              >
                <X size={18} />
              </button>
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 bg-green-500/20 border border-green-400/30 rounded-xl flex items-center justify-center">
                  <Dumbbell size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-xl leading-none">ChainLoyalty Passport</h3>
                  <p className="text-[10px] uppercase tracking-widest opacity-60 mt-1">
                    {isConnected ? `${address?.slice(0, 6)}...${address?.slice(-4)}` : 'Connect to unlock'}
                  </p>
                </div>
              </div>

              {/* Cross-platform points summary */}
              {isConnected && !loading && (
                <div className="mt-5 grid grid-cols-2 gap-3 relative z-10">
                  <div className="bg-white/10 rounded-2xl p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Coffee size={12} className="text-amber-300" />
                      <span className="text-[10px] uppercase tracking-wider text-white/60 font-bold">Brewbound</span>
                    </div>
                    <div className="flex items-end gap-1">
                      <span className="text-2xl font-bold text-white">{brewPoints}</span>
                      <span className="text-xs text-white/50 mb-0.5">pts</span>
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-2xl p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Dumbbell size={12} className="text-green-300" />
                      <span className="text-[10px] uppercase tracking-wider text-white/60 font-bold">Stride</span>
                    </div>
                    <div className="flex items-end gap-1">
                      <span className="text-2xl font-bold text-white">{stridePoints}</span>
                      <span className="text-xs text-white/50 mb-0.5">pts</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Total Points Banner */}
            {isConnected && (
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/70">Total Redeemable</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Zap size={18} className="text-yellow-300 fill-yellow-300" />
                    <span className="text-3xl font-black text-white">{totalPoints}</span>
                    <span className="text-xs text-white/70 font-bold">pts</span>
                  </div>
                </div>
                {brewPoints > 0 && (
                  <div className="bg-white/20 rounded-xl px-3 py-2 text-right">
                    <p className="text-white/80 text-[10px] font-bold leading-none">☕ from Brew?</p>
                    <p className="text-white font-black text-sm mt-0.5">Spend here! →</p>
                  </div>
                )}
              </div>
            )}

            {/* Scrollable body */}
            <div className="max-h-[340px] overflow-y-auto p-5 space-y-5">
              {!isConnected ? (
                <div className="text-center py-10">
                  <Wallet size={40} className="mx-auto mb-4 opacity-20 text-gray-500" />
                  <p className="text-sm font-semibold text-gray-500">Connect your wallet to see</p>
                  <p className="text-sm font-bold text-gray-700">your cross-platform rewards</p>
                </div>
              ) : loading ? (
                <div className="space-y-3 animate-pulse">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-gray-100 rounded-2xl" />
                  ))}
                </div>
              ) : (
                <>
                  {/* Active Badges / Perks */}
                  {activeBadges.length > 0 ? (
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                        <Sparkles size={12} />
                        Active Perks
                      </h4>
                      {activeBadges.map((badge, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.06 }}
                          className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-white border border-gray-100 rounded-2xl shadow-sm"
                        >
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${badge.perk.color} flex items-center justify-center text-lg flex-shrink-0`}>
                            {badge.perk.emoji}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-gray-800 leading-none mb-0.5">{badge.perk.label}</p>
                            <p className="text-[10px] font-semibold text-green-600">{badge.perk.perk}</p>
                          </div>
                          <span className="text-[10px] font-black text-green-700 bg-green-100 px-2 py-1 rounded-full whitespace-nowrap">
                            -{badge.perk.discount}%
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-2xl">
                      <Trophy size={32} className="mx-auto text-gray-300 mb-2" />
                      <p className="text-xs font-semibold text-gray-500">No badges yet</p>
                      <p className="text-[10px] text-gray-400 mt-1">Visit Brewbound or log workouts to earn badges</p>
                    </div>
                  )}

                  {/* What you can earn info */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-2xl p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-green-700 mb-3">How to earn more</p>
                    <div className="space-y-2">
                      {[
                        { icon: '☕', text: 'Order at Brewbound → 5% off gear' },
                        { icon: '🏋️', text: 'Log 30 workouts → Bronze badge' },
                        { icon: '🏆', text: '100 workouts → 20% off everything' },
                      ].map((tip, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-base">{tip.icon}</span>
                          <p className="text-[11px] text-green-800 font-medium">{tip.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 text-center">
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                Powered by ChainLoyalty · Cross-Platform Rewards
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-16 h-16 rounded-full shadow-2xl flex items-center justify-center border-4 border-white/30 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #166534 0%, #16a34a 100%)' }}
      >
        {/* Pulse ring when has badges */}
        {isConnected && activeBadges.length > 0 && !isOpen && (
          <span className="absolute inset-0 rounded-full animate-ping bg-green-400 opacity-30" />
        )}
        {isOpen ? <X size={26} className="text-white" /> : <Dumbbell size={26} className="text-white" />}

        {/* Badge count badge */}
        {isConnected && activeBadges.length > 0 && !isOpen && (
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-black text-yellow-900">
            {activeBadges.length}
          </span>
        )}
      </motion.button>
    </div>
  );
}
