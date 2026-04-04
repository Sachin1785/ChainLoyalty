"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuthStore, useUserStore } from "../store";
import {
  getConnectedAddress,
  authenticateWallet,
  getStoredSession,
} from "../utils/auth";
import { fetchUserStats, fetchUserBadges } from "../utils/api";
import type { WalletSession, UserStats, Badge } from "../types";

export function useWallet() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const session = useAuthStore((state) => state.session);
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clearSession);

  const connect = useCallback(async () => {
    try {
      setIsConnecting(true);
      setError(null);

      const ethereum = (window as any).ethereum;

      // Development: use mock wallet if no MetaMask
      if (!ethereum && process.env.NODE_ENV === "development") {
        console.log("MetaMask not found, using mock development wallet");
        // Create mock session with admin address
        const mockAddress = process.env.NEXT_PUBLIC_ADMIN_ADDRESSES?.split(",")[0] || "0x742d35Cc6634C0532925a3b844Bc390e5dAC34dC";
        const walletSession: WalletSession = {
          address: mockAddress,
          signature: "0xmock-signature-" + Date.now(),
          message: "Mock development session",
          timestamp: Date.now(),
          issuedAt: new Date().toISOString(),
        };
        setSession(walletSession);
        return;
      }

      if (!ethereum) {
        throw new Error("No Ethereum provider found. Please install MetaMask.");
      }

      // Request account access
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length === 0) {
        throw new Error("No accounts found");
      }

      // Authenticate
      const walletSession = await authenticateWallet();
      setSession(walletSession);
    } catch (err: any) {
      setError(err.message || "Failed to connect wallet");
      console.error("Wallet connection error:", err);
    } finally {
      setIsConnecting(false);
    }
  }, [setSession]);

  const disconnect = useCallback(() => {
    clearSession();
    setError(null);
  }, [clearSession]);

  // Check for stored session on mount
  useEffect(() => {
    const stored = getStoredSession();
    if (stored && !session) {
      setSession(stored);
    }
  }, [session, setSession]);

  return {
    session,
    isConnecting,
    error,
    connect,
    disconnect,
    isConnected: !!session,
  };
}

export function useUserData() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const session = useAuthStore((state) => state.session);
  const stats = useUserStore((state) => state.stats);
  const badges = useUserStore((state) => state.badges);
  const setStats = useUserStore((state) => state.setStats);
  const setBadges = useUserStore((state) => state.setBadges);

  const fetchData = useCallback(async () => {
    if (!session?.address) return;

    try {
      setLoading(true);
      setError(null);

      const [statsData, badgesData] = await Promise.all([
        fetchUserStats(session.address),
        fetchUserBadges(session.address),
      ]);

      setStats(statsData);
      setBadges(badgesData);
    } catch (err: any) {
      setError(err.message || "Failed to fetch user data");
      console.error("Error fetching user data:", err);
    } finally {
      setLoading(false);
    }
  }, [session?.address, setStats, setBadges]);

  // Fetch data when session changes
  useEffect(() => {
    if (session?.address) {
      fetchData();
    }
  }, [session?.address, fetchData]);

  return {
    stats,
    badges,
    loading,
    error,
    refetch: fetchData,
  };
}

export function useAdmin() {
  const [adminSession, setAdminSession] = useState<WalletSession | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const session = useAuthStore((state) => state.session);

  useEffect(() => {
    if (session?.address) {
      const adminAddresses =
        process.env.NEXT_PUBLIC_ADMIN_ADDRESSES?.split(",").map(a => a.trim().toLowerCase()) || [];

      // In development, allow any connected wallet as admin
      const isDev = process.env.NODE_ENV === "development";
      const isMockWallet = session.signature.includes("mock-");

      // Check if address is in admin list OR if it's a mock wallet in development
      const isUserAdmin = adminAddresses.includes(session.address.toLowerCase()) ||
                         (isDev && isMockWallet);

      setIsAdmin(isUserAdmin);
      if (isUserAdmin) {
        setAdminSession(session);
      }
    }
  }, [session]);

  return {
    adminSession,
    isAdmin,
  };
}

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error("Error reading from localStorage:", error);
    }
  }, [key]);

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Error writing to localStorage:", error);
    }
  };

  return [storedValue, setValue];
}
