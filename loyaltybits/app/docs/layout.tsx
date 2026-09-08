import { DocsSidebar } from '@/components/docs-sidebar'
import { ChatBot } from '@/components/chatbot'
import { ThemeProvider } from '@/components/theme-provider'

export const metadata = {
  title: 'Components - LoyaltyKit',
  description: 'LoyaltyKit — SDK component library for loyalty & gamification',
}

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--lk-bg)', color: 'var(--lk-text)', position: 'relative' }}>
        {/* Background blobs */}
        <div style={{ position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-40px', left: '-40px', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.12), transparent 70%)', filter: 'blur(40px)' }} />
          <div style={{ position: 'absolute', bottom: '-40px', right: '-40px', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.10), transparent 70%)', filter: 'blur(40px)' }} />
        </div>

        <DocsSidebar />

        <main style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ maxWidth: 896, margin: '0 auto', padding: '32px' }}>
            {children}
          </div>
        </main>

        <ChatBot />
      </div>
    </ThemeProvider>
  )
}
