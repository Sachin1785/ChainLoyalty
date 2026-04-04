"use client";

import React, { useState } from "react";
import { Card, Button, Input } from "@/components/shared/ui";
import { Coins, Shield, Activity, Save, Zap, Info, ArrowRight, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

interface PointsConfigProps {
  onSave?: (config: any) => void;
}

export function PointsConfiguration({ onSave }: PointsConfigProps) {
  const [config, setConfig] = useState({
    supplyCap: 1000000,
    transferable: false,
    decimals: 18,
    name: "Loyalty Points",
    symbol: "LP",
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      onSave?.(config);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex items-center gap-4">
         <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center">
            <Coins size={22} className="text-purple-600" />
         </div>
         <div>
            <h2 className="text-xl font-bold tracking-tight">Emission Control</h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">ERC-20 Tokenomics</p>
         </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-12">
        <div className="lg:col-span-3 space-y-8">
           <div className="bg-white p-10 rounded-[40px] border border-gray-50 shadow-sm space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                 <Input
                   label="Token Name"
                   value={config.name}
                   onChange={(e) => setConfig({ ...config, name: e.target.value })}
                   placeholder="e.g. Nexus Points"
                 />
                 <Input
                   label="Token Symbol"
                   value={config.symbol}
                   onChange={(e) => setConfig({ ...config, symbol: e.target.value })}
                   placeholder="LP"
                   maxLength={4}
                 />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                   <Zap size={16} className="text-yellow-400" />
                   <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Supply Cap</label>
                </div>
                <div className="relative">
                  <Input
                    type="number"
                    value={config.supplyCap}
                    onChange={(e) => setConfig({...config, supplyCap: parseInt(e.target.value)})}
                    placeholder="1000000"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 px-3 py-1 bg-white rounded-lg text-[10px] font-bold text-gray-400 border border-gray-100 uppercase">
                    {config.symbol}
                  </div>
                </div>
                <p className="text-[10px] font-medium text-gray-400 italic">Total mint limit. Set to 0 for uncapped emission.</p>
              </div>

              <div className="space-y-4">
                 <div className="flex items-center gap-2">
                   <Activity size={16} className="text-purple-400" />
                   <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Precision Decimals</label>
                </div>
                <Input
                  type="number"
                  min="0"
                  max="18"
                  value={config.decimals}
                  onChange={(e) => setConfig({ ...config, decimals: parseInt(e.target.value) })}
                />
              </div>

              <div className="p-8 bg-[#F8F7F3] rounded-[32px] border border-gray-50 border-dashed">
                <label className="flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center gap-4">
                     <input
                        type="checkbox"
                        checked={config.transferable}
                        onChange={(e) => setConfig({ ...config, transferable: e.target.checked })}
                        className="w-6 h-6 rounded-lg border-gray-200 text-purple-600 focus:ring-purple-500 cursor-pointer"
                     />
                     <div>
                        <p className="text-sm font-bold text-gray-900 transition-colors group-hover:text-purple-600">
                           Logic Transferability
                        </p>
                        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-tight mt-1">
                           Allow external wallet transfers
                        </p>
                     </div>
                  </div>
                  <ChevronRight size={18} className="text-gray-200 group-hover:text-purple-600 transition-all" />
                </label>
              </div>

              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full h-16 bg-black text-white rounded-[24px] font-bold text-lg flex items-center justify-center gap-3 hover:opacity-90 transition-opacity"
              >
                {isSaving ? "Synchronizing..." : "Apply Configuration"}
                <Save size={20} />
              </button>
           </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
           <div className="bg-white p-8 rounded-[40px] border border-gray-50 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-1.5 h-full bg-purple-500" />
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-lg font-bold tracking-tight">System Summary</h3>
                 <Info size={18} className="text-gray-200" />
              </div>
              
              <div className="space-y-6">
                 <div className="p-4 bg-[#F8F7F3] rounded-2xl border border-gray-100">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Active Standard</div>
                    <div className="text-sm font-bold italic tracking-tight">ERC-20 (BURNABLE_MODULE)</div>
                 </div>

                 <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                       <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Identity</span>
                       <span className="text-xs font-bold">{config.name} ({config.symbol})</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                       <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Emission Cap</span>
                       <span className="text-xs font-bold">{config.supplyCap === 0 ? "Infinite" : config.supplyCap.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                       <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Transfer Status</span>
                       <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase ${config.transferable ? 'bg-purple-100 text-purple-600' : 'bg-pink-100 text-pink-500'}`}>
                          {config.transferable ? "Enabled" : "Restricted"}
                       </span>
                    </div>
                 </div>

                 <div className="mt-8 p-6 bg-purple-50 rounded-[32px] border border-purple-100">
                    <div className="flex items-center gap-2 mb-2">
                       <Shield size={16} className="text-purple-600" />
                       <span className="text-[10px] font-bold uppercase tracking-widest text-purple-600">Protocol Alert</span>
                    </div>
                    <p className="text-[10px] font-medium text-purple-400 leading-relaxed uppercase">Tokenomics settings are logged on-chain and cannot be reverted once published to the nebula.</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
