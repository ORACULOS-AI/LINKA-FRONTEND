'use client'

import { Share2 } from 'lucide-react'
import { toast } from '@/lib/toast'

type Props = {
  /** Texto exibido no botão. */
  label?: string
  /** Título passado ao Web Share API. Default: document.title. */
  title?: string
  /** Texto passado ao Web Share API. */
  text?: string
  /** URL a compartilhar. Default: window.location.href. */
  url?: string
  size?: 'sm' | 'md'
  iconOnly?: boolean
  className?: string
}

export function ShareButton({
  label = 'Compartilhar',
  title,
  text,
  url,
  size = 'sm',
  iconOnly = false,
  className,
}: Props) {
  const onClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const shareUrl = url ?? (typeof window !== 'undefined' ? window.location.href : '')
    const shareTitle = title ?? (typeof document !== 'undefined' ? document.title : 'SeLinka')

    // Web Share API (mobile + alguns desktops)
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: shareTitle, text, url: shareUrl })
        return
      } catch (err) {
        // AbortError quando usuário cancela — não é falha, sai silencioso
        if ((err as Error).name === 'AbortError') return
        // qualquer outro erro cai no fallback clipboard abaixo
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success('Link copiado para a área de transferência')
    } catch {
      toast.error('Não foi possível compartilhar. Copie a URL manualmente.')
    }
  }

  const sizeClass = size === 'sm' ? 'btn-sm' : ''
  return (
    <button
      type="button"
      onClick={onClick}
      className={`btn btn-secondary ${sizeClass} ${className ?? ''}`}
      aria-label={label}
    >
      <Share2 size={size === 'sm' ? 14 : 16} />
      {!iconOnly && label}
    </button>
  )
}
