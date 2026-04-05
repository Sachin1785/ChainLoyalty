'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { COMPONENT_REGISTRY } from '@/lib/component-registry'
import { cn } from '@/lib/utils'

export function DocsSidebar() {
  const pathname = usePathname()
  
  // Group components by category
  const categories = Array.from(
    new Set(COMPONENT_REGISTRY.map(c => c.category))
  ).sort()

  return (
    <aside className="w-64 border-r border-white/10 bg-black/40 backdrop-blur-sm overflow-y-auto flex-shrink-0">
      <div className="sticky top-0 px-6 py-8">
        <Link 
          href="/docs"
          className="flex items-center gap-2 mb-8 group"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm group-hover:shadow-lg group-hover:shadow-cyan-500/50 transition-all">
            RB
          </div>
          <span className="font-semibold text-white">ReactBits</span>
        </Link>
        
        <p className="text-sm text-white/60 mb-6">Components Library</p>
      </div>

      <nav className="px-4 space-y-8">
        {categories.map(category => {
          const componentsInCategory = COMPONENT_REGISTRY.filter(
            c => c.category === category
          )
          
          return (
            <div key={category}>
              <h3 className="text-xs font-semibold uppercase text-white/40 px-2 mb-3">
                {category}
              </h3>
              <ul className="space-y-1">
                {componentsInCategory.map(component => {
                  const isActive = pathname === `/docs/${component.slug}`
                  
                  return (
                    <li key={component.slug}>
                      <Link
                        href={`/docs/${component.slug}`}
                        className={cn(
                          'block px-3 py-2 rounded-lg text-sm transition-all',
                          isActive
                            ? 'bg-white/10 text-white font-medium'
                            : 'text-white/70 hover:text-white hover:bg-white/5'
                        )}
                      >
                        {component.title}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </nav>
    </aside>
  )
}
