'use client'

import { type ReactNode, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { MessageCircle, Video } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { fetchMe } from '@/lib/api/client'
import { useAuth } from '@/lib/stores/auth'
import { useWS } from '@/lib/ws/useWS'
import { TopNav } from '@/components/shell/TopNav'
import { MobileTabBar } from '@/components/shell/MobileTabBar'

function FloatingActions() {
  const pathname = usePathname()
  const onChat = pathname?.startsWith('/mensagens')
  const onMeetings = pathname?.startsWith('/reunioes')

  return (
    <div className="fixed bottom-[calc(var(--nav-height-bottom,0px)+24px)] right-5 z-40 hidden flex-col gap-3 lg:flex">
      {!onMeetings && (
        <Link
          href="/reunioes"
          aria-label="Reuniões"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-surface border border-border shadow-md text-fg-2 transition-colors hover:bg-surface-2 hover:text-ink"
        >
          <Video size={20} aria-hidden />
        </Link>
      )}
      {!onChat && (
        <Link
          href="/mensagens"
          aria-label="Mensagens"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-ink text-paper shadow-md transition-opacity hover:opacity-90"
        >
          <MessageCircle size={20} aria-hidden />
        </Link>
      )}
    </div>
  )
}

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
      <main className="min-w-0 pb-[calc(var(--nav-height-bottom)+24px)] lg:pb-8">
        {children}
      </main>
      <MobileTabBar />
      <FloatingActions />
    </div>
  )
}
