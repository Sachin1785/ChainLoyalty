"use client";
import { useEffect, useState } from "react";
import { NeoCard } from "@/components/ui/NeoCard";
import { NeoButton } from "@/components/ui/NeoButton";
import { NeoBadge } from "@/components/ui/NeoBadge";
import { Zap, RotateCcw } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const API_BASE = "http://127.0.0.1:8000/api/v1";

interface Prize {
  type: string;
  amount: number;
  label: string;
  weight_bps: number;
  color?: string; // We'll assign colors locally
}

export default function SpinPage() {
  const { address } = useAuth();
  const [config, setConfig] = useState<any>(null);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<null | any>(null);
  const [phase, setPhase] = useState<"idle" | "committing" | "waiting" | "revealing" | "done">("idle");
  const [salt, setSalt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const colors = ["#FFD703", "#FEBDD2", "#8ED670", "#e5e7eb", "#7CC5D9", "#FA5D5D"];

  useEffect(() => {
    fetch(`${API_BASE}/gamification/lootbox/1/config`)
      .then((r) => r.json())
      .then((data) => {
        if (!data || !data.prizes) {
          console.warn("Lootbox config empty, using fallback");
          const fallbackPrizes = [
            { type: "POINTS", amount: 250, label: "250 Pts", weight_bps: 4000 },
            { type: "NONE", amount: 0, label: "Try Again", weight_bps: 3000 },
            { type: "BADGE", amount: 1, label: "Rare Badge", weight_bps: 2000 },
            { type: "POINTS", amount: 1000, label: "1000 Pts", weight_bps: 1000 }
          ].map((p, i) => ({ ...p, color: colors[i % colors.length] }));
          
          setConfig({ name: "Genesis Lootbox", points_cost: 500, cooldown: 60, prizes: fallbackPrizes });
          setLoading(false);
          return;
        }

        const prizesWithColors = data.prizes.map((p: any, i: number) => ({
          ...p,
          color: colors[i % colors.length]
        }));
        setConfig({ ...data, prizes: prizesWithColors });
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lootbox config fetch error:", err);
        setLoading(false);
      });
  }, []);


  const prizes = config?.prizes || [];
  const segmentAngle = 360 / (prizes.length || 1);

  const handleSpin = async () => {
    if (spinning || !address || !config) return;
    
    setSpinning(true);
    setResult(null);
    setPhase("committing");

    try {
      // 1. Commit spin on-chain via backend
      const commitRes = await fetch(`${API_BASE}/gamification/spin/commit?wallet_address=${address}&lootbox_id=1`, { method: "POST" });
      const commitData = await commitRes.json();
      if (!commitRes.ok) throw new Error(commitData.detail || "Commit failed");
      
      const spinSalt = commitData.salt;
      setSalt(spinSalt);
      setPhase("waiting");

      // 2. Wait for block delay (Backend uses 2 blocks, we wait 3s for safe reveal)
      // Play spin animation during this time
      const targetDeg = 360 * 5 + Math.random() * 360; // Just visual for now, we'll fix to result later
      setRotation((prev) => prev + targetDeg);
      
      await new Promise((r) => setTimeout(r, 4000));
      
      setPhase("revealing");

      // 3. Reveal spin on-chain
      const revealRes = await fetch(`${API_BASE}/gamification/spin/reveal?wallet_address=${address}&salt_hex=${spinSalt}`, { method: "POST" });
      const revealData = await revealRes.json();
      if (!revealRes.ok) throw new Error(revealData.detail || "Reveal failed");

      setResult({ label: revealData.prize_label, status: "success", tx_hash: revealData.tx_hash });
      setPhase("done");
    } catch (err: any) {
      console.error("Spin error:", err);
      alert(err.message || "Spin failed");
      setPhase("idle");
    } finally {
      setSpinning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-4xl font-black animate-bounce">Loading RewardVault...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black uppercase tracking-tighter">Spin & Win</h1>
        <p className="font-bold text-sm mt-1 opacity-70">
          Costs {config?.points_cost} points · Cooldown {config?.cooldown}s
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        {/* Wheel */}
        <NeoCard className="p-8 flex flex-col items-center gap-6" hover={false}>
          <div className="relative">
            <div className="absolute top-[-18px] left-1/2 -translate-x-1/2 z-10 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[28px] border-t-black" />

            <div
              className="relative w-72 h-72 border-4 border-black rounded-full shadow-[8px_8px_0_0_black] overflow-hidden"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: spinning ? "transform 4s cubic-bezier(0.17,0.67,0.12,0.99)" : "none",
              }}
            >
              <svg viewBox="0 0 200 200" className="w-full h-full">
                {prizes.map((prize: any, i: number) => {
                  const startAngle = (i * 360) / prizes.length;
                  const endAngle = ((i + 1) * 360) / prizes.length;
                  const toRad = (deg: number) => (deg * Math.PI) / 180;
                  const x1 = 100 + 100 * Math.cos(toRad(startAngle - 90));
                  const y1 = 100 + 100 * Math.sin(toRad(startAngle - 90));
                  const x2 = 100 + 100 * Math.cos(toRad(endAngle - 90));
                  const y2 = 100 + 100 * Math.sin(toRad(endAngle - 90));
                  const midAngle = (startAngle + endAngle) / 2;
                  const tx = 100 + 65 * Math.cos(toRad(midAngle - 90));
                  const ty = 100 + 65 * Math.sin(toRad(midAngle - 90));
                  const large = endAngle - startAngle > 180 ? 1 : 0;

                  return (
                    <g key={i}>
                      <path
                        d={`M 100 100 L ${x1} ${y1} A 100 100 0 ${large} 1 ${x2} ${y2} Z`}
                        fill={prize.color}
                        stroke="black"
                        strokeWidth="2"
                      />
                      <text
                        x={tx} y={ty}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="8"
                        fontWeight="bold"
                        transform={`rotate(${midAngle + 90}, ${tx}, ${ty})`}
                      >
                        {prize.label.split(" ")[0]}
                      </text>
                    </g>
                  );
                })}
                <circle cx="100" cy="100" r="12" fill="neo-white" stroke="black" strokeWidth="3" />
              </svg>
            </div>
          </div>

          <div className="h-8 flex flex-col items-center gap-1">
            {phase === "committing" && <NeoBadge variant="yellow">🔒 Locking Commitment...</NeoBadge>}
            {phase === "waiting" && <NeoBadge variant="pink">⏳ Waiting for blockhash...</NeoBadge>}
            {phase === "revealing" && <NeoBadge variant="blue">🎲 Revealing Prize...</NeoBadge>}
          </div>

          <NeoButton
            variant="secondary"
            size="lg"
            className="w-full text-xl bg-neo-yellow border-black"
            onClick={handleSpin}
            disabled={spinning || !address}
          >
            <Zap /> {spinning ? "Spinning..." : `SPIN! (${config?.points_cost} pts)`}
          </NeoButton>
        </NeoCard>

        {/* Right Side */}
        <div className="space-y-6">
          {result && (
            <NeoCard className="p-6 bg-neo-green text-center" hover={false}>
              <p className="text-6xl mb-3">🎉</p>
              <h2 className="text-3xl font-black uppercase">Spin Result!</h2>
              <p className="font-bold text-sm mt-3 opacity-70">
                Reward processed in tx: 
                <span className="block text-xs font-mono mt-1 break-all bg-white/30 p-2 rounded">{result.tx_hash}</span>
              </p>
              <NeoButton variant="primary" size="sm" className="mt-6" onClick={() => { setResult(null); setPhase("idle"); }}>
                <RotateCcw size={16} /> Close
              </NeoButton>
            </NeoCard>
          )}

          <NeoCard className="overflow-hidden" hover={false}>
            <div className="p-4 border-b-4 border-black bg-black text-neo-yellow">
              <h2 className="font-black uppercase">Lootbox Odds</h2>
            </div>
            <div className="divide-y-2 divide-dashed divide-black">
              {prizes.map((prize: any, i: number) => (
                <div key={i} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 rounded-full border-2 border-black" style={{ background: prize.color }} />
                    <span className="font-black">{prize.label}</span>
                  </div>
                  <NeoBadge variant="black">{prize.weight_bps / 100}%</NeoBadge>
                </div>
              ))}
            </div>
          </NeoCard>
        </div>
      </div>
    </div>
  );
}

