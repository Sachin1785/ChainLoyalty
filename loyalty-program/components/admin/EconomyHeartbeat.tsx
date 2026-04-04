"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity, 
  Wallet, 
  Coins, 
  Plus, 
  Settings2,
  TrendingUp,
  MoreHorizontal,
  ArrowUpRight,
  ChevronRight
} from "lucide-react";

interface Prize {
  id: string;
  label: string;
  weightBps: number;
  color: string;
}

const initialPrizes: Prize[] = [
  { id: 'p1', label: '100 Points', weightBps: 5000, color: '#A855F7' },
  { id: 'p2', label: 'Common Badge', weightBps: 3000, color: '#EC4899' },
  { id: 'p3', label: 'Rare Badge', weightBps: 1500, color: '#6366F1' },
  { id: 'p4', label: '0.01 ETH', weightBps: 500, color: '#FACC15' },
];

export function EconomyHeartbeat() {
  const [prizes, setPrizes] = useState<Prize[]>(initialPrizes);
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);

  const totalWeight = prizes.reduce((sum, p) => sum + p.weightBps, 0);

  const pieData = useMemo(() => {
    let currentAngle = 0;
    return prizes.map(p => {
      const angle = (p.weightBps / 10000) * 360;
      const startAngle = currentAngle;
      currentAngle += angle;
      return { ...p, startAngle, angle };
    });
  }, [prizes]);

  const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return [
      "M", x, y,
      "L", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
      "Z"
    ].join(" ");
  };

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Treasury Section */}
      <div className="space-y-6">
        <div className="bg-white p-8 rounded-[32px] border border-gray-50 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-6">
            <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center">
              <Wallet size={22} className="text-purple-600" />
            </div>
            <div className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-[10px] font-bold">
              +12.4% ↑
            </div>
          </div>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Native Reserve</div>
          <div className="text-3xl font-black tracking-tight mb-4 flex items-baseline gap-2">
            4.829 <span className="text-base font-bold text-gray-400">ETH</span>
          </div>
          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
             <div className="h-full w-[68%] bg-purple-500 rounded-full" />
          </div>
          <p className="text-[10px] font-medium text-gray-400 mt-4 underline decoration-gray-100 underline-offset-4 cursor-help">Reserved for high-tier rewards</p>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-gray-50 shadow-sm space-y-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-bold tracking-tight text-gray-900 italic">ERC-20 Holdings</div>
            <MoreHorizontal size={18} className="text-gray-200" />
          </div>
          
          <div className="space-y-3">
            {[
              { label: 'LOYALTY', val: '450K', color: 'bg-purple-500' },
              { label: 'BONUS_POOL', val: '120K', color: 'bg-pink-500' },
              { label: 'STAKE_RES', val: '80K', color: 'bg-indigo-500' }
            ].map(item => (
              <div key={item.label} className="bg-[#F8F7F3] p-4 rounded-2xl flex items-center justify-between group hover:bg-white border border-transparent hover:border-gray-100 transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className={`w-1.5 h-1.5 rounded-full ${item.color}`} />
                  <span className="text-xs font-bold text-gray-400 group-hover:text-gray-900 transition-colors uppercase tracking-tight">{item.label}</span>
                </div>
                <span className="text-xs font-bold">{item.val}</span>
              </div>
            ))}
          </div>
        </div>

        <button className="w-full h-14 bg-black text-white rounded-[24px] font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
           <Settings2 size={18} /> View Chain Explorer
        </button>
      </div>

      {/* Weight Controller Chart */}
      <div className="lg:col-span-2">
         <div className="bg-white p-10 rounded-[40px] border border-gray-50 shadow-sm h-full flex flex-col items-center">
            <div className="flex items-center justify-between w-full mb-10">
               <div className="flex items-center gap-3">
                  <Activity size={20} className="text-purple-600" />
                  <h3 className="text-xl font-bold tracking-tight">Probability Hub</h3>
               </div>
               <div className={`text-[10px] font-bold px-4 py-2 rounded-full border border-gray-50 ${totalWeight === 10000 ? 'bg-[#F8F7F3] text-purple-600' : 'bg-red-50 text-red-500'}`}>
                  Sum: {totalWeight.toLocaleString()} / 10,000
               </div>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center w-full">
               <div className="relative flex items-center justify-center">
                  <svg width="280" height="280" viewBox="0 0 300 300">
                    {pieData.map((slice) => (
                      <motion.path
                        key={slice.id}
                        d={describeArc(150, 150, 120, slice.startAngle, slice.startAngle + slice.angle)}
                        fill={slice.color}
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredSlice(slice.id)}
                        onMouseLeave={() => setHoveredSlice(null)}
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        style={{ filter: hoveredSlice === slice.id ? 'brightness(1.1)' : 'none' }}
                      />
                    ))}
                    <circle cx="150" cy="150" r="85" fill="white" />
                    <foreignObject x="100" y="100" width="100" height="100">
                      <div className="w-full h-full flex flex-col items-center justify-center text-center">
                        <div className="text-[10px] font-black uppercase text-gray-200 tracking-[0.2em] mb-1">Status</div>
                        <div className="text-sm font-bold text-gray-900 tracking-tighter leading-tight italic">Engine Balanced</div>
                      </div>
                    </foreignObject>
                  </svg>
               </div>

               <div className="space-y-4">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Weight Allocation</div>
                  <div className="space-y-4">
                    {prizes.map((p) => (
                      <div 
                        key={p.id}
                        onMouseEnter={() => setHoveredSlice(p.id)}
                        onMouseLeave={() => setHoveredSlice(null)}
                        className={`transition-all ${hoveredSlice === p.id ? 'translate-x-2' : ''}`}
                      >
                         <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-gray-400 uppercase">{p.label}</span>
                            <span className="text-[10px] font-bold bg-[#F8F7F3] px-2 py-0.5 rounded text-gray-500 uppercase">{p.weightBps} BPS</span>
                         </div>
                         <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                            <motion.div 
                               initial={{ width: 0 }}
                               animate={{ width: `${(p.weightBps / 10000) * 100}%` }}
                               className="h-full rounded-full"
                               style={{ backgroundColor: p.color }}
                            />
                         </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-10 p-6 bg-[#F8F7F3] rounded-[32px] border border-gray-50 relative group">
                     <Plus className="absolute top-4 right-4 text-gray-300 hover:text-purple-600 cursor-pointer transition-colors" size={18} />
                     <div className="flex items-center gap-3 mb-2">
                        <ArrowUpRight size={18} className="text-purple-600" />
                        <span className="text-xs font-bold uppercase tracking-tight">Add New Weight</span>
                     </div>
                     <p className="text-[10px] font-medium text-gray-400">Deploy additional logic branches to the probability nebula.</p>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
