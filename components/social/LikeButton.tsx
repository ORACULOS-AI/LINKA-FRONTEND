'use client'

import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useHasLiked, useLikesCount, useLike } from '@/lib/hooks/useLike'
import type { LikeTargetType } from '@/lib/api/like'

type Props = {
  type: LikeTargetType
  id: string
  /** Override initial values (e.g., from feed payload) to avoid double fetch. */
  initialLiked?: boolean
  initialCount?: number
  size?: 'sm' | 'md'
  showCount?: boolean
  className?: string
  disabled?: boolean
}

export function LikeButton({
  type,
  id,
  initialLiked,
  initialCount,
  size = 'md',
  showCount = true,
  className,
  disabled,
}: Props) {
  const { data: liked = initialLiked ?? false } = useHasLiked(type, id, !disabled)
  const { data: count = initialCount ?? 0 } = useLikesCount(type, id, showCount && !disabled)
  const mut = useLike(type, id)

  const onClick = () => {
    if (disabled || mut.isPending) return
    mut.mutate(liked)
  }

  return (
    <button
      type="button"
      aria-pressed={liked}
      aria-label={liked ? 'Descurtir' : 'Curtir'}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md transition-colors',
        size === 'sm' ? 'h-8 px-2 text-sm' : 'h-9 px-3 text-sm',
        'text-[var(--color-fg-2)] hover:bg-[var(--color-surface-2)]',
        disabled && 'cursor-not-allowed opacity-60',
        className,
      )}
    >
      <Heart
        className={cn(
          'h-4 w-4 transition-transform',
          liked && 'fill-[var(--color-mint)] text-[var(--color-mint)] scale-110',
        )}
      />
      {showCount && <span className="tabular-nums">{count}</span>}
    </button>
  )
}
