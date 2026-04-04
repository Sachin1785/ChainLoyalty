import * as React from "react";
import { type ChainLoyaltyClient } from "../client";
import { useRewardBalance, useRewardHistory } from "../hooks";

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

import { ConnectWalletButton } from "./ConnectWalletButton";

export interface RewardsDashboardProps {
  client: ChainLoyaltyClient;
  walletAddress: string;
  historyPageSize?: number;
  title?: string;
  theme?: RewardsDashboardTheme;
  className?: string;
  style?: React.CSSProperties;
  onConnect?: (address: string) => void;
}

const defaultTheme: Required<RewardsDashboardTheme> = {
  background: "#ffffff",
  foreground: "#000000",
  muted: "#666666",
  border: "#000000",
  accent: "#8ED670", // Greenish
  shadow: "8px 8px 0 0 black",
  fontFamily: "ui-sans-serif, system-ui, sans-serif",
  cardBase: "#ffffff",
  statBg: "#f3f4f6",
  itemBg: "#ffffff",
  tableRowBg: "#ffffff",
  tableRowAltBg: "#f9f9f9",
};

export function RewardsDashboard({
  client,
  walletAddress,
  historyPageSize = 5,
  title = "My Rewards",
  theme,
  className,
  style,
  onConnect,
}: RewardsDashboardProps) {
  const palette = { ...defaultTheme, ...(theme ?? {}) };
  const balance = useRewardBalance(client, walletAddress);
  const history = useRewardHistory(client, walletAddress, 1, historyPageSize);

  if (!walletAddress) {
    return (
      <section className={className} style={{ fontFamily: palette.fontFamily, color: palette.foreground, ...style }}>
        <div style={{ background: palette.cardBase, border: `4px solid ${palette.border}`, borderRadius: 16, padding: 32, boxShadow: palette.shadow, textAlign: "center" }}>
          <h2 style={{ fontSize: 24, fontWeight: 900, margin: "0 0 16px 0" }}>{title}</h2>
          <p style={{ fontWeight: 700, opacity: 0.7, marginBottom: 20 }}>Connect your wallet to see your points and rewards!</p>
          <ConnectWalletButton onConnect={(addr) => onConnect?.(addr)} />
        </div>
      </section>
    );
  }

  if (balance.isPending) {
    return (
      <div style={{ fontFamily: palette.fontFamily, color: palette.foreground, padding: 24, textAlign: "center" }}>
        <p>Loading {title}...</p>
      </div>
    );
  }

  const data = balance.data;

  return (
    <section 
      className={className} 
      style={{ 
        fontFamily: palette.fontFamily, 
        color: palette.foreground, 
        width: "100%", 
        ...style 
      }}
    >
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 32, fontWeight: 900, textTransform: "uppercase", letterSpacing: -1 }}>
          {title}
        </h2>
        <p style={{ margin: 4, fontSize: 13, fontWeight: 700, color: palette.muted, fontFamily: "monospace" }}>
          {walletAddress.slice(0, 10)}...{walletAddress.slice(-6)}
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 32 }}>
        <StatCard 
          label="Total Points" 
          value={data?.pointsBalance.toLocaleString() ?? "0"} 
          accent={palette.accent} 
          palette={palette}
        />
        <StatCard 
          label="Badges Earned" 
          value={String(data?.badges.length ?? 0)} 
          accent="#FEBDD2" 
          palette={palette}
        />
      </div>

      <div style={{ 
        background: palette.cardBase, border: `4px solid ${palette.border}`, 
        borderRadius: 16, overflow: "hidden", boxShadow: palette.shadow 
      }}>
        <div style={{ padding: 16, borderBottom: `4px solid ${palette.border}`, background: palette.border, color: palette.accent }}>
          <h3 style={{ margin: 0, fontWeight: 900, textTransform: "uppercase", fontSize: 18 }}>Recent Activity</h3>
        </div>
        
        <div style={{ display: "flex", flexDirection: "column" }}>
          {history.data?.items.length ? (
            history.data.items.map((item, i) => (
              <div 
                key={item.id} 
                style={{ 
                  display: "flex", alignItems: "center", justifyContent: "space-between", 
                  padding: "16px 24px", 
                  background: i % 2 === 0 ? palette.tableRowBg : palette.tableRowAltBg,
                  borderBottom: i === history.data.items.length - 1 ? "none" : `2px dashed ${palette.border}`
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ 
                    padding: "4px 8px", borderRadius: 8, border: `2px solid ${palette.border}`,
                    background: item.rewardType === "points" ? "#FFD703" : "#FEBDD2",
                    fontSize: 10, fontWeight: 900, textTransform: "uppercase"
                  }}>
                    {item.rewardType}
                  </div>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{item.reason}</span>
                </div>
                <div style={{ fontWeight: 900, fontSize: 16 }}>
                  {item.amount && item.amount > 0 ? `+${item.amount}` : item.amount}
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: 32, textAlign: "center", fontWeight: 700, color: palette.muted }}>
              No activity yet.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function StatCard({ label, value, accent, palette }: { label: string; value: string; accent: string; palette: any }) {
  return (
    <div style={{ 
      background: palette.cardBase, border: `4px solid ${palette.border}`, 
      borderRadius: 16, padding: 20, boxShadow: "4px 4px 0 0 black",
      display: "flex", flexDirection: "column", gap: 8
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
        <span style={{ fontSize: 12, fontWeight: 900, textTransform: "uppercase", color: palette.muted }}>{label}</span>
        <div style={{ 
          width: 32, height: 32, borderRadius: 8, border: `2px solid ${palette.border}`, 
          background: accent, boxShadow: "2px 2px 0 0 black"
        }} />
      </div>
      <span style={{ fontSize: 32, fontWeight: 900 }}>{value}</span>
    </div>
  );
}
