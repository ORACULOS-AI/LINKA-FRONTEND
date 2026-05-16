import Link from 'next/link'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type EmptyStateAction = {
  label: string
  href?: string
  onClick?: () => void
}

type EmptyStateProps = {
  icon?: ReactNode
  title: string
  description?: string
  action?: EmptyStateAction
  secondary?: EmptyStateAction
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondary,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-12 text-center',
        className,
      )}
    >
      {icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-surface-2)] text-[var(--color-fg-3)]">
          {icon}
        </div>
      )}
      <h3 className="font-display text-lg font-semibold text-[var(--color-fg-1)]">
        {title}
      </h3>
      {description && (
        <p className="max-w-md text-sm text-[var(--color-fg-3)]">{description}</p>
      )}
      {(action || secondary) && (
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
          {action && <ActionButton action={action} variant="primary" />}
          {secondary && <ActionButton action={secondary} variant="ghost" />}
        </div>
      )}
    </div>
  )
}

function ActionButton({
  action,
  variant,
}: {
  action: EmptyStateAction
  variant: 'primary' | 'ghost'
}) {
  const classes = cn(
    'inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium transition-colors',
    variant === 'primary'
      ? 'bg-[var(--color-ink)] text-[var(--color-on-dark-1)] hover:opacity-90'
      : 'border border-[var(--color-border)] bg-transparent text-[var(--color-fg-1)] hover:bg-[var(--color-surface-2)]',
  )

  if (action.href) {
    return (
      <Link href={action.href} className={classes}>
        {action.label}
      </Link>
    )
  }
  return (
    <button type="button" onClick={action.onClick} className={classes}>
      {action.label}
    </button>
  )
}
