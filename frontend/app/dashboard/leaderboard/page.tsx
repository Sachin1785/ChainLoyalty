'use client';

import { useEffect, useState } from "react";
import { NeoCard } from "@/components/ui/NeoCard";
import { NeoBadge } from "@/components/ui/NeoBadge";
import { Crown, Medal, Award } from "lucide-react";

const TOP_COLORS = ["bg-neo-yellow", "bg-white", "bg-neo-pink"];
const TOP_ICONS = [Crown, Medal, Award];

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/v1/rewards/leaderboard")
      .then(r => r.json())
      .then(data => {
        setLeaders(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Leaderboard fetch error:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-4xl font-black animate-bounce">Loading rankings...</div>
      </div>
    );
  }

  const top3 = leaders.slice(0, 3);
  const rest = leaders.slice(3);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black uppercase tracking-tighter">Leaderboard</h1>
        <p className="font-bold text-sm mt-1 opacity-70">Top point earners this month</p>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-3 gap-4 items-end">
        {[top3[1], top3[0], top3[2]].filter(Boolean).map((leader, i) => {
          const actualRank = leader.rank;
          const height = actualRank === 1 ? "h-48" : actualRank === 2 ? "h-36" : "h-28";
          const Icon = TOP_ICONS[actualRank - 1];
          const color = TOP_COLORS[actualRank - 1];

          return (
            <div key={leader.rank} className="flex flex-col items-center gap-3">
              <div className="text-center">
                <div className={`w-16 h-16 mx-auto mb-2 rounded-full border-4 border-black ${color} flex items-center justify-center shadow-[4px_4px_0_0_black] text-2xl`}>
                  {Icon ? <Icon size={28} /> : <span>#{actualRank}</span>}
                </div>
                <p className="font-black text-xs truncate max-w-[100px]">{leader.wallet}</p>
                <p className="font-black text-lg">{leader.points.toLocaleString()} pts</p>
              </div>
              <div className={`w-full ${height} ${color} border-4 border-black rounded-t-2xl flex items-start justify-center pt-3 shadow-[4px_4px_0_0_black]`}>
                <span className="font-black text-4xl">#{actualRank}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Table */}
      <NeoCard className="overflow-hidden" hover={false}>
        <div className="p-4 border-b-4 border-black bg-black text-neo-yellow">
          <h2 className="font-black uppercase">All Rankings</h2>
        </div>
        <div className="divide-y-2 divide-dashed divide-black">
          {leaders.map((leader: any) => (
            <div key={leader.rank} className={`flex items-center justify-between px-6 py-4 ${leader.rank <= 3 ? "bg-neo-yellow/30" : ""}`}>
              <div className="flex items-center gap-5">
                <span className="font-black text-xl w-8 text-center">#{leader.rank}</span>
                <div>
                  <p className="font-black">{leader.wallet}</p>
                  <p className="text-xs font-bold opacity-60">{leader.badges} badges</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-black text-lg">{leader.points.toLocaleString()}</span>
                <span className="font-bold text-xs opacity-60">pts</span>
              </div>
            </div>
          ))}
        </div>
      </NeoCard>
    </div>
  );
}
