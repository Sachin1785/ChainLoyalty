'use client';

import { useState } from 'react';

export interface CategoryNavProps {
  onCategoryChange: (category: string) => void;
  selectedCategory?: string;
}

export function CategoryNav({ onCategoryChange, selectedCategory = 'All' }: CategoryNavProps) {
  const categories = ['All', 'Coffee', 'Beans', 'Teas', 'Pastries', 'Equipment'];

  return (
    <nav className="bg-background border-b border-border sticky top-20 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-8 overflow-x-auto scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`py-3 px-2 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                selectedCategory === category
                  ? 'border-accent text-accent'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
