'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Trash2, BadgeCheck } from 'lucide-react'
import {
  type FeedPost,
  reactToPost, unreactPost,
  sharePost, bookmarkPost, unbookmarkPost,
  deletePost, listComments, createComment,
} from '@/lib/api/feed'
import { fetchUser } from '@/lib/api/users'
import { useAuth } from '@/lib/stores/auth'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { timeAgo } from '@/lib/format'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

type Props = { post: FeedPost }

export function PostCard({ post }: Props) {
  const me = useAuth((s) => s.me)
  const qc = useQueryClient()
  const isOwner = me?.id === post.autor_uid
  const [reacted, setReacted] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const author = useQuery({
    queryKey: ['user', post.autor_uid],
    queryFn: () => fetchUser(post.autor_uid),
    staleTime: 5 * 60_000,
  })

  const invalidateFeed = () => qc.invalidateQueries({ queryKey: ['feed'] })

  const reactM = useMutation({
    mutationFn: () => (reacted ? unreactPost(post.id) : reactToPost(post.id, 'LIKE')),
    onMutate: () => setReacted((v) => !v),
    onError: () => { setReacted((v) => !v); toast.error('Falha ao reagir') },
    onSuccess: invalidateFeed,
  })

  const bookmarkM = useMutation({
    mutationFn: () => (bookmarked ? unbookmarkPost(post.id) : bookmarkPost(post.id)),
    onMutate: () => setBookmarked((v) => !v),
    onError: () => { setBookmarked((v) => !v); toast.error('Falha ao salvar') },
    onSuccess: () => toast.success(bookmarked ? 'Removido dos salvos' : 'Post salvo'),
  })

  const shareM = useMutation({
    mutationFn: () => sharePost(post.id),
    onSuccess: () => { toast.success('Compartilhado'); invalidateFeed() },
    onError: () => toast.error('Falha ao compartilhar'),
  })

  const deleteM = useMutation({
    mutationFn: () => deletePost(post.id),
    onSuccess: () => { toast.success('Post removido'); invalidateFeed() },
    onError: () => toast.error('Falha ao remover'),
  })

  return (
    <article className="rounded-lg border border-border bg-paper p-5">
      <header className="flex items-start gap-3">
        <Link href={`/perfil/${post.autor_uid}`}>
          <Avatar nome={author.data?.nome ?? '?'} src={author.data?.foto_perfil ?? author.data?.foto_url} size={44} />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <Link href={`/perfil/${post.autor_uid}`} className="truncate font-display font-semibold hover:underline">
              {author.data?.nome ?? '…'}
            </Link>
            {author.data?.is_verified && (
              <BadgeCheck className="h-4 w-4 text-selinka-blue" aria-label="Verificado" />
            )}
          </div>
          <p className="text-xs text-ink/60">
            {author.data?.tipo_usuario && (
              <span className="capitalize">{author.data.tipo_usuario.replace('_', ' ')}</span>
            )}
            {author.data?.campus ? <> · {author.data.campus}</> : null}
            {' · '}{timeAgo(post.created_at)}
          </p>
        </div>
        {isOwner && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="rounded p-1.5 text-ink/60 hover:bg-surface-2 hover:text-ink"
              aria-label="Opções"
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-9 z-10 w-44 rounded-md border border-border bg-paper py-1 shadow-lg">
                <button
                  type="button"
                  onClick={() => { setMenuOpen(false); if (confirm('Remover post?')) deleteM.mutate() }}
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
        <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-ink">{post.conteudo}</p>
      )}

      {post.midia && post.midia.length > 0 && (
        <div className="mt-3 grid gap-2 overflow-hidden rounded-md">
          {post.midia.map((m, i) => (
            m.tipo === 'image' ? (
              <img key={i} src={m.url} alt={m.legenda ?? ''} className="w-full rounded-md object-cover" />
            ) : (
              <video key={i} src={m.url} controls className="w-full rounded-md" />
            )
          ))}
        </div>
      )}

      <footer className="mt-4 flex items-center gap-1 border-t border-border pt-3 text-sm text-ink/70">
        <button
          type="button"
          onClick={() => reactM.mutate()}
          className={cn(
            'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 hover:bg-surface-2',
            reacted && 'text-purple',
          )}
        >
          <Heart className={cn('h-4 w-4', reacted && 'fill-current')} />
          <span>{post.reactions_count + (reacted ? 1 : 0)}</span>
        </button>
        <button
          type="button"
          onClick={() => setShowComments((v) => !v)}
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 hover:bg-surface-2"
        >
          <MessageCircle className="h-4 w-4" />
          <span>{post.comments_count}</span>
        </button>
        <button
          type="button"
          onClick={() => shareM.mutate()}
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 hover:bg-surface-2"
        >
          <Share2 className="h-4 w-4" />
          <span>{post.shares_count}</span>
        </button>
        <div className="flex-1" />
        <button
          type="button"
          onClick={() => bookmarkM.mutate()}
          className={cn(
            'rounded-md p-1.5 hover:bg-surface-2',
            bookmarked && 'text-mint',
          )}
          aria-label="Salvar"
        >
          <Bookmark className={cn('h-4 w-4', bookmarked && 'fill-current')} />
        </button>
      </footer>

      {showComments && <CommentsThread postId={post.id} />}
    </article>
  )
}

function CommentsThread({ postId }: { postId: string }) {
  const qc = useQueryClient()
  const [text, setText] = useState('')
  const me = useAuth((s) => s.me)
  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['comments', postId],
    queryFn: () => listComments(postId),
  })
  const addM = useMutation({
    mutationFn: () => createComment(postId, text),
    onSuccess: () => {
      setText('')
      qc.invalidateQueries({ queryKey: ['comments', postId] })
      qc.invalidateQueries({ queryKey: ['feed'] })
    },
    onError: () => toast.error('Falha ao comentar'),
  })

  return (
    <div className="mt-3 border-t border-border pt-3">
      <div className="flex items-start gap-2">
        <Avatar nome={me?.nome ?? '?'} size={32} />
        <form
          onSubmit={(e) => { e.preventDefault(); if (text.trim()) addM.mutate() }}
          className="flex-1"
        >
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={2}
            placeholder="Escreva um comentário…"
            className="w-full resize-none rounded-md border border-border bg-surface px-3 py-2 text-sm focus:border-ink/30 focus:outline-none"
          />
          <div className="mt-2 flex justify-end">
            <Button type="submit" size="sm" loading={addM.isPending} disabled={!text.trim()}>
              Comentar
            </Button>
          </div>
        </form>
      </div>

      {isLoading ? (
        <p className="mt-3 text-xs text-ink/50">Carregando…</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {comments.map((c) => <CommentItem key={c.id} comment={c} />)}
        </ul>
      )}
    </div>
  )
}

function CommentItem({ comment }: { comment: { id: string; autor_uid: string; conteudo: string; created_at: string } }) {
  const author = useQuery({
    queryKey: ['user', comment.autor_uid],
    queryFn: () => fetchUser(comment.autor_uid),
    staleTime: 5 * 60_000,
  })
  return (
    <li className="flex items-start gap-2">
      <Avatar nome={author.data?.nome ?? '?'} src={author.data?.foto_perfil ?? author.data?.foto_url} size={32} />
      <div className="flex-1 rounded-md bg-surface px-3 py-2">
        <div className="flex items-baseline gap-2 text-sm">
          <Link href={`/perfil/${comment.autor_uid}`} className="font-semibold hover:underline">
            {author.data?.nome ?? '…'}
          </Link>
          <span className="text-xs text-ink/50">{timeAgo(comment.created_at)}</span>
        </div>
        <p className="text-sm text-ink">{comment.conteudo}</p>
      </div>
    </li>
  )
}
