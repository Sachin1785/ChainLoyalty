'use client'

import { useState, useCallback } from 'react'
import { CodeBlock } from './code-block'
import { ExampleRegistry } from '@/lib/example-registry'
import { COMPONENT_THEME_CONFIG } from '@/lib/theme-config'

interface ComponentPreviewProps {
  component?: React.ReactNode
  slug?: string
  code: string
  title?: string
}

export function ComponentPreview({ component, slug, code, title }: ComponentPreviewProps) {
  const [tab, setTab] = useState<'preview' | 'code'>('preview')

  const tokenDefs = slug ? (COMPONENT_THEME_CONFIG[slug] ?? []) : []
  const initialTheme = Object.fromEntries(tokenDefs.map(t => [t.key, t.default]))
  const [theme, setTheme] = useState<Record<string, string>>(initialTheme)

  const handleColorChange = useCallback((key: string, value: string) => {
    setTheme(prev => ({ ...prev, [key]: value }))
  }, [])

  const handleReset = useCallback(() => {
    setTheme(Object.fromEntries(tokenDefs.map(t => [t.key, t.default])))
  }, [tokenDefs])

  const ComponentToRender = slug ? ExampleRegistry[slug] : null
  const hasTheme = tokenDefs.length > 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {title && (
        <h3 style={{ fontSize: 17, fontWeight: 600, color: 'var(--lk-text)', margin: 0 }}>{title}</h3>
      )}

      {/* ── Tab bar ── */}
      <div style={{
        display: 'inline-flex', gap: 2,
        background: 'var(--lk-surface)',
        border: '1px solid var(--lk-border)',
        borderRadius: 10, padding: 3,
        width: 'fit-content',
      }}>
        {(['preview', 'code'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '6px 20px', borderRadius: 7, fontSize: 13, fontWeight: tab === t ? 600 : 400,
              border: 'none', cursor: 'pointer', transition: 'all 0.15s',
              background: tab === t ? 'var(--lk-tab-active-bg)' : 'transparent',
              color: tab === t ? 'var(--lk-text)' : 'var(--lk-tab-text)',
            }}
          >
            {t === 'preview' ? 'Preview' : 'Code'}
          </button>
        ))}
      </div>

      {/* ── Preview Tab ── */}
      {tab === 'preview' && (
        <div style={{
          borderRadius: 14,
          border: '1.5px solid var(--lk-border-strong)',
          overflow: 'hidden',
          boxShadow: 'var(--lk-shadow)',
        }}>
          {/* Palette bar */}
          {slug && hasTheme && (
            <div style={{
              display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10,
              background: 'var(--lk-surface)',
              borderBottom: '1px solid var(--lk-border)',
              padding: '10px 16px',
            }}>
              <span style={{
                fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.1em', color: 'var(--lk-text-faint)', marginRight: 4,
              }}>
                Theme
              </span>
              {tokenDefs.map(token => (
                <label key={token.key} title={token.key}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}
                >
                  <span style={{
                    position: 'relative', width: 20, height: 20, borderRadius: 5,
                    flexShrink: 0, display: 'block', overflow: 'hidden',
                    background: theme[token.key],
                    border: '1.5px solid var(--lk-border-strong)',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
                  }}>
                    <input
                      type="color"
                      value={theme[token.key]}
                      onChange={e => handleColorChange(token.key, e.target.value)}
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                    />
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--lk-text-muted)', whiteSpace: 'nowrap' }}>
                    {token.label}
                  </span>
                </label>
              ))}
              <button
                onClick={handleReset}
                style={{
                  marginLeft: 'auto', fontSize: 11, color: 'var(--lk-text-faint)',
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  padding: '2px 8px', borderRadius: 5,
                }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--lk-text)'; e.currentTarget.style.background = 'var(--lk-surface-hover)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--lk-text-faint)'; e.currentTarget.style.background = 'transparent' }}
              >
                Reset
              </button>
            </div>
          )}

          {/* Canvas */}
          <div style={{
            minHeight: 480, overflow: 'auto',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 32,
            backgroundImage: `radial-gradient(circle at 1.5px 1.5px, var(--lk-preview-dot) 1.5px, transparent 0)`,
            backgroundSize: '24px 24px',
            backgroundColor: 'var(--lk-preview-bg)',
          }}>
            <div style={{ width: '100%', minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {ComponentToRender ? (
                <div style={{ width: '100%' }}><ComponentToRender theme={theme} /></div>
              ) : component ? (
                <div style={{ width: '100%' }}>{component}</div>
              ) : (
                <p style={{ color: 'var(--lk-text-faint)', fontSize: 14 }}>Live preview not available.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Code Tab ── */}
      {tab === 'code' && (
        <div style={{
          borderRadius: 14,
          border: '1.5px solid var(--lk-border-strong)',
          overflow: 'hidden',
          minHeight: 480,
          boxShadow: 'var(--lk-shadow)',
        }}>
          <CodeBlock code={code} language="tsx" />
        </div>
      )}
    </div>
  )
}
