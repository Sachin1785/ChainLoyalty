import Link from 'next/link'
import { COMPONENT_REGISTRY } from '@/lib/component-registry'
import { cn } from '@/lib/utils'

export const metadata = {
  title: 'Components Overview - ReactBits',
  description: 'Browse our collection of beautiful React components',
}

export default function DocsIndexPage() {
  const categories = Array.from(
    new Set(COMPONENT_REGISTRY.map(c => c.category))
  ).sort()

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-white text-balance">
          Components Library
        </h1>
        <p className="text-lg text-white/70 max-w-2xl">
          A collection of beautiful, accessible, and customizable React components 
          built with Tailwind CSS and Radix UI.
        </p>
      </div>

      {/* Categories */}
      {categories.map(category => {
        const componentsInCategory = COMPONENT_REGISTRY.filter(
          c => c.category === category
        )

        return (
          <div key={category} className="space-y-4">
            <div>
              <h2 className="text-2xl font-semibold text-white mb-2">
                {category}
              </h2>
              <div className="w-12 h-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full" />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {componentsInCategory.map(component => (
                <Link
                  key={component.slug}
                  href={`/docs/${component.slug}`}
                  className={cn(
                    'group p-6 rounded-xl border border-white/10 bg-white/5',
                    'hover:bg-white/10 hover:border-cyan-500/50 transition-all',
                    'hover:shadow-lg hover:shadow-cyan-500/10'
                  )}
                >
                  <h3 className="font-semibold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                    {component.title}
                  </h3>
                  <p className="text-sm text-white/70 group-hover:text-white/80 transition-colors">
                    {component.description}
                  </p>
                  <div className="mt-4 flex items-center text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-sm font-medium">View →</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
