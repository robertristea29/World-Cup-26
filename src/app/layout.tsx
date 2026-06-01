import type { Metadata, Viewport } from 'next'
import './globals.css'
import ClientNavBar from '@/components/ClientNavBar'

export const metadata: Metadata = {
  title: 'World Cup 26 Predictions',
  description: 'Predict World Cup 2026 group stage results with your friends',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  themeColor: '#0f172a',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-white min-h-screen">
        <ClientNavBar />
        <main className="max-w-4xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
