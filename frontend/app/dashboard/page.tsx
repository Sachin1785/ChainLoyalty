'use client';

import { useEffect, useState } from "react";
import { NeoCard } from "@/components/ui/NeoCard";
import { NeoBadge } from "@/components/ui/NeoBadge";
import { NeoButton } from "@/components/ui/NeoButton";
import { useAuth } from "@/lib/auth-context";
import { Star, Trophy, Users, TrendingUp, Zap, Copy, Check } from "lucide-react";
import Link from "next/link";

const API_BASE = "http://localhost:8000/api/v1";

interface ActivityItem { 
  id: number; 
  type: string; 
  amount: number; 
  reason: string; 
  status?: string;
  certificate?: any;
  created_at: string; 
}

interface StatsData {
  total_points: number;
  redeemed_points: number;
  badge_count: number;
  referral_count: number;
  referral_code: string;
  recent_activity: ActivityItem[];
}

function StatCard({ label, value, color, icon: Icon }: { label: string; value: string | number; color: string; icon: React.ElementType }) {
  return (
    <NeoCard className={`p-6 ${color}`} hover={false}>
      <div className="flex justify-between items-start mb-4">
        <p className="font-black uppercase text-xs tracking-widest">{label}</p>
        <div className="w-9 h-9 bg-neo-white border-2 border-black rounded-lg flex items-center justify-center shadow-[3px_3px_0_0_black]">
          <Icon size={18} />
        </div>
      </div>
      <p className="text-5xl font-black leading-none">{value}</p>
    </NeoCard>
  );
}

export default function DashboardPage() {
  const { address } = useAuth();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!address) return;
    setLoading(true);
    fetch(`${API_BASE}/rewards/${address}/stats`)
      .then((r) => r.json())
      .then((data) => { 
        setStats(data); 
        setLoading(false); 
      })
      .catch((err) => {
        console.error("Dashboard fetch error:", err);
        setLoading(false);
      });
  }, [address]);


  const copyReferral = () => {
    if (stats?.referral_code) {
      navigator.clipboard.writeText(stats.referral_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-4xl font-black animate-bounce">Fetching rewards...</div>
      </div>
    );
  }

  const activityColors: Record<string, "yellow" | "green" | "blue" | "pink"> = {
    points: "yellow",
    badge: "green",
    referral: "blue",
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black uppercase tracking-tighter">My Dashboard</h1>
        <p className="font-bold text-sm mt-1 opacity-70">
          {address ? `${address.slice(0, 10)}...${address.slice(-6)}` : ""}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Points" value={(stats?.total_points ?? 0).toLocaleString()} color="bg-neo-yellow" icon={Star} />
        <StatCard label="Badges Earned" value={stats?.badge_count ?? 0} color="bg-neo-pink" icon={Trophy} />
        <StatCard label="Referrals" value={stats?.referral_count ?? 0} color="bg-neo-blue" icon={Users} />
        <StatCard label="Points Spent" value={(stats?.redeemed_points ?? 0).toLocaleString()} color="bg-neo-green" icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <NeoCard className="p-6 lg:col-span-2" hover={false}>
          <h2 className="text-xl font-black uppercase tracking-tight mb-4">Recent Activity</h2>
          {stats?.recent_activity?.length ? (
            <div className="divide-y-2 divide-dashed divide-black">
              {stats.recent_activity.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <NeoBadge variant={activityColors[item.type] ?? "pink"}>
                      {item.type}
                    </NeoBadge>
                    <span className="font-bold text-sm">{item.reason}</span>
                    {item.status && <NeoBadge variant="blue" className="text-[10px] scale-90">{item.status}</NeoBadge>}
                    {item.certificate && (
                      <button 
                        onClick={() => {
                          alert(JSON.stringify(item.certificate, null, 2));
                        }} 
                        className="text-[10px] font-black underline decoration-2 underline-offset-2 hover:text-neo-pink"
                      >
                        VIEW CERT
                      </button>
                    )}
                  </div>
                  <span className="font-black">{item.amount > 0 ? `+${item.amount}` : item.amount}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="font-bold text-center py-8 opacity-50">No activity yet. Trigger your first event!</p>
          )}
        </NeoCard>

        <div className="space-y-6">
          {/* Referral Card */}
          <NeoCard className="p-6 bg-neo-pink" hover={false}>
            <h2 className="text-xl font-black uppercase tracking-tight mb-4">Your Referral Code</h2>
            <div className="bg-white border-3 border-black rounded-xl p-3 flex items-center justify-between shadow-[4px_4px_0_0_black] mb-4">
              <span className="font-black text-lg tracking-widest">{stats?.referral_code}</span>
              <button onClick={copyReferral} className="p-1 hover:scale-110 transition-transform">
                {copied ? <Check size={20} className="text-green-600" /> : <Copy size={20} />}
              </button>
            </div>
            <p className="font-bold text-sm">Share this code. Earn <strong>200 pts</strong> per referral!</p>
          </NeoCard>

          {/* Spin CTA */}
          <NeoCard className="p-6 bg-neo-green" hover={false}>
            <h2 className="text-xl font-black uppercase tracking-tight mb-2">Feeling Lucky?</h2>
            <p className="font-bold text-sm mb-4">Spend 500 pts to spin the reward wheel and win NFTs, tokens, or bonus points!</p>
            <Link href="/dashboard/spin">
              <NeoButton className="w-full bg-black text-neo-yellow" size="md">
                <Zap size={18} /> Spin Now
              </NeoButton>
            </Link>
          </NeoCard>
        </div>
      </div>
    </div>
  );
}
