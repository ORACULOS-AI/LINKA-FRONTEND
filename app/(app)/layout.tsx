'use client'

import { type ReactNode, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { fetchMe } from '@/lib/api/client'
import { useAuth } from '@/lib/stores/auth'
import { useWS } from '@/lib/ws/useWS'
import { TopNav } from '@/components/shell/TopNav'
import { Sidebar } from '@/components/shell/Sidebar'
import { MobileTabBar } from '@/components/shell/MobileTabBar'

export default function AppLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const setMe = useAuth((s) => s.setMe)
  const { data, isLoading, isError } = useQuery({
    queryKey: ['me'],
    queryFn: fetchMe,
    staleTime: 60_000,
  })

  useEffect(() => {
    if (data) setMe(data)
  }, [data, setMe])

  useEffect(() => {
    if (isError) router.replace('/entrar')
  }, [isError, router])

  useEffect(() => {
    if (data && !data.onboarding_complete) router.replace('/onboarding')
  }, [data, router])

  useWS(Boolean(data))

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-1 w-32 animate-pulse rounded-full bg-mint" aria-label="Carregando…" />
      </div>
    )
  }
  if (isError) return null

  return (
    <div className="min-h-screen">
      <TopNav />
      <div className="mx-auto flex max-w-content">
        <Sidebar />
        <main className="flex-1 pb-20 lg:pb-8">{children}</main>
      </div>
      <MobileTabBar />
    </div>
  )
}
