import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = { title: 'Feed' }

export default function Layout({ children, modal }: { children: ReactNode; modal: ReactNode }) {
  return <>{children}{modal}</>
}
