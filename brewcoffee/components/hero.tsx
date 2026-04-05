import Link from 'next/link';

export function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-primary to-primary/90 text-primary-foreground py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold leading-tight text-balance">
              Elevate Your Daily Brew
            </h1>
            <p className="text-lg text-primary-foreground/90 leading-relaxed max-w-lg">
              Discover expertly roasted specialty coffee sourced from the world&apos;s finest regions. Each bean tells a story of craftsmanship and passion.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center px-8 py-3 bg-accent text-accent-foreground font-semibold rounded-lg hover:bg-accent/90 transition-colors"
              >
                Shop Now
              </Link>
              <Link
                href="#about"
                className="inline-flex items-center justify-center px-8 py-3 border-2 border-primary-foreground text-primary-foreground font-semibold rounded-lg hover:bg-primary-foreground/10 transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>

          {/* Image Placeholder */}
          <div className="relative h-64 sm:h-80 bg-primary-foreground/10 rounded-lg overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">☕</div>
                <p className="text-primary-foreground/60">Featured Coffee</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
