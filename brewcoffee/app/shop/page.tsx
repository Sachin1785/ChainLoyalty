'use client';

import { useState, useMemo } from 'react';
import { CategoryNav } from '@/components/category-nav';
import { SidebarFilters, FilterState } from '@/components/sidebar-filters';
import { ProductCard } from '@/components/product-card';
import { CartDrawer } from '@/components/cart-drawer';
import { products } from '@/lib/products';

export default function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    sortBy: 'featured',
    priceRange: [0, 100],
  });

  const filteredAndSortedProducts = useMemo(() => {
    let result = products;

    // Filter by category
    if (selectedCategory !== 'All') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Filter by price range
    result = result.filter(
      (p) => p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
    );

    // Sort
    result = [...result].sort((a, b) => {
      switch (filters.sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'newest':
          return b.id.localeCompare(a.id);
        case 'rated':
          return (b.rating || 0) - (a.rating || 0);
        case 'featured':
        default:
          return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      }
    });

    return result;
  }, [selectedCategory, filters]);

  return (
    <div className="min-h-screen bg-background">
      <CategoryNav
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      {/* Main Shop Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar Filters */}
          <div className="md:col-span-1">
            <SidebarFilters filters={filters} onFilterChange={setFilters} />
          </div>

          {/* Product Grid */}
          <div className="md:col-span-3">
            {filteredAndSortedProducts.length > 0 ? (
              <div>
                <p className="text-sm text-muted-foreground mb-4">
                  Showing {filteredAndSortedProducts.length} product{filteredAndSortedProducts.length !== 1 ? 's' : ''}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAndSortedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">🔍</div>
                <p className="text-lg text-foreground/60 mb-4">No products found</p>
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setFilters({ sortBy: 'featured', priceRange: [0, 100] });
                  }}
                  className="text-accent hover:text-accent/80 font-semibold"
                >
                  Reset filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
