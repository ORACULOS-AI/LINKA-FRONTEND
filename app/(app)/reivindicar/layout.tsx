import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = { title: 'Reivindicar entidade' }

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
