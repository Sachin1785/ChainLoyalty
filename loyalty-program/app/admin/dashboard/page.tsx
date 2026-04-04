"use client";

import { BadgeRegistry } from "@/components/admin/BadgeRegistry";
import { PointsConfiguration } from "@/components/admin/PointsConfiguration";
import { LogicNebula } from "@/components/admin/LogicNebula";
import { HeartbeatAnalytics } from "@/components/admin/HeartbeatAnalytics";
import { useWallet } from "@/lib/hooks";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid,
  LogOut,
  User,
  Bell,
  Search,
  BarChart3,
  Box,
  ShoppingCart,
  LineChart,
  FileText,
  HelpCircle,
  Video,
  ChevronDown,
  MoreHorizontal,
  Monitor,
  Trophy,
  Star,
  Settings
} from "lucide-react";

import { PointRulesEditor } from "@/components/admin/PointRulesEditor";

type TabType = "badges" | "logic" | "analytics";

export default function AdminDashboard() {
  const { isConnected, connect, isConnecting } = useWallet();
  const [activeTab, setActiveTab] = useState<TabType>("logic");
  const [showProfile, setShowProfile] = useState(false);
  const [editingRule, setEditingRule] = useState<any>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);

  if (!isConnected) {
    return (
      <div className="h-screen bg-[#F8F7F3] flex items-center justify-center p-8">
        <div className="bg-white p-12 rounded-[40px] shadow-xl text-center max-w-md border border-gray-100">
           <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <User size={40} className="text-purple-600" />
           </div>
          <h2 className="text-2xl font-bold mb-4 text-gray-900 leading-tight">
            ChainLoyalty Admin
          </h2>
          <p className="text-gray-500 mb-2 font-medium">
            Connect your wallet to access the Command Center.
          </p>
          <p className="text-xs text-gray-400 mb-8">
            No MetaMask? A mock dev wallet will be used automatically.
          </p>
          <button
            onClick={connect}
            disabled={isConnecting}
            className="w-full bg-black text-white rounded-2xl py-4 font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isConnecting ? "Connecting…" : "Initialize Dashboard"}
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="h-screen bg-white flex font-sans text-gray-900 overflow-hidden">
      {/* 2. Main Wrapper with Rounded Inner Content */}
      <div className="flex-1 flex flex-col bg-[#F8F7F3] p-3 lg:p-4 overflow-hidden">
         <div className="flex-1 bg-white rounded-[40px] shadow-sm flex flex-col overflow-hidden border border-gray-50 relative">
            
            {/* Top Header */}
            <header className="h-20 px-8 flex items-center justify-between shrink-0">
               <div className="flex items-center gap-6">
                  <h1 className="text-xl font-bold tracking-tight">Command Center</h1>
                  <div className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-bold rounded-full border border-green-100">SYSTEM_ACTIVE</div>
               </div>

               <div className="relative">
                  <button 
                    onClick={() => setShowProfile(!showProfile)}
                    className="w-10 h-10 rounded-full overflow-hidden border-2 border-purple-100 shadow-sm hover:ring-4 hover:ring-purple-50 transition-all active:scale-95"
                  >
                     <img src="https://ui-avatars.com/api/?name=Sam+Smith&background=F3E8FF&color=A855F7" alt="Avatar" />
                  </button>

                  <AnimatePresence>
                    {showProfile && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 top-14 w-64 bg-white rounded-3xl shadow-2xl border border-gray-50 p-6 z-50"
                      >
                         <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-50">
                            <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-xs">SS</div>
                            <div>
                               <p className="text-sm font-bold">Samuel Smith</p>
                               <p className="text-[10px] text-gray-400 font-medium">Administrator</p>
                            </div>
                         </div>
                         <div className="space-y-1">
                            <button className="w-full text-left px-4 py-3 rounded-xl text-xs font-semibold text-gray-600 hover:bg-[#F8F7F3] transition-colors flex items-center gap-3">
                               <Settings size={14} /> Account Settings
                            </button>
                            <button className="w-full text-left px-4 py-3 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors flex items-center gap-3">
                               <LogOut size={14} /> Terminate Session
                            </button>
                         </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
               </div>
            </header>

           {/* Dashboard Content */}
           <main className="flex-1 overflow-hidden px-6 pb-4 flex flex-col">
              
              {/* Tab Navigation */}
              <div className="flex items-center mb-3 shrink-0">
                 <div className="flex items-center gap-6 border-b border-gray-100 w-full mb-[-1px]">
                    <TabLink active={activeTab === 'badges'} onClick={() => setActiveTab('badges')} label="Badge Forge" num="01" />
                    <TabLink active={activeTab === 'logic'} onClick={() => setActiveTab('logic')} label="Logic Nebula" num="02" />
                    <TabLink active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} label="Partner Analytics" num="03" />
                 </div>
              </div>

              {/* Dynamic Page Workspace */}
              <div className="flex-1 bg-[#F8F7F3]/30 rounded-[32px] p-1 min-h-0 overflow-hidden">
                 <div className="h-full luxury-card-inner !bg-white rounded-[28px] overflow-hidden">
                    <AnimatePresence mode="wait">
                       <motion.div
                         key={activeTab}
                         initial={{ opacity: 0, scale: 0.99 }}
                         animate={{ opacity: 1, scale: 1 }}
                         exit={{ opacity: 0, scale: 0.99 }}
                         transition={{ duration: 0.2 }}
                         className={`h-full ${activeTab !== 'analytics' ? 'overflow-y-auto custom-scrollbar' : 'overflow-hidden'}`}
                       >
                         {activeTab === "logic" && (
                            <div className="p-6 h-full flex flex-row gap-8 overflow-hidden">
                                {/* Left Side: Visual Node Editor (Takes up 2/3 of space) */}
                                <div className="flex-[2] flex flex-col min-w-0 space-y-4 h-full">
                                   <div className="shrink-0">
                                      <h2 className="text-xl font-bold tracking-tight">Logic Nebula</h2>
                                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1">
                                        Visual node graph for deploying protocol conditions and rewards
                                      </p>
                                   </div>
                                   <div className="flex-1 rounded-[40px] shadow-sm border border-gray-100 overflow-hidden min-h-0 bg-white">
                                      <LogicNebula ruleToEdit={editingRule} onDeploySuccess={() => setRefreshCounter(c => c+1)} onNewRule={() => setEditingRule(null)} />
                                   </div>
                                </div>

                                {/* Right Side: Rules Protocol Stream (Takes up 1/3 of space) */}
                                <div className="flex-1 flex flex-col min-w-[350px] border-l border-gray-100 pl-8 h-full">
                                   <div className="shrink-0 mb-6">
                                      <h2 className="text-xl font-bold tracking-tight">Active Protocol Rules</h2>
                                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1">
                                        Manage your active deployments and legacy rules
                                      </p>
                                   </div>
                                   <div className="flex-1 min-h-0">
                                      <PointRulesEditor compact mode="grid-only" onSelectRule={(rule) => setEditingRule(rule)} refreshTrigger={refreshCounter} />
                                   </div>
                                </div>
                            </div>
                         )}
                         {activeTab === "analytics" && (
                            <div className="h-full overflow-hidden"><HeartbeatAnalytics /></div>
                         )}
                         {activeTab === "badges" && (
                            <div className="p-6 h-full"><BadgeRegistry /></div>
                         )}
                       </motion.div>
                    </AnimatePresence>
                 </div>
              </div>

           </main>
         </div>
      </div>
    </div>
  );
}

function SideIcon({ active, onClick, icon }: { active: boolean, onClick: () => void, icon: any }) {
  return (
    <button 
      onClick={onClick}
      className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
        active 
        ? "bg-black text-white shadow-xl scale-105" 
        : "text-gray-400 hover:bg-gray-50 hover:text-gray-900"
      }`}
    >
      {icon}
    </button>
  );
}

function TabLink({ active, onClick, label, num }: { active: boolean, onClick: () => void, label: string, num: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 pb-6 px-2 text-sm font-bold transition-all relative whitespace-nowrap ${
        active ? "text-gray-900" : "text-gray-400 hover:text-gray-600"
      }`}
    >
      <span className="text-[10px] py-0.5 px-1.5 rounded-full border border-gray-200">{num}</span>
      {label}
      {active && (
        <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-black rounded-full" />
      )}
    </button>
  );
}
