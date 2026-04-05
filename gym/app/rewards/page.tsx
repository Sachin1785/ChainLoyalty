'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Trophy, Ticket, Wallet, Coffee, Dumbbell, Sparkles, Star, ChevronRight, Lock } from 'lucide-react';

const API = 'http://127.0.0.1:8000';

const BADGE_PERKS = [
  { match: (r: string) => r.includes('Code:'), emoji: '☕', label: 'Brewbound Voucher', perk: '5% off Stride gear', source: 'Brewbound', color: 'from-amber-400 to-orange-500' },
  { match: (r: string) => r.toLowerCase().includes('bronze'), emoji: '🥉', label: 'Bronze Athlete', perk: '10% off Supplements', source: 'Stride', color: 'from-yellow-600 to-amber-700' },
  { match: (r: string) => r.toLowerCase().includes('silver'), emoji: '🥈', label: 'Silver Athlete', perk: '15% off Equipment', source: 'Stride', color: 'from-slate-400 to-slate-600' },
  { match: (r: string) => r.toLowerCase().includes('gold'), emoji: '🥇', label: 'Gold Athlete', perk: '20% off Everything', source: 'Stride', color: 'from-yellow-400 to-amber-500' },
  { match: (r: string) => r.toLowerCase().includes('platinum'), emoji: '💎', label: 'Platinum Legend', perk: '25% off + Early Access', source: 'Stride', color: 'from-cyan-400 to-blue-600' },
];

const MILESTONE_DEFS = [
  { emoji: '🔥', label: 'Streak Starter',  requirement: '5 workouts posted',  reward: '+150 bonus pts',       badgeKey: null       },
  { emoji: '🥉', label: 'Bronze Athlete',  requirement: '30 workouts',         reward: '10% off Supplements',  badgeKey: 'bronze'   },
  { emoji: '🥈', label: 'Silver Athlete',  requirement: '60 workouts',         reward: '15% off Equipment',    badgeKey: 'silver'   },
  { emoji: '🥇', label: 'Gold Athlete',    requirement: '100 workouts',        reward: '20% off Everything',   badgeKey: 'gold'     },
  { emoji: '💎', label: 'Platinum Legend', requirement: '200 workouts',        reward: '25% + Early Access',   badgeKey: 'platinum' },
];

export default function RewardsPage() {
  const { address, isConnected } = useAccount();
  const [brewStats, setBrewStats] = useState<any>(null);
  const [strideStats, setStrideStats] = useState<any>(null);
  const [activeBadges, setActiveBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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

      const allActivity = [
        ...(brew.recent_activity || []),
        ...(stride.recent_activity || []),
      ];
      const badges = allActivity
        .filter((a: any) => a.type === 'badge' || a.type === 'voucher')
        .map((a: any) => {
          const perk = BADGE_PERKS.find(p => p.match(a.reason));
          return perk ? { ...a, perk } : null;
        })
        .filter(Boolean);
      setActiveBadges(badges);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && address) fetchData();
    else { setBrewStats(null); setStrideStats(null); setActiveBadges([]); }
  }, [isConnected, address]);

  const brewPoints = brewStats?.total_points || 0;
  const stridePoints = strideStats?.total_points || 0;
  const totalPoints = brewPoints + stridePoints;

  const uniqueBadges = activeBadges.filter(
    (b: any, i: number, arr: any[]) => arr.findIndex((x: any) => x.perk.label === b.perk.label) === i
  );

  // Derive which milestones are unlocked from real badge data
  const earnedBadgeKeys = new Set(
    activeBadges
      .filter((b: any) => b.perk.source === 'Stride')
      .map((b: any) => b.perk.label.toLowerCase())
  );
  const milestones = MILESTONE_DEFS.map(m => ({
    ...m,
    unlocked: m.badgeKey === null ? totalPoints > 0 : earnedBadgeKeys.has(m.label.toLowerCase()),
  }));

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">

        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-br from-[#1a2e1a] to-[#16a34a] rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy size={32} className="text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            My <span className="text-primary">Rewards</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Earn points by working out and shopping. Badges unlock cross-platform discounts at Brewbound and Stride.
          </p>
        </div>

        {/* Stats Strip */}
        {isConnected && !loading && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          >
            <div className="bg-card border border-border p-6 rounded-2xl shadow-sm text-center">
              <Zap className="mx-auto text-yellow-500 fill-yellow-500 mb-2" size={24} />
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total Points</p>
              <p className="text-3xl font-bold text-foreground mt-1">{totalPoints}</p>
            </div>
            <div className="bg-card border border-border p-6 rounded-2xl shadow-sm text-center">
              <Sparkles className="mx-auto text-primary mb-2" size={24} />
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Active Badges</p>
              <p className="text-3xl font-bold text-foreground mt-1">{uniqueBadges.length}</p>
            </div>
            <div className="bg-card border border-border p-6 rounded-2xl shadow-sm text-center">
              <Ticket className="mx-auto text-accent mb-2" size={24} />
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Discount Perks</p>
              <p className="text-3xl font-bold text-foreground mt-1">{uniqueBadges.length}</p>
            </div>
          </motion.div>
        )}

        <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
          <div className="space-y-8">
            {/* ChainLoyalty Passport */}
            <section className="bg-gradient-to-br from-[#1a2e1a] to-[#0f4a2a] rounded-2xl p-8 text-white relative overflow-hidden shadow-lg">
              <div className="absolute inset-0 opacity-10"
                style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, #4ade80, transparent 50%), radial-gradient(circle at 80% 20%, #22c55e, transparent 50%)' }}
              />
              <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-4">🌐 ChainLoyalty Passport</p>
                {!isConnected ? (
                  <div className="text-center py-6">
                    <Wallet size={40} className="mx-auto text-white/20 mb-3" />
                    <p className="text-white/60 font-medium">Connect wallet to view passport</p>
                  </div>
                ) : loading ? (
                  <div className="space-y-3 animate-pulse">
                    <div className="h-10 bg-white/10 rounded-xl" />
                    <div className="h-10 bg-white/10 rounded-xl" />
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 mb-6">
                      <div className="bg-white/10 rounded-xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Coffee size={18} className="text-amber-300" />
                          <div>
                            <p className="font-bold text-white text-sm">Brewbound</p>
                            <p className="text-white/50 text-xs">Coffee rewards</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-black text-white">{brewPoints}</p>
                          <p className="text-white/50 text-xs">pts</p>
                        </div>
                      </div>
                      <div className="bg-white/10 rounded-xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Dumbbell size={18} className="text-green-300" />
                          <div>
                            <p className="font-bold text-white text-sm">Stride</p>
                            <p className="text-white/50 text-xs">Fitness rewards</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-black text-white">{stridePoints}</p>
                          <p className="text-white/50 text-xs">pts</p>
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-white/20 pt-4 flex items-center justify-between">
                      <p className="text-white/70 font-semibold text-sm">Total Redeemable</p>
                      <div className="flex items-center gap-2">
                        <Zap size={16} className="text-yellow-300 fill-yellow-300" />
                        <p className="text-2xl font-black text-white">{totalPoints} pts</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </section>

            {/* Active Badge Perks */}
            <section className="bg-card border border-border rounded-2xl p-8 shadow-sm">
              <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <Sparkles size={20} className="text-primary" />
                Active Perks
              </h2>
              {!isConnected ? (
                <p className="text-muted-foreground text-sm italic">Connect wallet to see your active perks.</p>
              ) : loading ? (
                <div className="space-y-3 animate-pulse">{[1,2].map(i => <div key={i} className="h-14 bg-muted rounded-xl" />)}</div>
              ) : uniqueBadges.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-border rounded-xl">
                  <Trophy size={36} className="mx-auto text-muted-foreground/20 mb-3" />
                  <p className="text-sm text-muted-foreground">No badges yet.</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Visit Brewbound or log workouts to earn badges</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {uniqueBadges.map((badge, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className="flex items-center gap-4 p-4 bg-gradient-to-r from-muted/30 to-muted/10 border border-border rounded-xl"
                    >
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${badge.perk.color} flex items-center justify-center text-lg flex-shrink-0`}>
                        {badge.perk.emoji}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-sm text-foreground">{badge.perk.label}</p>
                        <p className="text-xs text-primary font-semibold">{badge.perk.perk}</p>
                        <p className="text-[10px] text-muted-foreground">from {badge.perk.source}</p>
                      </div>
                      <span className="text-xs font-black text-green-700 bg-green-100 px-2 py-1 rounded-full">Active</span>
                    </motion.div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Milestone Rewards */}
          <section className="bg-card border border-border rounded-2xl p-8 shadow-sm">
            <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Star size={20} className="text-yellow-500 fill-yellow-500" />
              Milestone Badges
            </h2>
            <p className="text-sm text-muted-foreground mb-6">Complete workout milestones to unlock permanent discount badges.</p>
            <div className="space-y-4">
              {milestones.map((m, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                    m.unlocked
                      ? 'border-primary/30 bg-primary/5'
                      : 'border-border bg-muted/20 opacity-70'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${!m.unlocked ? 'grayscale' : ''}`}>
                    {m.emoji}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-foreground text-sm">{m.label}</p>
                    <p className="text-xs text-muted-foreground">{m.requirement}</p>
                    <p className="text-xs font-bold text-primary mt-0.5">{m.reward}</p>
                  </div>
                  {m.unlocked ? (
                    <span className="text-[10px] font-black text-green-700 bg-green-100 px-2 py-1 rounded-full whitespace-nowrap">Earned ✓</span>
                  ) : (
                    <Lock size={16} className="text-muted-foreground flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 p-5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
              <p className="text-xs font-black uppercase tracking-widest text-amber-700 mb-2">Cross-platform tip</p>
              <p className="text-sm text-amber-900 font-medium">
                Badges earned at Brewbound ☕ also unlock discounts here at Stride 🏋️ — and vice versa!
              </p>
              <a
                href="http://localhost:3002"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-900 transition-colors"
              >
                Visit Brewbound <ChevronRight size={14} />
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
