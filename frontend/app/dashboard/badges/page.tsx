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

interface BadgeInstance {
  id: number;
  reward_type: string;
  amount: number; // This is actually the badge_type_id in this context
  reason: string;
  created_at: string;
  tx_hash?: string;
}

interface BadgeStandard {
  id: string;
  name: string;
  description: string;
  metadataUri: string;
  point_value: number;
  max_supply: number;
  transferable: boolean;
}

export default function BadgesPage() {
  const { address } = useAuth();
  const [earnedBadges, setEarnedBadges] = useState<BadgeInstance[]>([]);
  const [allStandards, setAllStandards] = useState<BadgeStandard[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<number | null>(null);

  const { writeContract, data: hash, isPending: isSigning } = useWriteContract();
  const { isLoading: isWaiting, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // 1. Fetch public standards
        const stdRes = await fetch(`${API_BASE}/badges`);
        const stdData = await stdRes.json();
        setAllStandards(stdData || []);

        // 2. Fetch user instances if address exists
        if (address) {
          const statsRes = await fetch(`${API_BASE}/rewards/${address}/stats`);
          const statsData = await statsRes.json();
          setEarnedBadges(statsData.badges || []);
        }
      } catch (e) {
        console.error("Failed to load badges:", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [address, isSuccess]);

  const handleClaim = async (badge: BadgeInstance) => {
    if (!address) return;
    setClaimingId(badge.id);
    try {
      // 1. Get signature from backend
      const res = await fetch(`${API_BASE}/rewards/${address}/claim/${badge.id}`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to get signature");
      const payload = await res.json();

      // 2. Call claimBadge on contract
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
      setClaimingId(null);
    } 
    // We don't nullify claimingId here to let the success effect use it
  };

  useEffect(() => {
    if (isSuccess && hash && claimingId) {
      fetch(`${API_BASE}/rewards/report-tx?reward_id=${claimingId}&tx_hash=${hash}`, { method: "POST" })
        .catch(err => console.error("Failed to report tx:", err))
        .finally(() => setClaimingId(null));
    }
  }, [isSuccess, hash, claimingId]);

  const earned = earnedBadges.map(eb => {
    const std = allStandards.find(s => Number(s.id) === Number(eb.amount));
    return { ...eb, standard: std };
  });

  const locked = allStandards.filter(std => 
    !earnedBadges.some(eb => Number(eb.amount) === Number(std.id))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-4xl font-black animate-bounce">Opening trophy room...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-4xl font-black uppercase tracking-tighter">My Badges</h1>
        <p className="font-bold text-sm mt-1 opacity-70">
          {earned.length} earned · {locked.length} locked
        </p>
      </div>

      {/* Earned Badges */}
      <section>
        <h2 className="text-xl font-black uppercase tracking-tight mb-4 flex items-center gap-2">
          <Trophy size={20} className="text-neo-yellow" /> Earned Achievements
        </h2>
        {earned.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {earned.map((badge) => (
              <NeoCard key={badge.id} className="p-6 bg-neo-yellow flex flex-col gap-3">
                <div className="w-16 h-16 bg-white border-4 border-black rounded-2xl flex items-center justify-center shadow-[4px_4px_0_0_black] overflow-hidden">
                  {badge.standard?.metadataUri ? (
                    <img src={badge.standard.metadataUri} alt={badge.standard.name} className="w-full h-full object-cover" />
                  ) : (
                    "🏆"
                  )}
                </div>
                <h3 className="font-black text-lg leading-tight">{badge.standard?.name || badge.reason}</h3>
                <div className="flex items-center gap-2">
                   <NeoBadge variant="black" className="text-[10px] py-0 px-2 h-5">
                      {badge.standard?.point_value || 0} Points
                   </NeoBadge>
                </div>
                <p className="text-xs font-bold opacity-70 leading-tight">
                  {badge.standard?.description || "Badge earned on " + new Date(badge.created_at).toLocaleDateString()}
                </p>
                <div className="mt-4">
                  {badge.tx_hash ? (
                    <a 
                      href={`https://monad-testnet.socialscan.io/tx/${badge.tx_hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <NeoBadge variant="green" className="w-full justify-center hover:opacity-80 transition-opacity cursor-pointer">
                        View on Explorer
                        <span className="ml-2">↗</span>
                      </NeoBadge>
                    </a>
                  ) : (
                    <NeoButton
                      variant="primary"
                      size="sm"
                      className="w-full"
                      onClick={() => handleClaim(badge)}
                      disabled={claimingId === badge.id || isSigning || isWaiting}
                    >
                      {claimingId === badge.id || isSigning ? "Signing..." : isWaiting ? "Minting..." : "Claim NFT"}
                    </NeoButton>
                  )}
                </div>
              </NeoCard>
            ))}
          </div>
        ) : (
          <NeoCard className="p-12 text-center" hover={false}>
            <p className="font-bold opacity-50">No trophies yet. Keep grinding!</p>
          </NeoCard>
        )}
      </section>

      {/* Locked / Discoverable Badges */}
      {locked.length > 0 && (
         <section>
            <h2 className="text-xl font-black uppercase tracking-tight mb-4 flex items-center gap-2">
               <Lock size={20} className="opacity-40" /> Possible Achievements
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
               {locked.map((badge) => (
               <NeoCard key={badge.id} className="p-6 bg-neo-white opacity-60 flex flex-col gap-3 grayscale" hover={false}>
                  <div className="w-16 h-16 bg-black/10 border-4 border-black/20 rounded-2xl flex items-center justify-center shadow-[4px_4px_0_0_rgba(0,0,0,0.1)] overflow-hidden">
                     {badge.metadataUri ? (
                        <img src={badge.metadataUri} alt={badge.name} className="w-full h-full object-cover opacity-30" />
                     ) : (
                        "🔒"
                     )}
                  </div>
                  <h3 className="font-black text-lg leading-tight text-black/50">{badge.name}</h3>
                  <p className="text-sm font-bold opacity-40">{badge.description}</p>
                  <NeoBadge variant="black" className="self-start mt-auto opacity-30">Locked</NeoBadge>
               </NeoCard>
               ))}
            </div>
         </section>
      )}
    </div>
  );
}

