"use client";

import { useWallet } from "@/lib/hooks";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  ArrowRight,
  Cpu,
  Activity,
  Star,
  Trophy,
  User,
  Key,
  Wallet,
  Lock,
  ChevronRight,
  ShieldCheck,
  Sparkles
} from "lucide-react";

export default function Home() {
  const { isConnected, connect, session } = useWallet();
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminKey, setAdminKey] = useState("");
  const [adminPin, setAdminPin] = useState("");
  const router = useRouter();

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminKey && adminPin) {
      router.push("/admin/dashboard");
    }
  };

  const features = [
    { icon: Cpu, title: "Rules Nebula", color: "bg-[#6E9CDE]" },
    { icon: Activity, title: "Live Economy", color: "bg-[#7ED348]" },
    { icon: ShieldCheck, title: "EAS Proofs", color: "bg-[#E84D31]" },
    { icon: Trophy, title: "Quest Engine", color: "bg-[#FFC801]" },
  ];

  return (
    <div className="min-h-screen bg-[#FFC801] text-black font-sans selection:bg-black selection:text-white overflow-x-hidden">
      
      {/* 1. Hero Section - Bold Neobrutalism */}
      <main className="relative pt-20 pb-32 px-6">
        {/* Decorative Floating Elements */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-[#7ED348] border-[4px] border-black rounded-full shadow-[8px_8px_0px_#000] rotate-12 hidden lg:flex items-center justify-center">
           <Star size={48} fill="white" color="white" />
        </div>
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-[#6E9CDE] border-[4px] border-black rounded-[40px] shadow-[12px_12px_0px_#000] -rotate-6 hidden lg:flex items-center justify-center">
           <Trophy size={64} fill="white" color="white" />
        </div>

        <div className="max-w-7xl mx-auto text-center space-y-16">
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="inline-flex items-center gap-2 bg-white border-[3px] border-black px-6 py-2 rounded-full shadow-[4px_4px_0px_#000]"
           >
              <div className="w-2 h-2 rounded-full bg-[#E84D31] animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                 V2.5_NEOBRUTAL_ENGINE_ONLINE
              </span>
           </motion.div>

           <div className="space-y-8">
              <motion.h1 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-7xl md:text-9xl font-black italic uppercase tracking-tighter leading-[0.85]"
              >
                ON-CHAIN <br />
                <span className="bg-white border-[8px] border-black px-10 py-4 inline-block shadow-[20px_20px_0px_#000] -rotate-2 mt-4 hover:rotate-0 transition-transform cursor-default">
                  LOYALTY.
                </span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl md:text-2xl font-black uppercase max-w-2xl mx-auto leading-tight text-black/70"
              >
                Bridge the gap between Web3 gamification and SaaS utility. 
                Claim your legacy on the decentralized reward protocol.
              </motion.p>
           </div>

           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.3 }}
             className="flex flex-col items-center gap-8"
           >
              {isConnected ? (
                <div className="flex flex-col items-center gap-6">
                   <div className="bg-white border-[4px] border-black p-4 rounded-2xl shadow-[8px_8px_0px_#000] flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#7ED348] border-[2px] border-black rounded-full flex items-center justify-center">
                         <User size={20} color="white" />
                      </div>
                      <span className="font-black uppercase tracking-tight text-sm">
                         {session?.address?.slice(0, 6)}...{session?.address?.slice(-4)}
                      </span>
                   </div>
                   <button 
                      onClick={() => router.push("/user/loyalty-hub")}
                      className="neo-btn bg-black text-white text-3xl px-16 py-8 hover:bg-[#E84D31] flex items-center gap-4"
                   >
                      Enter Hub <ArrowRight size={32} strokeWidth={3} />
                   </button>
                </div>
              ) : (
                <button 
                  onClick={connect}
                  className="neo-btn bg-white text-black text-3xl px-16 py-8 hover:bg-[#6E9CDE] flex items-center gap-4"
                >
                  Connect Link <Wallet size={32} strokeWidth={3} />
                </button>
              )}
           </motion.div>
        </div>
      </main>

      {/* 2. Mini Feature Bar */}
      <section className="bg-white border-y-[6px] border-black py-10 overflow-hidden relative">
         <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-4">
                 <div className={`w-12 h-12 ${f.color} border-[3px] border-black rounded-xl flex items-center justify-center shadow-[4px_4px_0px_#000]`}>
                    <f.icon size={24} color="white" />
                 </div>
                 <span className="font-black uppercase italic tracking-tighter text-lg">{f.title}</span>
              </div>
            ))}
         </div>
      </section>

      {/* 3. Footer with Hidden Admin Entrance */}
      <footer className="bg-black text-white py-20 px-10 relative">
         <div className="max-w-7xl mx-auto flex flex-col items-center gap-12">
            <div className="flex flex-col items-center text-center gap-4">
               <div className="text-4xl font-black italic tracking-tighter uppercase leading-none">ChainLoyalty</div>
               <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Decentralized Retention Protocol_v2.5</p>
            </div>

            <div className="flex gap-10 text-[10px] font-black uppercase tracking-widest text-gray-500">
               <span className="hover:text-white cursor-pointer transition-colors">Privacy</span>
               <span className="hover:text-white cursor-pointer transition-colors">Discord</span>
               <span className="hover:text-white cursor-pointer transition-colors">X_Space</span>
               <span 
                 onClick={() => setShowAdminLogin(true)}
                 className="text-[#FFC801] hover:underline cursor-pointer"
               >
                 Merchant_Portal
               </span>
            </div>
            
            <div className="text-[10px] font-black uppercase bg-white text-black px-4 py-1.5 rounded-full shadow-[4px_4px_0px_#FFC801]">
               All_Rights_Reserved_2026
            </div>
         </div>
      </footer>

      {/* Admin Login Modal (SaaS Style) */}
      <AnimatePresence>
        {showAdminLogin && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowAdminLogin(false)}
               className="absolute inset-0 bg-black/60 backdrop-blur-sm"
             />
             <motion.div 
               initial={{ scale: 0.9, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.9, opacity: 0, y: 20 }}
               className="bg-white rounded-[40px] p-12 shadow-2xl w-full max-w-md relative z-10 border border-gray-100"
             >
                <div className="space-y-6 text-center">
                   <div className="w-20 h-20 bg-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                      <Lock size={32} className="text-purple-600" />
                   </div>
                   <h2 className="text-2xl font-bold tracking-tight text-gray-900">Merchant Forge</h2>
                   <p className="text-sm font-medium text-gray-500">Access authorized administrative controls.</p>
                </div>

                <form onSubmit={handleAdminLogin} className="mt-10 space-y-4">
                   <div className="relative">
                      <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                         type="text" 
                         placeholder="Merchant Key" 
                         value={adminKey}
                         onChange={(e) => setAdminKey(e.target.value)}
                         className="w-full h-14 bg-gray-50 rounded-2xl pl-14 pr-6 text-sm font-semibold outline-none border border-transparent focus:border-purple-200 focus:bg-white transition-all shadow-inner"
                      />
                   </div>
                   <div className="relative">
                      <Key className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                         type="password" 
                         placeholder="Access Pin" 
                         value={adminPin}
                         onChange={(e) => setAdminPin(e.target.value)}
                         className="w-full h-14 bg-gray-50 rounded-2xl pl-14 pr-6 text-sm font-semibold outline-none border border-transparent focus:border-purple-200 focus:bg-white transition-all shadow-inner"
                      />
                   </div>
                   <button 
                      type="submit"
                      className="w-full h-14 bg-black text-white rounded-2xl font-bold mt-6 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                   >
                      Initialize Auth <ChevronRight size={18} />
                   </button>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
