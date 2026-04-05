'use client';

import Link from 'next/link';
import { Star, Plus, Minus } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { useState } from 'react';

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  rating?: number;
  reviews?: number;
  size?: string;
  featured?: boolean;
  span?: 'small' | 'medium' | 'large';
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { state, dispatch } = useCart();
  const [quantity, setQuantity] = useState(0);

  const cartItem = state.items.find((item) => item.id === product.id);
  const currentQuantity = cartItem?.quantity || quantity;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (currentQuantity === 0) {
      setQuantity(1);
      dispatch({
        type: 'ADD_ITEM',
        payload: {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          image: product.image,
          description: product.description,
        },
      });
    }
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    if (cartItem) {
      dispatch({
        type: 'UPDATE_QUANTITY',
        payload: { id: product.id, quantity: cartItem.quantity + 1 },
      });
    } else {
      const newQty = quantity + 1;
      setQuantity(newQty);
      dispatch({
        type: 'ADD_ITEM',
        payload: {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: newQty,
          image: product.image,
          description: product.description,
        },
      });
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    if (cartItem) {
      if (cartItem.quantity > 1) {
        dispatch({
          type: 'UPDATE_QUANTITY',
          payload: { id: product.id, quantity: cartItem.quantity - 1 },
        });
      } else {
        dispatch({ type: 'REMOVE_ITEM', payload: product.id });
      }
    } else if (quantity > 0) {
      setQuantity(quantity - 1);
    }
  };

  const gridColSpan = product.span === 'large' ? 'md:col-span-2' : product.span === 'medium' ? 'md:col-span-2 md:row-span-2' : '';

  return (
    <Link href={`/product/${product.id}`}>
      <div className={`bg-card rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col ${gridColSpan}`}>
        {/* Image Container */}
        <div className="relative w-full h-48 sm:h-64 bg-muted flex items-center justify-center overflow-hidden">
          {product.image ? (
            <img src={product.image} alt={product.name} className="object-cover w-full h-full" />
          ) : (
            <div className="text-6xl text-muted-foreground/40">☕</div>
          )}
          {product.featured && (
            <div className="absolute top-4 right-4 bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-semibold">
              Featured
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4 sm:p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg sm:text-xl font-serif font-bold text-foreground mb-2">
              {product.name}
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-3 line-clamp-2">
              {product.description}
            </p>

            {/* Rating */}
            {product.rating !== undefined && (
              <div className="flex items-center gap-2 mb-3">
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < Math.round(product.rating!) ? 'fill-accent text-accent' : 'text-muted-foreground'}
                    />
                  ))}
                </div>
                {product.reviews && (
                  <span className="text-xs text-muted-foreground">({product.reviews})</span>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="text-2xl font-serif font-bold text-primary">
              ₹{product.price.toFixed(2)}
            </div>
            
            {currentQuantity === 0 ? (
              <button
                onClick={handleAddToCart}
                className="px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors text-sm font-medium"
              >
                Add
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-accent rounded-lg">
                <button
                  onClick={handleDecrement}
                  className="p-1 text-accent-foreground hover:bg-accent/90 transition-colors"
                >
                  <Minus size={18} />
                </button>
                <span className="px-2 font-semibold text-accent-foreground text-sm w-8 text-center">
                  {currentQuantity}
                </span>
                <button
                  onClick={handleIncrement}
                  className="p-1 text-accent-foreground hover:bg-accent/90 transition-colors"
                >
                  <Plus size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
