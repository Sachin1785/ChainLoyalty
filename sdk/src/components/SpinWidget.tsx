import * as React from "react";
import { useState, useEffect } from "react";
import { type ChainLoyaltyClient } from "../client";
import { type LootboxConfig, type LootboxPrize } from "../types";
import { ConnectWalletButton } from "./ConnectWalletButton";

export interface SpinWidgetTheme {
  background?: string;
  foreground?: string;
  muted?: string;
  border?: string;
  accent?: string;
  wheelColors?: string[];
  shadow?: string;
  fontFamily?: string;
  primaryButtonBg?: string;
  primaryButtonText?: string;
  cardBase?: string;
}

export interface SpinWidgetProps {
  client: ChainLoyaltyClient;
  walletAddress: string;
  lootboxId?: number | string;
  theme?: SpinWidgetTheme;
  className?: string;
  style?: React.CSSProperties;
  title?: string;
  onSpinSuccess?: (prize: string) => void;
  onSpinError?: (error: Error) => void;
  onConnect?: (address: string) => void;
}

const defaultTheme: Required<SpinWidgetTheme> = {
  background: "#f8fafc",
  foreground: "#0f172a",
  muted: "#64748b",
  border: "#000000",
  accent: "#f43f5e",
  wheelColors: ["#FFD703", "#FEBDD2", "#8ED670", "#e5e7eb", "#7CC5D9", "#FA5D5D"],
  shadow: "8px 8px 0 0 black",
  fontFamily: "ui-sans-serif, system-ui, sans-serif",
  primaryButtonBg: "#FFD703", // yellow
  primaryButtonText: "#000000",
  cardBase: "#ffffff",
};

export function SpinWidget({
  client,
  walletAddress,
  lootboxId = 1,
  theme,
  className,
  style,
  title = "Spin & Win",
  onSpinSuccess,
  onSpinError,
  onConnect,
}: SpinWidgetProps) {
  const palette = { ...defaultTheme, ...(theme ?? {}) };

  const [config, setConfig] = useState<LootboxConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<{ label: string; tx_hash: string } | null>(null);
  const [phase, setPhase] = useState<"idle" | "committing" | "waiting" | "revealing" | "done">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    client.getLootboxConfig(lootboxId)
      .then((data) => {
        if (mounted) {
          const prizesWithColors = (data.prizes || []).map((p, i) => ({
            ...p,
            color: p.color || palette.wheelColors[i % palette.wheelColors.length]
          }));
          setConfig({ ...data, prizes: prizesWithColors });
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load lootbox config", err);
        if (mounted) {
          setErrorMsg("Failed to load lootbox config");
          setLoading(false);
        }
      });
    return () => { mounted = false; };
  }, [client, lootboxId, palette.wheelColors]);

  const prizes = config?.prizes || [];

  const handleSpin = async () => {
    if (spinning || !walletAddress || !config) return;
    setSpinning(true);
    setResult(null);
    setErrorMsg(null);
    setPhase("committing");

    try {
      const commitData = await client.commitSpin(walletAddress, lootboxId);
      setPhase("waiting");

      // Visual spin effect (5 full turns + random)
      const targetDeg = 360 * 5 + Math.random() * 360;
      setRotation((prev) => prev + targetDeg);

      // Wait 4 seconds for safe reveal (simulating block confirmation)
      await new Promise((r) => setTimeout(r, 4000));
      setPhase("revealing");

      const revealData = await client.revealSpin(walletAddress, commitData.salt);
      setResult({ label: revealData.prize_label, tx_hash: revealData.tx_hash });
      setPhase("done");
      onSpinSuccess?.(revealData.prize_label);
    } catch (err: any) {
      setErrorMsg(err.message || "Spin failed");
      setPhase("idle");
      onSpinError?.(err);
    } finally {
      setSpinning(false);
    }
  };

  if (loading) {
    return (
      <div style={{ fontFamily: palette.fontFamily, color: palette.foreground, padding: 24, textAlign: "center" }}>
        <p>Loading {title}...</p>
      </div>
    );
  }

  const cardStyle: React.CSSProperties = {
    background: palette.cardBase,
    border: `4px solid ${palette.border}`,
    borderRadius: 16,
    padding: 24,
    boxShadow: palette.shadow,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 16,
  };

  if (!walletAddress) {
    return (
      <section className={className} style={{ fontFamily: palette.fontFamily, color: palette.foreground, ...style }}>
        <div style={cardStyle}>
          <h3 style={{ margin: 0, fontSize: 24, fontWeight: 900 }}>{title}</h3>
          <p style={{ textAlign: "center", fontWeight: 700, opacity: 0.7, margin: "10px 0" }}>
            Connect your wallet to participate in the reward wheel!
          </p>
          <ConnectWalletButton onConnect={(addr) => onConnect?.(addr)} />
        </div>
      </section>
    );
  }

  const buttonStyle: React.CSSProperties = {
    background: palette.primaryButtonBg,
    color: palette.primaryButtonText,
    border: `3px solid ${palette.border}`,
    borderRadius: 12,
    padding: "12px 24px",
    fontSize: 18,
    fontWeight: 900,
    cursor: spinning || !walletAddress ? "not-allowed" : "pointer",
    opacity: spinning || !walletAddress ? 0.7 : 1,
    boxShadow: "4px 4px 0 0 black",
    transition: "transform 0.1s, box-shadow 0.1s",
    width: "100%",
    fontFamily: palette.fontFamily,
  };

  const codeSnippet = `import { SpinWidget } from 'loyaltychain-sdk';\n\n<SpinWidget client={client} walletAddress={address} />`;

  return (
    <section
      className={className}
      style={{
        fontFamily: palette.fontFamily,
        color: palette.foreground,
        width: "100%",
        boxSizing: "border-box",
        ...style,
      }}
    >
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ margin: 0, fontSize: 32, fontWeight: 900, letterSpacing: -1, textTransform: "uppercase" }}>{title}</h3>
        <p style={{ margin: "4px 0 0 0", color: palette.muted, fontWeight: 700, fontSize: 14 }}>
          Costs {config?.points_cost ?? 500} pts · Cooldown {config?.cooldown ?? 60}s
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24, alignItems: "start" }}>
        
        {/* Spin Wheel Card */}
        <div style={cardStyle}>
          <div style={{ position: "relative", width: 240, height: 240, marginTop: 10 }}>
            {/* The Pointer */}
            <div style={{
              position: "absolute",
              top: -14,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 10,
              width: 0,
              height: 0,
              borderLeft: "12px solid transparent",
              borderRight: "12px solid transparent",
              borderTop: `24px solid ${palette.border}`
            }} />

            {/* The Wheel */}
            <div
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                border: `4px solid ${palette.border}`,
                overflow: "hidden",
                boxShadow: "8px 8px 0 0 rgba(0,0,0,1)",
                transform: `rotate(${rotation}deg)`,
                transition: spinning ? "transform 4s cubic-bezier(0.17,0.67,0.12,0.99)" : "none",
              }}
            >
              <svg viewBox="0 0 200 200" style={{ width: "100%", height: "100%" }}>
                {prizes.map((prize: LootboxPrize, i: number) => {
                  const startAngle = (i * 360) / prizes.length;
                  const endAngle = ((i + 1) * 360) / prizes.length;
                  const toRad = (deg: number) => (deg * Math.PI) / 180;
                  const x1 = 100 + 100 * Math.cos(toRad(startAngle - 90));
                  const y1 = 100 + 100 * Math.sin(toRad(startAngle - 90));
                  const x2 = 100 + 100 * Math.cos(toRad(endAngle - 90));
                  const y2 = 100 + 100 * Math.sin(toRad(endAngle - 90));
                  const midAngle = (startAngle + endAngle) / 2;
                  const tx = 100 + 65 * Math.cos(toRad(midAngle - 90));
                  const ty = 100 + 65 * Math.sin(toRad(midAngle - 90));
                  const large = endAngle - startAngle > 180 ? 1 : 0;

                  return (
                    <g key={i}>
                      <path
                        d={`M 100 100 L ${x1} ${y1} A 100 100 0 ${large} 1 ${x2} ${y2} Z`}
                        fill={prize.color}
                        stroke={palette.border}
                        strokeWidth="2"
                      />
                      <text
                        x={tx} y={ty}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="8"
                        fontWeight="bold"
                        fill="#000"
                        transform={`rotate(${midAngle + 90}, ${tx}, ${ty})`}
                      >
                        {prize.label.split(" ")[0]}
                      </text>
                    </g>
                  );
                })}
                <circle cx="100" cy="100" r="12" fill={palette.cardBase} stroke={palette.border} strokeWidth="3" />
              </svg>
            </div>
          </div>

          <div style={{ height: 24, fontSize: 13, fontWeight: 700, margin: "10px 0", color: palette.muted }}>
            {phase === "committing" && <span style={{ background: palette.wheelColors[0], padding: "4px 8px", borderRadius: 4, color: "#000", border: "2px solid #000" }}>🔒 Locking Commitment...</span>}
            {phase === "waiting" && <span style={{ background: palette.wheelColors[1], padding: "4px 8px", borderRadius: 4, color: "#000", border: "2px solid #000" }}>⏳ Waiting for blockhash...</span>}
            {phase === "revealing" && <span style={{ background: palette.wheelColors[4], padding: "4px 8px", borderRadius: 4, color: "#000", border: "2px solid #000" }}>🎲 Revealing Prize...</span>}
            {errorMsg && <span style={{ color: palette.accent }}>{errorMsg}</span>}
          </div>

          <button
            style={buttonStyle}
            onClick={handleSpin}
            disabled={spinning || !walletAddress}
            onMouseOver={(e) => { if (!spinning && walletAddress) e.currentTarget.style.transform = "translate(-2px, -2px)"; e.currentTarget.style.boxShadow = "6px 6px 0 0 black" }}
            onMouseOut={(e) => { if (!spinning && walletAddress) e.currentTarget.style.transform = "translate(0px, 0px)"; e.currentTarget.style.boxShadow = "4px 4px 0 0 black" }}
            onMouseDown={(e) => { if (!spinning && walletAddress) e.currentTarget.style.transform = "translate(2px, 2px)"; e.currentTarget.style.boxShadow = "2px 2px 0 0 black" }}
            onMouseUp={(e) => { if (!spinning && walletAddress) e.currentTarget.style.transform = "translate(-2px, -2px)"; e.currentTarget.style.boxShadow = "6px 6px 0 0 black" }}
          >
            {spinning ? "Spinning..." : `SPIN! (${config?.points_cost ?? 500} pts)`}
          </button>
        </div>

        {/* Right Side Info */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {result && (
            <div style={{ ...cardStyle, background: "#8ED670", textAlign: "center" }}>
              <p style={{ fontSize: 48, margin: 0 }}>🎉</p>
              <h2 style={{ fontSize: 24, fontWeight: 900, textTransform: "uppercase", margin: "10px 0" }}>Spin Result!</h2>
              <p style={{ fontSize: 13, fontWeight: 700, margin: 0, opacity: 0.8 }}>
                Reward processed in tx:
                <span style={{ display: "block", fontFamily: "monospace", marginTop: 4, fontSize: 11, background: "rgba(255,255,255,0.4)", padding: 6, borderRadius: 4, wordBreak: "break-all" }}>
                  {result.tx_hash}
                </span>
              </p>
              <button 
                onClick={() => { setResult(null); setPhase("idle"); }} 
                style={{ ...buttonStyle, padding: "8px 16px", fontSize: 14, marginTop: 10, background: palette.cardBase }}
              >
                Close
              </button>
            </div>
          )}

          <div style={{ 
            border: `4px solid ${palette.border}`, 
            borderRadius: 16, 
            overflow: "hidden", 
            boxShadow: palette.shadow,
            background: palette.cardBase
          }}>
            <div style={{ padding: 16, borderBottom: `4px solid ${palette.border}`, background: palette.border, color: palette.wheelColors[0] }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, textTransform: "uppercase" }}>Lootbox Odds</h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {prizes.map((prize: LootboxPrize, i: number) => (
                <div key={i} style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "space-between", 
                  padding: "12px 20px",
                  borderBottom: i !== prizes.length - 1 ? `2px dashed ${palette.border}` : "none"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 12, height: 12, borderRadius: "50%", background: prize.color, border: `2px solid ${palette.border}` }} />
                    <span style={{ fontWeight: 900 }}>{prize.label}</span>
                  </div>
                  <span style={{ background: palette.border, color: "#fff", padding: "4px 8px", borderRadius: 12, fontSize: 12, fontWeight: 900 }}>
                    {prize.weight_bps / 100}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
