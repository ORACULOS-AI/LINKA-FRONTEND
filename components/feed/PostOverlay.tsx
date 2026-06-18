'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { X } from 'lucide-react'
import { getPost } from '@/lib/api/feed'
import { PostDetailView } from './PostDetailView'
import { PostMediaCarousel } from './PostMediaCarousel'
import { cn } from '@/lib/utils'

type Props = {
  id: string
  initialMediaIndex?: number
}

/**
 * Overlay de visualização de post, renderizado pela rota interceptada
 * (@modal/(.)post/[id]) ao navegar a partir do feed. Post com mídia → lightbox
 * estilo Twitter com fundo preto transparente; post só-texto → painel central
 * que substitui a coluna do meio (header + col 1/3 ficam visíveis atrás).
 */
export function PostOverlay({ id, initialMediaIndex = 0 }: Props) {
  const router = useRouter()
  const [mediaIdx, setMediaIdx] = useState(initialMediaIndex)

  const { data: post, isLoading } = useQuery({ queryKey: ['post', id], queryFn: () => getPost(id) })

  // Swipe-to-close (mobile)
  const touchStartY = useRef<number | null>(null)
  const touchStartX = useRef<number | null>(null)
  const [dragY, setDragY] = useState(0)

  function close() { router.back() }

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
    if (Math.abs(dragY) > 90) close()
    else setDragY(0)
    touchStartY.current = null
    touchStartX.current = null
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') router.back() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [router])

  const media = post?.midia ?? []
  const hasMedia = media.length > 0

  const panelStyle = {
    transform: dragY !== 0 ? `translateY(${dragY * 0.3}px)` : undefined,
    opacity: dragY !== 0 ? Math.max(0.4, 1 - Math.abs(dragY) / 350) : 1,
    transition: dragY === 0 ? 'transform 0.2s ease, opacity 0.2s ease' : 'none',
  } as const

  return (
    <div
      className={cn('fixed inset-0 z-[300] flex', hasMedia ? 'bg-black/70' : 'bg-black/30')}
      onClick={close}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {isLoading || !post ? (
        <div className="m-auto text-sm text-white/80">Carregando…</div>
      ) : hasMedia ? (
        // ── Lightbox com mídia ──────────────────────────────────────────────
        <div className="flex w-full" style={panelStyle} onClick={(e) => e.stopPropagation()}>
          {/* Mídia (desktop) */}
          <div className="hidden md:flex flex-1 items-center justify-center relative min-w-0 min-h-0 p-4">
            <button
              type="button"
              onClick={close}
              className="absolute top-4 left-4 z-10 rounded-full p-2 bg-black/40 text-white hover:bg-black/70 transition-colors"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>
            <PostMediaCarousel media={media} index={mediaIdx} setIndex={setMediaIdx} className="h-full w-full" mediaClassName="max-h-[calc(100vh-2rem)]" />
          </div>

          {/* Painel de detalhes */}
          <div className="flex flex-col bg-surface h-full overflow-hidden w-full md:w-[400px] md:border-l md:border-border shrink-0">
            <div className="flex items-center gap-3 border-b border-border px-4 py-3 shrink-0 bg-surface">
              <button type="button" onClick={close} className="rounded-full p-1.5 hover:bg-surface-2 transition-colors" aria-label="Fechar">
                <X className="h-5 w-5" />
              </button>
              <span className="font-display font-semibold text-[15px]">Publicação</span>
            </div>

            {/* Mídia empilhada (mobile) */}
            <div className="md:hidden relative bg-black shrink-0">
              <PostMediaCarousel media={media} index={mediaIdx} setIndex={setMediaIdx} size="sm" className="w-full" mediaClassName="max-h-[45vh]" />
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain">
              <PostDetailView post={post} onNavigate={close} />
            </div>
          </div>
        </div>
      ) : (
        // ── Post só-texto: painel central (substitui a coluna do meio) ──────
        <div
          className="mx-auto my-auto flex max-h-[calc(100vh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-lg md:my-8"
          style={panelStyle}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-3 border-b border-border px-4 py-3 shrink-0 bg-surface">
            <button type="button" onClick={close} className="rounded-full p-1.5 hover:bg-surface-2 transition-colors" aria-label="Fechar">
              <X className="h-5 w-5" />
            </button>
            <span className="font-display font-semibold text-[15px]">Publicação</span>
          </div>
          <div className="flex-1 overflow-y-auto overscroll-contain">
            <PostDetailView post={post} onNavigate={close} />
          </div>
        </div>
      )}
    </div>
  )
}
