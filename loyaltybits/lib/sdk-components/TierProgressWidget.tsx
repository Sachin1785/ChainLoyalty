"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
// @ts-ignore
import { ChainLoyaltyClient, ConnectWalletButton } from "loyaltychain-sdk";

export interface Tier {
  name: string;
  minPoints: number;
  color?: string;
}

export interface TierProgressTheme {
  background?: string;
  foreground?: string;
  border?: string;
  shadow?: string;
  cardBase?: string;
  accent?: string;
  fontFamily?: string;
}

export interface TierProgressWidgetProps {
  client: ChainLoyaltyClient;
  walletAddress: string;
  tiers: Tier[];
  title?: string;
  theme?: TierProgressTheme;
  onConnect?: (address: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

const defaultTheme: TierProgressTheme = {
  background: "#f8fafc",
  foreground: "#000000",
  border: "#000000",
  shadow: "6px 6px 0 0 black",
  cardBase: "#ffffff",
  accent: "#FFD703",
  fontFamily: 'ui-sans-serif, system-ui, sans-serif',
};

export const TierProgressWidget: React.FC<TierProgressWidgetProps> = ({
  client,
  walletAddress,
  tiers,
  title = "VIP Status",
  theme = {},
  onConnect,
  className = "",
  style = {},
}) => {
  const finalTheme = { ...defaultTheme, ...theme };
  const sortedTiers = [...tiers].sort((a, b) => a.minPoints - b.minPoints);
  const { data: balanceData, isLoading, error } = useQuery({
    queryKey: ["chainloyalty", "rewards", "balance", walletAddress],
    queryFn: () => client.getRewardBalance(walletAddress),
    enabled: Boolean(walletAddress),
  });

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
          ...style,
        }}
      >
        <h2 style={{ fontSize: "1.5rem", fontWeight: "900", margin: "0 0 16px 0", textTransform: "uppercase" }}>{title}</h2>
        <div style={{ padding: "20px", textAlign: "center", background: finalTheme.cardBase, border: `2px solid ${finalTheme.border}`, borderRadius: "4px" }}>
          <p style={{ fontWeight: "700", marginBottom: "16px" }}>Connect your wallet to view your VIP status!</p>
          <ConnectWalletButton
            onConnect={onConnect || (() => {})}
            theme={{ background: finalTheme.accent, foreground: finalTheme.foreground, border: finalTheme.border, shadow: "4px 4px 0 0 black" }}
          />
        </div>
      </div>
    );
  }

  const points = balanceData?.pointsBalance || 0;
  let currentTierIndex = 0;
  for (let i = 0; i < sortedTiers.length; i++) {
    if (points >= sortedTiers[i].minPoints) currentTierIndex = i;
    else break;
  }

  const currentTier = sortedTiers[currentTierIndex];
  const nextTier = currentTierIndex < sortedTiers.length - 1 ? sortedTiers[currentTierIndex + 1] : null;
  let progressPercent = 100;
  let pointsNeeded = 0;

  if (nextTier) {
    const range = nextTier.minPoints - currentTier.minPoints;
    const progressIntoTier = Math.max(0, points - currentTier.minPoints);
    progressPercent = Math.min(100, Math.max(0, (progressIntoTier / range) * 100));
    pointsNeeded = nextTier.minPoints - points;
  }

  const barColor = currentTier.color || finalTheme.accent;

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
        ...style,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "8px" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "900", margin: "0", textTransform: "uppercase" }}>{title}</h2>
        {isLoading ? (
          <span style={{ fontWeight: "bold" }}>Loading...</span>
        ) : error ? (
          <span style={{ color: "red", fontWeight: "bold" }}>Error</span>
        ) : (
          <span style={{ fontSize: "1.2rem", fontWeight: "900" }}>{points} pts</span>
        )}
      </div>
      <div style={{ background: finalTheme.cardBase, border: `3px solid ${finalTheme.border}`, padding: "16px", borderRadius: "6px", boxShadow: "4px 4px 0 0 black", marginTop: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontWeight: "800", fontSize: "1.1rem" }}>
          <span style={{ color: barColor }}>{currentTier.name} Tier</span>
          {nextTier && <span style={{ opacity: 0.6 }}>Next: {nextTier.name}</span>}
        </div>
        <div style={{ height: "24px", width: "100%", background: "#e2e8f0", border: `2px solid ${finalTheme.border}`, borderRadius: "12px", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${progressPercent}%`, background: barColor, transition: "width 0.5s cubic-bezier(0.4, 0, 0.2, 1)" }} />
        </div>
        {nextTier ? (
          <p style={{ margin: "12px 0 0 0", fontSize: "0.9rem", fontWeight: "600", textAlign: "right" }}>
            Earn <strong>{pointsNeeded}</strong> more points for {nextTier.name}!
          </p>
        ) : (
          <p style={{ margin: "12px 0 0 0", fontSize: "0.9rem", fontWeight: "600", textAlign: "right" }}>
            🎉 You have reached the maximum tier!
          </p>
        )}
      </div>
    </div>
  );
};
