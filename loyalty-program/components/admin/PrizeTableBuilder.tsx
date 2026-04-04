"use client";

import React, { useState, useEffect } from "react";
import { Card, Button, Input, Badge as BadgeUI, Modal } from "@/components/shared/ui";
import { Prize } from "@/lib/types";
import { fetchPrizes, updatePrizeWeights } from "@/lib/utils/api";
import { Plus, Trash2, AlertCircle } from "lucide-react";

export function PrizeTableBuilder() {
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPrize, setNewPrize] = useState<{
    type: Prize["type"];
    label: string;
    value: string;
    weightBps: number;
  }>({
    type: "POINTS",
    label: "",
    value: "",
    weightBps: 0,
  });

  const totalWeight = prizes.reduce((sum, p) => sum + p.weightBps, 0);
  const isValid = totalWeight === 10000;

  useEffect(() => {
    loadPrizes();
  }, []);

  const loadPrizes = async () => {
    try {
      setLoading(true);
      const data = await fetchPrizes();
      setPrizes(data);
    } catch (error) {
      console.error("Failed to load prizes:", error);
    } finally {
      setLoading(false);
    }
  };

  const addPrize = () => {
    if (!newPrize.label || !newPrize.value) {
      alert("Please fill in all fields");
      return;
    }

    setPrizes([
      ...prizes,
      {
        id: Date.now().toString(),
        ...newPrize,
      },
    ]);

    setNewPrize({
      type: "POINTS",
      label: "",
      value: "",
      weightBps: 0,
    });
    setIsModalOpen(false);
  };

  const updateWeight = (id: string, newWeight: number) => {
    setPrizes(
      prizes.map((p) => (p.id === id ? { ...p, weightBps: newWeight } : p))
    );
  };

  const removePrize = (id: string) => {
    setPrizes(prizes.filter((p) => p.id !== id));
  };

  const handleSave = async () => {
    if (!isValid) {
      alert("Total weights must equal 10,000 (100%)");
      return;
    }

    try {
      await updatePrizeWeights(prizes);
      alert("Weights saved successfully!");
    } catch (error) {
      console.error("Failed to save weights:", error);
    }
  };

  const typeColors: Record<
    Prize["type"],
    "primary" | "success" | "warning" | "error"
  > = {
    NATIVE: "primary",
    ERC20: "success",
    POINTS: "warning",
    BADGE: "error",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Prize Table Builder
        </h2>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus size={18} />
          Add Prize
        </Button>
      </div>

      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                  Prize
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                  Type
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                  Value
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">
                  Weight (bps)
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">
                  Percentage
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {prizes.map((prize) => {
                const percentage = ((prize.weightBps / 10000) * 100).toFixed(2);
                return (
                  <tr
                    key={prize.id}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">
                      {prize.label}
                    </td>
                    <td className="py-3 px-4">
                      <BadgeUI variant={typeColors[prize.type]}>
                        {prize.type}
                      </BadgeUI>
                    </td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                      {prize.value}
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        min="0"
                        max="10000"
                        value={prize.weightBps}
                        onChange={(e) =>
                          updateWeight(prize.id, parseInt(e.target.value))
                        }
                        className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-center dark:bg-gray-900 dark:text-white"
                      />
                    </td>
                    <td className="py-3 px-4 text-center text-gray-700 dark:text-gray-300">
                      {percentage}%
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removePrize(prize.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <span className="font-semibold text-gray-900 dark:text-white">
              Total Weight
            </span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalWeight.toLocaleString()}
              </span>
              <span className="text-gray-600 dark:text-gray-400">/ 10,000</span>
            </div>
          </div>

          {!isValid && (
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-4">
              <AlertCircle size={16} />
              <span className="text-sm">
                Weight must equal exactly 10,000 (100%)
              </span>
            </div>
          )}

          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                isValid ? "bg-green-500" : "bg-blue-500"
              }`}
              style={{ width: `${Math.min((totalWeight / 10000) * 100, 100)}%` }}
            />
          </div>
        </div>
      </Card>

      <Button
        onClick={handleSave}
        disabled={!isValid}
        size="lg"
        className="w-full"
      >
        Save Prize Configuration
      </Button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Prize"
      >
        <div className="space-y-4">
          <Input
            label="Prize Name/Label"
            value={newPrize.label}
            onChange={(e) =>
              setNewPrize({ ...newPrize, label: e.target.value })
            }
            placeholder="e.g., 100 Points"
          />

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
              Prize Type
            </label>
            <select
              value={newPrize.type}
              onChange={(e) => {
                const value = e.target.value;
                if (
                  value === "NATIVE" ||
                  value === "ERC20" ||
                  value === "POINTS" ||
                  value === "BADGE"
                ) {
                  setNewPrize({
                    ...newPrize,
                    type: value,
                  });
                }
              }}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-900 dark:text-white"
            >
              <option value="POINTS">Points</option>
              <option value="NATIVE">Native Currency</option>
              <option value="ERC20">ERC20 Token</option>
              <option value="BADGE">Badge</option>
            </select>
          </div>

          <Input
            label="Prize Value"
            value={newPrize.value}
            onChange={(e) =>
              setNewPrize({ ...newPrize, value: e.target.value })
            }
            placeholder="e.g., 0x1234... or 100"
          />

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
              Weight (basis points)
            </label>
            <Input
              type="number"
              min="0"
              max="10000"
              value={newPrize.weightBps}
              onChange={(e) =>
                setNewPrize({
                  ...newPrize,
                  weightBps: parseInt(e.target.value),
                })
              }
              placeholder="e.g., 2000 for 20%"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              1 bps = 0.01%. Use 10,000 for 100% probability.
            </p>
          </div>

          <Button onClick={addPrize} className="w-full">
            Add Prize
          </Button>
        </div>
      </Modal>
    </div>
  );
}
