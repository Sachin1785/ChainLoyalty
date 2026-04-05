'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingCart, Dumbbell } from 'lucide-react'
import { ConnectButton } from '@/components/connect-button'
import { useCart } from '@/lib/cart-context'
import { useState } from 'react'
import { CartDrawer } from '@/components/cart-drawer'

const NAV_LINKS = [
  { href: '/', label: 'Store' },
  { href: '/rewards', label: 'Rewards' },
  { href: '/referrals', label: 'Referrals' },
]

export default function Header() {
  const pathname = usePathname()
  const { state } = useCart()
  const [cartOpen, setCartOpen] = useState(false)
  const itemCount = state.items.reduce((t, i) => t + i.quantity, 0)

  return (
    <>
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-9 h-9 bg-gradient-to-br from-[#1a2e1a] to-[#16a34a] rounded-xl flex items-center justify-center shadow-sm">
              <Dumbbell size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold text-foreground hidden sm:inline">Stride</span>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  pathname === href
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <ConnectButton />
            {/* Cart */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2 rounded-xl hover:bg-muted transition-colors"
              aria-label="Open cart"
            >
              <ShoppingCart size={22} className="text-foreground" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-[10px] font-black rounded-full flex items-center justify-center border-2 border-background">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <div className="md:hidden border-t border-border px-4 pb-3 pt-2 flex gap-2">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`flex-1 text-center py-2 rounded-lg text-xs font-bold transition-all ${
                pathname === href
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      </header>

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}
