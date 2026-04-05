"use client";
import { useEffect, useState } from "react";
import { NeoCard } from "@/components/ui/NeoCard";
import { NeoButton } from "@/components/ui/NeoButton";
import { NeoBadge } from "@/components/ui/NeoBadge";
import { Copy, Check, Users, Star, Share2, MessageSquare } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const API_BASE = "http://127.0.0.1:8000/api/v1";

interface Referral {
  wallet_address: string;
  created_at: string;
  status?: string; // Optional for future use
}

export default function ReferralsPage() {
  const { address } = useAuth();
  const [referralCode, setReferralCode] = useState<string>("");
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [copied, setCopied] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyCode, setVerifyCode] = useState("");
  const [verifyResult, setVerifyResult] = useState<null | { success: boolean; message: string }>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!address) return;
    
    // Fetch user's own referral code
    fetch(`${API_BASE}/referrals/code/${address}`)
      .then((r) => r.json())
      .then((data) => setReferralCode(data.referral_code))
      .catch(console.error);

    // Fetch referral network
    fetch(`${API_BASE}/referrals/${address}/list`)
      .then((r) => r.json())
      .then((data) => {
        setReferrals(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [address]);

  const copy = () => {
    if (referralCode) {
      navigator.clipboard.writeText(referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareToBluesky = () => {
    const text = encodeURIComponent(`Join ChainLoyalty and earn exclusive rewards! My referral code: ${referralCode}`);
    window.open(`https://bsky.app/intent/compose?text=${text}`, "_blank");
  };

  const verifyReferral = async () => {
    if (!verifyCode.trim() || !address) return;
    setVerifying(true);
    setVerifyResult(null);
    try {
      const res = await fetch(`${API_BASE}/referrals/verify?wallet_address=${address}&referral_code=${verifyCode}&program_id=default`, {
        method: "POST"
      });
      const data = await res.json();
      if (res.ok) {
        setVerifyResult({ success: true, message: "Referral applied! Bonus points added to your wallet." });
      } else {
        setVerifyResult({ success: false, message: data.detail || "Invalid code" });
      }
    } catch {
      setVerifyResult({ success: false, message: "Connection error" });
    } finally {
      setVerifying(false);
    }
  };

  const totalEarned = referrals.length * 200;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-4xl font-black animate-bounce">Loading network...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black uppercase tracking-tighter">Referrals</h1>
        <p className="font-bold text-sm mt-1 opacity-70">Refer friends. Earn rewards. Repeat.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <NeoCard className="p-6 bg-neo-blue text-center" hover={false}>
          <p className="font-black text-4xl">{referrals.length}</p>
          <p className="font-black text-xs uppercase tracking-widest mt-1">Total Referred</p>
        </NeoCard>
        <NeoCard className="p-6 bg-neo-green text-center" hover={false}>
          <p className="font-black text-4xl">{referrals.length}</p>
          <p className="font-black text-xs uppercase tracking-widest mt-1">Active</p>
        </NeoCard>
        <NeoCard className="p-6 bg-neo-pink text-center" hover={false}>
          <p className="font-black text-4xl">CHECK ON-CHAIN</p>
          <p className="font-black text-xs uppercase tracking-widest mt-1">Total Rewards Earned</p>
        </NeoCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Your Code */}
        <NeoCard className="p-6 bg-neo-yellow" hover={false}>
          <h2 className="text-xl font-black uppercase mb-4 flex items-center gap-2">
            <Share2 size={20} /> Share Your Code
          </h2>
          <div className="flex gap-4">
            <div className="flex-1 bg-neo-white border-4 border-black rounded-xl p-4 flex items-center justify-between shadow-[6px_6px_0_0_black]">
              <span className="font-black text-2xl tracking-[0.2em]">{referralCode || "LOADING..."}</span>
              <button onClick={copy} title="Copy Code" className="p-2 hover:scale-110 transition-transform">
                {copied ? <Check size={22} className="text-green-600" /> : <Copy size={22} />}
              </button>
            </div>
            <button 
              onClick={shareToBluesky}
              className="bg-[#0085FF] border-4 border-black rounded-xl p-4 shadow-[6px_6px_0_0_black] hover:-translate-y-1 transition-all flex items-center justify-center text-white"
              title="Share on Bluesky"
            >
              <MessageSquare size={24} fill="white" />
            </button>
          </div>
          <p className="font-bold text-sm mt-6">Share your code! You and your friend both earn <strong>Bonus Loyalty Points</strong> instantly.</p>
        </NeoCard>

        {/* Enter a Referral Code */}
        <NeoCard className="p-6 bg-neo-white" hover={false}>
          <h2 className="text-xl font-black uppercase mb-4 flex items-center gap-2">
            <Star size={20} /> Got a Code?
          </h2>
          <input
            className="w-full border-3 border-black rounded-xl px-4 py-3 font-black text-lg tracking-widest focus:outline-none focus:shadow-[4px_4px_0_0_black] mb-4 transition-shadow"
            placeholder="CHAIN-XXXXXX"
            value={verifyCode}
            onChange={(e) => setVerifyCode(e.target.value.toUpperCase())}
          />
          {verifyResult && (
            <div className={`border-3 border-black rounded-xl p-3 mb-4 font-bold text-sm ${verifyResult.success ? "bg-neo-green" : "bg-neo-red text-white"}`}>
              {verifyResult.message}
            </div>
          )}
          <NeoButton
            variant="primary"
            className="w-full"
            onClick={verifyReferral}
            disabled={verifying || !verifyCode}
          >
            {verifying ? "Verifying..." : "Apply Referral Code"}
          </NeoButton>
        </NeoCard>
      </div>

      {/* Referrals Table */}
      <NeoCard className="overflow-hidden" hover={false}>
        <div className="p-4 border-b-4 border-black bg-black text-neo-yellow">
          <h2 className="font-black uppercase flex items-center gap-2"><Users size={18} /> Your Network</h2>
        </div>
        <div className="divide-y-2 divide-dashed divide-black">
          {referrals.length > 0 ? referrals.map((r, i) => (
            <div key={i} className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-full bg-neo-yellow border-2 border-black flex items-center justify-center font-black text-sm">
                  {i + 1}
                </div>
                <div>
                  <p className="font-black text-sm md:text-base">{r.wallet_address}</p>
                  <p className="text-xs font-bold opacity-60">{new Date(r.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-black text-sm">REWARD SENT</span>
                <NeoBadge variant="green">active</NeoBadge>
              </div>
            </div>
          )) : (
            <div className="p-12 text-center">
              <p className="font-bold opacity-50">No referrals yet. Spread the word!</p>
            </div>
          )}
        </div>
      </NeoCard>
    </div>
  );
}

