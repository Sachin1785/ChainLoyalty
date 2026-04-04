"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldAlert, 
  Lock, 
  ChevronLeft, 
  ChevronRight, 
  ShieldCheck, 
  ExternalLink,
  Flame,
  Award,
  Cpu,
  Trophy,
  Star,
  Zap
} from "lucide-react";

interface Badge {
  id: string;
  name: string;
  description: string;
  image: string;
  isSoulbound: boolean;
  tier: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  color: string;
}

const mockBadges: Badge[] = [
  { id: 'b1', name: 'Alpha Pioneer', description: 'Early tester of the ChainLoyalty protocol. Grants 2x point multiplier.', image: '', isSoulbound: true, tier: 'Epic', color: '#FFC801' },
  { id: 'b2', name: 'Web3 Scholar', description: 'Completed 10 logic nebula deployments. Access to advanced rules.', image: '', isSoulbound: false, tier: 'Rare', color: '#6E9CDE' },
  { id: 'b3', name: 'Whale Whisperer', description: 'Handled over 50 ETH in rewards treasury. Premium badge registry access.', image: '', isSoulbound: true, tier: 'Legendary', color: '#7ED348' },
  { id: 'b4', name: 'Bug Hunter', description: 'Identified critical vulnerabilities in commit-reveal logic.', image: '', isSoulbound: false, tier: 'Common', color: '#E84D31' },
];

export function BadgeCarousel() {
  const [index, setIndex] = useState(0);
  const activeBadge = mockBadges[index];

  const next = () => setIndex((prev) => (prev + 1) % mockBadges.length);
  const prev = () => setIndex((prev) => (prev - 1 + mockBadges.length) % mockBadges.length);

  return (
    <div className="neo-card bg-white p-8 min-h-[500px] flex flex-col gap-8 relative overflow-hidden">
      {/* Decorative dots in background */}
      <div className="absolute top-4 left-4 grid grid-cols-4 gap-2 opacity-20">
         {[...Array(16)].map((_, i) => <div key={i} className="w-1.5 h-1.5 bg-black rounded-full" />)}
      </div>

      <div className="flex items-center justify-between relative">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-[#FFC801] border-[3px] border-black rounded-xl flex items-center justify-center shadow-[4px_4px_0px_#000]">
            <Trophy size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase italic tracking-tighter leading-none">Your Vault</h3>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">Collectible_Inventory</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <NavBtn onClick={prev} icon={<ChevronLeft size={20} />} />
          <NavBtn onClick={next} icon={<ChevronRight size={20} />} />
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center py-10 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeBadge.id}
            initial={{ x: 50, opacity: 0, rotate: 5 }}
            animate={{ x: 0, opacity: 1, rotate: index % 2 === 0 ? 2 : -2 }}
            exit={{ x: -50, opacity: 0, rotate: -5 }}
            className="w-full max-w-[320px] neo-card p-0 bg-white overflow-hidden group"
          >
            {/* Badge Image / Icon placeholder */}
            <div className="h-48 flex items-center justify-center relative bg-gray-50 border-b-[4px] border-black">
               <div 
                 className="absolute inset-0 opacity-20" 
                 style={{ 
                   backgroundImage: `radial-gradient(${activeBadge.color} 2px, transparent 2px)`,
                   backgroundSize: '20px 20px'
                 }} 
               />
               <div className="w-24 h-24 bg-white border-[3px] border-black rounded-full flex items-center justify-center shadow-[6px_6px_0px_#000] relative z-10">
                  <BadgeIcon tier={activeBadge.tier} color={activeBadge.color} />
               </div>
               
               <div className="absolute top-4 right-4 bg-white border-[2px] border-black px-2 py-1 flex items-center gap-1 rounded-full shadow-[2px_2px_0px_#000]">
                  <Star size={10} fill={activeBadge.color} color={activeBadge.color} />
                  <span className="text-[8px] font-black uppercase">{activeBadge.tier}</span>
               </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-2xl font-black uppercase italic tracking-tighter">{activeBadge.name}</h4>
                {activeBadge.isSoulbound && (
                  <div className="p-2 bg-[#E84D31] text-white border-[2px] border-black rounded-lg shadow-[2px_2px_0px_#000]">
                    <Lock size={14} />
                  </div>
                )}
              </div>
              
              <p className="text-xs font-bold text-gray-500 leading-relaxed uppercase">
                {activeBadge.description}
              </p>

              <button className="w-full neo-btn !py-2 !text-[10px] flex items-center justify-center gap-2">
                <ExternalLink size={14} /> View Contract Details
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Breadcrumbs / Progress */}
      <div className="flex justify-center gap-3">
         {mockBadges.map((_, i) => (
           <div 
             key={i} 
             className={`h-4 border-[2px] border-black transition-all ${i === index ? 'w-10 bg-[#FFC801]' : 'w-4 bg-gray-200'}`} 
           />
         ))}
      </div>
    </div>
  );
}

function NavBtn({ onClick, icon }: { onClick: () => void; icon: React.ReactNode }) {
  return (
    <button 
      onClick={onClick}
      className="w-12 h-12 flex items-center justify-center bg-white border-[3px] border-black shadow-[4px_4px_0px_#000] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000] transition-all"
    >
      {icon}
    </button>
  );
}

function BadgeIcon({ tier, color }: { tier: string, color: string }) {
  switch(tier) {
    case 'Legendary': return <Award size={48} color={color} />;
    case 'Epic': return <Zap size={48} color={color} fill={color} />;
    case 'Rare': return <Star size={48} color={color} fill={color} />;
    default: return <Cpu size={48} color={color} />;
  }
}
