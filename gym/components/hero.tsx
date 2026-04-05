import { Button } from '@/components/ui/button'
import Image from 'next/image'

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="/hero-workout.jpg"
          alt="Person exercising"
          fill
          className="object-cover brightness-75"
          priority
        />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 flex flex-col justify-center items-start">
        <div className="max-w-2xl">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-4 text-balance">
            Train Together. Win Together.
          </h2>
          <p className="text-xl text-gray-100 mb-8 text-pretty">
            Track your workouts, celebrate with friends, and earn rewards for fitness gear you love.
          </p>
          <div className="flex gap-4">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Get Started
            </Button>
            <Button size="lg" variant="outline" className="bg-white/20 text-white border-white hover:bg-white/30">
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
