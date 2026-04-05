'use client';

import { useCart } from '@/lib/cart-context';
import { X, Plus, Minus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { state, dispatch } = useCart();
  const [mounted, setMounted] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // handle checkout using the loyalty backend
  const handleCheckout = async (totalAmount: number) => {
    setIsCheckingOut(true);
    try {
      if (walletAddress.trim() !== '') {
        const response = await fetch(`http://127.0.0.1:8000/api/v1/events?wallet_address=${walletAddress}&event_type=COFFEE_ORDER&program_id=default`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: totalAmount }),
        });
        
        if (!response.ok) {
           throw new Error("Failed to process loyalty reward");
        }
        alert(`Order successful! You earned loyalty points for spending ₹${totalAmount.toFixed(2)}.`);
      } else {
        alert("Order successful! (No loyalty points claimed).");
      }
      
      dispatch({ type: 'CLEAR_CART' });
      onClose();
    } catch (e) {
      console.error(e);
      alert("Order completed, but there was an error processing the loyalty points.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const subtotal = state.items.reduce((total, item) => total + item.price * item.quantity, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const handleIncrement = (id: string, currentQty: number) => {
    dispatch({
      type: 'UPDATE_QUANTITY',
      payload: { id, quantity: currentQty + 1 },
    });
  };

  const handleDecrement = (id: string, currentQty: number) => {
    if (currentQty > 1) {
      dispatch({
        type: 'UPDATE_QUANTITY',
        payload: { id, quantity: currentQty - 1 },
      });
    } else {
      dispatch({ type: 'REMOVE_ITEM', payload: id });
    }
  };

  const handleRemove = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  if (!mounted || !isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-background border-l border-border shadow-lg z-50 flex flex-col overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b border-border p-4 sm:p-6 flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-serif font-bold text-foreground">
            Your Cart
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded transition-colors"
            aria-label="Close cart"
          >
            <X size={24} className="text-foreground" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {state.items.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-center px-4">
              <div>
                <div className="text-5xl mb-4">🛒</div>
                <p className="text-foreground font-semibold mb-2">Your cart is empty</p>
                <p className="text-muted-foreground text-sm">Add some delicious coffee to get started!</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3 p-4 sm:p-6">
              {state.items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 p-3 bg-card rounded-lg border border-border hover:border-accent transition-colors"
                >
                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground text-sm truncate">
                      {item.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-1 bg-accent rounded">
                    <button
                      onClick={() => handleDecrement(item.id, item.quantity)}
                      className="p-1 text-accent-foreground hover:bg-accent/90 transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-6 text-center text-xs font-semibold text-accent-foreground">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleIncrement(item.id, item.quantity)}
                      className="p-1 text-accent-foreground hover:bg-accent/90 transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer - Summary and Checkout */}
        {state.items.length > 0 && (
          <div className="sticky bottom-0 bg-background border-t border-border p-4 sm:p-6 space-y-3">
            {/* Summary */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-foreground">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-foreground">
                <span>Tax (8%)</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-base text-primary border-t border-border pt-2">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>

            {/* Wallet Address for Loyalty */}
            <div className="space-y-1 mt-2 mb-2">
               <label className="text-xs text-muted-foreground font-semibold">Web3 Wallet Address (Earn Points!)</label>
               <input 
                 type="text" 
                 placeholder="0x..." 
                 value={walletAddress}
                 onChange={(e) => setWalletAddress(e.target.value)}
                 className="w-full p-2 border border-border bg-background rounded-md text-sm text-foreground focus:ring-accent focus:border-accent"
               />
            </div>
            
            {/* Checkout Button */}
            <button 
              onClick={() => handleCheckout(total)}
              disabled={isCheckingOut}
              className="w-full py-3 bg-accent text-accent-foreground font-semibold rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50">
              {isCheckingOut ? "Processing..." : "Proceed to Checkout"}
            </button>

            {/* Continue Shopping */}
            <button
              onClick={onClose}
              className="w-full py-2 text-accent border border-accent rounded-lg hover:bg-accent/5 transition-colors text-sm font-medium"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
