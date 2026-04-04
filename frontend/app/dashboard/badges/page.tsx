'use client';

import { useEffect, useState } from "react";
import { NeoCard } from "@/components/ui/NeoCard";
import { NeoBadge } from "@/components/ui/NeoBadge";
import { NeoButton } from "@/components/ui/NeoButton";
import { Trophy, Lock } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import badgeAbi from "@/lib/abis/LoyaltyBadge.json";

const API_BASE = "http://localhost:8000/api/v1";
const LOYALTY_BADGE_ADDR = process.env.NEXT_PUBLIC_LOYALTY_BADGE_ADDR as `0x${string}`;

interface Badge {
  id: number;
  reward_type: string;
  amount: number;
  reason: string;
  created_at: string;
  tx_hash?: string;
}

export default function BadgesPage() {
  const { address } = useAuth();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<number | null>(null);

  const { writeContract, data: hash, isPending: isSigning } = useWriteContract();
  const { isLoading: isWaiting, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (!address) return;
    fetch(`${API_BASE}/rewards/${address}/stats`)
      .then((r) => r.json())
      .then((data) => {
        setBadges(data.badges || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [address, isSuccess]);

  const handleClaim = async (badge: Badge) => {
    if (!address) return;
    setClaimingId(badge.id);
    try {
      // 1. Get signature from backend
      const res = await fetch(`${API_BASE}/rewards/${address}/claim/${badge.id}`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to get signature");
      const payload = await res.json();

      // 2. Call claimBadge on contract
      // signature check in LoyaltyBadge.sol: claimBadge(address, uint256, bytes32, uint256, bytes)
      writeContract({
        address: LOYALTY_BADGE_ADDR,
        abi: badgeAbi.abi,
        functionName: "claimBadge",
        args: [
          address,
          BigInt(payload.badge_type_id),
          payload.attestation_uid as `0x${string}`,
          BigInt(payload.expires_at),
          payload.signature as `0x${string}`
        ],
      });
    } catch (err) {
      console.error("Claim error:", err);
    } finally {
      setClaimingId(null);
    }
  };

  const earned = badges;
  // For demo, we still show some "discoverable" locked badges as a separate concept
  const LOCKED_PREVIEWS = [
    { name: "Diamond Hands", description: "Held points for 90 days" },
    { name: "Lootbox Hunter", description: "Spin the wheel 10 times" }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-4xl font-black animate-bounce">Loading trophy room...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black uppercase tracking-tighter">My Badges</h1>
        <p className="font-bold text-sm mt-1 opacity-70">
          {earned.length} earned · {LOCKED_PREVIEWS.length} locked
        </p>
      </div>

      {/* Earned Badges */}
      <section>
        <h2 className="text-xl font-black uppercase tracking-tight mb-4 flex items-center gap-2">
          <Trophy size={20} /> Earned Achievements
        </h2>
        {earned.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {earned.map((badge) => (
              <NeoCard key={badge.id} className="p-6 bg-neo-yellow flex flex-col gap-3">
                <div className="w-14 h-14 bg-white border-4 border-black rounded-full flex items-center justify-center shadow-[4px_4px_0_0_black] text-2xl">
                  🏆
                </div>
                <h3 className="font-black text-lg leading-tight">{badge.reason}</h3>
                <p className="text-sm font-bold opacity-70">Badge Type ID: {badge.amount}</p>
                <div className="mt-auto pt-2">
                  {badge.tx_hash ? (
                    <NeoBadge variant="green" className="w-full justify-center">On-Chain Verified</NeoBadge>
                  ) : (
                    <NeoButton
                      variant="primary"
                      size="sm"
                      className="w-full"
                      onClick={() => handleClaim(badge)}
                      disabled={claimingId === badge.id || isSigning || isWaiting}
                    >
                      {claimingId === badge.id || isSigning ? "Signing..." : isWaiting ? "Minting..." : "Claim On-Chain"}
                    </NeoButton>
                  )}
                </div>
              </NeoCard>
            ))}
          </div>
        ) : (
          <NeoCard className="p-12 text-center" hover={false}>
            <p className="font-bold opacity-50">No badges earned yet. Complete tasks to unlock rewards!</p>
          </NeoCard>
        )}
      </section>

      {/* Locked Badges */}
      <section>
        <h2 className="text-xl font-black uppercase tracking-tight mb-4 flex items-center gap-2">
          <Lock size={20} /> Locked
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {LOCKED_PREVIEWS.map((badge, i) => (
            <NeoCard key={i} className="p-6 bg-neo-white opacity-60 flex flex-col gap-3" hover={false}>
              <div className="w-14 h-14 bg-black/10 border-4 border-black rounded-full flex items-center justify-center shadow-[4px_4px_0_0_black] text-2xl">
                🔒
              </div>
              <h3 className="font-black text-lg leading-tight">{badge.name}</h3>
              <p className="text-sm font-bold opacity-70">{badge.description}</p>
              <NeoBadge variant="black" className="self-start mt-auto">Discovering...</NeoBadge>
            </NeoCard>
          ))}
        </div>
      </section>
    </div>
  );
}

