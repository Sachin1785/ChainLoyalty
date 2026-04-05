'use client';

import Link from 'next/link';
import { useCart } from '@/lib/cart-context';
import { Trash2, ArrowRight, ShoppingBag } from 'lucide-react';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { Wallet, Check } from 'lucide-react';

export default function CartPage() {
  const { state, dispatch } = useCart();
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [referralCode, setReferralCode] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = async (totalAmount: number) => {
    if (!isConnected || !address) {
      alert("Please connect your wallet in the header!");
      return;
    }
    
    setIsCheckingOut(true);
    try {
      // 1. Verify referral if provided
      if (referralCode.trim() !== '') {
        try {
          const refRes = await fetch(`http://127.0.0.1:8000/api/v1/referrals/verify?wallet_address=${address}&referral_code=${referralCode}&program_id=brewbound`, {
            method: "POST"
          });
          if (refRes.ok) {
            console.log("Referral verified successfully!");
          }
        } catch (err) {
          console.warn("Referral verification failed", err);
        }
      }

      // 2. Process order
      const response = await fetch(`http://127.0.0.1:8000/api/v1/events?wallet_address=${address}&event_type=COFFEE_ORDER&program_id=brewbound`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: totalAmount }),
      });
      
      if (!response.ok) {
         throw new Error("Failed to process loyalty reward");
      }
      alert(`Order successful! Points sent to ${address.slice(0,6)}...`);
      
      dispatch({ type: 'CLEAR_CART' });
      router.push('/shop');
    } catch (e) {
      console.error(e);
      alert("Order completed, but there was an error processing the loyalty points.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag size={64} className="mx-auto text-muted-foreground mb-6" />
          <h1 className="text-3xl font-serif font-bold text-foreground mb-4">Your cart is empty</h1>
          <p className="text-foreground/60 mb-8">Add some premium coffee to get started</p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-3 bg-accent text-accent-foreground font-semibold rounded-lg hover:bg-accent/90 transition-colors"
          >
            Continue Shopping
            <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-serif font-bold text-foreground mb-2">Shopping Cart</h1>
          <p className="text-foreground/60">
            {state.items.length} item{state.items.length !== 1 ? 's' : ''} in cart
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-lg overflow-hidden">
              {state.items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-6 p-6 border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors"
                >
                  {/* Image */}
                  <div className="w-24 h-24 bg-muted rounded-lg flex flex-shrink-0 items-center justify-center overflow-hidden">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="object-cover w-full h-full" />
                    ) : (
                      <div className="text-4xl">☕</div>
                    )}
                  </div>

                  {/* Item Details */}
                  <div className="flex-1">
                    <h3 className="text-lg font-serif font-bold text-foreground mb-2">
                      {item.name}
                    </h3>
                    <p className="text-sm text-foreground/60 mb-4">{item.description}</p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center border border-border rounded-lg">
                        <button
                          onClick={() =>
                            dispatch({
                              type: 'UPDATE_QUANTITY',
                              payload: { id: item.id, quantity: Math.max(0, item.quantity - 1) },
                            })
                          }
                          className="px-3 py-2 text-foreground hover:bg-muted transition-colors"
                        >
                          −
                        </button>
                        <span className="w-12 text-center py-2 border-l border-r border-border">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            dispatch({
                              type: 'UPDATE_QUANTITY',
                              payload: { id: item.id, quantity: item.quantity + 1 },
                            })
                          }
                          className="px-3 py-2 text-foreground hover:bg-muted transition-colors"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-lg font-serif font-bold text-primary">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: item.id })}
                    className="p-2 text-foreground/60 hover:text-destructive hover:bg-muted rounded-lg transition-colors flex-shrink-0"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg p-8 sticky top-24">
              <h2 className="text-2xl font-serif font-bold text-foreground mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6 pb-6 border-b border-border">
                <div className="flex justify-between text-foreground/80">
                  <span>Subtotal</span>
                  <span>₹{state.totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-foreground/80">
                  <span>Shipping</span>
                  <span className="text-accent">Free</span>
                </div>
                <div className="flex justify-between text-foreground/80">
                  <span>Tax (estimated)</span>
                  <span>₹{(state.totalPrice * 0.08).toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between mb-8">
                <span className="text-xl font-serif font-bold text-foreground">Total</span>
                <span className="text-2xl font-serif font-bold text-primary">
                  ₹{(state.totalPrice * 1.08).toFixed(2)}
                </span>
              </div>


              {/* Wallet Integration Status */}
              <div className="space-y-2 mb-6">
                <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Wallet Connection
                </label>
                {isConnected ? (
                  <div className="flex items-center gap-3 p-4 bg-accent/5 border-2 border-dashed border-accent rounded-xl text-accent">
                     <Check size={20} />
                     <span className="font-serif font-bold text-lg">
                        {address?.slice(0,6)}...{address?.slice(-4)}
                     </span>
                  </div>
                ) : (
                  <div className="p-4 border border-border bg-muted/20 rounded-xl text-foreground flex items-center gap-3">
                     <Wallet size={20} className="text-muted-foreground" />
                     <span className="text-sm font-medium">Please connect wallet in the header</span>
                  </div>
                )}
              </div>

              {/* Referral Code (Optional) */}
              <div className="space-y-2 mb-6">
                <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Referral Code (Optional)
                </label>
                <input 
                  type="text" 
                  placeholder="CHAIN-XXXXXX" 
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  className="w-full p-3 border border-border bg-background rounded-lg text-foreground focus:ring-accent focus:border-accent"
                />
              </div>

              <button 
                onClick={() => handleCheckout(state.totalPrice * 1.08)}
                disabled={isCheckingOut || !isConnected}
                className="w-full px-8 py-3 bg-accent text-accent-foreground font-semibold rounded-lg hover:bg-accent/90 transition-colors mb-4 disabled:opacity-50 disabled:bg-muted"
              >
                {!isConnected ? "Connect Wallet to Order" : (isCheckingOut ? "Processing..." : "Proceed to Checkout")}
              </button>

              <Link
                href="/shop"
                className="block text-center text-accent hover:text-accent/80 text-sm font-semibold transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
