'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { useAccount, useSignMessage, useDisconnect } from "wagmi";
import { SiweMessage } from "siwe";
import { monadTestnet } from "@/lib/wagmi";

interface AuthContextType {
  address: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  address: null,
  isAuthenticated: false,
  isLoading: true,
  signIn: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { address: walletAddress, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { disconnect } = useDisconnect();

  const [address, setAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check existing session on mount
  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data) => {
        setAddress(data.address ?? null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const signIn = useCallback(async () => {
    if (!walletAddress) return;
    setIsLoading(true);
    try {
      // 1. Get nonce
      const nonceRes = await fetch("/api/auth/nonce");
      const { nonce } = await nonceRes.json();

      // 2. Build SIWE message
      const message = new SiweMessage({
        domain: window.location.host,
        address: walletAddress,
        statement: "Sign in to ChainLoyalty to access your rewards dashboard.",
        uri: window.location.origin,
        version: "1",
        chainId: monadTestnet.id,
        nonce,
      });

      // 3. Sign
      const signature = await signMessageAsync({ message: message.prepareMessage() });

      // 4. Verify
      const verifyRes = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message.toMessage(), signature }),
      });

      if (!verifyRes.ok) throw new Error("Verification failed");
      setAddress(walletAddress);
    } catch (e) {
      console.error("SIWE sign-in error:", e);
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress, signMessageAsync]);

  const signOut = useCallback(async () => {
    await fetch("/api/auth/session", { method: "DELETE" });
    disconnect();
    setAddress(null);
  }, [disconnect]);

  // Auto-sign out if wallet disconnects
  useEffect(() => {
    if (!isConnected && address) {
      signOut();
    }
  }, [isConnected, address, signOut]);

  return (
    <AuthContext.Provider value={{ address, isAuthenticated: !!address, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
