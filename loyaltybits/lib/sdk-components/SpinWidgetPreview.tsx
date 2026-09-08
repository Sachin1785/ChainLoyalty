"use client";

import React, { useState } from "react";

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

interface SpinWidgetPreviewProps {
  title?: string;
  theme?: SpinWidgetTheme;
  className?: string;
  style?: React.CSSProperties;
}

const defaultTheme = {
  background: "#f8fafc",
  foreground: "#0f172a",
  muted: "#64748b",
  border: "#000000",
  accent: "#f43f5e",
  wheelColors: ["#FFD703", "#FEBDD2", "#8ED670", "#e5e7eb", "#7CC5D9", "#FA5D5D"],
  shadow: "8px 8px 0 0 black",
  fontFamily: "ui-sans-serif, system-ui, sans-serif",
  primaryButtonBg: "#FFD703",
  primaryButtonText: "#000000",
  cardBase: "#ffffff",
};

const MOCK_PRIZES = [
  { label: "100 Points", weight_bps: 3000, color: "#FFD703" },
  { label: "50 Points",  weight_bps: 4000, color: "#FEBDD2" },
  { label: "500 Points", weight_bps: 500,  color: "#8ED670" },
  { label: "Nothing",    weight_bps: 2000, color: "#e5e7eb" },
  { label: "200 Points", weight_bps: 500,  color: "#7CC5D9" },
];

export function SpinWidgetPreview({ title = "Spin & Win", theme, className, style }: SpinWidgetPreviewProps) {
  const palette = { ...defaultTheme, ...(theme ?? {}) };
  const prizes = MOCK_PRIZES.map((p, i) => ({ ...p, color: p.color || palette.wheelColors[i % palette.wheelColors.length] }));
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [resultLabel, setResultLabel] = useState<string | null>(null);

  const handleSpin = () => {
    if (spinning) return;
    setSpinning(true);
    setResultLabel(null);
    const targetDeg = 360 * 5 + Math.random() * 360;
    setRotation((prev) => prev + targetDeg);
    setTimeout(() => {
      const winner = prizes[Math.floor(Math.random() * prizes.length)];
      setResultLabel(winner.label);
      setSpinning(false);
    }, 4100);
  };

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

  const buttonStyle: React.CSSProperties = {
    background: palette.primaryButtonBg,
    color: palette.primaryButtonText,
    border: `3px solid ${palette.border}`,
    borderRadius: 12,
    padding: "12px 24px",
    fontSize: 18,
    fontWeight: 900,
    cursor: spinning ? "not-allowed" : "pointer",
    opacity: spinning ? 0.7 : 1,
    boxShadow: "4px 4px 0 0 black",
    transition: "transform 0.1s, box-shadow 0.1s",
    width: "100%",
    fontFamily: palette.fontFamily,
  };

  return (
    <section className={className} style={{ fontFamily: palette.fontFamily, color: palette.foreground, width: "100%", boxSizing: "border-box", ...style }}>
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ margin: 0, fontSize: 32, fontWeight: 900, letterSpacing: -1, textTransform: "uppercase" }}>{title}</h3>
        <p style={{ margin: "4px 0 0 0", color: palette.muted, fontWeight: 700, fontSize: 14 }}>Costs 500 pts · Cooldown 60s</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24, alignItems: "start" }}>
        {/* Wheel Card */}
        <div style={cardStyle}>
          <div style={{ position: "relative", width: 240, height: 240, marginTop: 10 }}>
            {/* Pointer */}
            <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", zIndex: 10, width: 0, height: 0, borderLeft: "12px solid transparent", borderRight: "12px solid transparent", borderTop: `24px solid ${palette.border}` }} />
            {/* Wheel */}
            <div style={{ width: "100%", height: "100%", borderRadius: "50%", border: `4px solid ${palette.border}`, overflow: "hidden", boxShadow: "8px 8px 0 0 rgba(0,0,0,1)", transform: `rotate(${rotation}deg)`, transition: spinning ? "transform 4s cubic-bezier(0.17,0.67,0.12,0.99)" : "none" }}>
              <svg viewBox="0 0 200 200" style={{ width: "100%", height: "100%" }}>
                {prizes.map((prize, i) => {
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
                      <path d={`M 100 100 L ${x1} ${y1} A 100 100 0 ${large} 1 ${x2} ${y2} Z`} fill={prize.color} stroke={palette.border} strokeWidth="2" />
                      <text x={tx} y={ty} textAnchor="middle" dominantBaseline="middle" fontSize="8" fontWeight="bold" fill="#000" transform={`rotate(${midAngle + 90}, ${tx}, ${ty})`}>
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
            {spinning && <span style={{ background: palette.wheelColors[0], padding: "4px 8px", borderRadius: 4, color: "#000", border: "2px solid #000" }}>⏳ Spinning...</span>}
            {resultLabel && !spinning && <span style={{ background: "#8ED670", padding: "4px 8px", borderRadius: 4, color: "#000", border: "2px solid #000" }}>🎉 {resultLabel}!</span>}
          </div>

          <button style={buttonStyle} onClick={handleSpin} disabled={spinning}>
            {spinning ? "Spinning..." : "SPIN! (500 pts)"}
          </button>
        </div>

        {/* Odds list */}
        <div style={{ border: `4px solid ${palette.border}`, borderRadius: 16, overflow: "hidden", boxShadow: palette.shadow, background: palette.cardBase }}>
          <div style={{ padding: 16, borderBottom: `4px solid ${palette.border}`, background: palette.border, color: palette.wheelColors[0] }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, textTransform: "uppercase" }}>Lootbox Odds</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {prizes.map((prize, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", borderBottom: i !== prizes.length - 1 ? `2px dashed ${palette.border}` : "none" }}>
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
    </section>
  );
}
