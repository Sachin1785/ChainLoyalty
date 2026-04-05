import { HeroCarousel } from '@/components/hero-carousel';
import { ProductGrid } from '@/components/product-grid';
import type { Product } from '@/components/product-card';
import { products } from '@/lib/products';

const featuredProducts = products.filter((p) => p.featured).slice(0, 6);

export default function Home() {
  return (
    <div className="min-h-screen">
      <HeroCarousel />
      
      {/* Featured Products Section */}
      <ProductGrid
        products={featuredProducts}
        title="Featured Selections"
        subtitle="Explore our curated collection of the world's finest specialty coffees"
      />

      {/* About Section */}
      <section id="about" className="py-16 px-4 sm:px-6 lg:px-8 bg-muted">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-6">
                Our Story
              </h2>
              <p className="text-foreground/80 leading-relaxed mb-4">
                Brewbound was founded with a simple mission: to bring the world's finest specialty coffee directly to your cup. We partner with sustainable farms across the globe to source beans that represent the pinnacle of coffee craftsmanship.
              </p>
              <p className="text-foreground/80 leading-relaxed mb-4">
                Each roast is carefully curated by our expert roasters, who understand that great coffee starts with exceptional beans. We believe in transparency, sustainability, and the art of coffee.
              </p>
              <p className="text-foreground/80 leading-relaxed">
                From the highlands of Ethiopia to the mountains of Colombia, we celebrate the terroir and skill that goes into every harvest and roast.
              </p>
            </div>
            <div className="relative h-96 bg-primary rounded-lg flex items-center justify-center">
              <div className="text-center text-primary-foreground">
                <div className="text-8xl mb-4">☕</div>
                <p className="text-xl font-serif font-bold">Crafted with Care</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-6">
            Ready to Elevate Your Brew?
          </h2>
          <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Join our community of coffee enthusiasts and discover new favorites delivered to your door every month.
          </p>
          <a
            href="/shop"
            className="inline-flex items-center justify-center px-8 py-3 bg-accent text-accent-foreground font-semibold rounded-lg hover:bg-accent/90 transition-colors"
          >
            Explore All Products
          </a>
        </div>
      </section>
    </div>
  );
}
