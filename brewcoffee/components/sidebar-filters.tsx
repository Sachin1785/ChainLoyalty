'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export interface FilterState {
  sortBy: string;
  priceRange: [number, number];
}

export interface SidebarFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  filters: FilterState;
}

export function SidebarFilters({ onFilterChange, filters }: SidebarFiltersProps) {
  const [expandedSort, setExpandedSort] = useState(true);
  const [expandedPrice, setExpandedPrice] = useState(true);

  const sortOptions = [
    { label: 'Featured', value: 'featured' },
    { label: 'Price: Low to High', value: 'price-asc' },
    { label: 'Price: High to Low', value: 'price-desc' },
    { label: 'Newest', value: 'newest' },
    { label: 'Top Rated', value: 'rated' },
  ];

  const handlePriceChange = (min: number, max: number) => {
    onFilterChange({ ...filters, priceRange: [min, max] });
  };

  return (
    <aside className="w-full md:w-64 bg-background">
      <div className="sticky top-32 space-y-6">
        {/* Sort Section */}
        <div className="border-b border-border pb-4">
          <button
            onClick={() => setExpandedSort(!expandedSort)}
            className="flex items-center justify-between w-full py-2"
          >
            <h3 className="font-semibold text-foreground text-sm uppercase tracking-wide">Sort</h3>
            <ChevronDown
              size={16}
              className={`text-muted-foreground transition-transform ${expandedSort ? '' : '-rotate-90'}`}
            />
          </button>

          {expandedSort && (
            <div className="space-y-2 mt-3">
              {sortOptions.map((option) => (
                <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="sort"
                    value={option.value}
                    checked={filters.sortBy === option.value}
                    onChange={() => onFilterChange({ ...filters, sortBy: option.value })}
                    className="w-4 h-4 accent-accent"
                  />
                  <span className="text-sm text-foreground hover:text-accent transition-colors">{option.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Price Range Section */}
        <div className="border-b border-border pb-4">
          <button
            onClick={() => setExpandedPrice(!expandedPrice)}
            className="flex items-center justify-between w-full py-2"
          >
            <h3 className="font-semibold text-foreground text-sm uppercase tracking-wide">Price Range</h3>
            <ChevronDown
              size={16}
              className={`text-muted-foreground transition-transform ${expandedPrice ? '' : '-rotate-90'}`}
            />
          </button>

          {expandedPrice && (
            <div className="mt-3 space-y-3">
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.priceRange[0]}
                  onChange={(e) => handlePriceChange(Number(e.target.value), filters.priceRange[1])}
                  className="w-20 px-2 py-1 text-sm border border-border rounded bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <span className="text-muted-foreground">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.priceRange[1]}
                  onChange={(e) => handlePriceChange(filters.priceRange[0], Number(e.target.value))}
                  className="w-20 px-2 py-1 text-sm border border-border rounded bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
