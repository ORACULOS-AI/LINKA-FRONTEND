'use client'

import { UserPlus, UserMinus, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  useFollow,
  useIsFollowing,
  useFollowersCount,
} from '@/lib/hooks/useFollow'
import type { FollowTargetType } from '@/lib/api/follow'

type Props = {
  type: FollowTargetType
  id: string
  size?: 'sm' | 'md'
  showCount?: boolean
  variant?: 'solid' | 'outline'
  className?: string
  /** Disable if the target is "self" (e.g., own profile). */
  disabled?: boolean
}

const SIZE_CLS = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
}

export function FollowButton({
  type,
  id,
  size = 'md',
  showCount,
  variant = 'solid',
  className,
  disabled,
}: Props) {
  const { data: isFollowing = false, isLoading } = useIsFollowing(type, id, !disabled)
  const { data: count } = useFollowersCount(type, id, !!showCount)
  const mut = useFollow(type, id)

  const pending = mut.isPending
  const label = isFollowing ? 'Seguindo' : 'Seguir'
  const Icon = isFollowing ? UserMinus : UserPlus

  const base = cn(
    'inline-flex items-center justify-center rounded-md font-medium transition-colors',
    SIZE_CLS[size],
  )

  // Enquanto o status de follow ainda não chegou, não comprometemos um rótulo:
  // mostramos um estado neutro de carregamento para evitar o flicker "Seguir" → "Seguindo".
  if (isLoading && !disabled) {
    return (
      <button
        type="button"
        disabled
        aria-busy="true"
        aria-label="Carregando"
        className={cn(
          base,
          'border border-[var(--color-border)] bg-transparent text-[var(--color-fg-3)] cursor-progress opacity-70',
          className,
        )}
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>…</span>
      </button>
    )
  }

  const styles = isFollowing
    ? variant === 'solid'
      ? 'border border-[var(--color-border)] bg-transparent text-[var(--color-fg-1)] hover:bg-[var(--color-surface-2)]'
      : 'border border-[var(--color-border)] bg-transparent text-[var(--color-fg-1)] hover:bg-[var(--color-surface-2)]'
    : variant === 'solid'
      ? 'bg-[var(--color-ink)] text-[var(--color-on-dark-1)] hover:opacity-90'
      : 'border border-[var(--color-ink)] bg-transparent text-[var(--color-ink)] hover:bg-[var(--color-surface-2)]'

  return (
    <button
      type="button"
      aria-pressed={isFollowing}
      aria-label={isFollowing ? `Deixar de seguir` : `Seguir`}
      disabled={disabled || pending || isLoading}
      onClick={() => mut.mutate(isFollowing)}
      className={cn(base, styles, (disabled || pending) && 'cursor-not-allowed opacity-60', className)}
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
      <span>{label}</span>
      {showCount && typeof count === 'number' && (
        <span className="ml-1 tabular-nums text-xs opacity-70">{count}</span>
      )}
    </button>
  )
}
