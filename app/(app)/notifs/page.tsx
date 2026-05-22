'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Settings2, CheckCheck, MoreVertical, Bell,
  UserPlus, MessageCircle, Calendar, FlaskConical, Briefcase,
  Lightbulb, BadgeCheck, XCircle, Heart, Check, X,
} from 'lucide-react'
import { fetchNotifications, markAllRead, markRead, type NotifPage, type Notif as Notification } from '@/lib/api/notifications'
import { acceptInitiativeInvite, rejectInitiativeInvite } from '@/lib/api/initiatives'
import { followUser } from '@/lib/api/connections'
import { useEnum } from '@/lib/hooks/useEnum'
import { EmptyState, SkeletonList } from '@/components/primitives'
import { toast, toastApiError } from '@/lib/toast'
import { cn } from '@/lib/utils'

type NotifTipoIcon = {
  Icon: typeof Bell
  cls: string
}

const TIPO_ICONS: Record<string, NotifTipoIcon> = {
  NOVO_FOLLOWER: { Icon: UserPlus, cls: 'blue' },
  NOVA_MENSAGEM: { Icon: MessageCircle, cls: 'purple' },
  NOVA_CONVERSA: { Icon: MessageCircle, cls: 'purple' },
  EVENTO_APROVADO: { Icon: Calendar, cls: 'orange' },
  EVENTO_PUBLICADO: { Icon: Calendar, cls: 'orange' },
  EVENTO_PROXIMO: { Icon: Calendar, cls: 'orange' },
  LAB_CLAIM_APROVADO: { Icon: BadgeCheck, cls: 'mint' },
  LAB_CLAIM_RECUSADO: { Icon: XCircle, cls: 'red' },
  BUSINESS_CLAIM_APROVADO: { Icon: BadgeCheck, cls: 'mint' },
  LAB_APROVADO: { Icon: FlaskConical, cls: 'blue' },
  NEGOCIO_APROVADO: { Icon: Briefcase, cls: 'purple' },
  INICIATIVA_APROVADA: { Icon: Lightbulb, cls: 'mint' },
  NOVO_CONVITE_INICIATIVA: { Icon: Lightbulb, cls: 'mint' },
  LIKE_CREATED: { Icon: Heart, cls: 'red' },
  SHARE_CREATED: { Icon: BadgeCheck, cls: 'blue' },
}

type NotifFilter = 'todas' | 'naolida' | string

function NotifActions({ n }: { n: Notification }) {
  const qc = useQueryClient()
  const data = (n.data ?? {}) as Record<string, string | undefined>

  // Convite de iniciativa — aceitar/recusar inline
  const acceptM = useMutation({
    mutationFn: () => acceptInitiativeInvite(String(data.iniciativa_uid ?? data.iniciativa_id ?? '')),
    onSuccess: () => {
      toast.success('Convite aceito')
      qc.invalidateQueries({ queryKey: ['notifications'] })
    },
    onError: (e) => toastApiError(e, 'Não foi possível aceitar.'),
  })
  const rejectM = useMutation({
    mutationFn: () => rejectInitiativeInvite(String(data.iniciativa_uid ?? data.iniciativa_id ?? '')),
    onSuccess: () => {
      toast.success('Convite recusado')
      qc.invalidateQueries({ queryKey: ['notifications'] })
    },
    onError: (e) => toastApiError(e, 'Não foi possível recusar.'),
  })
  const followBackM = useMutation({
    mutationFn: () => followUser(String(data.follower_uid ?? data.from_uid ?? '')),
    onSuccess: () => toast.success('Seguindo de volta'),
    onError: (e) => toastApiError(e, 'Não foi possível seguir.'),
  })

  switch (n.tipo) {
    case 'NOVO_CONVITE_INICIATIVA':
      return (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); acceptM.mutate() }}
            disabled={acceptM.isPending}
            className="inline-flex h-7 items-center gap-1 rounded-md bg-[var(--color-mint-15)] px-2 text-[12px] font-medium text-[var(--color-mint)] hover:bg-[var(--color-mint)] hover:text-[var(--color-on-dark-1)]"
          >
            <Check size={12} /> Aceitar
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); rejectM.mutate() }}
            disabled={rejectM.isPending}
            className="inline-flex h-7 items-center gap-1 rounded-md border border-[var(--color-border)] px-2 text-[12px] text-[var(--color-fg-3)] hover:bg-[var(--color-surface-2)]"
          >
            <X size={12} /> Recusar
          </button>
          {data.iniciativa_uid && (
            <Link
              href={`/vitrine/projetos/${data.iniciativa_uid}`}
              onClick={(e) => e.stopPropagation()}
              className="text-[12px] font-semibold text-[var(--color-purple)]"
            >
              Ver projeto
            </Link>
          )}
        </>
      )
    case 'NOVA_MENSAGEM':
    case 'NOVA_CONVERSA':
      return (
        <Link
          href={data.thread_id ? `/mensagens?thread=${data.thread_id}` : '/mensagens'}
          onClick={(e) => e.stopPropagation()}
          className="text-[12px] font-semibold text-[var(--color-purple)]"
        >
          Responder
        </Link>
      )
    case 'NOVO_FOLLOWER': {
      const followerUid = data.follower_uid ?? data.from_uid
      return (
        <>
          {followerUid && (
            <Link
              href={`/perfil/${followerUid}`}
              onClick={(e) => e.stopPropagation()}
              className="text-[12px] font-semibold text-[var(--color-blue)]"
            >
              Ver perfil
            </Link>
          )}
          {followerUid && (
            <button
              onClick={(e) => { e.stopPropagation(); followBackM.mutate() }}
              disabled={followBackM.isPending}
              className="text-[12px] font-semibold text-[var(--color-mint)]"
            >
              Seguir de volta
            </button>
          )}
        </>
      )
    }
    case 'LAB_CLAIM_APROVADO':
    case 'LAB_APROVADO':
      return data.lab_uid ? (
        <Link
          href={`/vitrine/laboratorios/${data.lab_uid}`}
          onClick={(e) => e.stopPropagation()}
          className="text-[12px] font-semibold text-[var(--color-blue)]"
        >
          Ver laboratório
        </Link>
      ) : null
    case 'BUSINESS_CLAIM_APROVADO':
    case 'NEGOCIO_APROVADO':
      return data.negocio_id ? (
        <Link
          href={`/vitrine/negocios/${data.negocio_id}`}
          onClick={(e) => e.stopPropagation()}
          className="text-[12px] font-semibold text-[var(--color-purple)]"
        >
          Ver negócio
        </Link>
      ) : null
    case 'INICIATIVA_APROVADA':
      return data.iniciativa_uid ? (
        <Link
          href={`/vitrine/projetos/${data.iniciativa_uid}`}
          onClick={(e) => e.stopPropagation()}
          className="text-[12px] font-semibold text-[var(--color-mint)]"
        >
          Ver projeto
        </Link>
      ) : null
    case 'EVENTO_APROVADO':
      return data.event_id ? (
        <Link
          href={`/eventos/${data.event_id}/painel`}
          onClick={(e) => e.stopPropagation()}
          className="text-[12px] font-semibold text-[var(--color-orange)]"
        >
          Publicar agora
        </Link>
      ) : null
    case 'EVENTO_PUBLICADO':
    case 'EVENTO_PROXIMO':
      return data.event_id ? (
        <Link
          href={`/vitrine/eventos/${data.event_id}`}
          onClick={(e) => e.stopPropagation()}
          className="text-[12px] font-semibold text-[var(--color-orange)]"
        >
          Ver evento
        </Link>
      ) : null
    default:
      return null
  }
}

function NotifPageRow({ n, onRead }: { n: Notification; onRead: () => void }) {
  const ico = TIPO_ICONS[n.tipo] ?? { Icon: Bell, cls: 'blue' }
  const Ic = ico.Icon
  return (
    <div
      className={cn('notif-page-row', !n.lida && 'unread')}
      style={{ borderBottom: '1px solid var(--color-border)' }}
      onClick={onRead}
    >
      <div className={`icon-wrap ${ico.cls}`}>
        <Ic size={18} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ font: '500 14px var(--font-body)', lineHeight: 1.5 }}>
          <b>{n.titulo ?? n.tipo}</b>
        </div>
        <div style={{ fontSize: 13, color: 'var(--color-fg-2)', marginTop: 4, lineHeight: 1.5 }}>
          {n.mensagem ?? ''}
        </div>
        <div className="row" style={{ gap: 10, marginTop: 8, fontSize: 12, color: 'var(--color-fg-3)', flexWrap: 'wrap' }}>
          <span>{new Date(n.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
          <NotifActions n={n} />
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
