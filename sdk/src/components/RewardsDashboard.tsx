import * as React from "react";
import { type ChainLoyaltyClient } from "../client";
import { useRewardBalance, useRewardHistory } from "../hooks";
import { type CardStyleProps } from "./types";
import { CopyCodeButton } from "./CopyCodeButton";

export interface RewardsDashboardProps extends CardStyleProps {
  client: ChainLoyaltyClient;
  walletAddress: string;
  historyPageSize?: number;
  title?: string;
}

const defaultTheme = {
  background: "#f8fafc",
  foreground: "#0f172a",
  muted: "#475569",
  border: "#e2e8f0",
  accent: "#0ea5e9",
  fontFamily: "ui-sans-serif, system-ui, sans-serif",
  shadow: "0 2px 16px 0 rgba(16,30,54,0.08)",
};

export function RewardsDashboard({
  client,
  walletAddress,
  historyPageSize = 5,
  title = "Your Rewards",
  className,
  style,
  theme,
}: RewardsDashboardProps) {
  const palette = { ...defaultTheme, ...(theme ?? {}) };
  const balance = useRewardBalance(client, walletAddress);
  const history = useRewardHistory(client, walletAddress, 1, historyPageSize);

  const codeSnippet = `import { RewardsDashboard } from 'loyaltychain-sdk';\n\n<RewardsDashboard\n  client={client}\n  walletAddress={walletAddress}\n/>`;

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
        <span style={{ color: palette.muted, fontSize: 13, fontFamily: "monospace" }}>{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
      </div>

      <div style={{ margin: "12px 0 8px 0", display: "flex", alignItems: "center", gap: 8 }}>
        <CopyCodeButton code={codeSnippet} label="Copy integration code" />
      </div>

      {balance.isPending ? <p>Loading balance...</p> : null}
      {balance.error ? <p>Failed to load balance.</p> : null}

      {balance.data ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 16,
            marginTop: 12,
          }}
        >
          <StatCard label="Points" value={String(balance.data.pointsBalance)} accent={palette.accent} />
          <StatCard label="Badges" value={String(balance.data.badges.length)} accent={palette.accent} />
        </div>
      ) : null}

      <h4 style={{ marginTop: 28, marginBottom: 10, fontSize: 16 }}>Recent Rewards</h4>
      <div style={{ display: "grid", gap: 10 }}>
        {history.data?.items.length ? (
          history.data.items.map((item) => (
            <article
              key={item.id}
              style={{
                border: `1px solid ${palette.border}`,
                borderRadius: 10,
                padding: 14,
                background: "#fff",
                boxShadow: "0 1px 4px 0 rgba(16,30,54,0.04)",
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <div style={{ fontWeight: 600, textTransform: "capitalize", fontSize: 15 }}>{item.rewardType}</div>
              <div style={{ color: palette.muted, fontSize: 13 }}>{item.reason}</div>
            </article>
          ))
        ) : (
          <p style={{ color: palette.muted, margin: 0 }}>No rewards yet.</p>
        )}
      </div>
    </section>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div
      style={{
        background: "#f1f5f9",
        borderRadius: 10,
        padding: "18px 12px 12px 12px",
        boxShadow: "0 1px 4px 0 rgba(16,30,54,0.04)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        border: `1.5px solid ${accent}`,
        minHeight: 60,
      }}
    >
      <span style={{ fontSize: 13, color: accent, fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 22, fontWeight: 700, marginTop: 2 }}>{value}</span>
    </div>
  );
}
