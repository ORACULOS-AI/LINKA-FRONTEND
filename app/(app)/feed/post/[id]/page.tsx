'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { getPost } from '@/lib/api/feed'
import { FeedShell } from '@/components/feed/FeedShell'
import { FeedLeftSidebar } from '@/components/feed/FeedLeftSidebar'
import { FeedRightSidebar } from '@/components/feed/FeedRightSidebar'
import { PostDetailView } from '@/components/feed/PostDetailView'
import { PostMediaCarousel } from '@/components/feed/PostMediaCarousel'
import { EmptyState } from '@/components/primitives'

export default function PostPermalinkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [mediaIdx, setMediaIdx] = useState(0)
  const q = useQuery({ queryKey: ['post', id], queryFn: () => getPost(id) })

  const media = q.data?.midia ?? []

  return (
    <FeedShell
      left={<FeedLeftSidebar />}
      right={<FeedRightSidebar />}
    >
      <Link href="/feed" className="inline-flex items-center gap-1 text-sm text-[var(--color-fg-3)] px-1">
        <ArrowLeft className="h-4 w-4" /> Voltar ao feed
      </Link>

      {q.isLoading ? (
        <p className="text-sm text-[var(--color-fg-3)] px-1">Carregando…</p>
      ) : q.isError || !q.data ? (
        <EmptyState
          title="Post não encontrado"
          description="Esse post pode ter sido removido ou você não tem permissão para vê-lo."
          action={{ label: 'Voltar ao feed', href: '/feed' }}
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-surface">
          {media.length > 0 && (
            <div className="flex items-center justify-center bg-black">
              <PostMediaCarousel media={media} index={mediaIdx} setIndex={setMediaIdx} className="w-full" mediaClassName="max-h-[70vh]" />
            </div>
          )}
          <PostDetailView post={q.data} />
        </div>
      )}
    </FeedShell>
  )
}
