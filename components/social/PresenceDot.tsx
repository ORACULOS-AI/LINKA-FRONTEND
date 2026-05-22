'use client'

import { useQuery } from '@tanstack/react-query'
import { getPresenceMap } from '@/lib/api/presence'
import { cn } from '@/lib/utils'

type Props = {
  uid: string
  size?: number
  className?: string
}

/**
 * Bolinha de presença (online/offline) para sobrepor um Avatar.
 * Faz batch automático: 60s de staleTime + dedupe natural por queryKey.
 */
export function PresenceDot({ uid, size = 10, className }: Props) {
  const q = useQuery({
    queryKey: ['presence', uid],
    queryFn: () => getPresenceMap([uid]),
    staleTime: 60_000,
    refetchInterval: 90_000,
  })
  const online = q.data?.[uid] === true
  return (
    <span
      title={online ? 'Online' : 'Offline'}
      aria-label={online ? 'online' : 'offline'}
      className={cn(
        'inline-block rounded-full ring-2 ring-[var(--color-surface)]',
        online ? 'bg-[var(--color-mint)]' : 'bg-[var(--color-fg-4)]',
        className,
      )}
      style={{ width: size, height: size }}
    />
  )
}

/**
 * Versão em lote — usa um único request para vários UIDs.
 * Util em listas (mensagens, conexões).
 */
export function PresenceDotBulk({
  uid,
  presenceMap,
  size = 10,
  className,
}: {
  uid: string
  presenceMap: Record<string, boolean> | undefined
  size?: number
  className?: string
}) {
  const online = presenceMap?.[uid] === true
  return (
    <span
      title={online ? 'Online' : 'Offline'}
      className={cn(
        'inline-block rounded-full ring-2 ring-[var(--color-surface)]',
        online ? 'bg-[var(--color-mint)]' : 'bg-[var(--color-fg-4)]',
        className,
      )}
      style={{ width: size, height: size }}
    />
  )
}
