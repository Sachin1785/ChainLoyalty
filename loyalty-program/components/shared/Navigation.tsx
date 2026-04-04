"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { WalletConnect } from "@/components/shared/WalletConnect";
import { useAdmin } from "@/lib/hooks";
import {
  LayoutDashboard,
  Users,
  Home,
  Menu,
  X,
  Zap,
  Activity,
  Trophy,
  Star
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { id: "home", href: "/", label: "Home", icon: Home, color: "hover:bg-[#FFC801]" },
  { id: "loyalty-hub", href: "/user/loyalty-hub", label: "Loyalty Hub", icon: Users, color: "hover:bg-[#6E9CDE]" },
];

export function Navigation() {
  const pathname = usePathname();
  const { isAdmin } = useAdmin();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Client-side navigation should only show regular nav items
  const items = navItems;

  return (
    <nav className="bg-[#FFC801] border-b-[6px] border-black sticky top-0 z-[100] px-4 lg:px-8">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex items-center justify-between h-24">
          {/* Logo Section */}
          <Link
            href="/"
            className="flex items-center gap-3 group"
          >
            <div className="w-14 h-14 bg-white border-[4px] border-black rounded-2xl flex items-center justify-center shadow-[6px_6px_0px_#000] group-hover:translate-y-[2px] group-hover:shadow-[4px_4px_0px_#000] transition-all">
              <Zap size={32} className="fill-black group-hover:rotate-12 transition-transform" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black uppercase italic tracking-tighter leading-none">ChainLoyalty</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-black/50 leading-none mt-1">Core_Protocol_v2</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-6">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex items-center gap-2 px-6 py-3 border-[3px] border-black font-black uppercase text-sm italic transition-all shadow-[4px_4px_0px_#000] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000] ${
                    isActive
                      ? "bg-white translate-y-[1px] shadow-[2px_2px_0px_#000]"
                      : `bg-white ${item.color}`
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                  {isActive && <div className="w-2 h-2 rounded-full bg-[#E84D31] animate-pulse" />}
                </Link>
              );
            })}
          </div>

          {/* Connection Area */}
          <div className="hidden lg:flex items-center gap-4">
             <div className="neo-card bg-white !p-2 flex items-center gap-3 !rounded-full !shadow-[3px_3px_0px_#000]">
                <div className="w-8 h-8 bg-[#7ED348] border-[2px] border-black rounded-full flex items-center justify-center">
                   <Star size={14} fill="white" color="white" />
                </div>
                <div className="pr-2">
                   <div className="text-[8px] font-black uppercase leading-none opacity-40">System_OK</div>
                </div>
             </div>
             <WalletConnect />
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden w-14 h-14 bg-white border-[4px] border-black rounded-xl flex items-center justify-center shadow-[4px_4px_0px_#000]"
          >
            {mobileOpen ? <X size={32} /> : <Menu size={32} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden border-t-[4px] border-black overflow-hidden bg-white"
          >
            <div className="py-8 px-4 flex flex-col gap-4">
              {items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center justify-between p-6 border-[3px] border-black rounded-2xl font-black uppercase italic ${
                      isActive ? "bg-[#FFC801]" : "bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <Icon size={24} />
                      {item.label}
                    </div>
                    <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center">
                       <Trophy size={20} />
                    </div>
                  </Link>
                );
              })}
              <div className="pt-4 mt-4 border-t-[3px] border-black pt-8">
                 <WalletConnect />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
