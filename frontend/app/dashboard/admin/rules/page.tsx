'use client';

import { useState, useEffect } from "react";
import { NeoCard } from "@/components/ui/NeoCard";
import { NeoButton } from "@/components/ui/NeoButton";
import { NeoBadge } from "@/components/ui/NeoBadge";
import { Plus, Trash2, Settings, Save } from "lucide-react";

const API_BASE = "http://127.0.0.1:8000/api/v1";

export default function AdminRulesPage() {
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Note: Admin routes should have a separate list endpoint, 
    // but for the demo we'll show how a rule is added via POST.
    setLoading(false);
    setRules([
      { name: "Welcome Bonus", event_type: "signup", reward_type: "points", reward_value: 100 },
      { name: "First Purchase", event_type: "purchase", reward_type: "badge", reward_value: 1 }
    ]);
  }, []);

  const addRule = () => {
    // In a real app, this would open a modal/form
    alert("Rule Builder UI: Select Event -> Set Conditions -> Define Reward");
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter">Rule Builder</h1>
          <p className="font-bold text-sm mt-1 opacity-70">Define how customer actions turn into rewards</p>
        </div>
        <NeoButton onClick={addRule} className="bg-neo-yellow">
          <Plus size={18} /> New Rule
        </NeoButton>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {rules.map((rule, i) => (
          <NeoCard key={i} className="p-6 bg-neo-white flex items-center justify-between" hover={false}>
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 bg-black text-neo-yellow rounded-xl flex items-center justify-center font-black">
                {rule.event_type.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-black text-xl">{rule.name}</h3>
                <p className="text-sm font-bold opacity-60">Trigger: {rule.event_type} event</p>
              </div>
            </div>

            <div className="flex items-center gap-8">
              <div className="text-right">
                <p className="text-xs font-black uppercase opacity-40">Reward</p>
                <p className="font-black">+{rule.reward_value} {rule.reward_type}</p>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-black/5 rounded-lg"><Settings size={18} /></button>
                <button className="p-2 hover:bg-neo-red/10 text-neo-red rounded-lg"><Trash2 size={18} /></button>
              </div>
            </div>
          </NeoCard>
        ))}
      </div>

      <NeoCard className="p-12 border-dashed bg-black/5 flex flex-col items-center justify-center gap-4" hover={false}>
        <div className="w-16 h-16 rounded-full border-4 border-dashed border-black/20 flex items-center justify-center">
            <Plus className="text-black/20" size={32} />
        </div>
        <p className="font-black text-black/20 uppercase tracking-widest">Add another automation</p>
      </NeoCard>
    </div>
  );
}
