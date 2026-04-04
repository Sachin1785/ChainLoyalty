import * as React from "react";
import { useState, useEffect } from "react";
import { type ChainLoyaltyClient } from "../client";
import { ConnectWalletButton } from "./ConnectWalletButton";

export interface ReferralWidgetTheme {
  background?: string;
  foreground?: string;
  border?: string;
  shadow?: string;
  fontFamily?: string;
  cardBase?: string;
  inputBg?: string;
  accent?: string;
}

export interface ReferralWidgetProps {
  client: ChainLoyaltyClient;
  walletAddress: string;
  theme?: ReferralWidgetTheme;
  className?: string;
  style?: React.CSSProperties;
  title?: string;
  referralRewardText?: string;
  onConnect?: (address: string) => void;
}

const defaultTheme: Required<ReferralWidgetTheme> = {
  background: "#fdf2f8", // pinkish
  foreground: "#000000",
  border: "#000000",
  shadow: "8px 8px 0 0 black",
  fontFamily: "ui-sans-serif, system-ui, sans-serif",
  cardBase: "#fdf2f8",
  inputBg: "#ffffff",
  accent: "#ec4899",
};

export function ReferralWidget({
  client,
  walletAddress,
  theme,
  className,
  style,
  title = "Your Referral Code",
  referralRewardText = "Earn 200 pts per referral!",
  onConnect,
}: ReferralWidgetProps) {
  const palette = { ...defaultTheme, ...(theme ?? {}) };

  const cardStyle: React.CSSProperties = {
    background: palette.cardBase,
    border: `4px solid ${palette.border}`,
    borderRadius: 16,
    padding: 24,
    boxShadow: palette.shadow,
    display: "flex",
    flexDirection: "column",
    gap: 16,
    fontFamily: palette.fontFamily,
    color: palette.foreground,
    ...style
  };

  if (!walletAddress) {
    return (
      <div className={className} style={cardStyle}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, textTransform: "uppercase" }}>{title}</h2>
        <p style={{ fontWeight: 700, opacity: 0.7 }}>Connect wallet to see your referral code.</p>
        <ConnectWalletButton onConnect={(addr) => onConnect?.(addr)} />
      </div>
    );
  }

  const [referralCode, setReferralCode] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    client.getRewardBalance(walletAddress)
      .then((data: any) => {
        // The backend stats endpoint seems to have the code, but we can also use createReferralCode if it's missing
        // For now, let's try to get it from createReferralCode or a mock if it fails
        return client.createReferralCode(walletAddress);
      })
      .then((data) => {
        if (mounted) {
          setReferralCode(data.referralCode);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load referral code", err);
        if (mounted) {
          setReferralCode("ERROR");
          setLoading(false);
        }
      });
    return () => { mounted = false; };
  }, [client, walletAddress]);

  const copyToClipboard = () => {
    if (referralCode && referralCode !== "ERROR") {
      navigator.clipboard.writeText(referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const inputContainerStyle: React.CSSProperties = {
    background: palette.inputBg,
    border: `3px solid ${palette.border}`,
    borderRadius: 12,
    padding: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    boxShadow: "4px 4px 0 0 black",
  };

  return (
    <div className={className} style={cardStyle}>
      <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, textTransform: "uppercase", letterSpacing: -0.5 }}>
        {title}
      </h2>
      
      {loading ? (
        <div style={{ height: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span>Loading...</span>
        </div>
      ) : (
        <div style={inputContainerStyle}>
          <span style={{ fontWeight: 900, fontSize: 20, letterSpacing: 1 }}>{referralCode}</span>
          <button 
            onClick={copyToClipboard}
            style={{ 
              background: "transparent", 
              border: "none", 
              cursor: "pointer", 
              padding: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "transform 0.1s"
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.9)"}
            onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            {copied ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            )}
          </button>
        </div>
      )}

      <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>
        {referralRewardText.split(' ').map((word, i) => (
          word === '200' || word === 'pts' ? <strong key={i} style={{ color: palette.accent }}>{word} </strong> : word + ' '
        ))}
      </p>
    </div>
  );
}
