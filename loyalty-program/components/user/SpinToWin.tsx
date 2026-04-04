"use client";

import React, { useState, useEffect } from "react";
import { Card, Button, Badge as BadgeUI, Modal } from "@/components/shared/ui";
import { useUserData } from "@/lib/hooks";
import {
  commitSpin,
  revealSpin,
  fetchLootboxTypes,
} from "@/lib/utils/api";
import { LootboxType, SpinResult } from "@/lib/types";
import { Zap, Gift, Clock, Loader2, ChevronRight } from "lucide-react";

export function SpinToWin() {
  const { stats, refetch } = useUserData();
  const [lootboxes, setLootboxes] = useState<LootboxType[]>([]);
  const [selectedLootbox, setSelectedLootbox] = useState<LootboxType | null>(
    null
  );
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<SpinResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [cooldownEnd, setCooldownEnd] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadLootboxes();
  }, []);

  const loadLootboxes = async () => {
    try {
      setLoading(true);
      const data = await fetchLootboxTypes();
      setLootboxes(data);
    } catch (error) {
      console.error("Failed to load lootboxes:", error);
    } finally {
      setLoading(false);
    }
  };

  const getResultColor = (prizeType: string) => {
    const colors: Record<string, string> = {
      NATIVE: "from-blue-500 to-blue-600",
      ERC20: "from-green-500 to-green-600",
      POINTS: "from-yellow-500 to-yellow-600",
      BADGE: "from-purple-500 to-purple-600",
    };
    return colors[prizeType] || "from-gray-500 to-gray-600";
  };

  const handleSpin = async () => {
    if (!selectedLootbox || !stats) return;

    if (stats.pointsBalance < selectedLootbox.pointsCost) {
      alert(
        `Insufficient points. You need ${selectedLootbox.pointsCost} but have ${stats.pointsBalance}`
      );
      return;
    }

    try {
      setIsSpinning(true);

      // Commit phase
      const commitResponse = await commitSpin(selectedLootbox.id);

      // Simulate 3 second delay for reveal
      setTimeout(async () => {
        try {
          // Reveal phase
          const revealResponse = await revealSpin(
            commitResponse.commitmentHash
          );
          setSpinResult(revealResponse);
          setShowResult(true);

          // Update cooldown if needed
          if (selectedLootbox.cooldownSeconds > 0) {
            setCooldownEnd(Date.now() + selectedLootbox.cooldownSeconds * 1000);
          }

          // Refetch user data
          await refetch();
        } catch (error) {
          console.error("Failed to reveal spin:", error);
          alert("Failed to reveal the spin result");
        } finally {
          setIsSpinning(false);
        }
      }, 3000);
    } catch (error) {
      console.error("Failed to commit spin:", error);
      alert("Failed to start spin");
      setIsSpinning(false);
    }
  };

  const formatCooldown = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ${seconds % 60}s`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  };

  const [cooldownRemaining, setCooldownRemaining] = useState<string>("");

  useEffect(() => {
    if (!cooldownEnd) {
      setCooldownRemaining("");
      return;
    }

    const timer = setInterval(() => {
      const now = Date.now();
      if (now >= cooldownEnd) {
        setCooldownEnd(null);
        setCooldownRemaining("");
      } else {
        setCooldownRemaining(formatCooldown(cooldownEnd - now));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldownEnd]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        Spin-to-Win
      </h2>

      {lootboxes.length === 0 ? (
        <Card className="p-12 text-center">
          <Gift size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 dark:text-gray-400">
            No lootboxes available right now
          </p>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lootboxes.map((lootbox) => (
              <Card
                key={lootbox.id}
                className={`p-6 cursor-pointer transition-all ${
                  selectedLootbox?.id === lootbox.id
                    ? "ring-2 ring-blue-500 shadow-lg"
                    : "hover:shadow-lg"
                }`}
                onClick={() => setSelectedLootbox(lootbox)}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {lootbox.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Spin the wheel of fortune
                      </p>
                    </div>
                    <div className="text-2xl">
                      <Gift size={32} />
                    </div>
                  </div>

                  <div className="space-y-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Cost:
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                        <Zap size={14} className="text-yellow-500" />
                        {lootbox.pointsCost} Points
                      </span>
                    </div>
                    {lootbox.cooldownSeconds > 0 && (
                      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          Cooldown:
                        </span>
                        <span className="text-gray-900 dark:text-white">
                          {Math.floor(lootbox.cooldownSeconds / 60)}m
                        </span>
                      </div>
                    )}
                  </div>

                  {selectedLootbox?.id === lootbox.id && (
                    <Button
                      variant="primary"
                      className="w-full flex items-center justify-center gap-2"
                      disabled={
                        isSpinning ||
                        (stats && stats.pointsBalance < lootbox.pointsCost) ||
                        cooldownEnd !== null
                      }
                      onClick={handleSpin}
                      isLoading={isSpinning}
                    >
                      {cooldownEnd ? (
                        <>
                          <Clock size={16} />
                          Wait {cooldownRemaining}
                        </>
                      ) : (
                        <>
                          <Zap size={16} />
                          Spin Now
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {selectedLootbox && stats && (
            <Card className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Your Points Balance
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.pointsBalance}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Cost for Spin
                  </p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    -{selectedLootbox.pointsCost}
                  </p>
                </div>
              </div>
            </Card>
          )}
        </>
      )}

      <Modal
        isOpen={showResult}
        onClose={() => setShowResult(false)}
        title="Spin Result"
      >
        {spinResult && (
          <div className="space-y-6">
            <div
              className={`bg-gradient-to-br ${getResultColor(
                spinResult.prizeType
              )} p-12 rounded-lg text-center text-white`}
            >
              <div className="text-6xl mb-4">
                {spinResult.prizeType === "BADGE" ? "🏆" : "🎁"}
              </div>
              <h3 className="text-2xl font-bold mb-2">Congratulations!</h3>
              <p className="text-lg opacity-90">You won:</p>
            </div>

            <Card className="p-6 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Prize
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {spinResult.label}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Type
                    </p>
                    <BadgeUI variant="primary">{spinResult.prizeType}</BadgeUI>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Amount
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {spinResult.value}
                    </p>
                  </div>
                </div>

                {spinResult.attestationUID && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Attestation Proof
                    </p>
                    <p className="text-xs font-mono text-blue-600 dark:text-blue-400 truncate">
                      {spinResult.attestationUID}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 w-full text-xs"
                    >
                      View on Etherscan
                      <ChevronRight size={12} />
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            <Button onClick={() => setShowResult(false)} className="w-full">
              Close
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
