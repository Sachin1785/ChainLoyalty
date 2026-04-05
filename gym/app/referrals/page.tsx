'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { Share2, Copy, Check, Gift, Wallet, Zap, Users, Award, Dumbbell, Coffee, ChevronRight } from 'lucide-react';

const API = 'http://127.0.0.1:8000';

export default function ReferralsPage() {
  const { address, isConnected } = useAccount();
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [referrals, setReferrals] = useState<any[]>([]);

  useEffect(() => {
    if (isConnected && address) {
      fetchData(address);
    } else {
      setReferralCode('');
      setStats(null);
      setReferrals([]);
    }
  }, [isConnected, address]);

  const fetchData = async (userAddress: string) => {
    setLoading(true);
    try {
      const [codeRes, statsRes, refRes] = await Promise.all([
        fetch(`${API}/api/v1/referrals/code/${userAddress}?program_id=stride`),
        fetch(`${API}/api/v1/rewards/${userAddress}/stats?program_id=stride`),
        fetch(`${API}/api/v1/referrals/${userAddress}/list?program_id=stride`),
      ]);
      const codeData = await codeRes.json();
      const statsData = await statsRes.json();
      const refData = await refRes.json();
      setReferralCode(codeData.referral_code);
      setStats(statsData);
      setReferrals(refData);
    } catch (e) {
      console.error('Failed to fetch referral data', e);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToBluesky = () => {
    const text = encodeURIComponent(
      `Crushing my fitness goals at Stride! 🏋️✨ Use my code ${referralCode} to get bonus loyalty points on your first order. Join: http://localhost:3003`
    );
    window.open(`https://bsky.app/intent/compose?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">

        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 flex items-center justify-center mx-auto mb-6 text-4xl">
            🎁
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Refer & <span className="text-primary">Win</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Share your code with friends. You both earn 200 loyalty points — instantly.
          </p>
        </div>

        {/* Stats Strip */}
        {isConnected && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-card border border-border p-6 rounded-2xl shadow-sm text-center">
              <Zap className="mx-auto text-yellow-500 fill-yellow-500 mb-2" size={24} />
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total Points</p>
              <p className="text-3xl font-bold text-foreground mt-1">{stats?.total_points || 0}</p>
            </div>
            <div className="bg-card border border-border p-6 rounded-2xl shadow-sm text-center">
              <Users className="mx-auto text-primary mb-2" size={24} />
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Friends Referred</p>
              <p className="text-3xl font-bold text-foreground mt-1">{referrals.length}</p>
            </div>
            <div className="bg-card border border-border p-6 rounded-2xl shadow-sm text-center">
              <Award className="mx-auto text-accent mb-2" size={24} />
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Points Earned</p>
              <p className="text-3xl font-bold text-foreground mt-1">{referrals.length * 200}</p>
            </div>
          </div>
        )}

        <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
          <div className="space-y-8">
            {/* Invite Section */}
            <section className="bg-card border border-border rounded-2xl p-8 shadow-sm">
              <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">1</span>
                Invite Friends
              </h2>

              {!isConnected ? (
                <div className="p-8 border-2 border-dashed border-border rounded-xl text-center bg-muted/5">
                  <Wallet size={48} className="mx-auto text-muted-foreground/20 mb-4" />
                  <p className="text-foreground/60 font-medium mb-2">Connect your MetaMask wallet to unlock your referral code</p>
                </div>
              ) : loading ? (
                <div className="h-24 flex items-center justify-center bg-primary/5 animate-pulse rounded-xl">
                  <span className="text-primary font-bold uppercase tracking-widest text-sm">Fetching your code...</span>
                </div>
              ) : referralCode ? (
                <div className="space-y-6">
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Your Unique Code</p>
                    <div className="flex items-center justify-between p-5 bg-primary/5 border-2 border-dashed border-primary rounded-xl mb-4">
                      <span className="text-2xl font-mono font-black tracking-widest text-primary uppercase">
                        {referralCode}
                      </span>
                      <button
                        onClick={copyToClipboard}
                        className="p-2.5 bg-background border border-border rounded-xl hover:shadow-md transition-all flex items-center gap-2 text-foreground font-semibold text-sm"
                      >
                        {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={shareToBluesky}
                    className="w-full flex items-center justify-center gap-3 p-4 bg-[#0085FF] text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
                  >
                    <Share2 size={18} />
                    Share on BlueSky
                  </button>

                  <div className="p-4 border border-primary/20 bg-primary/5 rounded-xl text-primary font-semibold italic text-sm text-center">
                    "You both earn 200 pts per referral! 🏋️"
                  </div>
                </div>
              ) : null}
            </section>

            {/* How it Works */}
            <section className="bg-card border border-border rounded-2xl p-8 shadow-sm">
              <h2 className="text-xl font-bold text-foreground mb-6">How it Works</h2>
              <div className="space-y-6">
                {[
                  { icon: '✉️', title: 'Share Your Code', desc: 'Send your unique Stride code to a friend who wants to train.' },
                  { icon: '🛒', title: 'Friend Signs Up', desc: 'They enter your code during their first store purchase.' },
                  { icon: '✨', title: 'Both Rewarded', desc: 'You both get 200 loyalty points credited instantly.' },
                ].map((step, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="text-2xl mt-1">{step.icon}</div>
                    <div>
                      <h3 className="font-bold text-foreground mb-1">{step.title}</h3>
                      <p className="text-sm text-muted-foreground">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-8">
            {/* Cross-platform bonus info */}
            <section className="bg-gradient-to-br from-[#1a2e1a] to-[#0f4a2a] text-white rounded-2xl p-8 shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 opacity-10"
                style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, #22c55e, transparent 50%)' }}
              />
              <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-4">Cross-platform perks</p>
                <h3 className="text-xl font-bold text-white mb-4">Your points work everywhere</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3">
                    <Coffee size={18} className="text-amber-300 flex-shrink-0" />
                    <p className="text-sm text-white/80">Points earned here → spend at <span className="font-bold text-white">Brewbound</span> ☕</p>
                  </div>
                  <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3">
                    <Dumbbell size={18} className="text-green-300 flex-shrink-0" />
                    <p className="text-sm text-white/80">Coffee vouchers → discounts on <span className="font-bold text-white">Stride gear</span> 🏋️</p>
                  </div>
                </div>
                <a
                  href="http://localhost:3002"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-green-300 hover:text-white transition-colors"
                >
                  Visit Brewbound <ChevronRight size={14} />
                </a>
              </div>
            </section>

            {/* Referral History */}
            <section className="bg-card border border-border rounded-2xl p-8 shadow-sm">
              <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <Users size={20} className="text-primary" />
                Referral History
              </h2>

              {!isConnected ? (
                <p className="text-muted-foreground text-sm italic">Connect wallet to see your referrals.</p>
              ) : referrals.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-border rounded-xl">
                  <Gift size={36} className="mx-auto text-muted-foreground/20 mb-3" />
                  <p className="text-sm text-muted-foreground">You haven't referred anyone yet.</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Start sharing to earn points!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {referrals.map((r, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                          {i + 1}
                        </div>
                        <div>
                          <p className="text-xs font-mono font-bold text-foreground">
                            {r.wallet_address.slice(0, 10)}...{r.wallet_address.slice(-8)}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {new Date(r.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-green-600 font-bold text-xs">
                        <Award size={14} />
                        +200 pts
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
