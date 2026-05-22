'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Bookmark } from 'lucide-react'
import { fetchMyBookmarks } from '@/lib/api/feed'
import { PostCard } from '@/components/feed/PostCard'
import { EmptyState } from '@/components/primitives'

export default function SavedPostsPage() {
  const q = useQuery({ queryKey: ['bookmarks'], queryFn: () => fetchMyBookmarks(50) })

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 lg:py-8">
      <Link href="/feed" className="mb-3 inline-flex items-center gap-1 text-sm text-[var(--color-fg-3)]">
        <ArrowLeft className="h-4 w-4" /> Voltar ao feed
      </Link>
      <h1 className="font-display text-2xl font-semibold flex items-center gap-2">
        <Bookmark className="h-6 w-6" /> Posts salvos
      </h1>

      <div className="mt-6 space-y-4">
        {q.isLoading ? (
          <p className="text-sm text-[var(--color-fg-3)]">Carregando…</p>
        ) : (q.data ?? []).length === 0 ? (
          <EmptyState
            icon={<Bookmark size={24} />}
            title="Nada salvo ainda"
            description="Toque no ícone de marcador em qualquer post para guardá-lo aqui."
            action={{ label: 'Ir para o feed', href: '/feed' }}
          />
        ) : (
          (q.data ?? []).map((p) => <PostCard key={p.id} post={p} />)
        )}
      </div>
    </div>
  )
}
