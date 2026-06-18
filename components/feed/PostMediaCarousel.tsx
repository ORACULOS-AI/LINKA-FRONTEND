'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { MidiaItem } from '@/lib/api/feed'
import { cn } from '@/lib/utils'

type Props = {
  media: MidiaItem[]
  index: number
  setIndex: (updater: (i: number) => number) => void
  /** Tamanho dos controles/dots — 'lg' para o lightbox desktop, 'sm' para mobile. */
  size?: 'sm' | 'lg'
  className?: string
  /**
   * Classe de altura máxima aplicada DIRETAMENTE à mídia (ex.: `max-h-[70vh]`).
   * Limitar por unidades de viewport evita o gotcha de flexbox em que
   * `max-h-full` não resolve quando o container não tem altura definida.
   */
  mediaClassName?: string
}

/**
 * Área de mídia (imagem/vídeo) com carrossel. Usa object-contain sobre fundo
 * transparente — o backdrop preto fica a cargo do container (PostOverlay).
 */
export function PostMediaCarousel({ media, index, setIndex, size = 'lg', className, mediaClassName = 'max-h-full' }: Props) {
  const current = media[index]
  if (!current) return null

  const arrowPad = size === 'lg' ? 'p-2' : 'p-1.5'
  const arrowIcon = size === 'lg' ? 'h-6 w-6' : 'h-5 w-5'
  const mediaCls = cn('max-w-full w-auto object-contain', mediaClassName)

  return (
    <div className={cn('relative flex items-center justify-center select-none min-h-0 min-w-0', className)}>
      {current.tipo === 'video' ? (
        <video src={current.url} controls autoPlay className={mediaCls} />
      ) : (
        <img
          src={current.url}
          alt={current.legenda ?? ''}
          className={mediaCls}
          draggable={false}
        />
      )}

      {media.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            disabled={index === 0}
            className={cn('absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 text-white disabled:opacity-20 hover:bg-black/70 transition-colors', arrowPad)}
            aria-label="Anterior"
          >
            <ChevronLeft className={arrowIcon} />
          </button>
          <button
            type="button"
            onClick={() => setIndex((i) => Math.min(media.length - 1, i + 1))}
            disabled={index === media.length - 1}
            className={cn('absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 text-white disabled:opacity-20 hover:bg-black/70 transition-colors', arrowPad)}
            aria-label="Próximo"
          >
            <ChevronRight className={arrowIcon} />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {media.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(() => i)}
                className={cn('h-1.5 rounded-full transition-all', i === index ? 'w-5 bg-white' : 'w-1.5 bg-white/40')}
                aria-label={`Mídia ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
