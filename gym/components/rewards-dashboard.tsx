'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Trophy, Wallet, Coffee, Sparkles, Dumbbell, Lock, Star, ChevronRight } from 'lucide-react';

const API = 'http://127.0.0.1:8000';

const BADGE_PERKS = [
  { match: (r: string) => r.includes('Code:'),                         emoji: '☕', label: 'Brewbound Voucher',  perk: '5% off Stride gear',       discount: 5,  color: 'from-amber-400 to-orange-500', source: 'Brewbound' },
  { match: (r: string) => r.toLowerCase().includes('bronze'),          emoji: '🥉', label: 'Bronze Athlete',    perk: '10% off Supplements',       discount: 10, color: 'from-yellow-600 to-amber-700', source: 'Stride' },
  { match: (r: string) => r.toLowerCase().includes('silver'),          emoji: '🥈', label: 'Silver Athlete',    perk: '15% off Equipment',         discount: 15, color: 'from-slate-400 to-slate-600',  source: 'Stride' },
  { match: (r: string) => r.toLowerCase().includes('gold'),            emoji: '🥇', label: 'Gold Athlete',      perk: '20% off Everything',        discount: 20, color: 'from-yellow-400 to-amber-500', source: 'Stride' },
  { match: (r: string) => r.toLowerCase().includes('platinum'),        emoji: '💎', label: 'Platinum Legend',   perk: '25% off + Early Access',    discount: 25, color: 'from-cyan-400 to-blue-600',   source: 'Stride' },
];

const MILESTONES = [
  { emoji: '🔥', label: 'Streak Starter',  requirement: '5 workouts posted',  reward: '+150 bonus pts',         badgeKey: null },
  { emoji: '🥉', label: 'Bronze Athlete',  requirement: '30 workouts',         reward: '10% off Supplements',    badgeKey: 'bronze' },
  { emoji: '🥈', label: 'Silver Athlete',  requirement: '60 workouts',         reward: '15% off Equipment',      badgeKey: 'silver' },
  { emoji: '🥇', label: 'Gold Athlete',    requirement: '100 workouts',        reward: '20% off Everything',     badgeKey: 'gold' },
  { emoji: '💎', label: 'Platinum Legend', requirement: '200 workouts',        reward: '25% + Early Access',     badgeKey: 'platinum' },
];

export default function RewardsDashboard() {
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [brewPoints, setBrewPoints] = useState(0);
  const [stridePoints, setStridePoints] = useState(0);
  const [activeBadges, setActiveBadges] = useState<any[]>([]);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!isConnected || !address) {
      setBrewPoints(0);
      setStridePoints(0);
      setActiveBadges([]);
      return;
    }
    const load = async () => {
      setLoading(true);
      try {
        const [brewRes, strideRes] = await Promise.all([
          fetch(`${API}/api/v1/rewards/${address}/stats?program_id=brewbound`),
          fetch(`${API}/api/v1/rewards/${address}/stats?program_id=stride`),
        ]);
        const brew = await brewRes.json();
        const stride = await strideRes.json();
        setBrewPoints(brew?.total_points || 0);
        setStridePoints(stride?.total_points || 0);

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

        // Deduplicate by perk label
        const unique = badges.filter(
          (b: any, i: number, arr: any[]) =>
            arr.findIndex((x: any) => x.perk.label === b.perk.label) === i
        );
        setActiveBadges(unique);
      } catch (e) {
        console.error('RewardsDashboard: fetch failed', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isConnected, address]);

  const totalPoints = brewPoints + stridePoints;
  const earnedBadgeKeys = new Set(
    activeBadges
      .filter((b: any) => b.perk.source === 'Stride')
      .map((b: any) => b.perk.label.toLowerCase())
  );

  const milestonesWithStatus = MILESTONES.map(m => ({
    ...m,
    unlocked: m.badgeKey === null
      ? totalPoints >= 150          // "Streak Starter" proxy: has any points
      : earnedBadgeKeys.has(m.label.toLowerCase()),
  }));

  if (!mounted) return null;

  return (
    <section id="rewards" className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-2">Rewards Dashboard</h2>
          <p className="text-muted-foreground">
            Live data from ChainLoyalty — your real points and earned badges.
          </p>
        </div>

        {/* Live Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <div className="bg-card border border-border rounded-2xl p-6 text-center shadow-sm">
            <Zap className="mx-auto text-yellow-500 fill-yellow-500 mb-2" size={24} />
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total Points</p>
            {!isConnected ? (
              <p className="text-2xl font-bold text-foreground mt-1">—</p>
            ) : loading ? (
              <div className="h-8 w-16 bg-muted animate-pulse rounded-lg mx-auto mt-1" />
            ) : (
              <p className="text-3xl font-bold text-foreground mt-1">{totalPoints.toLocaleString()}</p>
            )}
          </div>
          <div className="bg-card border border-border rounded-2xl p-6 text-center shadow-sm">
            <Coffee className="mx-auto text-amber-500 mb-2" size={24} />
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Brewbound Pts</p>
            {!isConnected ? (
              <p className="text-2xl font-bold text-foreground mt-1">—</p>
            ) : loading ? (
              <div className="h-8 w-16 bg-muted animate-pulse rounded-lg mx-auto mt-1" />
            ) : (
              <p className="text-3xl font-bold text-foreground mt-1">{brewPoints.toLocaleString()}</p>
            )}
          </div>
          <div className="bg-card border border-border rounded-2xl p-6 text-center shadow-sm">
            <Dumbbell className="mx-auto text-primary mb-2" size={24} />
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Stride Pts</p>
            {!isConnected ? (
              <p className="text-2xl font-bold text-foreground mt-1">—</p>
            ) : loading ? (
              <div className="h-8 w-16 bg-muted animate-pulse rounded-lg mx-auto mt-1" />
            ) : (
              <p className="text-3xl font-bold text-foreground mt-1">{stridePoints.toLocaleString()}</p>
            )}
          </div>
        </div>

        {/* Not connected prompt */}
        {!isConnected && (
          <div className="mb-10 rounded-2xl border-2 border-dashed border-border bg-muted/20 p-8 text-center">
            <Wallet size={40} className="mx-auto text-muted-foreground/30 mb-3" />
            <p className="font-semibold text-foreground">Connect your wallet to see live rewards</p>
            <p className="text-sm text-muted-foreground mt-1">Points and badges are fetched live from ChainLoyalty</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Active Badge Perks */}
          <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
            <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Sparkles size={20} className="text-primary" />
              Active Discount Perks
            </h3>

            {!isConnected ? (
              <p className="text-sm text-muted-foreground italic">Connect wallet to see active perks.</p>
            ) : loading ? (
              <div className="space-y-3">
                {[1, 2].map(i => (
                  <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />
                ))}
              </div>
            ) : activeBadges.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-border rounded-xl">
                <Trophy size={36} className="mx-auto text-muted-foreground/20 mb-3" />
                <p className="text-sm text-muted-foreground">No badges yet.</p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Visit Brewbound or log workouts to earn badges
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {activeBadges.map((badge, i) => (
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
                      <span className="text-xs font-black text-green-700 bg-green-100 px-2 py-1 rounded-full whitespace-nowrap">
                        -{badge.perk.discount}%
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Milestone Badges */}
          <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
            <h3 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
              <Star size={20} className="text-yellow-500 fill-yellow-500" />
              Milestone Badges
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              {isConnected
                ? `${milestonesWithStatus.filter(m => m.unlocked).length} of ${MILESTONES.length} unlocked`
                : 'Complete workout milestones to unlock permanent discounts.'}
            </p>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {milestonesWithStatus.map((m, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                      m.unlocked
                        ? 'border-primary/30 bg-primary/5'
                        : 'border-border bg-muted/20 opacity-60'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${!m.unlocked && isConnected ? 'grayscale' : ''}`}>
                      {m.emoji}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-foreground text-sm">{m.label}</p>
                      <p className="text-xs text-muted-foreground">{m.requirement}</p>
                      <p className="text-xs font-bold text-primary mt-0.5">{m.reward}</p>
                    </div>
                    {isConnected && (
                      m.unlocked ? (
                        <span className="text-[10px] font-black text-green-700 bg-green-100 px-2 py-1 rounded-full whitespace-nowrap">
                          Earned ✓
                        </span>
                      ) : (
                        <Lock size={16} className="text-muted-foreground flex-shrink-0" />
                      )
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
              <p className="text-xs font-black uppercase tracking-widest text-amber-700 mb-1">Cross-platform</p>
              <p className="text-sm text-amber-900 font-medium">
                Badges earned at Brewbound ☕ also unlock discounts here — and vice versa!
              </p>
              <a
                href="http://localhost:3002"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-900 transition-colors"
              >
                Visit Brewbound <ChevronRight size={12} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
