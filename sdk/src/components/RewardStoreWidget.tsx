import React, { useState } from "react";
import { useRewardBalance } from "../hooks";
import { ChainLoyaltyClient } from "../client/ChainLoyaltyClient";
import { ConnectWalletButton } from "./ConnectWalletButton";

export interface StoreItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  imageUrl?: string;
}

export interface RewardStoreTheme {
  background?: string;
  foreground?: string;
  border?: string;
  shadow?: string;
  cardBase?: string;
  accent?: string; // used for primary purchase button
  insufficientFundsBg?: string; // disabled button color
  fontFamily?: string;
}

export interface RewardStoreWidgetProps {
  client: ChainLoyaltyClient;
  walletAddress: string;
  items: StoreItem[];
  title?: string;
  theme?: RewardStoreTheme;
  onConnect?: (address: string) => void;
  onPurchaseSuccess?: (item: StoreItem, txHash: string) => void;
  onPurchaseError?: (error: any) => void;
  className?: string;
  style?: React.CSSProperties;
}

const defaultTheme: RewardStoreTheme = {
  background: "#f0f9ff",
  foreground: "#000000",
  border: "#000000",
  shadow: "6px 6px 0 0 black",
  cardBase: "#ffffff",
  accent: "#FFD703",
  insufficientFundsBg: "#9ca3af",
  fontFamily: 'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
};

export const RewardStoreWidget: React.FC<RewardStoreWidgetProps> = ({
  client,
  walletAddress,
  items,
  title = "Rewards Store",
  theme = {},
  onConnect,
  onPurchaseSuccess,
  onPurchaseError,
  className = "",
  style = {},
}) => {
  const finalTheme = { ...defaultTheme, ...theme };
  const { data: balanceData, isLoading, error, refetch } = useRewardBalance(client, walletAddress);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  if (!walletAddress) {
    return (
      <div 
        className={className} 
        style={{
          background: finalTheme.background,
          color: finalTheme.foreground,
          border: `3px solid ${finalTheme.border}`,
          boxShadow: finalTheme.shadow,
          fontFamily: finalTheme.fontFamily,
          padding: "24px",
          borderRadius: "8px",
          ...style
        }}
      >
        <h2 style={{ fontSize: "1.5rem", fontWeight: "900", margin: "0 0 16px 0", textTransform: "uppercase" }}>
          {title}
        </h2>
        <div style={{ padding: "20px", textAlign: "center", background: finalTheme.cardBase, border: `2px solid ${finalTheme.border}`, borderRadius: "4px" }}>
          <p style={{ fontWeight: "700", marginBottom: "16px" }}>Connect your wallet or login to browse the store!</p>
          <ConnectWalletButton 
            onConnect={onConnect || (() => {})} 
            theme={{ background: finalTheme.accent, foreground: finalTheme.foreground, border: finalTheme.border, shadow: "4px 4px 0 0 black" }} 
          />
        </div>
      </div>
    );
  }

  const userPoints = balanceData?.pointsBalance || 0;

  const handlePurchase = async (item: StoreItem) => {
    if (userPoints < item.cost) return;
    
    setPurchasingId(item.id);
    try {
      const res = await client.purchaseStoreItem(walletAddress, item.id, item.cost);
      if (res && res.status === "success" && res.tx_hash) {
        if (onPurchaseSuccess) onPurchaseSuccess(item, res.tx_hash);
        // Force balance refresh
        await refetch();
      }
    } catch (err: any) {
      console.error("Store purchase failed:", err);
      if (onPurchaseError) onPurchaseError(err);
    } finally {
      setPurchasingId(null);
    }
  };

  return (
    <div
      className={className}
      style={{
        background: finalTheme.background,
        color: finalTheme.foreground,
        border: `3px solid ${finalTheme.border}`,
        boxShadow: finalTheme.shadow,
        fontFamily: finalTheme.fontFamily,
        padding: "24px",
        borderRadius: "8px",
        ...style
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "20px" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "900", margin: "0", textTransform: "uppercase" }}>
          {title}
        </h2>
        <span style={{ fontSize: "1.2rem", fontWeight: "900", background: finalTheme.cardBase, padding: "4px 12px", border: `2px solid ${finalTheme.border}`, borderRadius: "16px" }}>
          {isLoading ? "..." : `${userPoints} pts`}
        </span>
      </div>

      {error ? (
        <div style={{ color: "red", fontWeight: "bold" }}>Error loading balance.</div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: "center", padding: "20px", background: finalTheme.cardBase, border: `2px solid ${finalTheme.border}` }}>No items available in the store.</div>
      ) : (
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", 
          gap: "20px" 
        }}>
          {items.map(item => {
            const canAfford = userPoints >= item.cost;
            const isPurchasing = purchasingId === item.id;
            
            return (
              <div 
                key={item.id}
                style={{
                  background: finalTheme.cardBase,
                  border: `3px solid ${finalTheme.border}`,
                  borderRadius: "8px",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: "4px 4px 0 0 black",
                  opacity: canAfford ? 1 : 0.8,
                  transition: "all 0.2s ease"
                }}
              >
                {item.imageUrl && (
                  <div style={{ marginBottom: "12px", textAlign: "center", height: "100px" }}>
                    <img 
                      src={item.imageUrl} 
                      alt={item.name} 
                      style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                    />
                  </div>
                )}
                <h3 style={{ margin: "0 0 4px 0", fontSize: "1.1rem", fontWeight: "800" }}>{item.name}</h3>
                <p style={{ margin: "0 0 16px 0", fontSize: "0.85rem", opacity: 0.8, flexGrow: 1 }}>{item.description}</p>
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
                  <span style={{ fontWeight: "900", fontSize: "1.1rem" }}>{item.cost} pts</span>
                  <button
                    onClick={() => handlePurchase(item)}
                    disabled={!canAfford || isPurchasing}
                    style={{
                      background: !canAfford ? finalTheme.insufficientFundsBg : finalTheme.accent,
                      color: finalTheme.foreground,
                      fontWeight: "800",
                      padding: "8px 16px",
                      border: `2px solid ${finalTheme.border}`,
                      borderRadius: "4px",
                      cursor: (!canAfford || isPurchasing) ? "not-allowed" : "pointer",
                      boxShadow: (!canAfford || isPurchasing) ? "none" : "2px 2px 0 0 black",
                      transform: (!canAfford || isPurchasing) ? "translate(2px, 2px)" : "none",
                      transition: "all 0.1s"
                    }}
                  >
                    {isPurchasing ? "Processing..." : canAfford ? "Buy" : "Not Enough"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
