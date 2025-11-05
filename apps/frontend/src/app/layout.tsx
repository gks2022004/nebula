import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const Providers = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Nebula - Live Streaming Platform',
  description: 'Modern real-time live streaming with ultra-low latency',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
