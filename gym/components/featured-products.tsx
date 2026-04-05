import Image from 'next/image'
import { Button } from '@/components/ui/button'

export default function FeaturedProducts() {
  const products = [
    {
      id: 1,
      name: 'Premium Protein Powder',
      price: 49.99,
      image: '/protein-powder.jpg',
      reward: true
    },
    {
      id: 2,
      name: 'Resistance Bands Set',
      price: 34.99,
      image: '/resistance-bands.jpg',
      reward: true
    },
    {
      id: 3,
      name: 'Elite Workout Apparel',
      price: 89.99,
      image: '/workout-apparel.jpg',
      reward: true
    }
  ]

  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-foreground mb-4">Featured Products</h2>
        <p className="text-muted-foreground mb-12">
          Unlock these items by hitting your weekly fitness goals
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {products.map((product) => (
            <div key={product.id} className="bg-card rounded-lg overflow-hidden shadow-sm border border-border hover:shadow-md transition">
              <div className="relative h-48 w-full">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
                {product.reward && (
                  <div className="absolute top-3 right-3 bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-semibold">
                    Reward Item
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-card-foreground mb-2">{product.name}</h3>
                <p className="text-accent font-bold text-xl mb-4">${product.price}</p>
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  View in Store
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
