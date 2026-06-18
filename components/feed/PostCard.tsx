'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  MessageCircle, Share2, Bookmark, MoreHorizontal, Trash2, BadgeCheck, Pencil,
  Briefcase, FlaskConical, Lightbulb, Calendar,
} from 'lucide-react'
import {
  type FeedPost, type AutorInfo,
  sharePost, bookmarkPost, unbookmarkPost, deletePost, editPost, listComments,
} from '@/lib/api/feed'
import { fetchUser } from '@/lib/api/users'
import { getBusiness } from '@/lib/api/business'
import { getLab } from '@/lib/api/labs'
import { getInitiative } from '@/lib/api/initiatives'
import { getEvent } from '@/lib/api/events'
import { useAuth } from '@/lib/stores/auth'
import { Avatar } from '@/components/ui/avatar'
import { LikeButton } from '@/components/social/LikeButton'
import { sharePostLink } from '@/lib/share'
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
  const router = useRouter()
  const isOwner = me?.id === post.autor_uid
  const [bookmarked, setBookmarked] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(post.conteudo ?? '')

  const postHref = `/feed/post/${post.id}`

  // Navega para o post (rota interceptada → overlay), ignorando cliques em botões/links/inputs
  function handleCardClick(e: React.MouseEvent<HTMLElement>) {
    const target = e.target as HTMLElement
    if (target.closest('button, a, input, textarea, [role="button"]')) return
    openDetail(0)
  }

  function openDetail(mediaIdx = 0) {
    router.push(mediaIdx > 0 ? `${postHref}?m=${mediaIdx}` : postHref)
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

  const entity = useQuery({
    queryKey: ['ref-entity', post.ref_tipo, post.ref_id],
    enabled: isEntity && !!refMeta,
    staleTime: 5 * 60_000,
    queryFn: async (): Promise<{ nome: string; foto: string | null } | null> => {
      switch (post.ref_tipo) {
        case 'negocio': {
          const b = await getBusiness(post.ref_id!)
          return { nome: b.nome, foto: b.foto_perfil ?? null }
        }
        case 'laboratorio': {
          const l = await getLab(post.ref_id!)
          return { nome: l.nome, foto: (l.foto_perfil as string | undefined) ?? null }
        }
        case 'iniciativa': {
          const i = await getInitiative(post.ref_id!)
          return { nome: i.titulo, foto: null }
        }
        case 'evento': {
          const e = await getEvent(post.ref_id!)
          return { nome: e.titulo, foto: e.logo_url ?? null }
        }
        default:
          return null
      }
    },
  })

  // Principais comentários inline no feed (carrega só quando há comentários).
  const topComments = useQuery({
    queryKey: ['post-top-comments', post.id],
    queryFn: () => listComments(post.id, 2, 0),
    enabled: post.comments_count > 0,
    staleTime: 60_000,
  })

  const invalidateFeed = () => qc.invalidateQueries({ queryKey: ['feed'] })

  const bookmarkM = useMutation({
    mutationFn: () => (bookmarked ? unbookmarkPost(post.id) : bookmarkPost(post.id)),
    onMutate: () => setBookmarked((v) => !v),
    onError: () => { setBookmarked((v) => !v); toast.error('Falha ao salvar') },
    onSuccess: () => toast.success(bookmarked ? 'Removido dos salvos' : 'Post salvo'),
  })

  // Share: copia o permalink do post + registra o compartilhamento (contador)
  const shareM = useMutation({
    mutationFn: () => sharePost(post.id),
    onSuccess: () => invalidateFeed(),
  })
  function handleShare() {
    void sharePostLink(post.id)
    shareM.mutate()
  }

  const editM = useMutation({
    mutationFn: (conteudo: string) => editPost(post.id, { conteudo }),
    onSuccess: () => { setEditing(false); toast.success('Post atualizado'); invalidateFeed() },
    onError: () => toast.error('Falha ao atualizar'),
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

  const headerName = isEntity && refMeta ? (entity.data?.nome ?? refMeta.label) : (autor?.nome ?? '…')
  const headerHref = isEntity && refMeta && post.ref_id ? refMeta.href(post.ref_id) : `/perfil/${post.autor_uid}`
  const EntityIcon = refMeta?.Icon
  const entityFoto = entity.data?.foto ?? null

  return (
    <>
      <article
        className="rounded-lg border border-border bg-surface p-5 cursor-pointer hover:bg-surface-2/40 transition-colors"
        onClick={handleCardClick}
      >
        <header className="flex items-start gap-3">
          <Link href={headerHref} onClick={(e) => e.stopPropagation()}>
            {isEntity && EntityIcon ? (
              entityFoto ? (
                <img
                  src={entityFoto}
                  alt={headerName}
                  className="h-11 w-11 shrink-0 rounded-full border border-border object-cover"
                />
              ) : (
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-2 border border-border text-fg-2 shrink-0">
                  <EntityIcon className="h-5 w-5" />
                </div>
              )
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
                    onClick={(e) => { e.stopPropagation(); setMenuOpen(false); setDraft(post.conteudo ?? ''); setEditing(true) }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-surface-2"
                  >
                    <Pencil className="h-4 w-4" /> Editar
                  </button>
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

        {editing ? (
          <div className="mt-3" onClick={(e) => e.stopPropagation()}>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={4}
              autoFocus
              maxLength={2000}
              className="w-full resize-none rounded-md border border-border bg-surface-2 p-3 text-[15px] leading-relaxed focus:outline-none focus:border-border-strong"
            />
            <div className="mt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => { setEditing(false); setDraft(post.conteudo ?? '') }}
                className="rounded-md px-3 py-1.5 text-sm text-fg-2 hover:bg-surface-2"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={editM.isPending || !draft.trim() || draft.trim() === (post.conteudo ?? '').trim()}
                onClick={() => editM.mutate(draft.trim())}
                className="rounded-md bg-ink px-3 py-1.5 text-sm text-on-dark-1 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editM.isPending ? 'Salvando…' : 'Salvar'}
              </button>
            </div>
          </div>
        ) : post.conteudo ? (
          <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-fg-1 line-clamp-6">
            {post.conteudo}
          </p>
        ) : null}

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
            onClick={(e) => { e.stopPropagation(); handleShare() }}
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

        {post.comments_count > 0 && (topComments.data?.length ?? 0) > 0 && (
          <div className="mt-3 space-y-2.5">
            {topComments.data!.map((c) => (
              <div key={c.id} className="flex items-start gap-2">
                <Link href={`/perfil/${c.autor_uid}`} onClick={(e) => e.stopPropagation()} className="shrink-0">
                  <Avatar nome={c.autor?.nome ?? '?'} src={c.autor?.foto ?? undefined} size={28} />
                </Link>
                <div className="min-w-0 flex-1 rounded-2xl bg-surface-2 px-3 py-2">
                  <Link
                    href={`/perfil/${c.autor_uid}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-[13px] font-semibold hover:underline"
                  >
                    {c.autor?.nome ?? 'Membro'}
                  </Link>
                  <p className="whitespace-pre-wrap break-words text-[13px] leading-snug text-fg-1 line-clamp-3">{c.conteudo}</p>
                </div>
              </div>
            ))}
            {post.comments_count > (topComments.data?.length ?? 0) && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); openDetail(0) }}
                className="ml-9 text-[13px] font-medium text-fg-3 hover:text-fg-1 hover:underline"
              >
                Ver todos os {post.comments_count} comentários
              </button>
            )}
          </div>
        )}
      </article>
    </>
  )
}
