'use client'

interface Prop {
  name: string
  type: string
  description: string
  default?: string
}

export function PropsTable({ props }: { props: Prop[] }) {
  if (!props || props.length === 0) return null

  const cellBase: React.CSSProperties = { padding: '10px 16px', fontSize: 13 }
  const headCell: React.CSSProperties = { ...cellBase, fontWeight: 600, color: 'var(--lk-text)', textAlign: 'left' }

  return (
    <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid var(--lk-border)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead style={{ background: 'var(--lk-surface)', borderBottom: '1px solid var(--lk-border)' }}>
          <tr>
            <th style={headCell}>Property</th>
            <th style={headCell}>Type</th>
            <th style={headCell}>Description</th>
            <th style={headCell}>Default</th>
          </tr>
        </thead>
        <tbody>
          {props.map((prop, idx) => (
            <tr
              key={prop.name}
              style={{ borderTop: '1px solid var(--lk-divider)', background: idx % 2 === 1 ? 'var(--lk-surface)' : 'transparent', transition: 'background 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--lk-surface-hover)')}
              onMouseLeave={e => (e.currentTarget.style.background = idx % 2 === 1 ? 'var(--lk-surface)' : 'transparent')}
            >
              <td style={{ ...cellBase, fontFamily: 'monospace', color: 'var(--lk-accent)', fontWeight: 600 }}>{prop.name}</td>
              <td style={{ ...cellBase, fontFamily: 'monospace', color: 'var(--lk-text-muted)', fontSize: 12 }}>{prop.type}</td>
              <td style={{ ...cellBase, color: 'var(--lk-text-muted)' }}>{prop.description}</td>
              <td style={{ ...cellBase, fontFamily: 'monospace', color: 'var(--lk-text-faint)', fontSize: 12 }}>{prop.default || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
