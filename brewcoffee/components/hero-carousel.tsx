'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselSlide {
  id: string;
  title: string;
  description: string;
  color: string;
}

export function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: CarouselSlide[] = [
    {
      id: '1',
      title: 'Premium Single Origin Coffee',
      description: 'Discover expertly roasted beans from the world\'s finest coffee farms',
      color: 'from-amber-100 to-orange-100',
    },
    {
      id: '2',
      title: 'Fresh Specialty Blends',
      description: 'Handcrafted blends designed for the perfect morning brew',
      color: 'from-yellow-100 to-amber-100',
    },
    {
      id: '3',
      title: 'Professional Equipment',
      description: 'Everything you need for the ultimate home barista experience',
      color: 'from-orange-100 to-amber-100',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <div className="relative w-full h-64 sm:h-80 md:h-96 bg-background overflow-hidden">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 bg-gradient-to-r ${slide.color} transition-opacity duration-500 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="h-full flex items-center justify-center px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-primary mb-4">
                {slide.title}
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground">
                {slide.description}
              </p>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={goToPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/50 hover:bg-white transition-colors"
        aria-label="Previous slide"
      >
        <ChevronLeft size={24} className="text-primary" />
      </button>

      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/50 hover:bg-white transition-colors"
        aria-label="Next slide"
      >
        <ChevronRight size={24} className="text-primary" />
      </button>

      {/* Pagination Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentSlide ? 'bg-primary w-8' : 'bg-primary/30 w-2 hover:bg-primary/60'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
