'use client'

import { useState, useEffect, useRef } from 'react'
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Settings2, CheckCheck, MoreVertical, Bell } from 'lucide-react'
import { fetchNotifications, markAllRead, markRead, type NotifPage, type Notif as Notification } from '@/lib/api/notifications'
import { useEnum } from '@/lib/hooks/useEnum'
import { EmptyState, SkeletonList } from '@/components/primitives'
import { cn } from '@/lib/utils'

type NotifFilter = 'todas' | 'naolida' | string

function NotifPageRow({ n, onRead }: { n: Notification; onRead: () => void }) {
  return (
    <div
      className={cn('notif-page-row', !n.lida && 'unread')}
      style={{ borderBottom: '1px solid var(--color-border)' }}
      onClick={onRead}
    >
      <div className="icon-wrap blue">
        <Bell size={18} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ font: '500 14px var(--font-body)', lineHeight: 1.5 }}>
          <b>{n.titulo ?? n.tipo}</b>
        </div>
        <div style={{ fontSize: 13, color: 'var(--color-fg-2)', marginTop: 4, lineHeight: 1.5 }}>
          {n.mensagem ?? ''}
        </div>
        <div className="row" style={{ gap: 14, marginTop: 8, fontSize: 12, color: 'var(--color-fg-3)' }}>
          <span>{new Date(n.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
          {n.tipo === 'conexao_aceita' && (
            <a style={{ fontWeight: 600, cursor: 'pointer' }}>Enviar mensagem</a>
          )}
          {n.tipo === 'evento' && (
            <a style={{ fontWeight: 600, cursor: 'pointer' }}>Confirmar presença</a>
          )}
          {n.tipo === 'claim_aprovado' && (
            <a style={{ fontWeight: 600, cursor: 'pointer' }}>Ver laboratório</a>
          )}
        </div>
      </div>
      <button className="btn-icon" onClick={e => e.stopPropagation()}>
        <MoreVertical size={16} />
      </button>
    </div>
  )
}

export default function NotifsPage() {
  const qc = useQueryClient()
  const sentinelRef = useRef<HTMLDivElement>(null)
  const [filter, setFilter] = useState<NotifFilter>('todas')

  const q = useInfiniteQuery({
    queryKey: ['notifications', 'all'],
    queryFn: ({ pageParam }: { pageParam: string | null | undefined }): Promise<NotifPage> =>
      fetchNotifications({ cursor: pageParam ?? null, limit: 30 }),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => (last.has_more ? last.next_cursor : undefined),
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
    const el = sentinelRef.current
    if (!el) return
    const io = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && q.hasNextPage && !q.isFetchingNextPage) q.fetchNextPage()
    }, { rootMargin: '300px' })
    io.observe(el)
    return () => io.disconnect()
  }, [q])

  const tiposEnum = useEnum('tipo_notificacao')
  const allItems = q.data?.pages.flatMap((p) => p.items) ?? []
  const unread = allItems.filter(n => !n.lida)

  const filtered = allItems.filter(n => {
    if (filter === 'naolida') return !n.lida
    if (filter === 'todas') return true
    return n.tipo === filter
  })

  return (
    <div className="page page-narrow fade-in">
      <div className="page-header">
        <div>
          <h1>Notificações</h1>
          <div className="sub">Tudo que aconteceu envolvendo você e os projetos que você acompanha.</div>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn btn-tertiary btn-sm">
            <Settings2 size={14} />Preferências
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => allM.mutate()}>
            <CheckCheck size={14} />Marcar tudo como lido
          </button>
        </div>
      </div>

      <div className="tabs-bar">
        {[
          { id: 'todas', l: `Todas · ${allItems.length}` },
          { id: 'naolida', l: `Não lidas · ${unread.length}` },
          ...tiposEnum.map((t) => ({ id: t.value, l: t.label })),
        ].map(t => (
          <button key={t.id} className={cn('tab', filter === t.id && 'active')} onClick={() => setFilter(t.id)}>
            {t.l}
          </button>
        ))}
      </div>

      {q.isLoading ? (
        <SkeletonList count={4} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Bell size={24} />}
          title="Tudo em dia"
          description="Você não tem notificações neste filtro."
        />
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          {filtered.map((n) => (
            <NotifPageRow
              key={n.id}
              n={n}
              onRead={() => { if (!n.lida) readM.mutate(n.id) }}
            />
          ))}
          <div ref={sentinelRef} />
          {q.isFetchingNextPage && (
            <div style={{ padding: '12px 0', textAlign: 'center', fontSize: 12, color: 'var(--color-fg-3)' }}>
              Carregando mais…
            </div>
          )}
        </div>
      )}
    </div>
  )
}
