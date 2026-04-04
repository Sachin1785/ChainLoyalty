"use client";

import React, { useState, useEffect } from "react";
import { Card, Button, Input, Badge as BadgeUI } from "@/components/shared/ui";
import { Rule, TriggerNode, ConditionNode, ActionNode } from "@/lib/types";
import { getRules, createRule, deleteRule } from "@/lib/utils/api";
import {
  Trash2,
  Plus,
  ChevronDown,
  AlertCircle,
  Zap,
  Filter,
  Target,
} from "lucide-react";

const triggerTypes = [
  { value: "USER_PURCHASE", label: "User Purchase" },
  { value: "REFERRAL_MILESTONE", label: "Referral Milestone" },
  { value: "ACHIEVEMENT", label: "Achievement Unlocked" },
  { value: "CUSTOM", label: "Custom Event" },
];

const conditionOperators = [
  { value: "gt", label: "Greater than" },
  { value: "lt", label: "Less than" },
  { value: "eq", label: "Equals" },
  { value: "gte", label: "Greater or equal" },
  { value: "lte", label: "Less or equal" },
  { value: "contains", label: "Contains" },
];

const actionTypes = [
  { value: "GRANT_POINTS", label: "Grant Points" },
  { value: "AWARD_BADGE", label: "Award Badge" },
  { value: "TRIGGER_PRIZE", label: "Trigger Prize" },
];

export function RulesEngine() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedRule, setExpandedRule] = useState<string | null>(null);

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      setLoading(true);
      const data = await getRules();
      setRules(data);
    } catch (error) {
      console.error("Failed to load rules:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm("Are you sure you want to delete this rule?")) return;

    try {
      await deleteRule(ruleId);
      setRules(rules.filter((r) => r.id !== ruleId));
    } catch (error) {
      console.error("Failed to delete rule:", error);
    }
  };

  const getTriggerLabel = (trigger: TriggerNode) => {
    const type = triggerTypes.find((t) => t.value === trigger.type);
    return type?.label || trigger.type;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Business Rules Engine
        </h2>
        <Button className="flex items-center gap-2">
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
                Actions
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {rules.reduce((sum, r) => sum + r.actions.length, 0)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-3">
        {rules.map((rule) => (
          <Card key={rule.id} className="overflow-hidden">
            <div
              onClick={() =>
                setExpandedRule(
                  expandedRule === rule.id ? null : rule.id
                )
              }
              className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex items-center justify-between"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {rule.name}
                  </h3>
                  <BadgeUI variant={rule.enabled ? "success" : "warning"}>
                    {rule.enabled ? "Active" : "Inactive"}
                  </BadgeUI>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Zap size={14} />
                  <span>{getTriggerLabel(rule.trigger)}</span>
                  {rule.conditions.length > 0 && (
                    <>
                      <span>&bull;</span>
                      <span>{rule.conditions.length} condition</span>
                      {rule.conditions.length > 1 && <span>s</span>}
                    </>
                  )}
                  <span>&bull;</span>
                  <span>{rule.actions.length} action</span>
                  {rule.actions.length > 1 && <span>s</span>}
                </div>
              </div>

              <ChevronDown
                size={20}
                className={`text-gray-400 transition-transform ${
                  expandedRule === rule.id ? "rotate-180" : ""
                }`}
              />
            </div>

            {expandedRule === rule.id && (
              <div className="border-t border-gray-200 dark:border-gray-800 p-4 bg-gray-50 dark:bg-gray-800/50 space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <Zap size={16} className="text-yellow-600" />
                    Trigger
                  </h4>
                  <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {getTriggerLabel(rule.trigger)}
                    </p>
                  </div>
                </div>

                {rule.conditions.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <Filter size={16} className="text-blue-600" />
                      Conditions
                    </h4>
                    <div className="space-y-2">
                      {rule.conditions.map((cond, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 text-sm"
                        >
                          <span className="font-medium text-gray-900 dark:text-white">
                            {cond.field}
                          </span>{" "}
                          <span className="text-gray-600 dark:text-gray-400">
                            {cond.operator}
                          </span>{" "}
                          <span className="font-medium text-gray-900 dark:text-white">
                            {cond.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <Target size={16} className="text-green-600" />
                    Actions
                  </h4>
                  <div className="space-y-2">
                    {rule.actions.map((action, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 text-sm"
                      >
                        <p className="font-medium text-gray-900 dark:text-white">
                          {actionTypes.find((a) => a.value === action.type)
                            ?.label || action.type}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                          {JSON.stringify(action.payload, null, 2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-800">
                  <Button variant="outline" size="sm" className="flex-1">
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteRule(rule.id)}
                    className="flex-1 text-red-600"
                  >
                    <Trash2 size={16} />
                    Delete
                  </Button>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {rules.length === 0 && !loading && (
        <Card className="p-12 text-center">
          <AlertCircle className="mx-auto mb-4 text-gray-400" size={48} />
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No business rules configured yet.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Create rules to automate rewards and engagement!
          </p>
        </Card>
      )}
    </div>
  );
}
