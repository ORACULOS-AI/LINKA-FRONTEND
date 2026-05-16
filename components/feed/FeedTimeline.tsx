'use client'

import { useEffect, useRef } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Inbox, RefreshCw } from 'lucide-react'
import { fetchFeed, fetchUserPosts, type FeedPage } from '@/lib/api/feed'
import { EmptyState, SkeletonList } from '@/components/primitives'
import { PostCard } from './PostCard'

type Props = {
  /** Quando setado, lista posts deste usuário (perfil); caso contrário, feed home */
  userUid?: string
  emptyText?: string
}

export function FeedTimeline({ userUid, emptyText = 'Nada por aqui ainda.' }: Props) {
  const sentinelRef = useRef<HTMLDivElement>(null)

  const queryKey = userUid ? ['feed', 'user', userUid] : ['feed', 'home']
  const queryFn = ({ pageParam }: { pageParam: string | null | undefined }): Promise<FeedPage> => {
    const params = { cursor: pageParam ?? null, limit: 20 }
    return userUid ? fetchUserPosts(userUid, params) : fetchFeed(params)
  }

  const q = useInfiniteQuery({
    queryKey,
    queryFn,
    initialPageParam: null as string | null,
    getNextPageParam: (last) => (last.has_more ? last.next_cursor : undefined),
  })

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const io = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && q.hasNextPage && !q.isFetchingNextPage) {
        q.fetchNextPage()
      }
    }, { rootMargin: '400px' })
    io.observe(el)
    return () => io.disconnect()
  }, [q])

  if (q.isLoading) {
    return <SkeletonList count={3} lines={3} />
  }

  if (q.isError) {
    return (
      <EmptyState
        icon={<RefreshCw size={24} />}
        title="Não foi possível carregar o feed"
        description="Verifique sua conexão e tente novamente."
        action={{ label: 'Tentar novamente', onClick: () => q.refetch() }}
      />
    )
  }

  const posts = q.data?.pages.flatMap((p) => p.items) ?? []

  if (posts.length === 0) {
    return (
      <EmptyState
        icon={<Inbox size={24} />}
        title={emptyText}
        description={userUid ? undefined : 'Siga pessoas, laboratórios e projetos para começar a ver publicações.'}
        action={userUid ? undefined : { label: 'Ir para a Vitrine', href: '/vitrine' }}
      />
    )
  }

  return (
    <div className="space-y-4">
      {posts.map((p) => <PostCard key={p.id} post={p} />)}
      <div ref={sentinelRef} className="h-8" />
      {q.isFetchingNextPage && (
        <div className="text-center text-xs text-ink/50">Carregando mais…</div>
      )}
    </div>
  )
}
