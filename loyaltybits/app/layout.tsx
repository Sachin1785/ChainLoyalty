import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'LoyaltyKit - SDK Components for Loyalty & Web3',
  description: 'Drop-in SDK widgets for loyalty programs, gamification, and Web3 wallet experiences.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
  keywords: ['React', 'Components', 'UI', 'Tailwind CSS', 'Radix UI', 'Accessible'],
  openGraph: {
    type: 'website',
    title: 'ReactBits - Beautiful React Components',
    description: 'A curated collection of accessible, customizable React components',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" data-theme="dark">
      {/* Anti-flash: apply stored theme before first paint */}
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              var t = localStorage.getItem('lk-theme') || 'dark';
              document.documentElement.setAttribute('data-theme', t);
            } catch(e) {}
          })()
        ` }} />
      </head>
      <body className="font-sans antialiased" style={{ background: 'var(--lk-bg)', color: 'var(--lk-text)', margin: 0 }}>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
