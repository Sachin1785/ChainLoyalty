'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Star, ChevronLeft, ShoppingCart } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { getProductById, getRelatedProducts } from '@/lib/products';
import { ProductGrid } from '@/components/product-grid';

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ProductPage({ params }: ProductPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const product = getProductById(resolvedParams.id);
  const relatedProducts = getRelatedProducts(resolvedParams.id);
  const { dispatch } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-serif font-bold text-foreground mb-4">Product Not Found</h1>
          <Link href="/shop" className="text-accent hover:text-accent/80">
            Return to Shop
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity,
        image: product.image,
        description: product.description,
      },
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-accent hover:text-accent/80 transition-colors"
        >
          <ChevronLeft size={20} />
          Back
        </button>
      </div>

      {/* Product Details */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="bg-muted rounded-lg h-96 flex items-center justify-center overflow-hidden">
            {product.image ? (
              <img src={product.image} alt={product.name} className="object-cover w-full h-full" />
            ) : (
              <div className="text-center">
                <div className="text-8xl mb-4">☕</div>
                <p className="text-muted-foreground">{product.name}</p>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col justify-between">
            <div>
              <div className="mb-4">
                <h1 className="text-4xl font-serif font-bold text-foreground mb-4">
                  {product.name}
                </h1>

                {/* Rating */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={20}
                        className={i < Math.round(product.rating || 0) ? 'fill-accent text-accent' : 'text-muted-foreground'}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ({product.reviews} reviews)
                  </span>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <span className="text-4xl font-serif font-bold text-primary">
                    ₹{product.price.toFixed(2)}
                  </span>
                </div>

                {/* Description */}
                <p className="text-lg text-foreground/80 mb-8 leading-relaxed">
                  {product.description}
                </p>

                {/* Details */}
                <div className="grid grid-cols-2 gap-6 mb-8 pb-8 border-b border-border">
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Size
                    </h3>
                    <p className="text-foreground mt-2">{product.size}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Availability
                    </h3>
                    <p className="text-foreground mt-2">In Stock</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <label htmlFor="quantity" className="text-foreground font-semibold">
                  Quantity:
                </label>
                <div className="flex items-center border border-border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-foreground hover:bg-muted transition-colors"
                  >
                    −
                  </button>
                  <input
                    id="quantity"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-12 text-center py-2 border-l border-r border-border bg-background outline-none"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 text-foreground hover:bg-muted transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                className="w-full px-8 py-4 bg-accent text-accent-foreground font-semibold rounded-lg hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingCart size={20} />
                Add to Cart
              </button>

              {addedToCart && (
                <div className="text-center text-accent font-semibold">
                  Added to cart!
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <ProductGrid
          products={relatedProducts}
          title="You Might Also Like"
          subtitle="Discover other exceptional coffees from our collection"
        />
      )}
    </div>
  );
}
