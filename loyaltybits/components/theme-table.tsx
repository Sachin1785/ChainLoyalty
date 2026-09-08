'use client'

interface ThemeVariable {
  variable: string
  description: string
}

export function ThemeTable({ variables }: { variables: ThemeVariable[] }) {
  if (!variables || variables.length === 0) return null

  const cellBase: React.CSSProperties = { padding: '10px 16px', fontSize: 13 }
  const headCell: React.CSSProperties = { ...cellBase, fontWeight: 600, color: 'var(--lk-text)', textAlign: 'left' }

  return (
    <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid var(--lk-border)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead style={{ background: 'var(--lk-surface)', borderBottom: '1px solid var(--lk-border)' }}>
          <tr>
            <th style={headCell}>Variable</th>
            <th style={headCell}>Description</th>
          </tr>
        </thead>
        <tbody>
          {variables.map((item, idx) => (
            <tr
              key={item.variable}
              style={{ borderTop: '1px solid var(--lk-divider)', background: idx % 2 === 1 ? 'var(--lk-surface)' : 'transparent', transition: 'background 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--lk-surface-hover)')}
              onMouseLeave={e => (e.currentTarget.style.background = idx % 2 === 1 ? 'var(--lk-surface)' : 'transparent')}
            >
              <td style={{ ...cellBase, fontFamily: 'monospace', color: 'var(--lk-badge-text)', fontWeight: 600 }}>{item.variable}</td>
              <td style={{ ...cellBase, color: 'var(--lk-text-muted)' }}>{item.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
