"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
// @ts-ignore
import { ChainLoyaltyClient, ConnectWalletButton } from "loyaltychain-sdk";

export interface Quest {
  id: string;
  title: string;
  description: string;
  rewardPoints: number;
  icon?: string;
  actionUrl?: string;
}

export interface QuestBoardTheme {
  background?: string;
  foreground?: string;
  border?: string;
  shadow?: string;
  cardBase?: string;
  accent?: string;
  completedGreen?: string;
  fontFamily?: string;
}

export interface QuestBoardWidgetProps {
  client: ChainLoyaltyClient;
  walletAddress: string;
  quests: Quest[];
  title?: string;
  theme?: QuestBoardTheme;
  onConnect?: (address: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

const defaultTheme: QuestBoardTheme = {
  background: "#f0fdf4",
  foreground: "#000000",
  border: "#000000",
  shadow: "6px 6px 0 0 black",
  cardBase: "#ffffff",
  accent: "#FFD703",
  completedGreen: "#8ED670",
  fontFamily: 'ui-sans-serif, system-ui, sans-serif',
};

export const QuestBoardWidget: React.FC<QuestBoardWidgetProps> = ({
  client,
  walletAddress,
  quests,
  title = "Active Quests",
  theme = {},
  onConnect,
  className = "",
  style = {},
}) => {
  const finalTheme = { ...defaultTheme, ...theme };
  const { data: historyData, isLoading, error } = useQuery({
    queryKey: ["chainloyalty", "rewards", "history", walletAddress, 1, 50],
    queryFn: () => client.getRewardHistory(walletAddress, 1, 50),
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
          <p style={{ fontWeight: "700", marginBottom: "16px" }}>Connect your wallet to view your quests!</p>
          <ConnectWalletButton
            onConnect={onConnect || (() => {})}
            theme={{ background: finalTheme.accent, foreground: finalTheme.foreground, border: finalTheme.border, shadow: "4px 4px 0 0 black" }}
          />
        </div>
      </div>
    );
  }

  const completedQuestIds = new Set<string>();
  if (historyData?.items) {
    historyData.items.forEach((r: any) => {
      const reasonLower = r.reason.toLowerCase();
      quests.forEach((q) => {
        if (reasonLower.includes(q.id.toLowerCase()) || reasonLower.includes(q.title.toLowerCase())) {
          completedQuestIds.add(q.id);
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
        ...style,
      }}
    >
      <h2 style={{ fontSize: "1.5rem", fontWeight: "900", margin: "0 0 20px 0", textTransform: "uppercase" }}>{title}</h2>
      {isLoading ? (
        <div style={{ textAlign: "center", padding: "20px", fontWeight: "bold" }}>Loading quests...</div>
      ) : error ? (
        <div style={{ color: "red", fontWeight: "bold" }}>Error loading quests.</div>
      ) : quests.length === 0 ? (
        <div style={{ textAlign: "center", padding: "20px", background: finalTheme.cardBase, border: `2px solid ${finalTheme.border}` }}>No quests available!</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {quests.map((quest) => {
            const isCompleted = completedQuestIds.has(quest.id);
            return (
              <div
                key={quest.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: isCompleted ? finalTheme.completedGreen : finalTheme.cardBase,
                  border: `3px solid ${finalTheme.border}`,
                  borderRadius: "6px",
                  padding: "16px",
                  boxShadow: "4px 4px 0 0 black",
                  opacity: isCompleted ? 0.8 : 1,
                  transition: "all 0.2s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={{ fontSize: "2rem" }}>{isCompleted ? "✅" : quest.icon || "🎯"}</div>
                  <div>
                    <h3 style={{ margin: "0 0 4px 0", fontSize: "1.2rem", fontWeight: "800", textDecoration: isCompleted ? "line-through" : "none" }}>{quest.title}</h3>
                    <p style={{ margin: 0, fontSize: "0.9rem", color: isCompleted ? "rgba(0,0,0,0.6)" : "inherit" }}>{quest.description}</p>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
                  <span style={{ fontWeight: "900", fontSize: "1.2rem" }}>+{quest.rewardPoints} pts</span>
                  {!isCompleted && quest.actionUrl && (
                    <a
                      href={quest.actionUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        background: finalTheme.accent,
                        color: finalTheme.foreground,
                        border: `2px solid ${finalTheme.border}`,
                        padding: "6px 12px",
                        fontWeight: "800",
                        textDecoration: "none",
                        fontSize: "0.9rem",
                        boxShadow: "2px 2px 0 0 black",
                      }}
                    >
                      GO!
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
