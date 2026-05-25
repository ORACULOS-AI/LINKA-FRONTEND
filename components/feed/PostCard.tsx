'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  MessageCircle, Share2, Bookmark, MoreHorizontal, Trash2, BadgeCheck,
  Briefcase, FlaskConical, Lightbulb, Calendar,
} from 'lucide-react'
import {
  type FeedPost, type AutorInfo,
  sharePost, bookmarkPost, unbookmarkPost, deletePost,
} from '@/lib/api/feed'
import { fetchUser } from '@/lib/api/users'
import { getBusiness } from '@/lib/api/business'
import { getLab } from '@/lib/api/labs'
import { getInitiative } from '@/lib/api/initiatives'
import { getEvent } from '@/lib/api/events'
import { useAuth } from '@/lib/stores/auth'
import { Avatar } from '@/components/ui/avatar'
import { LikeButton } from '@/components/social/LikeButton'
import { PostDetailModal } from './PostDetailModal'
import { timeAgo } from '@/lib/format'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

type Props = { post: FeedPost }

const REF_META: Record<string, { label: string; Icon: typeof Briefcase; href: (id: string) => string }> = {
  negocio:     { label: 'Negócio',      Icon: Briefcase,    href: (id) => `/vitrine/negocios/${id}` },
  laboratorio: { label: 'Laboratório',  Icon: FlaskConical, href: (id) => `/vitrine/laboratorios/${id}` },
  iniciativa:  { label: 'Projeto',      Icon: Lightbulb,    href: (id) => `/vitrine/projetos/${id}` },
  evento:      { label: 'Evento',       Icon: Calendar,     href: (id) => `/vitrine/eventos/${id}` },
}

export function PostCard({ post }: Props) {
  const me = useAuth((s) => s.me)
  const qc = useQueryClient()
  const isOwner = me?.id === post.autor_uid
  const [bookmarked, setBookmarked] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailMediaIdx, setDetailMediaIdx] = useState(0)

  // Abre o modal, mas ignora cliques em botões/links/inputs
  function handleCardClick(e: React.MouseEvent<HTMLElement>) {
    const target = e.target as HTMLElement
    if (target.closest('button, a, input, textarea, [role="button"]')) return
    openDetail(0)
  }

  function openDetail(mediaIdx = 0) {
    setDetailMediaIdx(mediaIdx)
    setDetailOpen(true)
  }

  // Autor inline; fallback apenas para posts em cache sem autor
  const authorFallback = useQuery({
    queryKey: ['user', post.autor_uid],
    queryFn: () => fetchUser(post.autor_uid),
    staleTime: 5 * 60_000,
    enabled: !post.autor,
  })
  const autor: AutorInfo | null = post.autor ?? (authorFallback.data ? {
    uid: authorFallback.data.uid ?? post.autor_uid,
    nome: authorFallback.data.nome,
    foto: authorFallback.data.foto_perfil ?? authorFallback.data.foto_url ?? null,
    tipo_usuario: authorFallback.data.tipo_usuario ?? null,
    campus: authorFallback.data.campus ?? null,
    is_verified: authorFallback.data.is_verified ?? false,
  } : null)

  const isEntity = post.tipo !== 'PESSOAL' && !!post.ref_id && !!post.ref_tipo
  const refMeta = post.ref_tipo ? REF_META[post.ref_tipo] : undefined

  const entityName = useQuery({
    queryKey: ['ref-entity', post.ref_tipo, post.ref_id],
    enabled: isEntity && !!refMeta,
    staleTime: 5 * 60_000,
    queryFn: async () => {
      switch (post.ref_tipo) {
        case 'negocio':     return (await getBusiness(post.ref_id!)).nome
        case 'laboratorio': return (await getLab(post.ref_id!)).nome
        case 'iniciativa':  return (await getInitiative(post.ref_id!)).titulo
        case 'evento':      return (await getEvent(post.ref_id!)).titulo
        default:            return null
      }
    },
  })

  const invalidateFeed = () => qc.invalidateQueries({ queryKey: ['feed'] })

  const bookmarkM = useMutation({
    mutationFn: () => (bookmarked ? unbookmarkPost(post.id) : bookmarkPost(post.id)),
    onMutate: () => setBookmarked((v) => !v),
    onError: () => { setBookmarked((v) => !v); toast.error('Falha ao salvar') },
    onSuccess: () => toast.success(bookmarked ? 'Removido dos salvos' : 'Post salvo'),
  })

  // Share: chama API + abre o modal do post
  const shareM = useMutation({
    mutationFn: () => sharePost(post.id),
    onSuccess: () => {
      toast.success('Compartilhado')
      invalidateFeed()
      openDetail(0)
    },
    onError: () => toast.error('Falha ao compartilhar'),
  })

  const deleteM = useMutation({
    mutationFn: () => deletePost(post.id),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: ['feed'] })
      qc.setQueriesData<unknown>({ queryKey: ['feed'] }, (old: unknown) => {
        if (!old || typeof old !== 'object') return old
        const data = old as { pages?: Array<{ items: { id: string }[] }> }
        if (!data.pages) return old
        return {
          ...data,
          pages: data.pages.map((pg) => ({
            ...pg,
            items: pg.items.filter((p) => p.id !== post.id),
          })),
        }
      })
    },
    onSuccess: () => { toast.success('Post removido'); invalidateFeed() },
    onError: () => { toast.error('Falha ao remover'); invalidateFeed() },
  })

  const headerName = isEntity && refMeta ? (entityName.data ?? refMeta.label) : (autor?.nome ?? '…')
  const headerHref = isEntity && refMeta && post.ref_id ? refMeta.href(post.ref_id) : `/perfil/${post.autor_uid}`
  const EntityIcon = refMeta?.Icon

  return (
    <>
      <article
        className="rounded-lg border border-border bg-surface p-5 cursor-pointer hover:bg-surface-2/40 transition-colors"
        onClick={handleCardClick}
      >
        <header className="flex items-start gap-3">
          <Link href={headerHref} onClick={(e) => e.stopPropagation()}>
            {isEntity && EntityIcon ? (
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-2 border border-border text-fg-2 shrink-0">
                <EntityIcon className="h-5 w-5" />
              </div>
            ) : (
              <Avatar nome={autor?.nome ?? '?'} src={autor?.foto ?? undefined} size={44} />
            )}
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <Link
                href={headerHref}
                onClick={(e) => e.stopPropagation()}
                className="truncate font-display font-semibold hover:underline"
              >
                {headerName}
              </Link>
              {!isEntity && autor?.is_verified && (
                <BadgeCheck className="h-4 w-4 text-blue" aria-label="Verificado" />
              )}
            </div>
            <p className="text-xs text-fg-3">
              {isEntity ? (
                <>
                  {refMeta?.label}
                  {autor?.nome ? <> · por <Link href={`/perfil/${post.autor_uid}`} onClick={(e) => e.stopPropagation()} className="hover:underline">{autor.nome}</Link></> : null}
                  {' · '}{timeAgo(post.created_at)}
                </>
              ) : (
                <>
                  {autor?.tipo_usuario && <span className="capitalize">{autor.tipo_usuario.replace('_', ' ')}</span>}
                  {autor?.campus ? <> · {autor.campus}</> : null}
                  {' · '}{timeAgo(post.created_at)}
                </>
              )}
            </p>
          </div>
          {isOwner && (
            <div className="relative">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v) }}
                className="rounded p-1.5 text-fg-3 hover:bg-surface-2 hover:text-fg-1"
                aria-label="Opções"
              >
                <MoreHorizontal className="h-5 w-5" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-9 z-10 w-44 rounded-md border border-border bg-surface py-1 shadow-lg">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setMenuOpen(false); if (confirm('Remover post?')) deleteM.mutate() }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[#E5102E] hover:bg-surface-2"
                  >
                    <Trash2 className="h-4 w-4" /> Remover
                  </button>
                </div>
              )}
            </div>
          )}
        </header>

        {post.conteudo && (
          <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-fg-1 line-clamp-6">
            {post.conteudo}
          </p>
        )}

        {post.midia && post.midia.length > 0 && (
          <div className={cn('mt-3 grid gap-1.5 overflow-hidden rounded-md', post.midia.length >= 2 && 'grid-cols-2')}>
            {post.midia.slice(0, 4).map((m, i) => (
              <button
                key={i}
                type="button"
                className="relative overflow-hidden rounded-md focus:outline-none"
                onClick={(e) => { e.stopPropagation(); openDetail(i) }}
                aria-label="Ver publicação"
              >
                {m.tipo === 'image' ? (
                  <img src={m.url} alt={m.legenda ?? ''} className="w-full h-48 object-cover hover:brightness-90 transition-[filter]" />
                ) : (
                  <video src={m.url} className="w-full h-48 object-cover" muted />
                )}
                {i === 3 && post.midia!.length > 4 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-ink/50 text-paper font-bold text-xl">
                    +{post.midia!.length - 4}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        <footer className="mt-4 flex items-center gap-1 border-t border-border pt-3 text-sm text-fg-2">
          <LikeButton type="post" id={post.id} initialCount={post.likes_count} size="sm" />
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); openDetail(0) }}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 hover:bg-surface-2"
          >
            <MessageCircle className="h-4 w-4" />
            <span>{post.comments_count}</span>
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); shareM.mutate() }}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 hover:bg-surface-2"
          >
            <Share2 className="h-4 w-4" />
            <span>{post.shares_count}</span>
          </button>
          <div className="flex-1" />
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); bookmarkM.mutate() }}
            className={cn('rounded-md p-1.5 hover:bg-surface-2', bookmarked && 'text-mint')}
            aria-label="Salvar"
          >
            <Bookmark className={cn('h-4 w-4', bookmarked && 'fill-current')} />
          </button>
        </footer>
      </article>

      {detailOpen && (
        <PostDetailModal
          post={post}
          initialMediaIndex={detailMediaIdx}
          onClose={() => setDetailOpen(false)}
        />
      )}
    </>
  )
}
