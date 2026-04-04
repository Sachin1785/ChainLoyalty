'use client';

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { LayoutDashboard, Trophy, Users, Zap, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConnectWallet } from "@/components/ConnectWallet";
import { useAuth } from "@/lib/auth-context";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/badges", label: "My Badges", icon: Trophy },
  { href: "/dashboard/referrals", label: "Referrals", icon: Users },
  { href: "/dashboard/spin", label: "Spin & Win", icon: Zap },
  { href: "/dashboard/leaderboard", label: "Leaderboard", icon: ChevronRight },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading, address } = useAuth();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neo-yellow" style={{ backgroundImage: 'radial-gradient(rgba(0,0,0,0.08) 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
        <div className="text-5xl font-black animate-bounce">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-neo-yellow" style={{ backgroundImage: 'radial-gradient(rgba(0,0,0,0.08) 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
      {/* Topbar */}
      <header className="bg-white border-b-4 border-black sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-black italic tracking-tighter">
            CHAIN<span style={{ WebkitTextStroke: '2px black', color: 'white' }}>LOYALTY</span>
          </Link>
          <ConnectWallet />
        </div>
      </header>

      <div className="flex max-w-7xl mx-auto w-full px-4 py-8 gap-8">
        {/* Sidebar */}
        <aside className="w-60 shrink-0 hidden md:block">
          <nav className="bg-white border-4 border-black rounded-2xl shadow-[8px_8px_0_0_black] overflow-hidden sticky top-24">
            <div className="p-4 border-b-4 border-black bg-neo-yellow">
              <p className="font-black uppercase text-xs tracking-widest">Navigation</p>
              {address && (
                <p className="font-black text-xs mt-1 opacity-60 truncate">{address.slice(0, 14)}...</p>
              )}
            </div>
            <ul className="p-2">
              {navItems.map(({ href, label, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-sm",
                        active
                          ? "bg-black text-neo-yellow"
                          : "hover:bg-neo-yellow"
                      )}
                    >
                      <Icon size={18} />
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
