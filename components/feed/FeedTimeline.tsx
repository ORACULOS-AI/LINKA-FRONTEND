'use client'

import { useEffect, useRef } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { fetchFeed, fetchUserPosts, type FeedPage } from '@/lib/api/feed'
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
    return (
      <div className="space-y-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-40 animate-pulse rounded-lg border border-border bg-surface" />
        ))}
      </div>
    )
  }

  if (q.isError) {
    return (
      <div className="rounded-md border border-border bg-surface p-6 text-center text-sm text-ink/70">
        Não foi possível carregar o feed.
        <button onClick={() => q.refetch()} className="ml-2 underline">Tentar novamente</button>
      </div>
    )
  }

  const posts = q.data?.pages.flatMap((p) => p.items) ?? []

  if (posts.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border bg-surface p-10 text-center text-sm text-ink/60">
        {emptyText}
      </div>
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
