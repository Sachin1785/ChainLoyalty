'use client'

import { useState, useCallback } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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

  // Build initial theme state from defaults
  const initialTheme = Object.fromEntries(tokenDefs.map((t) => [t.key, t.default]))
  const [theme, setTheme] = useState<Record<string, string>>(initialTheme)

  const handleColorChange = useCallback((key: string, value: string) => {
    setTheme((prev) => ({ ...prev, [key]: value }))
  }, [])

  const handleReset = useCallback(() => {
    setTheme(Object.fromEntries(tokenDefs.map((t) => [t.key, t.default])))
  }, [tokenDefs])

  const ComponentToRender = slug ? ExampleRegistry[slug] : null
  const hasTheme = tokenDefs.length > 0

  return (
    <div className="space-y-4">
      {title && (
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      )}

      <Tabs value={tab} onValueChange={(v) => setTab(v as 'preview' | 'code')} className="w-full">
        <TabsList className="w-full bg-white/5 border border-white/10 p-1">
          <TabsTrigger
            value="preview"
            className="flex-1 text-white/60 hover:text-white/80 data-[state=active]:bg-white/10 data-[state=active]:text-white"
          >
            Preview
          </TabsTrigger>
          <TabsTrigger
            value="code"
            className="flex-1 text-white/60 hover:text-white/80 data-[state=active]:bg-white/10 data-[state=active]:text-white"
          >
            Code
          </TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="mt-4 min-h-[500px] relative">

          {/* Color Palette Panel */}
          {slug && hasTheme && (
            <div className="mb-3 flex flex-wrap items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
              <span className="text-xs font-semibold text-white/50 uppercase tracking-widest mr-1">Theme</span>
              {tokenDefs.map((token) => (
                <label
                  key={token.key}
                  className="flex items-center gap-1.5 cursor-pointer group"
                  title={token.key}
                >
                  {/* Swatch acts as the color picker trigger */}
                  <span
                    className="relative w-6 h-6 rounded-md border-2 border-white/20 group-hover:border-white/50 transition-colors overflow-hidden shadow-sm flex-shrink-0"
                    style={{ background: theme[token.key] }}
                  >
                    <input
                      type="color"
                      value={theme[token.key]}
                      onChange={(e) => handleColorChange(token.key, e.target.value)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </span>
                  <span className="text-xs text-white/60 group-hover:text-white/90 transition-colors whitespace-nowrap">
                    {token.label}
                  </span>
                </label>
              ))}
              <button
                onClick={handleReset}
                className="ml-auto text-xs text-white/40 hover:text-white/80 transition-colors px-2 py-1 rounded hover:bg-white/10"
                title="Reset to defaults"
              >
                Reset
              </button>
            </div>
          )}

          <div
            className="rounded-xl border border-white/20 p-8 min-h-[500px] overflow-auto relative flex items-center justify-center"
            style={{
              backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, rgba(255, 255, 255, 0.15) 1.5px, transparent 0)',
              backgroundSize: '24px 24px',
              backgroundColor: '#0a0a0a',
            }}
          >
            <div className="w-full min-h-[400px] flex items-center justify-center relative">
              {ComponentToRender ? (
                <div className="w-full">
                  <ComponentToRender theme={theme} />
                </div>
              ) : component ? (
                <div className="w-full">{component}</div>
              ) : (
                <div className="text-white/50 text-sm">Live preview not available for this component.</div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="code" className="mt-4 min-h-[500px]">
          <CodeBlock code={code} language="tsx" />
        </TabsContent>
      </Tabs>
    </div>
  )
}
