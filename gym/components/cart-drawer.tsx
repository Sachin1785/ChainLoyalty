'use client';

import { useCart } from '@/lib/cart-context';
import { X, Plus, Minus, Trash2, Wallet, Check, ShoppingBag, Zap, Tag } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';

const API = 'http://127.0.0.1:8000';

export interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { state, dispatch } = useCart();
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const subtotal = state.items.reduce(
    (total, item) => total + (item.discountedPrice ?? item.price) * item.quantity,
    0
  );
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const totalSavings = state.items.reduce(
    (saved, item) =>
      item.discountedPrice ? saved + (item.price - item.discountedPrice) * item.quantity : saved,
    0
  );

  const handleCheckout = async () => {
    if (!isConnected || !address) {
      alert('Please connect your wallet to proceed!');
      return;
    }
    setIsCheckingOut(true);
    try {
      // 1. Verify referral if provided
      if (referralCode.trim() !== '') {
        try {
          await fetch(
            `${API}/api/v1/referrals/verify?wallet_address=${address}&referral_code=${referralCode}&program_id=stride`,
            { method: 'POST' }
          );
        } catch (err) {
          console.warn('Referral verification failed, continuing', err);
        }
      }

      // 2. Fire GYM_STORE_PURCHASE event to earn loyalty points
      const res = await fetch(
        `${API}/api/v1/events?wallet_address=${address}&event_type=GYM_STORE_PURCHASE&program_id=stride`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: total }),
        }
      );
      if (!res.ok) throw new Error('Failed to process loyalty reward');

      setCheckoutSuccess(true);
      setTimeout(() => {
        setCheckoutSuccess(false);
        dispatch({ type: 'CLEAR_CART' });
        onClose();
      }, 2500);
    } catch (e) {
      console.error(e);
      alert('Order completed, but there was an error processing loyalty points.');
      dispatch({ type: 'CLEAR_CART' });
      onClose();
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (!mounted || !isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed right-0 top-0 h-full w-full max-w-md bg-background border-l border-border shadow-2xl z-50 flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1a2e1a] to-[#0f4a2a] px-6 py-5 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ShoppingBag size={20} />
              Your Cart
            </h2>
            <p className="text-green-300/70 text-xs mt-0.5">
              {state.items.length} item{state.items.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <X size={22} className="text-white" />
          </button>
        </div>

        {/* Success Screen */}
        <AnimatePresence>
          {checkoutSuccess && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 bg-background flex flex-col items-center justify-center gap-4 px-8 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center"
              >
                <Check size={48} className="text-green-600" />
              </motion.div>
              <h3 className="text-2xl font-bold text-foreground">Order Placed! 🎉</h3>
              <p className="text-muted-foreground">
                You earned <span className="font-bold text-green-600">+50 loyalty pts</span> on this purchase!
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {state.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-8 gap-4">
              <ShoppingBag size={56} className="text-muted-foreground/20" />
              <p className="font-semibold text-foreground">Your cart is empty</p>
              <p className="text-muted-foreground text-sm">Add some premium gear from the store!</p>
            </div>
          ) : (
            <div className="space-y-3 p-5">
              {state.items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex gap-4 p-4 bg-card rounded-2xl border border-border hover:border-primary/30 transition-colors"
                >
                  {/* Emoji Icon */}
                  <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                    {item.emoji}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm leading-tight">{item.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {item.discountedPrice ? (
                        <>
                          <span className="text-sm font-bold text-green-600">
                            ${(item.discountedPrice * item.quantity).toFixed(2)}
                          </span>
                          <span className="text-xs text-muted-foreground line-through">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                          <span className="text-[10px] bg-green-100 text-green-700 font-black px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                            <Tag size={8} /> Badge price
                          </span>
                        </>
                      ) : (
                        <span className="text-sm font-bold text-primary">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity + Delete */}
                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: item.id })}
                      className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                    <div className="flex items-center gap-1 bg-primary/10 rounded-lg">
                      <button
                        onClick={() => {
                          if (item.quantity > 1) {
                            dispatch({ type: 'UPDATE_QUANTITY', payload: { id: item.id, quantity: item.quantity - 1 } });
                          } else {
                            dispatch({ type: 'REMOVE_ITEM', payload: item.id });
                          }
                        }}
                        className="p-1.5 text-primary hover:bg-primary/20 rounded-l-lg transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-primary">{item.quantity}</span>
                      <button
                        onClick={() =>
                          dispatch({ type: 'UPDATE_QUANTITY', payload: { id: item.id, quantity: item.quantity + 1 } })
                        }
                        className="p-1.5 text-primary hover:bg-primary/20 rounded-r-lg transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {state.items.length > 0 && (
          <div className="border-t border-border p-5 space-y-4 flex-shrink-0 bg-background">
            {/* Savings callout */}
            {totalSavings > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
                <Zap size={14} className="text-green-600 fill-green-600" />
                <p className="text-green-700 text-sm font-bold">
                  Badge discount saving you ${totalSavings.toFixed(2)}!
                </p>
              </div>
            )}

            {/* Price summary */}
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Tax (8%)</span><span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-base text-foreground border-t border-border pt-2 mt-2">
                <span>Total</span><span>${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Wallet status */}
            {isConnected ? (
              <div className="flex items-center gap-2 p-2.5 bg-green-50 border border-green-200 rounded-xl text-green-700 text-xs font-semibold">
                <Check size={14} />
                <span>{address?.slice(0, 6)}...{address?.slice(-4)}</span>
              </div>
            ) : (
              <div className="p-2.5 border border-amber-200 bg-amber-50 rounded-xl text-amber-700 text-xs flex items-center gap-2 font-semibold">
                <Wallet size={14} />
                <span>Connect wallet to earn loyalty points</span>
              </div>
            )}

            {/* Referral code */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-1.5">
                Referral Code (Optional)
              </label>
              <input
                type="text"
                placeholder="STRIDE-XXXXXX"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                className="w-full px-3 py-2.5 border border-border bg-background rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono"
              />
            </div>

            {/* Checkout */}
            <button
              onClick={handleCheckout}
              disabled={isCheckingOut || !isConnected}
              className="w-full py-3.5 bg-gradient-to-r from-[#1a2e1a] to-[#16a34a] text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {!isConnected
                ? 'Connect Wallet to Order'
                : isCheckingOut
                ? 'Processing...'
                : `Checkout · $${total.toFixed(2)}`}
            </button>

            <button
              onClick={onClose}
              className="w-full py-2.5 text-primary border border-primary/30 rounded-xl hover:bg-primary/5 transition-colors text-sm font-semibold"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </motion.div>
    </>
  );
}
