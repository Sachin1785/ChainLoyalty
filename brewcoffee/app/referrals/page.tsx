'use client';

import { useEffect, useState } from 'react';
import { Share2, Copy, Check, Gift, ArrowRight, Wallet, Zap, Trophy, Ticket, Users, Coffee, Cookie, Award } from 'lucide-react';
import { useAccount } from 'wagmi';

export default function ReferralsPage() {
  const { address, isConnected } = useAccount();
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);

  useEffect(() => {
    if (isConnected && address) {
      fetchData(address);
    } else {
      setReferralCode('');
      setStats(null);
      setVouchers([]);
      setReferrals([]);
    }
  }, [isConnected, address]);

  const fetchData = async (userAddress: string) => {
    setLoading(true);
    try {
      const [codeRes, statsRes, refRes] = await Promise.all([
        fetch(`http://127.0.0.1:8000/api/v1/referrals/code/${userAddress}?program_id=brewbound`),
        fetch(`http://127.0.0.1:8000/api/v1/rewards/${userAddress}/stats?program_id=brewbound`),
        fetch(`http://127.0.0.1:8000/api/v1/referrals/${userAddress}/list?program_id=brewbound`)
      ]);

      const codeData = await codeRes.json();
      const statsData = await statsRes.json();
      const refData = await refRes.json();

      setReferralCode(codeData.referral_code);
      setStats(statsData);
      setReferrals(refData);

      // Filter for brewbound vouchers (now stored as 'badge' NFTs but include 'Code:')
      const brewVouchers = statsData.recent_activity?.filter((a: any) => 
        (a.type === 'voucher' || a.type === 'badge') && a.reason.includes('Code:')
      ) || [];
      setVouchers(brewVouchers);

    } catch (e) {
      console.error("Failed to fetch data", e);
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
    const text = encodeURIComponent(`Enjoying the best coffee at Brewbound! ☕✨ Use my code ${referralCode} to get bonus loyalty points on your first order. Join here: http://localhost:3002`);
    window.open(`https://bsky.app/intent/compose?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
             🎁
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-foreground mb-4">
            My <span className="text-accent">Rewards & Referrals</span>
          </h1>
          <p className="text-lg text-foreground/60 max-w-xl mx-auto">
            Manage your coffee vouchers, track your loyalty points, and invite friends to earn together.
          </p>
        </div>

        {isConnected && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-in fade-in slide-in-from-bottom-4">
             <div className="bg-card border border-border p-6 rounded-2xl shadow-sm text-center">
                <Zap className="mx-auto text-amber-500 mb-2" size={24} />
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total Points</p>
                <p className="text-3xl font-serif font-bold text-foreground">{stats?.total_points || 0}</p>
             </div>
             <div className="bg-card border border-border p-6 rounded-2xl shadow-sm text-center">
                <Ticket className="mx-auto text-accent mb-2" size={24} />
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Vouchers</p>
                <p className="text-3xl font-serif font-bold text-foreground">{vouchers.length}</p>
             </div>
             <div className="bg-card border border-border p-6 rounded-2xl shadow-sm text-center">
                <Users className="mx-auto text-primary mb-2" size={24} />
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Referrals</p>
                <p className="text-3xl font-serif font-bold text-foreground">{referrals.length}</p>
             </div>
          </div>
        )}

        <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
          <div className="space-y-8">
            <section className="bg-card border border-border rounded-2xl p-8 shadow-sm">
              <h2 className="text-xl font-serif font-bold text-foreground mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-sm font-bold">1</span>
                Invite Friends
              </h2>
              
              <div className="space-y-4">
                {!isConnected ? (
                  <div className="p-8 border-2 border-dashed border-border rounded-xl text-center bg-muted/5">
                     <Wallet size={48} className="mx-auto text-muted-foreground mb-4 opacity-20" />
                     <p className="text-foreground/60 font-medium mb-2">Connect your MetaMask wallet to unlock your referral code</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {loading ? (
                      <div className="h-24 flex items-center justify-center bg-accent/5 animate-pulse rounded-xl">
                         <span className="text-accent font-bold uppercase tracking-widest">Fetching your code...</span>
                      </div>
                    ) : referralCode && (
                      <div className="animate-in fade-in slide-in-from-bottom-4">
                         <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                          Your Unique Code
                        </p>
                        <div className="flex items-center justify-between p-6 bg-accent/5 border-2 border-dashed border-accent rounded-xl mb-6">
                          <span className="text-3xl font-mono font-bold tracking-widest text-accent uppercase">
                            {referralCode}
                          </span>
                          <button
                            onClick={copyToClipboard}
                            className="p-3 bg-white border border-border rounded-lg hover:shadow-md transition-all flex items-center gap-2 text-foreground font-semibold"
                          >
                            {copied ? <Check size={20} className="text-green-600" /> : <Copy size={20} />}
                            {copied ? 'Copied!' : 'Copy'}
                          </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                          <button
                            onClick={shareToBluesky}
                            className="flex items-center justify-center gap-3 p-4 bg-[#0085FF] text-white font-bold rounded-xl hover:scale-[1.02] transition-transform w-full"
                          >
                            <Share2 size={20} />
                            Share on BlueSky
                          </button>
                          <div className="p-4 border border-accent/20 bg-accent/5 rounded-xl text-accent font-semibold italic text-sm text-center">
                             "You both earn 200 pts per referral!"
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>

            <section className="bg-card border border-border rounded-2xl p-8 shadow-sm">
               <h2 className="text-xl font-serif font-bold text-foreground mb-6">How it Works</h2>
               <div className="space-y-6">
                {[
                  { icon: '✉️', title: 'Share Code', desc: 'Send your code to a friend who loves coffee.' },
                  { icon: '🛒', title: 'Friend Orders', desc: 'They enter your code during their first checkout.' },
                  { icon: '✨', title: 'Both Rewarded', desc: 'You both get 200 loyalty points instantly.' },
                ].map((step, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="text-2xl mt-1">{step.icon}</div>
                    <div>
                      <h3 className="font-serif font-bold text-foreground leading-none mb-1">{step.title}</h3>
                      <p className="text-sm text-foreground/60">{step.desc}</p>
                    </div>
                  </div>
                ))}
               </div>
            </section>
          </div>

          <div className="space-y-8">
            <section className="bg-card border border-border rounded-2xl p-8 shadow-sm overflow-hidden">
               <h2 className="text-xl font-serif font-bold text-foreground mb-6 flex items-center gap-2">
                 <Ticket size={24} className="text-accent" />
                 My Coffee Vouchers
               </h2>

               {!isConnected ? (
                 <p className="text-muted-foreground text-sm italic">Connect wallet to see your vouchers.</p>
               ) : vouchers.length === 0 ? (
                 <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
                   <Gift className="mx-auto text-muted-foreground/20 mb-4" size={40} />
                   <p className="text-muted-foreground text-sm">No vouchers earned yet. Spin the wheel or refer a friend!</p>
                 </div>
               ) : (
                 <div className="space-y-4">
                    {vouchers.map((v, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-accent/5 border border-accent/10 rounded-2xl animate-in fade-in slide-in-from-right-4" style={{ animationDelay: `${i * 100}ms` }}>
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-accent shadow-sm">
                            {v.reason.includes('Cookie') ? <Cookie size={20} /> : <Coffee size={20} />}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground leading-none mb-1">{v.reason.split(' (Code:')[0]}</p>
                            <p className="text-xs font-mono font-black text-accent">{v.reason.match(/Code: (.*)\)/)?.[1]}</p>
                          </div>
                        </div>
                        <div className="text-right">
                           <span className="text-[10px] bg-green-100 text-green-700 font-black px-2 py-1 rounded-full uppercase">Valid</span>
                        </div>
                      </div>
                    ))}
                 </div>
               )}
            </section>

            <section className="bg-card border border-border rounded-2xl p-8 shadow-sm">
               <h2 className="text-xl font-serif font-bold text-foreground mb-6 flex items-center gap-2">
                 <Users size={24} className="text-primary" />
                 Referral History
               </h2>

               {!isConnected ? (
                 <p className="text-muted-foreground text-sm italic">Connect wallet to see your referrals.</p>
               ) : referrals.length === 0 ? (
                 <p className="text-muted-foreground text-sm italic">You haven't referred anyone yet. Start sharing!</p>
               ) : (
                 <div className="space-y-3">
                    {referrals.map((r, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                             {i + 1}
                           </div>
                           <div>
                             <p className="text-xs font-mono font-bold text-foreground">{r.wallet_address.slice(0, 10)}...{r.wallet_address.slice(-10)}</p>
                             <p className="text-[10px] text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</p>
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
