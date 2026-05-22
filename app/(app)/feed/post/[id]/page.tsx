'use client'

import { use } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { getPost } from '@/lib/api/feed'
import { PostCard } from '@/components/feed/PostCard'
import { EmptyState } from '@/components/primitives'

export default function PostPermalinkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const q = useQuery({ queryKey: ['post', id], queryFn: () => getPost(id) })

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 lg:py-8">
      <Link href="/feed" className="mb-3 inline-flex items-center gap-1 text-sm text-[var(--color-fg-3)]">
        <ArrowLeft className="h-4 w-4" /> Voltar ao feed
      </Link>

      {q.isLoading ? (
        <p className="text-sm text-[var(--color-fg-3)]">Carregando…</p>
      ) : q.isError || !q.data ? (
        <EmptyState
          title="Post não encontrado"
          description="Esse post pode ter sido removido ou você não tem permissão para vê-lo."
          action={{ label: 'Voltar ao feed', href: '/feed' }}
        />
      ) : (
        <PostCard post={q.data} />
      )}
    </div>
  )
}
