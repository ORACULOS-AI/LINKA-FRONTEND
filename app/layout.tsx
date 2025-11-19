import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Toaster as SonnerToaster } from 'sonner'
import { Toaster } from '@/components/ui/toaster'
import PlatformLayoutClient from './platform-layout-client'
import '@livekit/components-styles'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['200', '600', '400', '500', '600', '700', '800', '900'],
})

export const metadata: Metadata = {
  title: 'LINK@',
  description: 'Plataforma de Conexões e Projetos da UFC',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html className="scroll-smooth" lang="pt-br">
      <head>
        <Analytics />
        <SpeedInsights />
        <link rel="icon" href="/link@.svg" type="image/svg+xml" />
      </head>
      <body
        className={`${poppins.className} flex flex-col min-h-screen`}
        suppressHydrationWarning
      >
        <PlatformLayoutClient>{children}</PlatformLayoutClient>
        <Toaster />
        <SonnerToaster />
      </body>
    </html>
  )
}
