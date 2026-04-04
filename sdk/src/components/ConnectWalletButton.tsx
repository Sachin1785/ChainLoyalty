import * as React from "react";

export interface ConnectWalletButtonTheme {
  background?: string;
  foreground?: string;
  border?: string;
  shadow?: string;
  fontFamily?: string;
}

export interface ConnectWalletButtonProps {
  onConnect: (address: string) => void;
  label?: string;
  theme?: ConnectWalletButtonTheme;
  className?: string;
  style?: React.CSSProperties;
}

const defaultTheme: Required<ConnectWalletButtonTheme> = {
  background: "#FFD703", // yellow
  foreground: "#000000",
  border: "#000000",
  shadow: "4px 4px 0 0 black",
  fontFamily: "ui-sans-serif, system-ui, sans-serif",
};

/**
 * A lightweight, Neo-Brutalist connect button that interacts with the browser wallet.
 * This is designed to be standalone and not strictly dependent on a parent Wagmi provider.
 */
export function ConnectWalletButton({
  onConnect,
  label = "Connect Wallet",
  theme,
  className,
  style,
}: ConnectWalletButtonProps) {
  const palette = { ...defaultTheme, ...(theme ?? {}) };
  const [loading, setLoading] = React.useState(false);

  const handleConnect = async () => {
    if (typeof window === "undefined" || !(window as any).ethereum) {
      alert("Please install MetaMask or another Ethereum wallet.");
      return;
    }

    setLoading(true);
    try {
      const accounts = await (window as any).ethereum.request({
        method: "eth_requestAccounts",
      });
      if (accounts.length > 0) {
        onConnect(accounts[0]);
      }
    } catch (err) {
      console.error("Connect wallet failed", err);
    } finally {
      setLoading(false);
    }
  };

  const buttonStyle: React.CSSProperties = {
    background: palette.background,
    color: palette.foreground,
    border: `3px solid ${palette.border}`,
    borderRadius: 12,
    padding: "10px 20px",
    fontSize: 16,
    fontWeight: 900,
    cursor: loading ? "not-allowed" : "pointer",
    boxShadow: palette.shadow,
    transition: "transform 0.1s, box-shadow 0.1s",
    fontFamily: palette.fontFamily,
    textTransform: "uppercase",
    display: "flex",
    alignItems: "center",
    gap: 8,
    ...style,
  };

  return (
    <button
      className={className}
      style={buttonStyle}
      disabled={loading}
      onClick={handleConnect}
      onMouseOver={(e) => { e.currentTarget.style.transform = "translate(-2px, -2px)"; e.currentTarget.style.boxShadow = "6px 6px 0 0 black" }}
      onMouseOut={(e) => { e.currentTarget.style.transform = "translate(0px, 0px)"; e.currentTarget.style.boxShadow = palette.shadow }}
      onMouseDown={(e) => { e.currentTarget.style.transform = "translate(2px, 2px)"; e.currentTarget.style.boxShadow = "2px 2px 0 0 black" }}
      onMouseUp={(e) => { e.currentTarget.style.transform = "translate(-2px, -2px)"; e.currentTarget.style.boxShadow = "6px 6px 0 0 black" }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
      </svg>
      {loading ? "Connecting..." : label}
    </button>
  );
}
