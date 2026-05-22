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
} from '@/lib/api/feed'
import { EmptyState, SkeletonList } from '@/components/primitives'
import { PostCard } from './PostCard'
import { FeedEmptyState } from './FeedEmptyState'

type Props = {
  /** Quando setado, lista posts deste usuário (perfil); caso contrário, feed home. */
  userUid?: string
  /** Quando setado junto com targetId, lista posts que referenciam essa entidade. */
  targetType?: EntityFeedTarget
  targetId?: string
  emptyText?: string
}

export function FeedTimeline({
  userUid,
  targetType,
  targetId,
  emptyText = 'Nada por aqui ainda.',
}: Props) {
  const sentinelRef = useRef<HTMLDivElement>(null)

  const isEntity = !!(targetType && targetId)
  const queryKey = isEntity
    ? ['feed', 'entity', targetType, targetId]
    : userUid
      ? ['feed', 'user', userUid]
      : ['feed', 'home']
  const queryFn = ({ pageParam }: { pageParam: string | null | undefined }): Promise<FeedPage> => {
    const params = { cursor: pageParam ?? null, limit: 20 }
    if (isEntity) return fetchEntityPosts(targetType!, targetId!, params)
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
