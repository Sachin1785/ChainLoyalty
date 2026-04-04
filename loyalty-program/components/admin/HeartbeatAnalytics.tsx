"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Award, Trophy, Activity, Users, Share2, TrendingUp } from "lucide-react";

// ─── Data ───────────────────────────────────────────────────────────────────
interface CompanyData {
  id: string;
  name: string;
  color: string;
  accentHex: string;
  logo: string;
  activeWallets: number;
  pointsIssued: number;
  referrals: number;
  growth: string;
  badgeDist: { bronze: number; silver: number; gold: number; platinum: number };
  monthlyPoints: number[];    // 12 data points
  referralTrend: number[];    // 12 data points
  customerSegments: { label: string; pct: number; color: string }[];
}

const COMPANIES: CompanyData[] = [
  {
    id: "brewbound",
    name: "Brewbound",
    color: "bg-[#3E1C00]",
    accentHex: "#6B3A1F",
    logo: "https://ui-avatars.com/api/?name=BB&background=3E1C00&color=F5E0C9",
    activeWallets: 42800,
    pointsIssued: 12400000,
    referrals: 8924,
    growth: "+18.2%",
    badgeDist: { bronze: 1204, silver: 842, gold: 312, platinum: 48 },
    monthlyPoints: [820, 950, 1080, 1250, 1400, 1620, 1850, 2100, 2450, 3000, 3800, 4600],
    referralTrend: [120, 145, 175, 210, 255, 310, 380, 450, 540, 650, 800, 980],
    customerSegments: [
      { label: "Repeat Buyers", pct: 42, color: "#6B3A1F" },
      { label: "New Users", pct: 28, color: "#8B4A2B" },
      { label: "Referral-Driven", pct: 18, color: "#B07050" },
      { label: "Dormant", pct: 12, color: "#D4A882" },
    ],
  },
  {
    id: "bookmyshow",
    name: "BookMyShow",
    color: "bg-[#111111]",
    accentHex: "#111111",
    logo: "https://ui-avatars.com/api/?name=BMS&background=111111&color=ffffff",
    activeWallets: 890000,
    pointsIssued: 245000000,
    referrals: 142398,
    growth: "+24.5%",
    badgeDist: { bronze: 45012, silver: 31024, gold: 12402, platinum: 1240 },
    monthlyPoints: [12000, 18000, 28000, 42000, 58000, 72000, 88000, 102000, 118000, 128000, 136000, 142000],
    referralTrend: [2400, 3800, 6000, 9200, 13000, 17500, 22000, 27000, 33000, 38000, 43000, 48000],
    customerSegments: [
      { label: "Movie-goers", pct: 38, color: "#111111" },
      { label: "Sports Fans", pct: 24, color: "#444444" },
      { label: "Concert Crowd", pct: 22, color: "#777777" },
      { label: "Casual", pct: 16, color: "#AAAAAA" },
    ],
  },
  {
    id: "hyperlocal",
    name: "HyperLocal",
    color: "bg-blue-500",
    accentHex: "#3B82F6",
    logo: "https://ui-avatars.com/api/?name=HL&background=BFDBFE&color=1E40AF",
    activeWallets: 156000,
    pointsIssued: 52000000,
    referrals: 24801,
    growth: "+12.1%",
    badgeDist: { bronze: 18240, silver: 12014, gold: 4120, platinum: 612 },
    monthlyPoints: [3200, 5800, 9400, 14000, 18500, 22000, 21000, 19500, 18000, 20000, 23500, 28000],
    referralTrend: [620, 1100, 1900, 3000, 4200, 5500, 5200, 4700, 4200, 5000, 6200, 7800],
    customerSegments: [
      { label: "Daily Shoppers", pct: 45, color: "#3B82F6" },
      { label: "Weekend Users", pct: 30, color: "#60A5FA" },
      { label: "Power Buyers", pct: 15, color: "#93C5FD" },
      { label: "Lapsed", pct: 10, color: "#BFDBFE" },
    ],
  },
  {
    id: "zenith",
    name: "Zenith",
    color: "bg-purple-600",
    accentHex: "#9333EA",
    logo: "https://ui-avatars.com/api/?name=ZA&background=E9D5FF&color=6B21A8",
    activeWallets: 12200,
    pointsIssued: 4200000,
    referrals: 1402,
    growth: "+6.8%",
    badgeDist: { bronze: 4200, silver: 2840, gold: 1102, platinum: 204 },
    monthlyPoints: [2800, 2500, 2200, 1950, 1720, 1500, 1300, 1120, 950, 800, 660, 520],
    referralTrend: [380, 340, 295, 255, 218, 185, 155, 128, 104, 84, 66, 50],
    customerSegments: [
      { label: "Platinum Members", pct: 28, color: "#9333EA" },
      { label: "VIP Gold", pct: 34, color: "#A855F7" },
      { label: "Silver Tier", pct: 26, color: "#C084FC" },
      { label: "Newcomers", pct: 12, color: "#E9D5FF" },
    ],
  },
];

interface LeaderboardEntry {
  rank: number;
  wallet: string;
  points: number;
  badges: number;
}

const MONTHS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

// ─── Utility Charts ──────────────────────────────────────────────────────────

function LineChart({ data, color, chartId }: { data: number[]; color: string; chartId: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const W = 300;
  const H = 80;
  const gradId = `lg-${chartId}`;
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * W,
    y: 8 + ((max - v) / range) * (H - 16),
  }));
  // Smooth bezier curve
  const pathD = pts.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = pts[i - 1];
    const cpx = (prev.x + p.x) / 2;
    return `${acc} C ${cpx} ${prev.y} ${cpx} ${p.y} ${p.x} ${p.y}`;
  }, "");
  const areaD = `${pathD} L ${pts[pts.length - 1].x} ${H} L 0 ${H} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#${gradId})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => i === pts.length - 1 ? (
        <circle key={i} cx={p.x} cy={p.y} r="3.5" fill={color} />
      ) : null)}
    </svg>
  );
}

function DonutChart({ segments }: { segments: { pct: number; color: string; label: string }[] }) {
  const r = 38;
  const cx = 50;
  const cy = 50;
  const circumference = 2 * Math.PI * r;
  let offset = 0;
  const slices = segments.map((s) => {
    const len = (s.pct / 100) * circumference;
    const dashoffset = -(offset);
    offset += len;
    return { ...s, len, dashoffset };
  });

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" style={{ transform: "rotate(-90deg)" }}>
      {slices.map((s, i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={s.color}
          strokeWidth="14"
          strokeDasharray={`${s.len} ${circumference - s.len}`}
          strokeDashoffset={s.dashoffset}
          className="transition-all duration-700"
        />
      ))}
      <circle cx={cx} cy={cy} r="28" fill="white" />
    </svg>
  );
}

function MiniBar({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  return (
    <div className="flex items-end gap-0.5 h-full w-full">
      {data.map((v, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          animate={{ height: `${(v / max) * 100}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 20, delay: i * 0.03 }}
          className="flex-1 rounded-sm opacity-80 hover:opacity-100 transition-opacity"
          style={{ backgroundColor: color, minHeight: 2 }}
        />
      ))}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function HeartbeatAnalytics() {
  const [selectedId, setSelectedId] = useState(COMPANIES[0].id);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const co = COMPANIES.find((c) => c.id === selectedId) || COMPANIES[0];

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/v1/rewards/leaderboard?limit=12&program_id=default")
      .then((r) => r.json())
      .then(setLeaderboard)
      .catch(() => {});
  }, []);

  const totalBadges = Object.values(co.badgeDist).reduce((a, b) => a + b, 0);

  return (
    <div className="h-full flex flex-col bg-[#F8F7F3] overflow-hidden">
      {/* ── Top Nav: Company Switcher ── */}
      <div className="flex items-center gap-2 px-4 py-3 bg-white border-b border-gray-100 flex-shrink-0">
        <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest mr-2">Partner</span>
        {COMPANIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedId(c.id)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              selectedId === c.id
                ? "bg-black text-white border-black shadow"
                : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
            }`}
          >
            {c.name}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-600 rounded-xl border border-green-100 text-[10px] font-black uppercase tracking-widest">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          {co.growth}
        </div>
      </div>

      {/* ── Dashboard Body ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedId}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="flex-1 min-h-0 grid grid-cols-12 gap-3 p-3"
        >
          {/* ======= LEFT 8 COLS: ANALYTICS ======= */}
          <div className="col-span-8 grid grid-rows-[auto_1fr_1fr] gap-3 min-h-0">
            
            {/* Row 1: 4 KPI chips */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "Active Wallets", val: co.activeWallets.toLocaleString(), icon: <Users size={14} />, sub: co.growth },
                { label: "Points Issued", val: co.pointsIssued >= 1e6 ? `${(co.pointsIssued / 1e6).toFixed(1)}M` : `${(co.pointsIssued/1000).toFixed(0)}K`, icon: <TrendingUp size={14} />, sub: "+12.4% WoW" },
                { label: "Referrals Made", val: co.referrals.toLocaleString(), icon: <Share2 size={14} />, sub: "+8.2% MoM" },
                { label: "Badges Minted", val: totalBadges.toLocaleString(), icon: <Award size={14} />, sub: `${co.badgeDist.platinum} Platinum` },
              ].map((item) => (
                <div key={item.label} className="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm flex flex-col gap-1">
                  <div className="flex items-center justify-between text-gray-400">
                    {item.icon}
                    <span className="text-[9px] font-black text-green-500 uppercase">{item.sub}</span>
                  </div>
                  <div className="text-xl font-black text-gray-900 mt-1">{item.val}</div>
                  <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{item.label}</div>
                </div>
              ))}
            </div>

            {/* Row 2: LINE CHART – Monthly Points */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-2 flex-shrink-0">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-gray-900">Monthly Points Distribution</h4>
                  <p className="text-[9px] font-bold text-gray-400 mt-0.5">Accrual volume across 12 calendar months</p>
                </div>
                <span className="text-[9px] bg-gray-50 border border-gray-100 text-gray-500 px-2 py-1 rounded font-black uppercase">12 Period</span>
              </div>
              <div className="flex-1 min-h-0 relative">
                <LineChart data={co.monthlyPoints} color={co.accentHex} chartId={`mp-${co.id}`} />
              </div>
              <div className="flex justify-between pt-1 flex-shrink-0">
                {MONTHS.map((m, i) => (
                  <span key={i} className="text-[8px] font-black text-gray-300 uppercase">{m}</span>
                ))}
              </div>
            </div>

            {/* Row 3: BAR CHART – Referral Trend + Badge horizontal bars */}
            <div className="grid grid-cols-2 gap-3 min-h-0">
              {/* Referral Trend Bars */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col min-h-0">
                <div className="flex-shrink-0 mb-2">
                  <h4 className="text-xs font-black uppercase tracking-widest text-gray-900">Referral Trend</h4>
                  <p className="text-[9px] font-bold text-gray-400">New wallets joined via referral links</p>
                </div>
                <div className="flex-1 min-h-0">
                  <MiniBar data={co.referralTrend} color={co.accentHex} key={co.id} />
                </div>
                <div className="flex justify-between pt-1 flex-shrink-0">
                  {MONTHS.map((m, i) => (
                    <span key={i} className="text-[8px] font-black text-gray-300 uppercase">{m}</span>
                  ))}
                </div>
              </div>

              {/* Badge Tier Horizontal Bars */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-2 min-h-0">
                <h4 className="text-xs font-black uppercase tracking-widest text-gray-900 flex-shrink-0">Badge Tier Split</h4>
                {[
                  { label: "Bronze", val: co.badgeDist.bronze, color: "#F97316", icon: "🥉" },
                  { label: "Silver", val: co.badgeDist.silver, color: "#9CA3AF", icon: "🥈" },
                  { label: "Gold", val: co.badgeDist.gold, color: "#EAB308", icon: "🥇" },
                  { label: "Platinum", val: co.badgeDist.platinum, color: "#9333EA", icon: "💎" },
                ].map((tier) => {
                  const pct = ((tier.val / totalBadges) * 100).toFixed(1);
                  return (
                    <div key={tier.label} className="flex items-center gap-2 flex-1 min-h-0">
                      <span className="text-sm w-5 flex-shrink-0">{tier.icon}</span>
                      <div className="flex-1 flex items-center gap-2 min-w-0">
                        <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ type: "spring", stiffness: 200, damping: 20 }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: tier.color }}
                          />
                        </div>
                        <span className="text-[9px] font-black text-gray-400 w-8 text-right">{pct}%</span>
                      </div>
                      <span className="text-[9px] font-black text-gray-600 w-12 text-right">{tier.val.toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ======= RIGHT 4 COLS: DONUT + LEADERBOARD ======= */}
          <div className="col-span-4 grid grid-rows-[auto_1fr] gap-3 min-h-0">
            
            {/* Customer Segments Donut */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col">
              <h4 className="text-xs font-black uppercase tracking-widest text-gray-900 mb-3">Customer Segments</h4>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 flex-shrink-0">
                  <DonutChart segments={co.customerSegments} />
                </div>
                <div className="flex-1 space-y-2">
                  {co.customerSegments.map((s) => (
                    <div key={s.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                        <span className="text-[9px] font-bold text-gray-600 leading-none">{s.label}</span>
                      </div>
                      <span className="text-[10px] font-black text-gray-900">{s.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Global Leaderboard */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden min-h-0">
              <div className="p-4 border-b border-gray-50 flex-shrink-0 flex items-center gap-2">
                <Trophy size={14} className="text-yellow-500" />
                <h4 className="text-xs font-black uppercase tracking-widest text-gray-900">Global Leaderboard</h4>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {leaderboard.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-300 gap-2 p-4">
                    <Activity size={20} />
                    <p className="text-[9px] font-black uppercase text-center">No activity yet. Minting will populate this.</p>
                  </div>
                ) : (
                  <div className="p-2 space-y-1">
                    {leaderboard.map((u) => (
                      <div
                        key={u.wallet}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors group"
                      >
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black flex-shrink-0 ${
                            u.rank === 1 ? "bg-yellow-400 text-white" :
                            u.rank === 2 ? "bg-gray-300 text-white" :
                            u.rank === 3 ? "bg-orange-400 text-white" :
                            "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {u.rank}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-black text-gray-700 font-mono truncate">{u.wallet}</p>
                          <p className="text-[8px] font-bold text-gray-300 uppercase">{u.badges} badge{u.badges !== 1 ? "s" : ""}</p>
                        </div>
                        <span className="text-[10px] font-black text-emerald-600 flex-shrink-0">{u.points.toLocaleString()} pts</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
