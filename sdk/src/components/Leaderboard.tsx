import * as React from "react";
import { type ChainLoyaltyClient } from "../client";
import { useLeaderboard } from "../hooks";
import { type CardStyleProps } from "./types";
import { CopyCodeButton } from "./CopyCodeButton";

export interface LeaderboardProps extends CardStyleProps {
  client: ChainLoyaltyClient;
  page?: number;
  pageSize?: number;
  title?: string;
}

const defaultTheme = {
  background: "#fff7ed",
  foreground: "#111827",
  muted: "#4b5563",
  border: "#fed7aa",
  accent: "#f97316",
  fontFamily: "ui-sans-serif, system-ui, sans-serif",
  shadow: "0 2px 16px 0 rgba(16,30,54,0.08)",
};

export function Leaderboard({
  client,
  page = 1,
  pageSize = 10,
  title = "Leaderboard",
  className,
  style,
  theme,
}: LeaderboardProps) {
  const palette = { ...defaultTheme, ...(theme ?? {}) };
  const board = useLeaderboard(client, page, pageSize);

  const codeSnippet = `import { Leaderboard } from 'loyaltychain-sdk';\n\n<Leaderboard\n  client={client}\n/>`;

  return (
    <section
      className={className}
      style={{
        fontFamily: palette.fontFamily,
        border: `1px solid ${palette.border}`,
        borderRadius: 16,
        background: palette.background,
        color: palette.foreground,
        padding: 24,
        width: "100%",
        boxSizing: "border-box",
        boxShadow: palette.shadow,
        ...style,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <h3 style={{ margin: 0, fontSize: 22, letterSpacing: -0.5 }}>{title}</h3>
        <CopyCodeButton code={codeSnippet} label="Copy integration code" />
      </div>
      {board.isPending ? <p>Loading leaderboard...</p> : null}
      {board.error ? <p>Failed to load leaderboard.</p> : null}

      <div style={{ display: "grid", gap: 12, marginTop: 10 }}>
        {board.data?.items.length ? (
          board.data.items.map((entry) => (
            <div
              key={`${entry.walletAddress}-${entry.rank}`}
              style={{
                display: "grid",
                gridTemplateColumns: "48px 1fr auto",
                gap: 10,
                alignItems: "center",
                border: `1.5px solid ${palette.border}`,
                borderRadius: 10,
                padding: 14,
                background: "#fff",
                boxShadow: "0 1px 4px 0 rgba(16,30,54,0.04)",
              }}
            >
              <div style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: palette.accent + "22",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 16,
                color: palette.accent,
              }}>#{entry.rank}</div>
              <span style={{ color: palette.muted, overflow: "hidden", textOverflow: "ellipsis", fontFamily: "monospace", fontSize: 14 }}>
                {entry.walletAddress.slice(0, 6)}...{entry.walletAddress.slice(-4)}
              </span>
              <span style={{ color: palette.accent, fontWeight: 700, fontSize: 18 }}>{entry.score}</span>
            </div>
          ))
        ) : (
          <p style={{ color: palette.muted, margin: 0 }}>No leaderboard data.</p>
        )}
      </div>
    </section>
  );
}
