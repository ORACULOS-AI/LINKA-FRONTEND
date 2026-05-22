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
  title: {
    default: 'SeLinka',
    template: '%s | SeLinka',
  },
  description:
    'Plataforma que conecta pesquisadores, estudantes, negócios, laboratórios, projetos e eventos da Universidade Federal do Ceará.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: 'SeLinka',
    statusBarStyle: 'default',
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    siteName: 'SeLinka',
    locale: 'pt_BR',
    type: 'website',
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
    <html lang="pt-BR" className={`${inter.variable} ${exo2.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var p=location.pathname;var brandLocked=p==='/'||p.startsWith('/entrar')||p.startsWith('/cadastro')||p.startsWith('/esqueci-senha')||p.startsWith('/resetar-senha')||p.startsWith('/verificar-email');if(brandLocked){document.documentElement.setAttribute('data-theme','light');return;}var t=localStorage.getItem('selinka-theme');if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`,
          }}
        />
      </head>
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
