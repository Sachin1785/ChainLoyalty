'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { COMPONENT_REGISTRY } from '@/lib/component-registry'
import { ThemeToggle } from '@/components/theme-provider'

export function DocsSidebar() {
  const pathname = usePathname()
  const categories = Array.from(new Set(COMPONENT_REGISTRY.map(c => c.category))).sort()

  return (
    <aside style={{
      width: 256,
      flexShrink: 0,
      overflowY: 'auto',
      backdropFilter: 'blur(12px)',
      background: 'var(--lk-sidebar-bg)',
      borderRight: '1px solid var(--lk-border)',
    }}>
      <div style={{ position: 'sticky', top: 0, padding: '32px 24px 16px' }}>
        {/* Logo */}
        <Link href="/docs" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, textDecoration: 'none' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
            background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: 12,
          }}>
            LK
          </div>
          <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--lk-text)' }}>LoyaltyKit</span>
        </Link>

        {/* Subtitle + toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <span style={{ fontSize: 12, color: 'var(--lk-text-muted)' }}>SDK Components</span>
          <ThemeToggle />
        </div>
      </div>

      <nav style={{ padding: '0 16px 32px' }}>
        {categories.map(category => {
          const items = COMPONENT_REGISTRY.filter(c => c.category === category)
          return (
            <div key={category} style={{ marginBottom: 28 }}>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--lk-text-faint)', padding: '0 8px', marginBottom: 8 }}>
                {category}
              </p>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {items.map(comp => {
                  const isActive = pathname === `/docs/${comp.slug}`
                  return (
                    <li key={comp.slug}>
                      <Link href={`/docs/${comp.slug}`} style={{
                        display: 'block', padding: '7px 12px', borderRadius: 8, fontSize: 13,
                        textDecoration: 'none', transition: 'all 0.15s',
                        color: isActive ? 'var(--lk-accent)' : 'var(--lk-text-muted)',
                        background: isActive ? 'var(--lk-surface-active)' : 'transparent',
                        fontWeight: isActive ? 600 : 400,
                      }}>
                        {comp.title}
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
