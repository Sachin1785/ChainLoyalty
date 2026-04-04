"use client";

import React from "react";
import { useWallet } from "@/lib/hooks";
import { Button } from "./ui";
import { LogOut, Wallet } from "lucide-react";
import { shortenAddress } from "@/lib/utils/auth";

export function WalletConnect() {
  const { session, isConnecting, error, connect, disconnect, isConnected } =
    useWallet();

  const isDev = process.env.NODE_ENV === "development";
  const isMockWallet = session?.signature.includes("mock-");

  if (isConnected && session) {
    return (
      <div className="flex items-center gap-3">
        <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm font-medium text-blue-700 dark:text-blue-300 flex items-center gap-2">
            <Wallet size={16} />
            {shortenAddress(session.address)}
            {isDev && isMockWallet && (
              <span className="ml-1 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-2 py-0.5 rounded">
                MOCK
              </span>
            )}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={disconnect}
          className="text-gray-600 hover:text-gray-900"
        >
          <LogOut size={16} />
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={connect}
        isLoading={isConnecting}
        className="flex items-center gap-2"
      >
        <Wallet size={18} />
        {isDev ? "Connect (Dev)" : "Connect Wallet"}
      </Button>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      {isDev && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Development mode: Click to connect with mock wallet
        </p>
      )}
    </div>
  );
}

