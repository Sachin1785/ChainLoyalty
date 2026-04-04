import * as React from "react";
import { type ChainLoyaltyClient } from "../client";
import { useLeaderboard } from "../hooks";

export interface LeaderboardTheme {
  background?: string;
  foreground?: string;
  muted?: string;
  border?: string;
  accent?: string;
  shadow?: string;
  fontFamily?: string;
  cardBase?: string;
  podiumCol1?: string;
  podiumCol2?: string;
  podiumCol3?: string;
  tableRowBg?: string;
  tableRowAltBg?: string;
}

export interface LeaderboardProps {
  client: ChainLoyaltyClient;
  page?: number;
  pageSize?: number;
  title?: string;
  theme?: LeaderboardTheme;
  className?: string;
  style?: React.CSSProperties;
  showPodium?: boolean;
}

const defaultTheme: Required<LeaderboardTheme> = {
  background: "#ffffff",
  foreground: "#000000",
  muted: "#666666",
  border: "#000000",
  accent: "#FFD703",
  shadow: "8px 8px 0 0 black",
  fontFamily: "ui-sans-serif, system-ui, sans-serif",
  cardBase: "#ffffff",
  podiumCol1: "#FFD703", // Gold/Yellow
  podiumCol2: "#f3f4f6", // Silver/Grey
  podiumCol3: "#FEBDD2", // Bronze/Pink
  tableRowBg: "#ffffff",
  tableRowAltBg: "#f9f9f9",
};

export function Leaderboard({
  client,
  page = 1,
  pageSize = 10,
  title = "Leaderboard",
  theme,
  className,
  style,
  showPodium = true,
}: LeaderboardProps) {
  const palette = { ...defaultTheme, ...(theme ?? {}) };
  const board = useLeaderboard(client, page, pageSize);

  if (board.isPending) {
    return (
      <div style={{ fontFamily: palette.fontFamily, color: palette.foreground, padding: 24, textAlign: "center" }}>
        <p>Loading {title}...</p>
      </div>
    );
  }

  const items = board.data?.items ?? [];
  const top3 = items.slice(0, 3);
  const others = items.slice(3);

  const podiumOrder = [
    top3[1], // Rank 2
    top3[0], // Rank 1
    top3[2], // Rank 3
  ].filter(Boolean);

  const podiumColors = [palette.podiumCol2, palette.podiumCol1, palette.podiumCol3];
  const podiumHeights = ["70px", "100px", "50px"];

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
        <p style={{ margin: 4, fontSize: 14, fontWeight: 700, color: palette.muted }}>
          Top point earners this month
        </p>
      </div>

      {showPodium && items.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, alignItems: "end", marginBottom: 32, textAlign: "center" }}>
          {podiumOrder.map((leader, i) => {
            const actualRank = leader.rank;
            const color = [palette.podiumCol1, palette.podiumCol2, palette.podiumCol3][actualRank - 1];
            const height = actualRank === 1 ? "120px" : actualRank === 2 ? "90px" : "70px";
            
            return (
              <div key={leader.rank} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                <div style={{ marginBottom: 8 }}>
                  <div style={{ 
                    width: 56, height: 56, margin: "0 auto 8px auto", borderRadius: "50%", 
                    border: `4px solid ${palette.border}`, background: color,
                    display: "flex", alignItems: "center", justifyContent: "center", 
                    fontSize: 24, fontWeight: 900, boxShadow: "4px 4px 0 0 black"
                  }}>
                    {actualRank === 1 ? "👑" : actualRank === 2 ? "🥈" : "🥉"}
                  </div>
                  <p style={{ margin: 0, fontWeight: 900, fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", width: "100%", maxWidth: 80 }}>
                    {leader.walletAddress.slice(0, 6)}...{leader.walletAddress.slice(-4)}
                  </p>
                  <p style={{ margin: 0, fontWeight: 900, fontSize: 16 }}>{leader.score.toLocaleString()} pts</p>
                </div>
                <div style={{ 
                  width: "100%", height: height, background: color, border: `4px solid ${palette.border}`, 
                  borderRadius: "16px 16px 0 0", display: "flex", alignItems: "start", justifyContent: "center",
                  paddingTop: 12, boxShadow: "4px 4px 0 0 black"
                }}>
                  <span style={{ fontSize: 32, fontWeight: 900 }}>#{actualRank}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ 
        background: palette.cardBase, border: `4px solid ${palette.border}`, 
        borderRadius: 16, overflow: "hidden", boxShadow: palette.shadow 
      }}>
        <div style={{ padding: 16, borderBottom: `4px solid ${palette.border}`, background: palette.border, color: palette.accent }}>
          <h3 style={{ margin: 0, fontWeight: 900, textTransform: "uppercase", fontSize: 18 }}>All Rankings</h3>
        </div>
        
        <div style={{ display: "flex", flexDirection: "column" }}>
          {items.map((leader, i) => (
            <div 
              key={leader.rank} 
              style={{ 
                display: "flex", alignItems: "center", justifyContent: "space-between", 
                padding: "16px 24px", 
                background: leader.rank <= 3 ? `${palette.accent}33` : (i % 2 === 0 ? palette.tableRowBg : palette.tableRowAltBg),
                borderBottom: i === items.length - 1 ? "none" : `2px dashed ${palette.border}`
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span style={{ fontSize: 20, fontWeight: 900, width: 40, textAlign: "center" }}>#{leader.rank}</span>
                <div>
                  <p style={{ margin: 0, fontWeight: 900 }}>{leader.walletAddress.slice(0, 10)}...{leader.walletAddress.slice(-6)}</p>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: palette.muted }}>Points Earner</p>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 18, fontWeight: 900 }}>{leader.score.toLocaleString()}</span>
                <span style={{ fontSize: 12, fontWeight: 700, opacity: 0.7 }}>pts</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
