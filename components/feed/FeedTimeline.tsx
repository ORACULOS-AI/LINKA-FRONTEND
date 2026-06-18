'use client'

import { useEffect, useRef } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Inbox, RefreshCw } from 'lucide-react'
import {
  fetchFeed,
  fetchUserPosts,
  fetchEntityPosts,
  type FeedPage,
  type EntityFeedTarget,
  type TipoPost,
} from '@/lib/api/feed'
import { EmptyState, SkeletonList } from '@/components/primitives'
import { PostCard } from './PostCard'
import { FeedEmptyState } from './FeedEmptyState'

type Props = {
  userUid?: string
  targetType?: EntityFeedTarget
  targetId?: string
  tipo?: TipoPost
  /** true = cronológico (padrão); false = relevância (reordena em memória no cliente) */
  sortRecent?: boolean
  emptyText?: string
}

export function FeedTimeline({
  userUid,
  targetType,
  targetId,
  tipo,
  sortRecent = true,
  emptyText = 'Nada por aqui ainda.',
}: Props) {
  const sentinelRef = useRef<HTMLDivElement>(null)

  const isEntity = !!(targetType && targetId)
  const queryKey = isEntity
    ? ['feed', 'entity', targetType, targetId]
    : userUid
      ? ['feed', 'user', userUid]
      : ['feed', 'home', tipo ?? 'all']
  const queryFn = ({ pageParam }: { pageParam: string | null | undefined }): Promise<FeedPage> => {
    const params = { cursor: pageParam ?? null, limit: 20 }
    if (isEntity) return fetchEntityPosts(targetType!, targetId!, params)
    return userUid ? fetchUserPosts(userUid, params) : fetchFeed({ ...params, tipo })
  }

  const q = useInfiniteQuery({
    queryKey,
    queryFn,
    initialPageParam: null as string | null,
    getNextPageParam: (last) => (last.has_more ? last.next_cursor : undefined),
  })

  // Stable refs — observer created once, always reads latest state
  const fetchNextRef = useRef(q.fetchNextPage)
  const hasMoreRef = useRef(q.hasNextPage)
  const fetchingRef = useRef(q.isFetchingNextPage)
  fetchNextRef.current = q.fetchNextPage
  hasMoreRef.current = q.hasNextPage
  fetchingRef.current = q.isFetchingNextPage

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const io = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && hasMoreRef.current && !fetchingRef.current) {
        fetchNextRef.current()
      }
    }, { rootMargin: '600px' })
    io.observe(el)
    return () => io.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

  const rawPosts = q.data?.pages.flatMap((p) => p.items) ?? []
  // Modo relevância: reordena por engagement (likes*2 + comments*3 + shares*4) / idade
  const posts = sortRecent
    ? rawPosts
    : [...rawPosts].sort((a, b) => {
        const score = (p: typeof a) => {
          const age = (Date.now() - new Date(p.created_at).getTime()) / 3_600_000 + 2
          return (p.likes_count * 2 + p.comments_count * 3 + p.shares_count * 4 + 1) / Math.pow(age, 1.5)
        }
        return score(b) - score(a)
      })

  if (posts.length === 0) {
    if (userUid || isEntity) {
      return (
        <EmptyState
          icon={<Inbox size={24} />}
          title={emptyText}
        />
      )
    }
    // Feed home vazio = empty state rico com sugestões, showcase e CTA por papel.
    return <FeedEmptyState />
  }

  return (
    <div className="space-y-4">
      {posts.map((p) => <PostCard key={p.id} post={p} />)}
      <div ref={sentinelRef} className="h-8" />
      {q.isFetchingNextPage && (
        <div className="text-center text-xs text-fg-3">Carregando mais…</div>
      )}
    </div>
  )
}
