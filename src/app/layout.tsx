import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AppProviders } from '@/components/app-providers'
import { AppLayout } from '@/components/app-layout'
import React from 'react'

// ✅ Only include fields allowed in metadata
export const metadata: Metadata = {
  title: 'Third Time - Portfolio Dashboard',
  description: 'Professional Solana Portfolio Management Dashboard',
  keywords: 'Solana, cryptocurrency, portfolio, blockchain, DeFi',
  authors: [{ name: 'Third Time' }],
}

// ✅ Move viewport & themeColor to this new export
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#a855f7' },
    { media: '(prefers-color-scheme: dark)', color: '#8b5cf6' },
  ],
}

const links: { label: string; path: string }[] = [{ label: 'Portfolio', path: '/' }]

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <AppProviders>
          <AppLayout links={links}>{children}</AppLayout>
        </AppProviders>
      </body>
    </html>
  )
}

// Patch BigInt so we can log it using JSON.stringify without any errors
declare global {
  interface BigInt {
    toJSON(): string
  }
}

BigInt.prototype.toJSON = function () {
  return this.toString()
}
