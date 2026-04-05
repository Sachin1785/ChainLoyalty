'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, Star, Zap, Trophy, Wallet,
  Coffee, Sparkles, Check, Tag, Lock
} from 'lucide-react';
import { useCart } from '@/lib/cart-context';

const API = 'http://127.0.0.1:8000';

// Badge tiers keyed to product categories
const BADGE_PERKS = [
  {
    match: (r: string) => r.includes('Code:'),
    emoji: '☕',
    label: 'Brewbound Coffee Voucher',
    perk: '5% off any Stride gear',
    discount: 5,
    appliesTo: 'all',
    color: 'bg-amber-100 text-amber-800 border-amber-200',
    badgeColor: 'from-amber-400 to-orange-500',
    source: 'Brewbound',
  },
  {
    match: (r: string) => r.toLowerCase().includes('bronze'),
    emoji: '🥉',
    label: 'Bronze Athlete',
    perk: '10% off Supplements',
    discount: 10,
    appliesTo: 'Supplements',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    badgeColor: 'from-yellow-600 to-amber-700',
    source: 'Stride',
  },
  {
    match: (r: string) => r.toLowerCase().includes('silver'),
    emoji: '🥈',
    label: 'Silver Athlete',
    perk: '15% off Equipment',
    discount: 15,
    appliesTo: 'Equipment',
    color: 'bg-slate-100 text-slate-700 border-slate-200',
    badgeColor: 'from-slate-400 to-slate-600',
    source: 'Stride',
  },
  {
    match: (r: string) => r.toLowerCase().includes('gold'),
    emoji: '🥇',
    label: 'Gold Athlete',
    perk: '20% off Everything',
    discount: 20,
    appliesTo: 'all',
    color: 'bg-yellow-100 text-yellow-900 border-yellow-300',
    badgeColor: 'from-yellow-400 to-amber-500',
    source: 'Stride',
  },
  {
    match: (r: string) => r.toLowerCase().includes('platinum'),
    emoji: '💎',
    label: 'Platinum Legend',
    perk: '25% off + Early Access',
    discount: 25,
    appliesTo: 'all',
    color: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    badgeColor: 'from-cyan-400 to-blue-600',
    source: 'Stride',
  },
];

const LOCK_BADGES = [
  { emoji: '☕', label: 'Brewbound Voucher', desc: 'Order any coffee at Brewbound', discount: 5, locked: true },
  { emoji: '🥉', label: 'Bronze Badge', desc: 'Complete 30 workouts at Stride', discount: 10, locked: true },
  { emoji: '🥇', label: 'Gold Badge', desc: 'Complete 100 workouts at Stride', discount: 20, locked: true },
];

const PRODUCTS = [
  { id: 1, name: 'Premium Protein Powder', category: 'Supplements', price: 49.99, rating: 4.8, image: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&q=80&w=800', desc: 'Whey isolate, 25g protein per serving' },
  { id: 4, name: 'Foam Roller Pro', category: 'Recovery', price: 44.99, rating: 4.6, image: 'https://images.unsplash.com/photo-1600881333168-2ef49b341f30?auto=format&fit=crop&q=80&w=800', desc: 'Deep tissue muscle recovery' },
  { id: 5, name: 'Hydration Bottle 1L', category: 'Accessories', price: 24.99, rating: 4.5, image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=800', desc: 'Insulated stainless steel design' },
];

const CATEGORIES = ['All', 'Supplements', 'Equipment', 'Clothing', 'Recovery', 'Accessories', 'Tech'];

function getBestDiscount(category: string, activeBadges: any[]): { perk: any; value: number } | null {
  let best: any = null;
  let bestVal = 0;
  for (const badge of activeBadges) {
    if (badge.perk && (badge.perk.appliesTo === 'all' || badge.perk.appliesTo === category)) {
      if (badge.perk.discount > bestVal) {
        bestVal = badge.perk.discount;
        best = badge.perk;
      }
    }
  }
  return best ? { perk: best, value: bestVal } : null;
}

export default function Store() {
  const { address, isConnected } = useAccount();
  const { dispatch: cartDispatch } = useCart();
  const [activeBadges, setActiveBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [addedToCart, setAddedToCart] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const fetchBadges = async () => {
    if (!address) return;
    setLoading(true);
    try {
      const [brewRes, strideRes] = await Promise.all([
        fetch(`${API}/api/v1/rewards/${address}/stats?program_id=brewbound`),
        fetch(`${API}/api/v1/rewards/${address}/stats?program_id=stride`),
      ]);
      const brew = await brewRes.json();
      const stride = await strideRes.json();
      const allActivity = [
        ...(brew.recent_activity || []),
        ...(stride.recent_activity || []),
      ];
      const badges = allActivity
        .filter((a: any) => a.type === 'badge' || a.type === 'voucher')
        .map((a: any) => {
          const perk = BADGE_PERKS.find((p) => p.match(a.reason));
          return perk ? { ...a, perk } : null;
        })
        .filter(Boolean);
      setActiveBadges(badges);
    } catch (e) {
      console.error('Store: failed to fetch badges', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && address) {
      fetchBadges();
    } else {
      setActiveBadges([]);
    }
  }, [isConnected, address]);

  const filteredProducts = selectedCategory === 'All'
    ? PRODUCTS
    : PRODUCTS.filter(p => p.category === selectedCategory);

  const handleAddToCart = (product: typeof PRODUCTS[number], discountedPrice: number | null) => {
    cartDispatch({
      type: 'ADD_ITEM',
      payload: {
        id: String(product.id),
        name: product.name,
        price: product.price,
        discountedPrice: discountedPrice ?? undefined,
        quantity: 1,
        image: product.image,
        description: product.desc,
      },
    });
    setAddedToCart(product.id);
    setTimeout(() => setAddedToCart(null), 2000);
  };

  // Deduplicate active perks for the banner
  const uniquePerks = activeBadges
    .map(b => b.perk)
    .filter((p, i, arr) => arr.findIndex(x => x.label === p.label) === i);

  return (
    <section id="store" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-10">
          <h2 className="text-4xl font-bold text-foreground mb-2">Stride Store</h2>
          <p className="text-muted-foreground text-lg">
            Shop premium fitness gear. Badges from any platform unlock real discounts.
          </p>
        </div>

        {/* Cross-Platform Badge Banner */}
        {mounted && (
          <div className="mb-10">
            {!isConnected ? (
              /* Not connected - show what you could unlock */
              <div className="rounded-2xl border-2 border-dashed border-border bg-muted/20 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Wallet size={20} className="text-muted-foreground" />
                  <p className="font-semibold text-foreground">Connect wallet to unlock badge discounts</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {LOCK_BADGES.map((b, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl opacity-60">
                      <span className="text-2xl">{b.emoji}</span>
                      <div>
                        <p className="text-xs font-bold text-foreground">{b.label}</p>
                        <p className="text-[11px] text-muted-foreground">{b.desc}</p>
                        <p className="text-xs font-black text-green-600 mt-1">Unlocks {b.discount}% off</p>
                      </div>
                      <Lock size={14} className="text-muted-foreground ml-auto flex-shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            ) : loading ? (
              <div className="h-28 bg-muted/30 rounded-2xl animate-pulse" />
            ) : uniquePerks.length > 0 ? (
              /* Active perks banner */
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl overflow-hidden border border-green-200"
              >
                <div className="bg-gradient-to-r from-green-600 to-emerald-700 px-6 py-3 flex items-center gap-3">
                  <Sparkles size={18} className="text-yellow-300" />
                  <p className="font-bold text-white text-sm">
                    🎉 Your badges are active — discounts applied automatically at checkout!
                  </p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {uniquePerks.map((p, i) => (
                    <div key={i} className={`flex items-center gap-3 border rounded-xl p-3 ${p.color}`}>
                      <span className="text-xl">{p.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold leading-none">{p.label}</p>
                        <p className="text-[11px] mt-0.5 opacity-80">{p.perk}</p>
                        <p className="text-[10px] font-bold opacity-60 mt-0.5">from {p.source}</p>
                      </div>
                      <div className="bg-white/80 rounded-lg px-2 py-1 flex-shrink-0">
                        <span className="text-sm font-black text-green-700">-{p.discount}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              /* Connected but no badges */
              <div className="rounded-2xl bg-gradient-to-r from-gray-50 to-slate-50 border border-border p-5 flex items-center gap-4">
                <Trophy size={32} className="text-gray-300 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-foreground">No badges yet — full price applies</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Log workouts here or order at Brewbound to earn cross-platform discounts
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Category Filter */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full whitespace-nowrap border text-sm font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'border-border hover:bg-muted text-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product, idx) => {
            const discount = mounted && isConnected
              ? getBestDiscount(product.category, activeBadges)
              : null;
            const discountedPrice = discount
              ? product.price * (1 - discount.value / 100)
              : null;

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col"
              >
                {/* Product Image Area */}
                <div className="relative h-48 bg-muted flex items-center justify-center overflow-hidden">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover mix-blend-multiply" />
                  <div className="absolute top-3 left-3 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold">
                    {product.category}
                  </div>
                  {discount && (
                    <div className={`absolute top-3 right-3 bg-gradient-to-br ${discount.perk.badgeColor} text-white px-2 py-1 rounded-full text-xs font-black shadow-lg`}>
                      {discount.perk.emoji} -{discount.value}%
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-card-foreground text-base mb-1">{product.name}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{product.desc}</p>
                  <div className="flex items-center gap-1 mb-4">
                    <Star size={12} className="fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-semibold text-muted-foreground">{product.rating}</span>
                  </div>

                  {/* Pricing */}
                  <div className="mt-auto">
                    {discount && discountedPrice ? (
                      <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Tag size={12} className="text-green-600" />
                          <span className="text-[10px] font-black text-green-700 uppercase tracking-wider">{discount.perk.label} price</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-black text-green-700">
                            ${discountedPrice.toFixed(2)}
                          </span>
                          <span className="text-sm text-muted-foreground line-through">${product.price.toFixed(2)}</span>
                        </div>
                        <p className="text-[11px] text-green-600 font-bold mt-1">
                          You save ${(product.price - discountedPrice).toFixed(2)} ✓
                        </p>
                      </div>
                    ) : (
                      <div className="mb-4 p-4 bg-muted/30 rounded-xl">
                        <p className="text-xs text-muted-foreground mb-1">Price</p>
                        <p className="text-2xl font-black text-card-foreground">${product.price.toFixed(2)}</p>
                        {mounted && isConnected && (
                          <p className="text-[10px] text-muted-foreground mt-1 italic">
                            Earn a badge to unlock discounts
                          </p>
                        )}
                      </div>
                    )}

                    <AnimatePresence mode="wait">
                      {addedToCart === product.id ? (
                        <motion.div
                          key="added"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="w-full py-3 bg-green-500 text-white font-bold rounded-xl flex items-center justify-center gap-2"
                        >
                          <Check size={18} /> Added to Cart!
                        </motion.div>
                      ) : (
                        <motion.button
                          key="add"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => handleAddToCart(product, discountedPrice)}
                          className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
                        >
                          <ShoppingCart size={16} />
                          {discount ? 'Add at Discount Price' : 'Add to Cart'}
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Footer CTA */}
        <div className="mt-20 bg-gradient-to-br from-[#1a2e1a] to-[#0f4a2a] text-white rounded-2xl p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, #4ade80, transparent 50%), radial-gradient(circle at 80% 20%, #22c55e, transparent 50%)' }}
          />
          <div className="relative z-10">
            <h3 className="text-3xl font-bold mb-2">Earn badges, unlock better deals</h3>
            <p className="mb-6 text-white/80 max-w-2xl mx-auto text-base">
              Every workout logged and every coffee at Brewbound earns you cross-platform badges —
              redeemable right here in the Stride Store.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a href="http://localhost:3002" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-400 transition-colors">
                <Coffee size={18} />
                Visit Brewbound ☕
              </a>
              <button
                onClick={() => document.getElementById('feed')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-colors border border-white/20">
                Log a Workout 🏋️
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
