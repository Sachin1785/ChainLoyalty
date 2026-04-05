'use client'

import { cn } from '@/lib/utils'

interface Prop {
  name: string
  type: string
  description: string
  default?: string
}

interface PropsTableProps {
  props: Prop[]
}

export function PropsTable({ props }: PropsTableProps) {
  if (!props || props.length === 0) return null

  return (
    <div className="overflow-x-auto rounded-xl border border-white/10">
      <table className="w-full text-sm">
        <thead className="bg-white/5 border-b border-white/10">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-white">Property</th>
            <th className="px-4 py-3 text-left font-semibold text-white">Type</th>
            <th className="px-4 py-3 text-left font-semibold text-white">Description</th>
            <th className="px-4 py-3 text-left font-semibold text-white">Default</th>
          </tr>
        </thead>
        <tbody>
          {props.map((prop, idx) => (
            <tr
              key={prop.name}
              className={cn(
                'border-t border-white/5 transition-colors',
                idx % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.02]',
                'hover:bg-white/5'
              )}
            >
              <td className="px-4 py-3 font-mono text-cyan-400">{prop.name}</td>
              <td className="px-4 py-3 font-mono text-white/70 text-xs">{prop.type}</td>
              <td className="px-4 py-3 text-white/70">{prop.description}</td>
              <td className="px-4 py-3 font-mono text-white/50 text-xs">
                {prop.default || '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
