'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
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
  | {
      state: CartState;
      dispatch: React.Dispatch<CartAction>;
    }
  | undefined
>(undefined);

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          ),
          totalPrice: state.totalPrice + action.payload.price * action.payload.quantity,
        };
      }
      return {
        items: [...state.items, action.payload],
        totalPrice: state.totalPrice + action.payload.price * action.payload.quantity,
      };
    }
    case 'REMOVE_ITEM': {
      const itemToRemove = state.items.find(item => item.id === action.payload);
      if (!itemToRemove) return state;
      return {
        items: state.items.filter(item => item.id !== action.payload),
        totalPrice: state.totalPrice - itemToRemove.price * itemToRemove.quantity,
      };
    }
    case 'UPDATE_QUANTITY': {
      const itemToUpdate = state.items.find(item => item.id === action.payload.id);
      if (!itemToUpdate) return state;
      const oldTotal = itemToUpdate.price * itemToUpdate.quantity;
      const newTotal = itemToUpdate.price * action.payload.quantity;
      return {
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
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
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    totalPrice: 0,
  });

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
