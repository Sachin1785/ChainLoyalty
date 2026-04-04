"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Trophy, 
  Gift, 
  X, 
  Settings,
  LogOut,
  Star
} from "lucide-react";
import { IdentityIsland } from "./IdentityIsland";
import { BadgeCarousel } from "./BadgeCarousel";
import { SpinnableVault } from "./SpinnableVault";

type Tab = "identity" | "badges" | "vault";

export function UserQuestHub() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("identity");

  const tabs = [
    { id: "identity", label: "Identity", icon: User, color: "bg-[#FFC801]" },
    { id: "badges", label: "Badges", icon: Trophy, color: "bg-[#6E9CDE]" },
    { id: "vault", label: "The Vault", icon: Gift, color: "bg-[#7ED348]" },
  ];

  return (
    <>
      {/* Floating Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 w-20 h-20 bg-[#FFC801] border-[4px] border-black rounded-full flex items-center justify-center shadow-[6px_6px_0px_#000] hover:scale-110 active:translate-y-[2px] active:shadow-[2px_2px_0px_#000] transition-all z-50 group"
      >
        <div className="relative">
           <Trophy size={32} className="group-hover:rotate-12 transition-transform" />
           <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#E84D31] border-[2px] border-black rounded-full flex items-center justify-center text-[10px] font-black text-white">
             3
           </div>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            />

            {/* Sidebar Hub */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 20 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-[500px] bg-[#F9F1E7] border-l-[6px] border-black z-[70] flex flex-col"
            >
              {/* Hub Header */}
              <div className="p-8 border-b-[4px] border-black bg-white flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-black uppercase italic tracking-tighter leading-none mb-1">Quest Hub</h2>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">User_Protocol_Active</p>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="w-12 h-12 border-[3px] border-black rounded-full flex items-center justify-center hover:bg-[#E84D31] hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Navigation Tabs */}
              <div className="flex p-4 gap-2 bg-[#F9F1E7]">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as Tab)}
                      className={`flex-1 flex flex-col items-center gap-2 py-4 border-[3px] border-black rounded-2xl transition-all shadow-[4px_4px_0px_#000] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000] ${isActive ? tab.color : 'bg-white hover:bg-gray-50'}`}
                    >
                      <Icon size={20} />
                      <span className="text-[10px] font-black uppercase tracking-tight">{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Main Content Area */}
              <div className="flex-1 overflow-y-auto p-6 flex flex-col">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex-1"
                  >
                    {activeTab === "identity" && <IdentityIsland />}
                    {activeTab === "badges" && <BadgeCarousel />}
                    {activeTab === "vault" && <SpinnableVault />}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Hub Footer */}
              <div className="p-6 border-t-[4px] border-black bg-white flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#FFC801] border-[2px] border-black rounded-full flex items-center justify-center">
                       <Settings size={18} />
                    </div>
                    <div>
                       <div className="text-[10px] font-black uppercase leading-none mb-1">Status</div>
                       <div className="text-[10px] font-bold text-green-600 uppercase">Synchronized</div>
                    </div>
                 </div>
                 <button className="flex items-center gap-2 font-black uppercase text-xs hover:text-[#E84D31]">
                    Disconnect <LogOut size={16} />
                 </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
