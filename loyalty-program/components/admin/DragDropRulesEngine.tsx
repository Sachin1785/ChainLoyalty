"use client";

import React, { useState } from "react";
import { Card, Button, Input } from "@/components/shared/ui";
import { Rule, TriggerNode, ConditionNode, ActionNode } from "@/lib/types";
import {
  Trash2,
  Plus,
  GripVertical,
  AlertCircle,
  Zap,
  Filter,
  Target,
  ChevronDown,
  X,
} from "lucide-react";
import { createRule, deleteRule, getRules, updateRule } from "@/lib/utils/api";

const triggerOptions = [
  { value: "USER_PURCHASE", label: "User Purchase" },
  { value: "REFERRAL_MILESTONE", label: "Referral Milestone" },
  { value: "ACHIEVEMENT", label: "Achievement Unlocked" },
  { value: "CUSTOM", label: "Custom Event" },
];

const conditionOperators = [
  { value: "gt", label: ">" },
  { value: "lt", label: "<" },
  { value: "eq", label: "=" },
  { value: "gte", label: ">=" },
  { value: "lte", label: "<=" },
  { value: "contains", label: "contains" },
];

const actionTypes = [
  { value: "GRANT_POINTS", label: "Grant Points" },
  { value: "AWARD_BADGE", label: "Award Badge" },
  { value: "TRIGGER_PRIZE", label: "Trigger Prize" },
];

interface RuleBuilderState {
  name: string;
  trigger: TriggerNode;
  conditions: ConditionNode[];
  actions: ActionNode[];
}

export function DragDropRulesEngine() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [isBuilding, setIsBuilding] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [draggedNode, setDraggedNode] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [builder, setBuilder] = useState<RuleBuilderState>({
    name: "",
    trigger: { id: "t1", type: "CUSTOM", label: "Custom Event" },
    conditions: [],
    actions: [],
  });

  // Load rules on mount
  React.useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      const data = await getRules();
      setRules(data);
    } catch (error) {
      console.error("Failed to load rules:", error);
    }
  };

  const handleSaveRule = async () => {
    if (!builder.name.trim()) {
      alert("Rule name is required");
      return;
    }

    try {
      setLoading(true);
      const newRule: Rule = {
        id: editingRuleId || `rule-${Date.now()}`,
        name: builder.name,
        trigger: builder.trigger,
        conditions: builder.conditions,
        actions: builder.actions,
        enabled: true,
      };

      if (editingRuleId) {
        // Update existing
        await updateRule(editingRuleId, newRule);
        const updated = rules.map((r) =>
          r.id === editingRuleId ? newRule : r
        );
        setRules(updated);
      } else {
        // Create new
        const created = await createRule(newRule);
        setRules([...rules, created]);
      }

      resetBuilder();
      setIsBuilding(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm("Delete this rule?")) return;

    try {
      setLoading(true);
      await deleteRule(ruleId);
      setRules(rules.filter((r) => r.id !== ruleId));
    } finally {
      setLoading(false);
    }
  };

  const handleEditRule = (rule: Rule) => {
    setBuilder({
      name: rule.name,
      trigger: rule.trigger,
      conditions: rule.conditions,
      actions: rule.actions,
    });
    setEditingRuleId(rule.id);
    setIsBuilding(true);
  };

  const resetBuilder = () => {
    setBuilder({
      name: "",
      trigger: { id: "t1", type: "CUSTOM", label: "Custom Event" },
      conditions: [],
      actions: [],
    });
    setEditingRuleId(null);
  };

  const addCondition = () => {
    const newCondition: ConditionNode = {
      id: `c${builder.conditions.length + 1}`,
      field: "amount",
      operator: "gt",
      value: "",
    };
    setBuilder({
      ...builder,
      conditions: [...builder.conditions, newCondition],
    });
  };

  const updateCondition = (
    id: string,
    updates: Partial<ConditionNode>
  ) => {
    setBuilder({
      ...builder,
      conditions: builder.conditions.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    });
  };

  const removeCondition = (id: string) => {
    setBuilder({
      ...builder,
      conditions: builder.conditions.filter((c) => c.id !== id),
    });
  };

  const addAction = () => {
    const newAction: ActionNode = {
      id: `a${builder.actions.length + 1}`,
      type: "GRANT_POINTS",
      payload: { amount: 0 },
    };
    setBuilder({
      ...builder,
      actions: [...builder.actions, newAction],
    });
  };

  const updateAction = (id: string, updates: Partial<ActionNode>) => {
    setBuilder({
      ...builder,
      actions: builder.actions.map((a) =>
        a.id === id ? { ...a, ...updates } : a
      ),
    });
  };

  const removeAction = (id: string) => {
    setBuilder({
      ...builder,
      actions: builder.actions.filter((a) => a.id !== id),
    });
  };

  const handleDragStart = (e: React.DragEvent, node: any) => {
    setDraggedNode(node);
    e.dataTransfer.effectAllowed = "move";
  };

  if (isBuilding) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {editingRuleId ? "Edit Rule" : "Create New Rule"}
          </h2>
          <Button
            variant="ghost"
            onClick={() => {
              resetBuilder();
              setIsBuilding(false);
            }}
          >
            <X size={20} />
          </Button>
        </div>

        <Card className="p-8 space-y-8">
          {/* Rule Name */}
          <div>
            <Input
              label="Rule Name"
              placeholder="e.g., Welcome Bonus"
              value={builder.name}
              onChange={(e) =>
                setBuilder({ ...builder, name: e.target.value })
              }
            />
          </div>

          {/* Trigger Node */}
          <div className="border-2 border-dashed border-yellow-300 dark:border-yellow-700 rounded-lg p-6 bg-yellow-50 dark:bg-yellow-900/10">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="text-yellow-600 dark:text-yellow-400" size={24} />
              <h3 className="font-bold text-gray-900 dark:text-white">
                TRIGGER
              </h3>
            </div>
            <select
              value={builder.trigger.type}
              onChange={(e) =>
                setBuilder({
                  ...builder,
                  trigger: {
                    ...builder.trigger,
                    type: e.target.value as any,
                    label: triggerOptions.find(
                      (t) => t.value === e.target.value
                    )?.label || e.target.value,
                  },
                })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-900 dark:text-white"
            >
              {triggerOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-3">
              Event that activates this rule
            </p>
          </div>

          {/* Conditions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Filter className="text-blue-600 dark:text-blue-400" size={24} />
                <h3 className="font-bold text-gray-900 dark:text-white">
                  CONDITIONS
                </h3>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={addCondition}
                className="flex items-center gap-2"
              >
                <Plus size={16} />
                Add Condition
              </Button>
            </div>

            {builder.conditions.length === 0 ? (
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-center text-gray-500 dark:text-gray-400 text-sm">
                No conditions - rule triggers on event alone
              </div>
            ) : (
              <div className="space-y-3">
                {builder.conditions.map((cond, idx) => (
                  <div
                    key={cond.id}
                    className="p-4 border border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex gap-3 items-start"
                    draggable
                    onDragStart={(e) => handleDragStart(e, cond)}
                  >
                    <GripVertical
                      size={16}
                      className="text-gray-400 cursor-grab mt-3"
                    />
                    <div className="flex-1 space-y-3">
                      <div className="grid grid-cols-3 gap-3">
                        <Input
                          placeholder="Field"
                          value={cond.field}
                          onChange={(e) =>
                            updateCondition(cond.id, {
                              field: e.target.value,
                            })
                          }
                        />
                        <select
                          value={cond.operator}
                          onChange={(e) =>
                            updateCondition(cond.id, {
                              operator: e.target.value as any,
                            })
                          }
                          className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-900 dark:text-white"
                        >
                          {conditionOperators.map((op) => (
                            <option key={op.value} value={op.value}>
                              {op.label}
                            </option>
                          ))}
                        </select>
                        <Input
                          placeholder="Value"
                          value={cond.value}
                          onChange={(e) =>
                            updateCondition(cond.id, {
                              value: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeCondition(cond.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Target className="text-green-600 dark:text-green-400" size={24} />
                <h3 className="font-bold text-gray-900 dark:text-white">
                  ACTIONS
                </h3>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={addAction}
                className="flex items-center gap-2"
              >
                <Plus size={16} />
                Add Action
              </Button>
            </div>

            {builder.actions.length === 0 ? (
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-center text-gray-500 dark:text-gray-400 text-sm">
                Add at least one action
              </div>
            ) : (
              <div className="space-y-3">
                {builder.actions.map((action) => (
                  <div
                    key={action.id}
                    className="p-4 border border-green-200 dark:border-green-800 rounded-lg bg-green-50 dark:bg-green-900/20 flex gap-3 items-start"
                    draggable
                    onDragStart={(e) => handleDragStart(e, action)}
                  >
                    <GripVertical
                      size={16}
                      className="text-gray-400 cursor-grab mt-3"
                    />
                    <div className="flex-1 space-y-3">
                      <select
                        value={action.type}
                        onChange={(e) =>
                          updateAction(action.id, {
                            type: e.target.value as any,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-900 dark:text-white"
                      >
                        {actionTypes.map((at) => (
                          <option key={at.value} value={at.value}>
                            {at.label}
                          </option>
                        ))}
                      </select>
                      <Input
                        placeholder="Value (JSON)"
                        value={JSON.stringify(action.payload)}
                        onChange={(e) => {
                          try {
                            updateAction(action.id, {
                              payload: JSON.parse(e.target.value),
                            });
                          } catch (err) {
                            // Keep editing
                          }
                        }}
                      />
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeAction(action.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Save/Cancel */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
            <Button
              variant="outline"
              onClick={() => {
                resetBuilder();
                setIsBuilding(false);
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveRule}
              isLoading={loading}
              disabled={builder.actions.length === 0}
              className="flex-1"
            >
              {editingRuleId ? "Update Rule" : "Create Rule"}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Business Rules Engine
        </h2>
        <Button
          onClick={() => {
            resetBuilder();
            setIsBuilding(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus size={18} />
          Create Rule
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Zap className="text-yellow-600 dark:text-yellow-400" size={24} />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Active Rules
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {rules.filter((r) => r.enabled).length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Filter className="text-blue-600 dark:text-blue-400" size={24} />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Rules
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {rules.length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Target className="text-green-600 dark:text-green-400" size={24} />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Actions
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {rules.reduce((sum, r) => sum + r.actions.length, 0)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-3">
        {rules.length === 0 ? (
          <Card className="p-12 text-center">
            <AlertCircle className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-gray-600 dark:text-gray-400">
              No rules yet. Create one to automate rewards!
            </p>
          </Card>
        ) : (
          rules.map((rule) => (
            <Card key={rule.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {rule.name}
                  </h3>
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Zap size={16} className="text-yellow-600" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {triggerOptions.find(
                          (t) => t.value === rule.trigger.type
                        )?.label || rule.trigger.type}
                      </span>
                    </div>
                    {rule.conditions.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Filter size={16} className="text-blue-600" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {rule.conditions.length} condition
                          {rule.conditions.length > 1 ? "s" : ""}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Target size={16} className="text-green-600" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {rule.actions.length} action
                        {rule.actions.length > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditRule(rule)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteRule(rule.id)}
                    className="text-red-600"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
