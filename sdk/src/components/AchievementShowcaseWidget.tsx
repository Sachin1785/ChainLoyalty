import React from "react";
import { useRewardHistory } from "../hooks";
import { ChainLoyaltyClient } from "../client/ChainLoyaltyClient";
import { ConnectWalletButton } from "./ConnectWalletButton";

export interface BadgeDef {
  id: string; // e.g., "early_adopter", "whale"
  name: string;
  description: string;
  imageUrl: string;
}

export interface AchievementShowcaseTheme {
  background?: string;
  foreground?: string;
  border?: string;
  shadow?: string;
  cardBase?: string;
  accent?: string;
  fontFamily?: string;
}
  
export interface AchievementShowcaseWidgetProps {
  client: ChainLoyaltyClient;
  walletAddress: string;
  availableBadges: BadgeDef[];
  title?: string;
  theme?: AchievementShowcaseTheme;
  onConnect?: (address: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

const defaultTheme: AchievementShowcaseTheme = {
  background: "#faf5ff",
  foreground: "#000000",
  border: "#000000",
  shadow: "6px 6px 0 0 black",
  cardBase: "#ffffff",
  accent: "#FFD703",
  fontFamily: 'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
};

export const AchievementShowcaseWidget: React.FC<AchievementShowcaseWidgetProps> = ({
  client,
  walletAddress,
  availableBadges,
  title = "My Badges",
  theme = {},
  onConnect,
  className = "",
  style = {},
}) => {
  const finalTheme = { ...defaultTheme, ...theme };
  const { data: historyData, isLoading, error } = useRewardHistory(client, walletAddress, 1, 100);

  if (!walletAddress) {
    return (
      <div 
        className={className} 
        style={{
          background: finalTheme.background,
          color: finalTheme.foreground,
          border: `3px solid ${finalTheme.border}`,
          boxShadow: finalTheme.shadow,
          fontFamily: finalTheme.fontFamily,
          padding: "24px",
          borderRadius: "8px",
          ...style
        }}
      >
        <h2 style={{ fontSize: "1.5rem", fontWeight: "900", margin: "0 0 16px 0", textTransform: "uppercase" }}>
          {title}
        </h2>
        <div style={{ padding: "20px", textAlign: "center", background: finalTheme.cardBase, border: `2px solid ${finalTheme.border}`, borderRadius: "4px" }}>
          <p style={{ fontWeight: "700", marginBottom: "16px" }}>Connect your wallet or login to view your achievements!</p>
          <ConnectWalletButton 
            onConnect={onConnect || (() => {})} 
            theme={{ background: finalTheme.accent, foreground: finalTheme.foreground, border: finalTheme.border, shadow: "4px 4px 0 0 black" }} 
          />
        </div>
      </div>
    );
  }

  // Find earned badges matching availableBadges id or name in the reason field
  const earnedBadgeIds = new Set<string>();
  if (historyData?.items) {
    const badgeRewards = historyData.items.filter((r: any) => r.rewardType === "badge");
    badgeRewards.forEach((r: any) => {
      const reasonLower = r.reason.toLowerCase();
      availableBadges.forEach(b => {
        if (reasonLower.includes(b.id.toLowerCase()) || reasonLower.includes(b.name.toLowerCase())) {
          earnedBadgeIds.add(b.id);
        }
      });
    });
  }

  return (
    <div
      className={className}
      style={{
        background: finalTheme.background,
        color: finalTheme.foreground,
        border: `3px solid ${finalTheme.border}`,
        boxShadow: finalTheme.shadow,
        fontFamily: finalTheme.fontFamily,
        padding: "24px",
        borderRadius: "8px",
        ...style
      }}
    >
      <h2 style={{ fontSize: "1.5rem", fontWeight: "900", margin: "0 0 20px 0", textTransform: "uppercase" }}>
        {title} <span style={{ fontSize: "1rem", color: "#666" }}>({earnedBadgeIds.size}/{availableBadges.length})</span>
      </h2>

      {isLoading ? (
        <div style={{ textAlign: "center", padding: "20px", fontWeight: "bold" }}>Loading achievements...</div>
      ) : error ? (
        <div style={{ color: "red", fontWeight: "bold" }}>Error loading achievements.</div>
      ) : availableBadges.length === 0 ? (
        <div style={{ textAlign: "center", padding: "20px", background: finalTheme.cardBase, border: `2px solid ${finalTheme.border}` }}>No badges configured.</div>
      ) : (
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", 
          gap: "16px" 
        }}>
          {availableBadges.map(badge => {
            const isEarned = earnedBadgeIds.has(badge.id);
            return (
              <div 
                key={badge.id}
                style={{
                  background: finalTheme.cardBase,
                  border: `3px solid ${isEarned ? "#10b981" : finalTheme.border}`,
                  borderRadius: "8px",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  boxShadow: isEarned ? "4px 4px 0 0 #10b981" : "none",
                  opacity: isEarned ? 1 : 0.6,
                  filter: isEarned ? "none" : "grayscale(100%)",
                  transition: "all 0.2s ease"
                }}
                title={badge.description}
              >
                <img 
                  src={badge.imageUrl} 
                  alt={badge.name} 
                  style={{ width: "64px", height: "64px", objectFit: "contain", marginBottom: "12px", borderRadius: "50%" }}
                />
                <h3 style={{ margin: 0, fontSize: "0.9rem", fontWeight: "800" }}>{badge.name}</h3>
                {isEarned ? (
                  <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "#10b981", marginTop: "4px" }}>UNLOCKED</span>
                ) : (
                  <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "#666", marginTop: "4px" }}>LOCKED</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
