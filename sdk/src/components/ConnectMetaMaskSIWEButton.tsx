import React from "react";

export interface ConnectMetaMaskSIWEButtonProps {
  onConnect: (address: string, siweJwt: string) => void;
  label?: string;
  style?: React.CSSProperties;
  className?: string;
  siweApiUrl: string; // Your backend endpoint for SIWE
}

export const ConnectMetaMaskSIWEButton: React.FC<ConnectMetaMaskSIWEButtonProps> = ({
  onConnect,
  label = "Sign-In With Ethereum",
  style,
  className,
  siweApiUrl,
}) => {
  const [connecting, setConnecting] = React.useState(false);
  const [address, setAddress] = React.useState<string | null>(null);
  const [jwt, setJwt] = React.useState<string | null>(null);

  const handleConnect = async () => {
    if (!(window as any).ethereum) {
      alert("MetaMask is not installed");
      return;
    }
    setConnecting(true);
    try {
      // 1. Request accounts
      const accounts = await (window as any).ethereum.request({ method: "eth_requestAccounts" });
      const userAddress = accounts[0];
      setAddress(userAddress);

      // 2. Fetch SIWE message from backend
      const nonceRes = await fetch(`${siweApiUrl}/siwe/nonce`);
      const { nonce } = await nonceRes.json();
      const domain = window.location.host;
      const origin = window.location.origin;
      const statement = "Sign in with Ethereum to LoyaltyChain.";
      const siweMessage = [
        `domain: ${domain}`,
        `address: ${userAddress}`,
        `statement: ${statement}`,
        `uri: ${origin}`,
        `version: 1`,
        `chainId: 1`,
        `nonce: ${nonce}`
      ].join("\n");

      // 3. Request signature
      const signature = await (window as any).ethereum.request({
        method: "personal_sign",
        params: [siweMessage, userAddress],
      });

      // 4. Send to backend for verification, get JWT
      const verifyRes = await fetch(`${siweApiUrl}/siwe/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: siweMessage, signature }),
      });
      if (!verifyRes.ok) throw new Error("SIWE verification failed");
      const { token } = await verifyRes.json();
      setJwt(token);
      onConnect(userAddress, token);
    } catch (err) {
      alert("Failed to sign in with Ethereum");
    } finally {
      setConnecting(false);
    }
  };

  return (
    <button
      onClick={handleConnect}
      disabled={connecting}
      className={className}
      style={{
        padding: "8px 16px",
        borderRadius: 6,
        background: "#6366f1",
        color: "white",
        fontWeight: 600,
        border: "none",
        cursor: connecting ? "not-allowed" : "pointer",
        marginBottom: 8,
        width: "fit-content",
        ...style,
      }}
    >
      {jwt
        ? `Signed in: ${address?.slice(0, 6)}...${address?.slice(-4)}`
        : connecting
        ? "Signing..."
        : label}
    </button>
  );
};
