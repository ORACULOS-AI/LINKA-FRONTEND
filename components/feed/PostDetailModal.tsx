'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  X, BadgeCheck, Briefcase, FlaskConical, Lightbulb, Calendar,
  MessageCircle, Share2, Bookmark, ChevronLeft, ChevronRight,
  ChevronDown, CornerDownRight,
} from 'lucide-react'
import {
  type FeedPost, type AutorInfo, type PostComment,
  listComments, listReplies, createComment,
  sharePost, bookmarkPost, unbookmarkPost,
} from '@/lib/api/feed'
import { fetchUser } from '@/lib/api/users'
import { getBusiness } from '@/lib/api/business'
import { getLab } from '@/lib/api/labs'
import { getInitiative } from '@/lib/api/initiatives'
import { getEvent } from '@/lib/api/events'
import { useAuth } from '@/lib/stores/auth'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { LikeButton } from '@/components/social/LikeButton'
import { timeAgo } from '@/lib/format'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const PAGE = 5

const REF_META: Record<string, { label: string; Icon: typeof Briefcase; profileHref: (id: string) => string }> = {
  negocio:     { label: 'Negócio',     Icon: Briefcase,    profileHref: (id) => `/vitrine/negocios/${id}` },
  laboratorio: { label: 'Laboratório', Icon: FlaskConical, profileHref: (id) => `/vitrine/laboratorios/${id}` },
  iniciativa:  { label: 'Projeto',     Icon: Lightbulb,    profileHref: (id) => `/vitrine/projetos/${id}` },
  evento:      { label: 'Evento',      Icon: Calendar,     profileHref: (id) => `/vitrine/eventos/${id}` },
}

type Props = {
  post: FeedPost
  initialMediaIndex?: number
  onClose: () => void
}

export function PostDetailModal({ post, initialMediaIndex = 0, onClose }: Props) {
  const me = useAuth((s) => s.me)
  const qc = useQueryClient()
  const [mediaIdx, setMediaIdx] = useState(initialMediaIndex)
  const [bookmarked, setBookmarked] = useState(false)

  // ── Swipe to close (mobile) ───────────────────────────────────────────────
  const touchStartY = useRef<number | null>(null)
  const touchStartX = useRef<number | null>(null)
  const [dragY, setDragY] = useState(0)

  function onTouchStart(e: React.TouchEvent) {
    touchStartY.current = e.touches[0]?.clientY ?? null
    touchStartX.current = e.touches[0]?.clientX ?? null
    setDragY(0)
  }

  function onTouchMove(e: React.TouchEvent) {
    if (touchStartY.current === null || touchStartX.current === null) return
    const touch = e.touches[0]
    if (!touch) return
    const dy = touch.clientY - touchStartY.current
    const dx = Math.abs(touch.clientX - touchStartX.current)
    if (Math.abs(dy) > dx) setDragY(dy)
  }

  function onTouchEnd() {
    if (Math.abs(dragY) > 90) onClose()
    else setDragY(0)
    touchStartY.current = null
    touchStartX.current = null
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  // ── Autor ─────────────────────────────────────────────────────────────────
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

  const headerName = isEntity && refMeta ? (entityName.data ?? refMeta.label) : (autor?.nome ?? '…')
  const headerHref = isEntity && refMeta && post.ref_id ? refMeta.profileHref(post.ref_id) : `/perfil/${post.autor_uid}`
  const EntityIcon = refMeta?.Icon

  // ── Ações ─────────────────────────────────────────────────────────────────
  const shareM = useMutation({
    mutationFn: () => sharePost(post.id),
    onSuccess: () => { toast.success('Compartilhado'); qc.invalidateQueries({ queryKey: ['feed'] }) },
    onError: () => toast.error('Falha ao compartilhar'),
  })

  const bookmarkM = useMutation({
    mutationFn: () => (bookmarked ? unbookmarkPost(post.id) : bookmarkPost(post.id)),
    onMutate: () => setBookmarked((v) => !v),
    onError: () => { setBookmarked((v) => !v); toast.error('Falha ao salvar') },
    onSuccess: () => toast.success(bookmarked ? 'Removido' : 'Post salvo'),
  })

  const media = post.midia ?? []
  const currentMedia = media[mediaIdx]

  return (
    <div
      // z-[300] garante ficar acima de qualquer navbar/toast da app
      className="fixed inset-0 z-[300] flex"
      style={{
        transform: dragY !== 0 ? `translateY(${dragY * 0.3}px)` : undefined,
        opacity: dragY !== 0 ? Math.max(0.4, 1 - Math.abs(dragY) / 350) : 1,
        transition: dragY === 0 ? 'transform 0.2s ease, opacity 0.2s ease' : 'none',
      }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* ── Lado esquerdo: imagem em fundo preto (desktop only) ───────────── */}
      {media.length > 0 && (
        <div className="hidden md:flex flex-1 bg-black items-center justify-center relative select-none min-w-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 left-4 z-10 rounded-full p-2 bg-black/40 text-white hover:bg-black/70 transition-colors"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>

          {currentMedia?.tipo === 'video' ? (
            <video src={currentMedia.url} controls autoPlay className="max-h-full max-w-full object-contain" />
          ) : (
            <img
              src={currentMedia?.url}
              alt={currentMedia?.legenda ?? ''}
              className="max-h-full max-w-full object-contain"
              draggable={false}
            />
          )}

          {media.length > 1 && (
            <>
              <button type="button" onClick={() => setMediaIdx((i) => Math.max(0, i - 1))} disabled={mediaIdx === 0}
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white disabled:opacity-20 hover:bg-black/70 transition-colors">
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button type="button" onClick={() => setMediaIdx((i) => Math.min(media.length - 1, i + 1))} disabled={mediaIdx === media.length - 1}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white disabled:opacity-20 hover:bg-black/70 transition-colors">
                <ChevronRight className="h-6 w-6" />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                {media.map((_, i) => (
                  <button key={i} type="button" onClick={() => setMediaIdx(i)}
                    className={cn('h-1.5 rounded-full transition-all', i === mediaIdx ? 'w-5 bg-white' : 'w-1.5 bg-white/40')} />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Painel direito: detalhes + comentários ────────────────────────── */}
      <div className={cn(
        'flex flex-col bg-surface h-full overflow-hidden',
        media.length > 0
          ? 'w-full md:w-[400px] md:border-l md:border-border shrink-0'
          : 'w-full md:max-w-2xl md:mx-auto md:border-x md:border-border',
      )}>
        {/* Header do painel */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3 shrink-0 bg-surface">
          <button type="button" onClick={onClose}
            className="rounded-full p-1.5 hover:bg-surface-2 transition-colors" aria-label="Fechar">
            <X className="h-5 w-5" />
          </button>
          <span className="font-display font-semibold text-[15px]">Publicação</span>
        </div>

        {/* Mídia mobile (empilhado) */}
        {media.length > 0 && (
          <div className="md:hidden relative bg-black shrink-0">
            <div className="absolute top-1.5 left-1/2 -translate-x-1/2 h-1 w-10 rounded-full bg-white/30 z-10" />
            {currentMedia?.tipo === 'video' ? (
              <video src={currentMedia.url} controls autoPlay className="w-full max-h-[45vh] object-contain" />
            ) : (
              <img src={currentMedia?.url} alt={currentMedia?.legenda ?? ''} className="w-full max-h-[45vh] object-contain" />
            )}
            {media.length > 1 && (
              <>
                <button type="button" onClick={() => setMediaIdx((i) => Math.max(0, i - 1))} disabled={mediaIdx === 0}
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white disabled:opacity-20">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button type="button" onClick={() => setMediaIdx((i) => Math.min(media.length - 1, i + 1))} disabled={mediaIdx === media.length - 1}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white disabled:opacity-20">
                  <ChevronRight className="h-5 w-5" />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {media.map((_, i) => (
                    <button key={i} type="button" onClick={() => setMediaIdx(i)}
                      className={cn('h-1.5 rounded-full transition-all', i === mediaIdx ? 'w-4 bg-white' : 'w-1.5 bg-white/40')} />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Corpo scrollável */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="px-4 py-4 space-y-4">

            {/* Autor */}
            <div className="flex items-center gap-3">
              <Link href={headerHref} onClick={onClose} className="shrink-0">
                {isEntity && EntityIcon ? (
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-2 border border-border text-fg-2">
                    <EntityIcon className="h-5 w-5" />
                  </div>
                ) : (
                  <Avatar nome={autor?.nome ?? '?'} src={autor?.foto ?? undefined} size={44} />
                )}
              </Link>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <Link href={headerHref} onClick={onClose} className="font-display font-semibold text-[15px] hover:underline truncate">
                    {headerName}
                  </Link>
                  {!isEntity && autor?.is_verified && <BadgeCheck className="h-4 w-4 text-blue shrink-0" />}
                </div>
                <p className="text-xs text-fg-3">
                  {isEntity ? (
                    <>
                      {refMeta?.label}
                      {autor?.nome ? <> · por <Link href={`/perfil/${post.autor_uid}`} onClick={onClose} className="hover:underline">{autor.nome}</Link></> : null}
                    </>
                  ) : (
                    <>
                      {autor?.tipo_usuario && <span className="capitalize">{autor.tipo_usuario.replace('_', ' ')}</span>}
                      {autor?.campus ? <> · {autor.campus}</> : null}
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Texto completo */}
            {post.conteudo && (
              <p className="text-[15px] leading-relaxed text-fg-1 whitespace-pre-wrap">{post.conteudo}</p>
            )}

            {/* Timestamp */}
            <p className="text-xs text-fg-4">
              {new Date(post.created_at).toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' })}
            </p>

            {/* Action bar */}
            <div className="flex items-center gap-1 border-y border-border py-2">
              <LikeButton type="post" id={post.id} initialCount={post.likes_count} size="sm" />
              <button type="button" className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-fg-2 hover:bg-surface-2">
                <MessageCircle className="h-4 w-4" /><span>{post.comments_count}</span>
              </button>
              <button type="button" onClick={() => shareM.mutate()} className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-fg-2 hover:bg-surface-2">
                <Share2 className="h-4 w-4" /><span>{post.shares_count}</span>
              </button>
              <div className="flex-1" />
              <button type="button" onClick={() => bookmarkM.mutate()} className={cn('rounded-md p-1.5 hover:bg-surface-2', bookmarked && 'text-mint')} aria-label="Salvar">
                <Bookmark className={cn('h-4 w-4', bookmarked && 'fill-current')} />
              </button>
            </div>

            {/* Comentários paginados + threads */}
            <CommentsSection postId={post.id} onNavigate={onClose} />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Seção de comentários paginada ────────────────────────────────────────────

function CommentsSection({ postId, onNavigate }: { postId: string; onNavigate: () => void }) {
  const qc = useQueryClient()
  const me = useAuth((s) => s.me)
  const [text, setText] = useState('')
  const [offset, setOffset] = useState(0)
  const [allComments, setAllComments] = useState<PostComment[]>([])
  const [hasMore, setHasMore] = useState(true)
  const sentinelRef = useRef<HTMLDivElement>(null)

  // Primeira página
  const { data: firstPage, isLoading } = useQuery({
    queryKey: ['comments', postId, 0],
    queryFn: () => listComments(postId, PAGE, 0),
    staleTime: 30_000,
  })

  useEffect(() => {
    if (firstPage) {
      setAllComments(firstPage)
      setHasMore(firstPage.length === PAGE)
      setOffset(PAGE)
    }
  }, [firstPage])

  // IntersectionObserver para carregar mais
  const loadingMore = useRef(false)
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const io = new IntersectionObserver(async (entries) => {
      if (!entries[0]?.isIntersecting || !hasMore || loadingMore.current) return
      loadingMore.current = true
      try {
        const more = await listComments(postId, PAGE, offset)
        setAllComments((prev) => [...prev, ...more])
        setHasMore(more.length === PAGE)
        setOffset((o) => o + PAGE)
      } finally {
        loadingMore.current = false
      }
    }, { threshold: 0.1 })
    io.observe(el)
    return () => io.disconnect()
  }, [hasMore, offset, postId])

  const addM = useMutation({
    mutationFn: () => createComment(postId, text),
    onSuccess: (newComment) => {
      setText('')
      // Adiciona no topo da lista
      setAllComments((prev) => [newComment, ...prev])
      // Atualiza o count no feed cache
      qc.setQueriesData<unknown>({ queryKey: ['feed'] }, (old: unknown) => {
        if (!old || typeof old !== 'object') return old
        const data = old as { pages?: Array<{ items: FeedPost[] }> }
        if (!data.pages) return old
        return {
          ...data,
          pages: data.pages.map((pg) => ({
            ...pg,
            items: pg.items.map((p) =>
              p.id === postId ? { ...p, comments_count: p.comments_count + 1 } : p,
            ),
          })),
        }
      })
      qc.invalidateQueries({ queryKey: ['comments', postId, 0] })
    },
    onError: () => toast.error('Falha ao comentar'),
  })

  return (
    <div className="space-y-4">
      {/* Input */}
      <form onSubmit={(e) => { e.preventDefault(); if (text.trim()) addM.mutate() }} className="flex items-start gap-3">
        <Avatar nome={me?.nome ?? '?'} src={me?.avatar_url ?? undefined} size={36} />
        <div className="flex-1">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={2}
            placeholder="Escreva um comentário…"
            className="w-full resize-none rounded-xl border border-border bg-surface-2 px-3 py-2 text-[14px] focus:border-ink/30 focus:outline-none"
          />
          {text.trim() && (
            <div className="mt-1.5 flex justify-end">
              <Button type="submit" size="sm" loading={addM.isPending}>Comentar</Button>
            </div>
          )}
        </div>
      </form>

      {/* Lista */}
      {isLoading ? (
        <p className="text-xs text-fg-3 py-4 text-center">Carregando…</p>
      ) : allComments.length === 0 ? (
        <p className="text-sm text-fg-3 py-4 text-center">Seja o primeiro a comentar.</p>
      ) : (
        <ul className="space-y-1">
          {allComments.map((c) => (
            <CommentRow key={c.id} comment={c} postId={postId} onNavigate={onNavigate} />
          ))}
        </ul>
      )}

      {/* Sentinel de scroll para carregar mais */}
      {hasMore && <div ref={sentinelRef} className="h-4" />}
    </div>
  )
}

// ─── Comentário individual + thread expansível ────────────────────────────────

function CommentRow({
  comment,
  postId,
  onNavigate,
  indent = false,
}: {
  comment: PostComment
  postId: string
  onNavigate: () => void
  indent?: boolean
}) {
  const qc = useQueryClient()
  const me = useAuth((s) => s.me)
  const [expanded, setExpanded] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [showReplyInput, setShowReplyInput] = useState(false)

  const author = useQuery({
    queryKey: ['user', comment.autor_uid],
    queryFn: () => fetchUser(comment.autor_uid),
    staleTime: 5 * 60_000,
  })

  const { data: replies = [], refetch: refetchReplies } = useQuery({
    queryKey: ['replies', comment.id],
    queryFn: () => listReplies(postId, comment.id),
    enabled: expanded,
    staleTime: 30_000,
  })

  const replyM = useMutation({
    mutationFn: () => createComment(postId, replyText, comment.id),
    onSuccess: () => {
      setReplyText('')
      setShowReplyInput(false)
      setExpanded(true)
      refetchReplies()
      // Incrementa count no feed cache
      qc.setQueriesData<unknown>({ queryKey: ['feed'] }, (old: unknown) => {
        if (!old || typeof old !== 'object') return old
        const data = old as { pages?: Array<{ items: FeedPost[] }> }
        if (!data.pages) return old
        return {
          ...data,
          pages: data.pages.map((pg) => ({
            ...pg,
            items: pg.items.map((p) =>
              p.id === postId ? { ...p, comments_count: p.comments_count + 1 } : p,
            ),
          })),
        }
      })
    },
    onError: () => toast.error('Falha ao responder'),
  })

  const repliesCount = comment.replies_count ?? 0

  return (
    <li className={cn('py-1', indent && 'pl-10')}>
      <div className="flex items-start gap-2.5">
        <Link href={`/perfil/${comment.autor_uid}`} onClick={onNavigate} className="shrink-0 mt-0.5">
          <Avatar nome={author.data?.nome ?? '?'} src={author.data?.foto_perfil ?? author.data?.foto_url} size={32} />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="rounded-2xl bg-surface-2 px-3 py-2">
            <div className="flex items-baseline gap-2">
              <Link href={`/perfil/${comment.autor_uid}`} onClick={onNavigate} className="text-[13px] font-semibold hover:underline">
                {author.data?.nome ?? '…'}
              </Link>
              <span className="text-[11px] text-fg-4">{timeAgo(comment.created_at)}</span>
            </div>
            <p className="text-[13px] text-fg-1 mt-0.5 leading-relaxed">{comment.conteudo}</p>
          </div>
          <div className="flex items-center gap-3 mt-1 pl-1">
            {!indent && (
              <button
                type="button"
                onClick={() => setShowReplyInput((v) => !v)}
                className="text-[12px] text-fg-3 hover:text-fg-1 font-medium"
              >
                Responder
              </button>
            )}
            {!indent && repliesCount > 0 && (
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="flex items-center gap-1 text-[12px] text-blue font-medium hover:underline"
              >
                <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', expanded && 'rotate-180')} />
                {expanded ? 'Ocultar' : `${repliesCount} resposta${repliesCount !== 1 ? 's' : ''}`}
              </button>
            )}
          </div>

          {/* Input de resposta */}
          {showReplyInput && (
            <form
              onSubmit={(e) => { e.preventDefault(); if (replyText.trim()) replyM.mutate() }}
              className="mt-2 flex items-start gap-2"
            >
              <Avatar nome={me?.nome ?? '?'} size={26} />
              <div className="flex-1">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={1}
                  autoFocus
                  placeholder={`Responder a ${author.data?.nome ?? '…'}…`}
                  className="w-full resize-none rounded-xl border border-border bg-surface-2 px-3 py-1.5 text-[13px] focus:border-ink/30 focus:outline-none"
                />
                {replyText.trim() && (
                  <div className="mt-1 flex gap-2 justify-end">
                    <button type="button" onClick={() => setShowReplyInput(false)} className="text-[12px] text-fg-3">Cancelar</button>
                    <Button type="submit" size="sm" loading={replyM.isPending}>Responder</Button>
                  </div>
                )}
              </div>
            </form>
          )}

          {/* Respostas expandidas */}
          {expanded && replies.length > 0 && (
            <ul className="mt-2 space-y-1 border-l-2 border-border pl-3">
              {replies.map((r) => (
                <CommentRow key={r.id} comment={r} postId={postId} onNavigate={onNavigate} indent />
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Ícone de thread connector */}
      {!indent && repliesCount > 0 && !expanded && (
        <div className="flex items-center gap-1 pl-10 mt-1">
          <CornerDownRight className="h-3 w-3 text-fg-4" />
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="text-[12px] text-fg-4 hover:text-fg-1"
          >
            ver thread
          </button>
        </div>
      )}
    </li>
  )
}
