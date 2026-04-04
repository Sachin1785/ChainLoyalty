"use client";

import React, { useState, useEffect } from "react";
import { Card, Button, Input, Badge as BadgeUI, Modal } from "@/components/shared/ui";
import { LootboxType } from "@/lib/types";
import { fetchLootboxTypes, registerLootboxType } from "@/lib/utils/api";
import { Trash2, Plus, Edit2, Clock, Coins } from "lucide-react";

export function LootboxSetup() {
  const [lootboxes, setLootboxes] = useState<LootboxType[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    pointsCost: 0,
    nativeCost: 0,
    cooldownSeconds: 0,
  });

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

  const handleOpenModal = (lootbox?: LootboxType) => {
    if (lootbox) {
      setEditingId(lootbox.id);
      setFormData({
        name: lootbox.name,
        pointsCost: lootbox.pointsCost,
        nativeCost: lootbox.nativeCost || 0,
        cooldownSeconds: lootbox.cooldownSeconds,
      });
    } else {
      setEditingId(null);
      setFormData({
        name: "",
        pointsCost: 0,
        nativeCost: 0,
        cooldownSeconds: 0,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({
      name: "",
      pointsCost: 0,
      nativeCost: 0,
      cooldownSeconds: 0,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);

      if (editingId) {
        const updatedLootboxes = lootboxes.map((l) =>
          l.id === editingId ? { ...l, ...formData } : l
        );
        setLootboxes(updatedLootboxes);
      } else {
        await registerLootboxType(formData);
      }

      handleCloseModal();
      await loadLootboxes();
    } catch (error) {
      console.error("Failed to save lootbox:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (lootboxId: string) => {
    if (!confirm("Are you sure you want to delete this lootbox?")) return;

    try {
      setLoading(true);
      setLootboxes(lootboxes.filter((l) => l.id !== lootboxId));
    } catch (error) {
      console.error("Failed to delete lootbox:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCooldown = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Lootbox / Spin Setup
        </h2>
        <Button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2"
        >
          <Plus size={18} />
          New Lootbox
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {lootboxes.map((lootbox) => (
          <Card key={lootbox.id} className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {lootbox.name}
                </h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <Coins size={18} className="text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Points Cost
                    </p>
                    <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                      {lootbox.pointsCost}
                    </p>
                  </div>
                </div>

                {lootbox.nativeCost && lootbox.nativeCost > 0 && (
                  <div className="flex items-center gap-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <Coins size={18} className="text-purple-600 dark:text-purple-400" />
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Native Cost
                      </p>
                      <p className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                        {lootbox.nativeCost} ETH
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                  <Clock size={18} className="text-amber-600 dark:text-amber-400" />
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Cooldown
                    </p>
                    <p className="text-lg font-semibold text-amber-600 dark:text-amber-400">
                      {formatCooldown(lootbox.cooldownSeconds)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-800">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleOpenModal(lootbox)}
                >
                  <Edit2 size={16} />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-red-600 hover:text-red-700"
                  onClick={() => handleDelete(lootbox.id)}
                  disabled={loading}
                >
                  <Trash2 size={16} />
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {lootboxes.length === 0 && !loading && (
        <Card className="p-12 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            No lootboxes configured yet. Create one to get started!
          </p>
        </Card>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingId ? "Edit Lootbox" : "Create New Lootbox"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Lootbox Name"
            required
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            placeholder="e.g., Basic Spin"
          />

          <Input
            label="Points Cost"
            required
            type="number"
            min="0"
            value={formData.pointsCost}
            onChange={(e) =>
              setFormData({
                ...formData,
                pointsCost: parseInt(e.target.value),
              })
            }
            placeholder="100"
          />

          <Input
            label="Native Cost (Optional)"
            type="number"
            min="0"
            step="0.001"
            value={formData.nativeCost}
            onChange={(e) =>
              setFormData({
                ...formData,
                nativeCost: parseFloat(e.target.value) || 0,
              })
            }
            placeholder="0"
          />

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
              Cooldown Duration
            </label>
            <div className="grid grid-cols-3 gap-2">
              <Input
                type="number"
                placeholder="Hours"
                onChange={(e) => {
                  const hours = parseInt(e.target.value) || 0;
                  const minutes = parseInt(
                    ((document.querySelector('[placeholder="Minutes"]') as HTMLInputElement)
                      ?.value || "0")
                  );
                  const seconds = parseInt(
                    ((document.querySelector('[placeholder="Seconds"]') as HTMLInputElement)
                      ?.value || "0")
                  );
                  setFormData({
                    ...formData,
                    cooldownSeconds: hours * 3600 + minutes * 60 + seconds,
                  });
                }}
              />
              <Input
                type="number"
                placeholder="Minutes"
                onChange={(e) => {
                  const hours = parseInt(
                    ((document.querySelector('[placeholder="Hours"]') as HTMLInputElement)
                      ?.value || "0")
                  );
                  const minutes = parseInt(e.target.value) || 0;
                  const seconds = parseInt(
                    ((document.querySelector('[placeholder="Seconds"]') as HTMLInputElement)
                      ?.value || "0")
                  );
                  setFormData({
                    ...formData,
                    cooldownSeconds: hours * 3600 + minutes * 60 + seconds,
                  });
                }}
              />
              <Input
                type="number"
                placeholder="Seconds"
                onChange={(e) => {
                  const hours = parseInt(
                    ((document.querySelector('[placeholder="Hours"]') as HTMLInputElement)
                      ?.value || "0")
                  );
                  const minutes = parseInt(
                    ((document.querySelector('[placeholder="Minutes"]') as HTMLInputElement)
                      ?.value || "0")
                  );
                  const seconds = parseInt(e.target.value) || 0;
                  setFormData({
                    ...formData,
                    cooldownSeconds: hours * 3600 + minutes * 60 + seconds,
                  });
                }}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Current: {formatCooldown(formData.cooldownSeconds)}
            </p>
          </div>

          <Button type="submit" className="w-full">
            Create Lootbox
          </Button>
        </form>
      </Modal>
    </div>
  );
}
