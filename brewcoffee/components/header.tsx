'use client';

import Link from 'next/link';
import { useCart } from '@/lib/cart-context';
import { ShoppingCart, Search } from 'lucide-react';
import { ConnectButton } from './connect-button';
import { useState } from 'react';

export function Header() {
  const { state } = useCart();
  const [searchQuery, setSearchQuery] = useState('');

  const itemCount = state.items.reduce((total, item) => total + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Bar with Location and Search */}
        <div className="flex items-center justify-between gap-4 py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <span className="text-accent-foreground font-serif text-lg font-bold">B</span>
            </div>
            <span className="text-lg font-serif font-bold text-primary hidden sm:inline">Brewbound</span>
          </Link>

          {/* Centered Search Bar */}
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search coffee, equipment..."
                className="w-full px-4 py-2 pl-10 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              />
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 group">
               <Link href="/referrals" className="hidden md:inline text-[10px] font-bold uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity">
                  Rewards
               </Link>
               <ConnectButton />
            </div>

            {/* Cart Icon */}
            <Link
              href="/cart"
              className="relative p-2 text-foreground hover:text-accent transition-colors flex-shrink-0"
            >
              <ShoppingCart size={24} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
