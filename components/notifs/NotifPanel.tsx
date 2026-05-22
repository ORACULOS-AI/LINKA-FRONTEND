'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Bell, Check } from 'lucide-react'
import { fetchNotifications, markAllRead, markRead, type Notif } from '@/lib/api/notifications'
import { iconFor, colorFor } from './NotifIcon'
import { timeAgo } from '@/lib/format'
import { cn } from '@/lib/utils'

type Props = { onClose: () => void }

export function NotifPanel({ onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', 'panel'],
    queryFn: () => fetchNotifications({ limit: 15 }),
  })

  const readM = useMutation({
    mutationFn: markRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const allM = useMutation({
    mutationFn: markAllRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [onClose])

  return (
    <div
      ref={ref}
      className="absolute right-0 top-12 z-40 w-[360px] rounded-lg border border-border bg-surface shadow-xl"
    >
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="font-display font-semibold">Notificações</h3>
        <button
          type="button"
          onClick={() => allM.mutate()}
          className="flex items-center gap-1 text-xs text-blue hover:underline"
        >
          <Check className="h-3 w-3" /> Marcar todas
        </button>
      </header>

      <div className="max-h-[480px] overflow-y-auto">
        {isLoading ? (
          <div className="p-6 text-center text-sm text-fg-3">Carregando…</div>
        ) : data && data.items.length > 0 ? (
          <ul>
            {data.items.map((n) => (
              <NotifRow
                key={n.id}
                notif={n}
                onRead={() => { if (!n.lida) readM.mutate(n.id) }}
              />
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center gap-2 p-10 text-center text-sm text-fg-3">
            <Bell className="h-8 w-8 text-fg-4" />
            <p>Sem notificações por enquanto.</p>
          </div>
        )}
      </div>

      <footer className="border-t border-border px-4 py-2 text-center">
        <Link href="/notifs" onClick={onClose} className="text-sm text-blue hover:underline">
          Ver todas
        </Link>
      </footer>
    </div>
  )
}

export function NotifRow({ notif, onRead, onClick }: { notif: Notif; onRead?: () => void; onClick?: () => void }) {
  const Icon = iconFor(notif.tipo)
  const color = colorFor(notif.tipo)

  return (
    <li>
      <button
        type="button"
        onClick={() => { onRead?.(); onClick?.() }}
        className={cn(
          'flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-surface-2',
          !notif.lida && 'bg-mint/5',
        )}
      >
        <span className={cn('mt-0.5 rounded-full bg-surface p-2', color)}>
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-fg-1">{notif.titulo}</p>
          {notif.mensagem && (
            <p className="line-clamp-2 text-xs text-fg-3">{notif.mensagem}</p>
          )}
          <p className="mt-0.5 text-[11px] text-fg-4">{timeAgo(notif.created_at)}</p>
        </div>
        {!notif.lida && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-purple" aria-label="Não lida" />}
      </button>
    </li>
  )
}
