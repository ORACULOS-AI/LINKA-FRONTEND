import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = { title: 'Pesquisadores do laboratório' }

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
