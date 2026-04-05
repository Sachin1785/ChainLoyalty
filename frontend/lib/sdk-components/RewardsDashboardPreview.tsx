"use client";

import React from "react";

export interface RewardsDashboardTheme {
  background?: string;
  foreground?: string;
  muted?: string;
  border?: string;
  accent?: string;
  shadow?: string;
  fontFamily?: string;
  cardBase?: string;
  statBg?: string;
  itemBg?: string;
  tableRowBg?: string;
  tableRowAltBg?: string;
}

interface RewardsDashboardPreviewProps {
  walletAddress?: string;
  title?: string;
  theme?: RewardsDashboardTheme;
  className?: string;
  style?: React.CSSProperties;
}

const defaultTheme: Required<RewardsDashboardTheme> = {
  background: "#ffffff",
  foreground: "#000000",
  muted: "#666666",
  border: "#000000",
  accent: "#8ED670",
  shadow: "8px 8px 0 0 black",
  fontFamily: "ui-sans-serif, system-ui, sans-serif",
  cardBase: "#ffffff",
  statBg: "#f3f4f6",
  itemBg: "#ffffff",
  tableRowBg: "#ffffff",
  tableRowAltBg: "#f9f9f9",
};

const MOCK_BALANCE = { pointsBalance: 3_480, badges: ["early_adopter", "first_tx"] };
const MOCK_HISTORY = [
  { id: "1", rewardType: "points", reason: "Referral bonus", amount: 200 },
  { id: "2", rewardType: "badge",  reason: "Early Adopter badge unlocked", amount: 0 },
  { id: "3", rewardType: "points", reason: "Daily login streak", amount: 50 },
  { id: "4", rewardType: "points", reason: "Quest: Follow Twitter", amount: 100 },
  { id: "5", rewardType: "points", reason: "Spin Wheel prize", amount: 75 },
];

function StatCard({ label, value, accent, palette }: { label: string; value: string; accent: string; palette: any }) {
  return (
    <div style={{ background: palette.cardBase, border: `4px solid ${palette.border}`, borderRadius: 16, padding: 20, boxShadow: "4px 4px 0 0 black", display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
        <span style={{ fontSize: 12, fontWeight: 900, textTransform: "uppercase", color: palette.muted }}>{label}</span>
        <div style={{ width: 32, height: 32, borderRadius: 8, border: `2px solid ${palette.border}`, background: accent, boxShadow: "2px 2px 0 0 black" }} />
      </div>
      <span style={{ fontSize: 32, fontWeight: 900 }}>{value}</span>
    </div>
  );
}

export function RewardsDashboardPreview({
  walletAddress = "0xPreview...abcd",
  title = "My Rewards",
  theme,
  className,
  style,
}: RewardsDashboardPreviewProps) {
  const palette = { ...defaultTheme, ...(theme ?? {}) };

  return (
    <section className={className} style={{ fontFamily: palette.fontFamily, color: palette.foreground, width: "100%", ...style }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 32, fontWeight: 900, textTransform: "uppercase", letterSpacing: -1 }}>{title}</h2>
        <p style={{ margin: 4, fontSize: 13, fontWeight: 700, color: palette.muted, fontFamily: "monospace" }}>
          {walletAddress.slice(0, 10)}...{walletAddress.slice(-6)}
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 32 }}>
        <StatCard label="Total Points" value={MOCK_BALANCE.pointsBalance.toLocaleString()} accent={palette.accent} palette={palette} />
        <StatCard label="Badges Earned" value={String(MOCK_BALANCE.badges.length)} accent="#FEBDD2" palette={palette} />
      </div>

      <div style={{ background: palette.cardBase, border: `4px solid ${palette.border}`, borderRadius: 16, overflow: "hidden", boxShadow: palette.shadow }}>
        <div style={{ padding: 16, borderBottom: `4px solid ${palette.border}`, background: palette.border, color: palette.accent }}>
          <h3 style={{ margin: 0, fontWeight: 900, textTransform: "uppercase", fontSize: 18 }}>Recent Activity</h3>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {MOCK_HISTORY.map((item, i) => (
            <div
              key={item.id}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", background: i % 2 === 0 ? palette.tableRowBg : palette.tableRowAltBg, borderBottom: i === MOCK_HISTORY.length - 1 ? "none" : `2px dashed ${palette.border}` }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ padding: "4px 8px", borderRadius: 8, border: `2px solid ${palette.border}`, background: item.rewardType === "points" ? "#FFD703" : "#FEBDD2", fontSize: 10, fontWeight: 900, textTransform: "uppercase" }}>
                  {item.rewardType}
                </div>
                <span style={{ fontWeight: 700, fontSize: 14 }}>{item.reason}</span>
              </div>
              <div style={{ fontWeight: 900, fontSize: 16 }}>
                {item.amount > 0 ? `+${item.amount}` : "—"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
