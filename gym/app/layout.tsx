import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Web3Provider } from '@/components/web3-provider'
import { CartProvider } from '@/lib/cart-context'
import { GymLoyaltyWidget } from '@/components/gym-loyalty-widget'
import Header from '@/components/header'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Stride - Train Together, Win Together',
  description: 'Shop premium fitness gear, earn ChainLoyalty points, and unlock cross-platform rewards.',
  generator: 'v0.app',
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased flex flex-col min-h-screen">
        <Web3Provider>
          <CartProvider>
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <GymLoyaltyWidget />
          </CartProvider>
        </Web3Provider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}

