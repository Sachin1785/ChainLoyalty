"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  Edit3,
  ArrowUpRight,
  ArrowDownLeft,
  Zap,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Loader2,
  ToggleLeft,
  ToggleRight,
  Filter,
  Hash,
  Tag,
  X,
} from "lucide-react";
import { getRules, createRule, deleteRule, updateRule, fetchAllBadges } from "@/lib/utils/api";

// ── Condition type labels ────────────────────────────────────────────────────
const CONDITION_TYPES = [
  { value: "threshold", label: "Min Amount (threshold)", icon: <ArrowUpRight size={14} /> },
  { value: "frequency", label: "Nth Action (frequency)", icon: <Hash size={14} /> },
  { value: "metadata", label: "Metadata Match (conditional)", icon: <Tag size={14} /> },
];

const EVENT_TYPES = [
  { value: "USER_PURCHASE", label: "Purchase", backend: "purchase" },
  { value: "REFERRAL_MILESTONE", label: "Referral", backend: "referral" },
  { value: "ACHIEVEMENT", label: "Achievement", backend: "achievement" },
  { value: "CUSTOM", label: "Custom Event", backend: "custom" },
];

const REWARD_TYPES = [
  { value: "GRANT_POINTS", label: "Points", rewardType: "points" },
  { value: "AWARD_BADGE", label: "Badge", rewardType: "badge" },
];

// ── Default builder state ────────────────────────────────────────────────────
const defaultBuilder = () => ({
  name: "",
  triggerType: "USER_PURCHASE",
  rewardAction: "GRANT_POINTS",
  rewardValue: 100 as string | number,
  automaticMint: true,
  conditions: [] as Array<{
    id: string;
    conditionType: "threshold" | "frequency" | "metadata";
    field: string;
    value: string | number;
  }>,
});

// ── Condition field label ────────────────────────────────────────────────────
function conditionFieldLabel(c: { conditionType: string; field: string; value: any }) {
  if (c.conditionType === "threshold") return `Amount ≥ ${c.value}`;
  if (c.conditionType === "frequency") return `Every ${c.value} actions`;
  return `${c.field} = "${c.value}"`;
}

export function PointRulesEditor({ compact = false, mode = 'full', onSelectRule, refreshTrigger = 0 }: { compact?: boolean, mode?: 'full' | 'grid-only', onSelectRule?: (rule: any) => void, refreshTrigger?: number }) {
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [builder, setBuilder] = useState(defaultBuilder());
  const [availableBadges, setAvailableBadges] = useState<any[]>([]);

  // ── Load rules & badges on mount or refresh ───────────────────────────────────────
  useEffect(() => { 
    fetchRules(); 
    loadBadges();
  }, [refreshTrigger]);

  async function loadBadges() {
    try {
      const data = await fetchAllBadges();
      setAvailableBadges(data || []);
    } catch (e) {
      console.error("Failed to load badges:", e);
    }
  }

  async function fetchRules() {
    try {
      setLoading(true);
      setError(null);
      const data = await getRules();
      setRules(data);
    } catch (e: any) {
      setError(e.message ?? "Failed to load rules");
    } finally {
      setLoading(false);
    }
  }

  // ── Condition helpers ───────────────────────────────────────────────────
  function addCondition() {
    setBuilder(b => ({
      ...b,
      conditions: [
        ...b.conditions,
        { id: `c${Date.now()}`, conditionType: "threshold", field: "amount", value: 0 },
      ],
    }));
  }

  function updateCondition(id: string, patch: Partial<typeof builder.conditions[0]>) {
    setBuilder(b => ({
      ...b,
      conditions: b.conditions.map(c => c.id === id ? { ...c, ...patch } : c),
    }));
  }

  function removeCondition(id: string) {
    setBuilder(b => ({ ...b, conditions: b.conditions.filter(c => c.id !== id) }));
  }

  // ── Open/close modal ────────────────────────────────────────────────────
  function openCreateModal() {
    setEditingId(null);
    setBuilder(defaultBuilder());
    setShowModal(true);
  }

  function openEditModal(rule: any) {
    setEditingId(rule.id);
    setBuilder({
      name: rule.name,
      triggerType: rule.trigger?.type ?? "USER_PURCHASE",
      rewardAction: rule.actions?.[0]?.type ?? "GRANT_POINTS",
      rewardValue: rule.actions?.[0]?.payload?.amount ?? rule.actions?.[0]?.payload?.badgeId ?? 100,
      automaticMint: rule.automaticMint !== false,
      conditions: rule.conditions?.map((c: any) => ({
        id: c.id ?? `c${Date.now()}`,
        conditionType: c.conditionType ?? "threshold",
        field: c.field ?? "amount",
        value: c.value ?? 0,
      })) ?? [],
    });
    setShowModal(true);
  }

  // ── Save (create or update) ─────────────────────────────────────────────
  async function handleSave() {
    if (!builder.name.trim()) { setError("Rule name is required"); return; }
    try {
      setSaving(true);
      setError(null);

      const rulePayload = {
        name: builder.name,
        trigger: { id: "t1", type: builder.triggerType, label: builder.triggerType, value: builder.triggerType },
        conditions: builder.conditions,
        actions: [
          builder.rewardAction === "AWARD_BADGE"
            ? { id: "a1", type: "AWARD_BADGE", payload: { badgeId: builder.rewardValue } }
            : { id: "a1", type: "GRANT_POINTS", payload: { amount: builder.rewardValue } },
        ],
        enabled: true,
        automaticMint: builder.automaticMint,
      };

      if (editingId) {
        const updated = await updateRule(editingId, rulePayload);
        setRules(rs => rs.map(r => r.id === editingId ? updated : r));
      } else {
        const created = await createRule(rulePayload);
        setRules(rs => [created, ...rs]);
      }
      setShowModal(false);
    } catch (e: any) {
      setError(e.response?.data?.detail ?? e.message ?? "Failed to save rule");
    } finally {
      setSaving(false);
    }
  }

  // ── Delete ──────────────────────────────────────────────────────────────
  async function handleDelete(id: string) {
    if (!confirm("Delete this rule permanently?")) return;
    try {
      await deleteRule(id);
      setRules(rs => rs.filter(r => r.id !== id));
    } catch (e: any) {
      alert(e.message ?? "Delete failed");
    }
  }

  // ── Toggle active ───────────────────────────────────────────────────────
  async function handleToggle(rule: any) {
    try {
      const updated = await updateRule(rule.id, { ...rule, enabled: !rule.enabled });
      setRules(rs => rs.map(r => r.id === rule.id ? updated : r));
    } catch { /* silent */ }
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header */}
      {mode !== 'grid-only' && (
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Point Protocol Rules</h2>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1">
            {rules.length} rule{rules.length !== 1 ? "s" : ""} configured
          </p>
        </div>
        <div className="flex items-center gap-3">
          {error && (
            <span className="text-xs font-semibold text-red-500 flex items-center gap-1">
              <AlertCircle size={14} /> {error}
            </span>
          )}
          <button
            onClick={openCreateModal}
            className="h-12 px-6 bg-black text-white rounded-2xl font-bold text-xs flex items-center gap-3 hover:opacity-90 transition-all shadow-lg active:scale-95"
          >
            <Plus size={18} /> Define New Rule
          </button>
        </div>
      </div>
      )}

      {/* Rules Grid */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
        {loading ? (
          <div className="flex items-center justify-center h-40 gap-3 text-gray-400">
            <Loader2 size={24} className="animate-spin" />
            <span className="text-sm font-semibold">Loading rules…</span>
          </div>
        ) : rules.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-3 text-gray-400">
            <AlertCircle size={32} className="opacity-40" />
            <p className="text-sm font-semibold">No rules yet. Define your first one!</p>
          </div>
        ) : (
          <div className={`grid gap-6 ${compact ? "grid-cols-1 xl:grid-cols-2" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"}`}>
            <AnimatePresence>
              {rules.map((rule) => {
                const raw = rule._raw ?? {};
                const isPoints = raw.reward_type === "points" || rule.actions?.[0]?.type === "GRANT_POINTS";
                return (
                  <motion.div
                    key={rule.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={() => onSelectRule && onSelectRule(rule)}
                    className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow group relative cursor-pointer"
                  >
                    <div className={`h-1.5 w-full ${isPoints ? "bg-emerald-500" : "bg-violet-500"}`} />

                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-2 rounded-xl ${isPoints ? "bg-emerald-50 text-emerald-600" : "bg-violet-50 text-violet-600"}`}>
                          {isPoints ? <ArrowUpRight size={18} /> : <Zap size={18} />}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${rule.enabled ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                            {rule.enabled ? "Active" : "Inactive"}
                          </span>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(rule.id); }}
                            className="w-7 h-7 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                            title="Delete Rule"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                      <h3 className="font-bold text-gray-900 tracking-tight text-sm mb-1 group-hover:text-purple-600 transition-colors uppercase">
                        {rule.name}
                      </h3>
                      <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
                        Trigger: {EVENT_TYPES.find(e => e.value === rule.trigger?.type)?.label ?? rule.trigger?.type ?? "—"}
                      </p>

                      {/* Condition pills */}
                      {rule.conditions?.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {rule.conditions.map((c: any, i: number) => (
                            <span key={i} className="text-[9px] px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full font-bold">
                              {conditionFieldLabel(c)}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50 mt-4">
                        <div className="flex items-center gap-2">
                          <span className={`text-xl font-black ${isPoints ? "text-emerald-500" : "text-violet-500"}`}>
                            +{raw.reward_value ?? rule.actions?.[0]?.payload?.amount ?? "?"}
                          </span>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                            {raw.reward_type ?? (isPoints ? "pts" : "badge")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {/* Toggle */}
                          <button
                            onClick={() => handleToggle(rule)}
                            className="w-8 h-8 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-gray-100 hover:text-gray-900 transition-all"
                            title={rule.enabled ? "Deactivate" : "Activate"}
                          >
                            {rule.enabled ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                          </button>
                          {/* Edit */}
                          <button
                            onClick={(e) => {
                               e.stopPropagation();
                               if (onSelectRule) onSelectRule(rule);
                               else openEditModal(rule);
                            }}
                            className="w-8 h-8 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-gray-100 hover:text-gray-900 transition-all"
                          >
                            <Edit3 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ── Create / Edit Modal ──────────────────────────────────────────── */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 pointer-events-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-xl bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col relative z-20 pointer-events-auto max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              {/* Modal Header */}
              <div className="p-8 border-b border-gray-50 bg-[#F8F7F3]/50 flex items-center justify-between sticky top-0 z-10">
                <div>
                  <h3 className="text-xl font-bold tracking-tight">
                    {editingId ? "Edit Rule" : "Define Point Logic"}
                  </h3>
                  <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mt-1">
                    {editingId ? "Update rule parameters" : "Create a new emission or badge rule"}
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 space-y-6">
                {error && (
                  <div className="flex items-center gap-2 text-xs font-semibold text-red-500 bg-red-50 p-3 rounded-2xl">
                    <AlertCircle size={14} /> {error}
                  </div>
                )}

                {/* Rule Name */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">Rule Name</label>
                  <input
                    value={builder.name}
                    onChange={e => setBuilder(b => ({ ...b, name: e.target.value }))}
                    placeholder="e.g., Welcome Bonus"
                    className="w-full h-14 bg-[#F8F7F3] rounded-2xl px-6 text-sm font-semibold outline-none border-none shadow-inner"
                  />
                </div>

                {/* Trigger Event */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">Trigger Event</label>
                  <select
                    value={builder.triggerType}
                    onChange={e => setBuilder(b => ({ ...b, triggerType: e.target.value }))}
                    className="w-full h-14 bg-[#F8F7F3] rounded-2xl px-6 text-sm font-semibold outline-none border-none shadow-inner appearance-none"
                  >
                    {EVENT_TYPES.map(et => (
                      <option key={et.value} value={et.value}>{et.label}</option>
                    ))}
                  </select>
                </div>

                {/* Conditions */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4 flex items-center gap-2">
                      <Filter size={12} /> Conditions
                    </label>
                    <button
                      onClick={addCondition}
                      className="text-[10px] font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 px-3 py-1 rounded-full bg-purple-50 hover:bg-purple-100 transition-colors"
                    >
                      <Plus size={12} /> Add condition
                    </button>
                  </div>

                  {builder.conditions.length === 0 && (
                    <p className="text-[10px] text-gray-400 font-medium ml-4">No conditions — rule fires on every matching event.</p>
                  )}

                  {builder.conditions.map((cond) => (
                    <div key={cond.id} className="bg-[#F8F7F3] rounded-2xl p-4 space-y-3">
                      {/* Condition Type */}
                      <div className="flex items-center justify-between gap-2">
                        <select
                          value={cond.conditionType}
                          onChange={e => updateCondition(cond.id, {
                            conditionType: e.target.value as any,
                            field: e.target.value === "threshold" ? "amount" : e.target.value === "frequency" ? "frequency" : "",
                            value: 0,
                          })}
                          className="flex-1 h-10 bg-white rounded-xl px-3 text-xs font-semibold outline-none border border-gray-100"
                        >
                          {CONDITION_TYPES.map(ct => (
                            <option key={ct.value} value={ct.value}>{ct.label}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => removeCondition(cond.id)}
                          className="w-8 h-8 rounded-full bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all flex-shrink-0"
                        >
                          <X size={14} />
                        </button>
                      </div>

                      {/* Condition-specific inputs */}
                      {cond.conditionType === "threshold" && (
                        <div>
                          <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">Minimum Amount</label>
                          <input
                            type="number"
                            value={cond.value as number}
                            onChange={e => updateCondition(cond.id, { value: Number(e.target.value) })}
                            placeholder="100"
                            className="w-full h-10 bg-white rounded-xl px-3 text-sm font-semibold outline-none border border-gray-100 mt-1"
                          />
                        </div>
                      )}
                      {cond.conditionType === "frequency" && (
                        <div>
                          <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">Every Nth action</label>
                          <input
                            type="number"
                            value={cond.value as number}
                            onChange={e => updateCondition(cond.id, { value: Number(e.target.value) })}
                            placeholder="5"
                            className="w-full h-10 bg-white rounded-xl px-3 text-sm font-semibold outline-none border border-gray-100 mt-1"
                          />
                        </div>
                      )}
                      {cond.conditionType === "metadata" && (
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">Key</label>
                            <input
                              value={cond.field}
                              onChange={e => updateCondition(cond.id, { field: e.target.value })}
                              placeholder="plan_type"
                              className="w-full h-10 bg-white rounded-xl px-3 text-xs font-semibold outline-none border border-gray-100 mt-1"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">Value</label>
                            <input
                              value={cond.value as string}
                              onChange={e => updateCondition(cond.id, { value: e.target.value })}
                              placeholder="premium"
                              className="w-full h-10 bg-white rounded-xl px-3 text-xs font-semibold outline-none border border-gray-100 mt-1"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Reward Configuration */}
                <div className="space-y-6 pt-6 border-t border-gray-50">
                  <div className="flex items-center justify-between px-4">
                    <label className="text-[10px] font-black uppercase text-purple-600 tracking-widest">Protocol Reward</label>
                    <div className="flex gap-1.5">
                      {REWARD_TYPES.map(rt => (
                        <button
                          key={rt.value}
                          onClick={() => setBuilder(b => ({ ...b, rewardAction: rt.value as any }))}
                          className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase transition-all ${
                            builder.rewardAction === rt.value
                              ? "bg-purple-600 text-white shadow-lg"
                              : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                          }`}
                        >
                          {rt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {builder.rewardAction === "AWARD_BADGE" ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">Badge Registry</label>
                        <select
                          value={builder.rewardValue}
                          onChange={(e) => setBuilder({ ...builder, rewardValue: e.target.value })}
                          className="w-full h-14 bg-[#F8F7F3] rounded-2xl px-6 text-sm font-semibold outline-none border-none shadow-inner"
                        >
                          <option value="">Select Badge Standard</option>
                          {availableBadges.map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="flex items-center justify-between p-5 bg-purple-50/50 rounded-[28px] border border-purple-100 group transition-all hover:bg-purple-50">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-2xl bg-white shadow-sm ring-1 ring-purple-100 transition-all ${builder.automaticMint ? "text-purple-600" : "text-gray-300"}`}>
                            <Zap size={20} className={builder.automaticMint ? "fill-purple-600" : ""} />
                          </div>
                          <div>
                            <h4 className="font-black text-gray-900 text-xs tracking-tight">Instant Fulfillment</h4>
                            <p className="text-[9px] font-bold text-purple-400 leading-tight">Mint NFT automatically (Gas-free for user)</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setBuilder({ ...builder, automaticMint: !builder.automaticMint })}
                          className={`w-12 h-6 rounded-full relative transition-all duration-300 ${builder.automaticMint ? "bg-purple-600" : "bg-gray-200"}`}
                        >
                          <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${builder.automaticMint ? "translate-x-6" : "translate-x-0"}`} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">Points Quantum</label>
                      <input
                        type="number"
                        value={builder.rewardValue}
                        onChange={(e) => setBuilder({ ...builder, rewardValue: Number(e.target.value) })}
                        placeholder="100"
                        className="w-full h-16 bg-[#F8F7F3] rounded-3xl px-8 text-2xl font-black outline-none border-none shadow-inner focus:bg-white focus:ring-4 focus:ring-emerald-50 focus:text-emerald-600 transition-all"
                      />
                    </div>
                  )}
                </div>

                {/* Submit */}
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full h-16 bg-black text-white rounded-[24px] font-bold text-lg flex items-center justify-center gap-3 hover:opacity-90 transition-opacity mt-4 disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 size={22} className="animate-spin" />
                  ) : (
                    <>
                      {editingId ? "Update Rule" : "Publish Rule to Protocol"}
                      <CheckCircle2 size={20} />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
