import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-cyan-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute -top-40 -right-4 w-80 h-80 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000" />
        <div className="absolute bottom-0 -left-4 w-80 h-80 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-700" />
      </div>

      {/* Navigation */}
      <header className="border-b border-white/10 backdrop-blur-sm bg-black/50">
        <nav className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              LK
            </div>
            <span className="font-semibold text-white">LoyaltyKit</span>
          </div>
          <Link href="/docs">
            <Button variant="outline" className="gap-2">
              View Components
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center max-w-7xl mx-auto px-8 py-20">
        <div className="text-center space-y-6 max-w-3xl">
          <div className="inline-block px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-sm font-medium text-cyan-400">
            ✨ Beautiful Component Library
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold text-white text-balance leading-tight">
            Loyalty UI Components, Done Right
          </h1>
          
          <p className="text-xl text-white/70 text-balance">
            A curated SDK component library for loyalty programs, gamification and
            Web3 wallet experiences. Drop-in widgets with full theme customization.
          </p>

          <div className="flex items-center justify-center gap-4 pt-8">
            <Link href="/docs">
              <Button size="lg" className="gap-2">
                Browse Components
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-24 w-full">
          {[
            {
              icon: '✓',
              title: 'Copy & Paste',
              description: 'Easily copy component code and customize it for your project',
            },
            {
              icon: '🎨',
              title: 'Fully Customizable',
              description: 'Built with Tailwind CSS, modify colors, sizes, and styles',
            },
            {
              icon: '♿',
              title: 'Accessible',
              description: 'Built on Radix UI with accessibility best practices',
            },
          ].map((feature, idx) => (
            <div
              key={idx}
              className="p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-cyan-500/50 transition-all group"
            >
              <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-white/70">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 backdrop-blur-sm bg-black/50">
        <div className="max-w-7xl mx-auto px-8 py-8 text-center text-white/50 text-sm">
          <p>LoyaltyKit • SDK Components for Loyalty & Web3 Apps</p>
        </div>
      </footer>
    </div>
  )
}
