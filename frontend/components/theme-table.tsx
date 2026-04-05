'use client'

import { cn } from '@/lib/utils'

interface ThemeVariable {
  variable: string
  description: string
}

interface ThemeTableProps {
  variables: ThemeVariable[]
}

export function ThemeTable({ variables }: ThemeTableProps) {
  if (!variables || variables.length === 0) return null

  return (
    <div className="overflow-x-auto rounded-xl border border-white/10">
      <table className="w-full text-sm">
        <thead className="bg-white/5 border-b border-white/10">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-white">Variable</th>
            <th className="px-4 py-3 text-left font-semibold text-white">Description</th>
          </tr>
        </thead>
        <tbody>
          {variables.map((item, idx) => (
            <tr
              key={item.variable}
              className={cn(
                'border-t border-white/5 transition-colors',
                idx % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.02]',
                'hover:bg-white/5'
              )}
            >
              <td className="px-4 py-3 font-mono text-blue-400">{item.variable}</td>
              <td className="px-4 py-3 text-white/70">{item.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
