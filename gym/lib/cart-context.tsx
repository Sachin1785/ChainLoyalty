'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;         // base price
  discountedPrice?: number; // badge-discounted price if applicable
  quantity: number;
  emoji: string;
  description?: string;
}

interface CartState {
  items: CartItem[];
  totalPrice: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' };

const CartContext = createContext<
  | { state: CartState; dispatch: React.Dispatch<CartAction> }
  | undefined
>(undefined);

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      const effectivePrice = action.payload.discountedPrice ?? action.payload.price;
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          ),
          totalPrice: state.totalPrice + effectivePrice * action.payload.quantity,
        };
      }
      return {
        items: [...state.items, action.payload],
        totalPrice: state.totalPrice + effectivePrice * action.payload.quantity,
      };
    }
    case 'REMOVE_ITEM': {
      const item = state.items.find(i => i.id === action.payload);
      if (!item) return state;
      const effectivePrice = item.discountedPrice ?? item.price;
      return {
        items: state.items.filter(i => i.id !== action.payload),
        totalPrice: state.totalPrice - effectivePrice * item.quantity,
      };
    }
    case 'UPDATE_QUANTITY': {
      const item = state.items.find(i => i.id === action.payload.id);
      if (!item) return state;
      const effectivePrice = item.discountedPrice ?? item.price;
      const oldTotal = effectivePrice * item.quantity;
      const newTotal = effectivePrice * action.payload.quantity;
      return {
        items: state.items.map(i =>
          i.id === action.payload.id ? { ...i, quantity: action.payload.quantity } : i
        ),
        totalPrice: state.totalPrice - oldTotal + newTotal,
      };
    }
    case 'CLEAR_CART':
      return { items: [], totalPrice: 0 };
    default:
      return state;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], totalPrice: 0 });
  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}
