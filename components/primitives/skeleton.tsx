import { cn } from '@/lib/utils'

type SkeletonProps = React.HTMLAttributes<HTMLDivElement>

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={cn(
        'animate-pulse rounded-md bg-[var(--color-surface-2)]',
        className,
      )}
      {...props}
    />
  )
}

type SkeletonAvatarProps = {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const AVATAR_SIZE: Record<NonNullable<SkeletonAvatarProps['size']>, string> = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-14 w-14',
  xl: 'h-20 w-20',
}

export function SkeletonAvatar({ size = 'md', className }: SkeletonAvatarProps) {
  return <Skeleton className={cn('rounded-full', AVATAR_SIZE[size], className)} />
}

type SkeletonCardProps = {
  showAvatar?: boolean
  lines?: number
  className?: string
}

export function SkeletonCard({ showAvatar = true, lines = 2, className }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        {showAvatar && <SkeletonAvatar size="md" />}
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/3" />
          {Array.from({ length: lines }).map((_, i) => (
            <Skeleton
              key={i}
              className={cn('h-3', i === lines - 1 ? 'w-2/3' : 'w-full')}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

type SkeletonListProps = {
  count?: number
  showAvatar?: boolean
  lines?: number
  className?: string
}

export function SkeletonList({ count = 5, showAvatar, lines, className }: SkeletonListProps) {
  return (
    <div className={cn('space-y-3', className)} role="status" aria-label="Carregando">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} showAvatar={showAvatar} lines={lines} />
      ))}
    </div>
  )
}

export function SkeletonText({ width = 'w-full', className }: { width?: string; className?: string }) {
  return <Skeleton className={cn('h-4', width, className)} />
}
