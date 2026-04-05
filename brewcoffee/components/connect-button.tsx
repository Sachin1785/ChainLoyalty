'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { LogOut, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const [mounted, setMounted] = useState(false);

  // Prevents hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="h-10 w-32 bg-muted/20 rounded-lg animate-pulse" />;

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex flex-col items-end mr-1">
           <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground leading-none">Connected</span>
           <span className="text-xs font-mono font-bold text-foreground">{address.slice(0, 6)}...{address.slice(-4)}</span>
        </div>
        <button
          onClick={() => disconnect()}
          className="p-2 bg-muted hover:bg-destructive hover:text-white transition-all rounded-lg group"
          title="Disconnect Wallet"
        >
          <LogOut size={18} />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => connect({ connector: injected() })}
      className="px-4 py-2 bg-accent text-accent-foreground font-semibold rounded-lg hover:bg-accent/90 transition-all flex items-center gap-2 shadow-sm"
    >
      <Wallet size={18} />
      <span>Connect</span>
    </button>
  );
}
