import type { Metadata, Viewport } from 'next'
import { Inter, Exo_2 } from 'next/font/google'
import { Toaster } from 'sonner'
import { Providers } from '@/lib/query/providers'
import { ServiceWorkerRegister } from '@/components/system/sw-register'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-ui',
  display: 'swap',
})

const exo2 = Exo_2({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['400', '600', '700'],
})

export const metadata: Metadata = {
  title: 'SeLinka — UFC',
  description:
    'Plataforma que conecta pesquisadores, estudantes, negócios, laboratórios, projetos e eventos da Universidade Federal do Ceará.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: 'SeLinka',
    statusBarStyle: 'default',
  },
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/icon-192.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#06070F',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${exo2.variable}`}>
      <body>
        <Providers>
          {children}
          <Toaster position="top-right" richColors closeButton />
          <ServiceWorkerRegister />
        </Providers>
      </body>
    </html>
  )
}
