'use client';

import { useState } from "react";
import { useConnect, useAccount } from "wagmi";
import { useAuth } from "@/lib/auth-context";
import { Wallet, ChevronDown, LogOut, ExternalLink, Copy, Check } from "lucide-react";
import { NeoButton } from "./ui/NeoButton";

export function ConnectWallet() {
  const { address: walletAddress, isConnected } = useAccount();
  const { address: authedAddress, isAuthenticated, signIn, signOut, isLoading } = useAuth();
  const { connect, connectors } = useConnect();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showConnectors, setShowConnectors] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    if (authedAddress) {
      navigator.clipboard.writeText(authedAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const short = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  // State 1: Not connected — show wallet picker
  if (!isConnected) {
    return (
      <div className="relative">
        <NeoButton
          variant="primary"
          size="sm"
          onClick={() => setShowConnectors((v) => !v)}
          className="gap-2"
        >
          <Wallet size={16} /> Connect Wallet
        </NeoButton>

        {showConnectors && (
          <div className="absolute right-0 top-12 z-50 bg-white border-3 border-black rounded-xl shadow-[8px_8px_0_0_black] p-3 min-w-[200px]">
            <p className="font-black text-xs uppercase tracking-widest mb-3 px-2">Choose Wallet</p>
            {connectors.map((connector) => (
              <button
                key={connector.id}
                onClick={() => {
                  connect({ connector });
                  setShowConnectors(false);
                }}
                className="w-full text-left px-4 py-3 rounded-lg font-bold hover:bg-neo-yellow transition-colors flex items-center gap-3"
              >
                <Wallet size={16} />
                {connector.name}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // State 2: Connected but not signed in — show Sign In button
  if (isConnected && !isAuthenticated) {
    return (
      <div className="flex items-center gap-3">
        <span className="font-bold text-sm opacity-70 hidden sm:block">{short(walletAddress!)}</span>
        <NeoButton
          variant="green"
          size="sm"
          onClick={signIn}
          disabled={isLoading}
          className="bg-neo-green"
        >
          {isLoading ? "Signing..." : "Sign In"}
        </NeoButton>
      </div>
    );
  }

  // State 3: Fully authenticated
  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown((v) => !v)}
        className="flex items-center gap-2 px-4 py-2 border-3 border-black rounded-xl bg-neo-green font-black text-sm shadow-[4px_4px_0_0_black] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[6px_6px_0_0_black] transition-all"
      >
        <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-neo-yellow" />
        </div>
        {short(authedAddress!)}
        <ChevronDown size={14} className={`transition-transform ${showDropdown ? "rotate-180" : ""}`} />
      </button>

      {showDropdown && (
        <div className="absolute right-0 top-14 z-50 bg-white border-3 border-black rounded-xl shadow-[8px_8px_0_0_black] p-2 min-w-[220px]">
          {/* Full address */}
          <div className="px-4 py-3 border-b-2 border-dashed border-black mb-2">
            <p className="font-black text-xs uppercase tracking-widest text-black/50 mb-1">Wallet</p>
            <p className="font-black text-sm">{short(authedAddress!)}</p>
          </div>
          <button
            onClick={copyAddress}
            className="w-full text-left px-4 py-3 rounded-lg font-bold hover:bg-neo-yellow transition-colors flex items-center gap-3 text-sm"
          >
            {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
            {copied ? "Copied!" : "Copy Address"}
          </button>
          <a
            href={`https://testnet.monadexplorer.com/address/${authedAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full text-left px-4 py-3 rounded-lg font-bold hover:bg-neo-yellow transition-colors flex items-center gap-3 text-sm"
          >
            <ExternalLink size={16} /> View on Explorer
          </a>
          <button
            onClick={() => { signOut(); setShowDropdown(false); }}
            className="w-full text-left px-4 py-3 rounded-lg font-bold hover:bg-neo-red hover:text-white transition-colors flex items-center gap-3 text-sm mt-1 border-t-2 border-dashed border-black"
          >
            <LogOut size={16} /> Disconnect
          </button>
        </div>
      )}
    </div>
  );
}
