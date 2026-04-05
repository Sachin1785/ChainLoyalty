'use client';

import { useEffect, useState } from 'react';
import { Share2, Copy, Check, Gift, ArrowRight, Wallet } from 'lucide-react';
import { useAccount } from 'wagmi';

export default function ReferralsPage() {
  const { address, isConnected } = useAccount();
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isConnected && address) {
      fetchCode(address);
    } else {
      setReferralCode('');
    }
  }, [isConnected, address]);

  const fetchCode = async (userAddress: string) => {
    setLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/referrals/code/${userAddress}?program_id=brewbound`);
      const data = await res.json();
      setReferralCode(data.referral_code);
    } catch (e) {
      console.error(e);
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
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
             🎁
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-foreground mb-4">
            Refer a Friend, <span className="text-accent">Earn Rewards</span>
          </h1>
          <p className="text-lg text-foreground/60 max-w-xl mx-auto">
            Share the love of specialty coffee. When your friends join Brewbound, you both earn 200 loyalty points!
          </p>
        </div>

        <div className="grid gap-8">
          <section className="bg-card border border-border rounded-2xl p-8 shadow-sm">
            <h2 className="text-xl font-serif font-bold text-foreground mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-sm font-bold">1</span>
              Connect & Rewards
            </h2>
            
            <div className="space-y-4">
              {!isConnected ? (
                <div className="p-8 border-2 border-dashed border-border rounded-xl text-center bg-muted/5">
                   <Wallet size={48} className="mx-auto text-muted-foreground mb-4 opacity-20" />
                   <p className="text-foreground/60 font-medium mb-2">Connect your MetaMask wallet in the header to get started</p>
                   <p className="text-xs text-muted-foreground uppercase tracking-widest">Rewards are sent on-chain instantly</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700">
                    <Check size={20} />
                    <div className="flex flex-col">
                       <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">Wallet Connected</span>
                       <span className="font-mono font-bold">{address}</span>
                    </div>
                  </div>

                  {loading ? (
                    <div className="h-24 flex items-center justify-center bg-accent/5 animate-pulse rounded-xl">
                       <span className="text-accent font-bold uppercase tracking-widest">Fetching your code...</span>
                    </div>
                  ) : referralCode && (
                    <div className="animate-in fade-in slide-in-from-bottom-4">
                       <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                        Your Unique Code
                      </p>
                      <div className="flex items-center justify-between p-6 bg-accent/5 border-2 border-dashed border-accent rounded-xl">
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
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Step 2: Share */}
          {referralCode && (
            <section className="bg-card border border-border rounded-2xl p-8 shadow-sm animate-in fade-in slide-in-from-top-4">
               <h2 className="text-xl font-serif font-bold text-foreground mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-sm font-bold">2</span>
                Spread the Word
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={shareToBluesky}
                  className="flex items-center justify-center gap-3 p-4 bg-[#0085FF] text-white font-bold rounded-xl hover:scale-[1.02] transition-transform"
                >
                  <Share2 size={20} />
                  Post to BlueSky
                </button>
                
                <div className="flex items-center justify-center p-4 border border-accent/20 bg-accent/5 rounded-xl text-accent font-semibold italic text-sm text-center">
                   "You both earn 200 pts per referral!"
                </div>
              </div>
            </section>
          )}

          {/* How it works */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {[
              { icon: '✉️', title: 'Share Code', desc: 'Send your code to a friend who loves coffee.' },
              { icon: '🛒', title: 'Friend Orders', desc: 'They enter your code during their first checkout.' },
              { icon: '✨', title: 'Both Rewarded', desc: 'You both get 200 loyalty points instantly.' },
            ].map((step, i) => (
              <div key={i} className="text-center p-6 rounded-2xl bg-muted/50 border border-transparent hover:border-border transition-colors">
                <div className="text-3xl mb-4">{step.icon}</div>
                <h3 className="font-serif font-bold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-foreground/60">{step.desc}</p>
              </div>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}
