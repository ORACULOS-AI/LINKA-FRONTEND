'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Settings2, CheckCheck, Bell, Check, X, Trash2,
  UserPlus, Users, MessageCircle, Calendar, FlaskConical, Briefcase,
  Lightbulb, BadgeCheck, XCircle, Video,
} from 'lucide-react'
import {
  fetchNotifications, markAllRead, markRead, deleteNotif,
  type NotifPage, type Notif as Notification,
} from '@/lib/api/notifications'
import { acceptInitiativeInvite, rejectInitiativeInvite } from '@/lib/api/initiatives'
import { followUser } from '@/lib/api/connections'
import { useEnum } from '@/lib/hooks/useEnum'
import { EmptyState, SkeletonList } from '@/components/primitives'
import { toast, toastApiError } from '@/lib/toast'
import { cn } from '@/lib/utils'

type NotifTipoIcon = { Icon: typeof Bell; cls: string }

// Chaves alinhadas ao enum real do backend (app/schemas/notifications.py:TipoNotificacao).
// Cor segue a paleta de marca por domínio: mint=sucesso, blue=conexão/lab,
// purple=negócio/mensagem, orange=evento/reunião/aviso, red=recusa/remoção.
const TIPO_ICONS: Record<string, NotifTipoIcon> = {
  CONVITE_INICIATIVA:      { Icon: Lightbulb,    cls: 'mint' },
  CONVITE_NEGOCIO:         { Icon: Briefcase,    cls: 'purple' },
  CONVITE_ACEITO:          { Icon: Check,        cls: 'mint' },
  CONVITE_RECUSADO:        { Icon: X,            cls: 'red' },
  NOVO_SEGUIDOR:           { Icon: UserPlus,     cls: 'blue' },
  REMOCAO_INICIATIVA:      { Icon: Lightbulb,    cls: 'orange' },
  REMOCAO_NEGOCIO:         { Icon: Briefcase,    cls: 'orange' },
  NOVO_MEMBRO:             { Icon: Users,        cls: 'mint' },
  INICIATIVA_APROVADA:     { Icon: BadgeCheck,   cls: 'mint' },
  INICIATIVA_RECUSADA:     { Icon: XCircle,      cls: 'red' },
  NEGOCIO_APROVADO:        { Icon: BadgeCheck,   cls: 'mint' },
  NEGOCIO_RECUSADO:        { Icon: XCircle,      cls: 'red' },
  CONVITE_CONEXAO:         { Icon: UserPlus,     cls: 'blue' },
  CONEXAO_ACEITA:          { Icon: Check,        cls: 'mint' },
  CONEXAO_RECUSADA:        { Icon: X,            cls: 'red' },
  NOVA_MENSAGEM:           { Icon: MessageCircle, cls: 'purple' },
  NOVA_CONVERSA:           { Icon: MessageCircle, cls: 'purple' },
  MEETING_CREATED:         { Icon: Video,        cls: 'orange' },
  MEETING_UPDATED:         { Icon: Video,        cls: 'orange' },
  LAB_CLAIM_APROVADO:      { Icon: BadgeCheck,   cls: 'blue' },
  LAB_CLAIM_RECUSADO:      { Icon: XCircle,      cls: 'red' },
  BUSINESS_CLAIM_APROVADO: { Icon: BadgeCheck,   cls: 'mint' },
  BUSINESS_CLAIM_RECUSADO: { Icon: XCircle,      cls: 'red' },
}

type PrimaryFilter = 'todas' | 'naolida'

const linkCls = (color: string) =>
  `text-[12px] font-semibold text-[var(--color-${color})] hover:underline`

function NotifActions({ n }: { n: Notification }) {
  const qc = useQueryClient()
  const data = (n.data ?? {}) as Record<string, string | undefined>
  const iniciativaId = data.iniciativa_uid ?? data.iniciativa_id
  const negocioId = data.negocio_id ?? data.business_id
  const followerId = data.follower_uid ?? data.from_uid ?? data.user_uid

  const acceptM = useMutation({
    mutationFn: () => acceptInitiativeInvite(String(iniciativaId ?? '')),
    onSuccess: () => { toast.success('Convite aceito'); qc.invalidateQueries({ queryKey: ['notifications'] }) },
    onError: (e) => toastApiError(e, 'Não foi possível aceitar.'),
  })
  const rejectM = useMutation({
    mutationFn: () => rejectInitiativeInvite(String(iniciativaId ?? '')),
    onSuccess: () => { toast.success('Convite recusado'); qc.invalidateQueries({ queryKey: ['notifications'] }) },
    onError: (e) => toastApiError(e, 'Não foi possível recusar.'),
  })
  const followBackM = useMutation({
    mutationFn: () => followUser(String(followerId ?? '')),
    onSuccess: () => toast.success('Seguindo de volta'),
    onError: (e) => toastApiError(e, 'Não foi possível seguir.'),
  })

  switch (n.tipo) {
    case 'CONVITE_INICIATIVA':
      return (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); acceptM.mutate() }}
            disabled={acceptM.isPending || !iniciativaId}
            className="inline-flex h-7 items-center gap-1 rounded-md bg-[var(--color-mint-15)] px-2 text-[12px] font-medium text-[var(--color-mint)] hover:opacity-90 disabled:opacity-40"
          >
            <Check size={12} /> Aceitar
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); rejectM.mutate() }}
            disabled={rejectM.isPending || !iniciativaId}
            className="inline-flex h-7 items-center gap-1 rounded-md border border-[var(--color-border)] px-2 text-[12px] text-[var(--color-fg-3)] hover:bg-[var(--color-surface-2)] disabled:opacity-40"
          >
            <X size={12} /> Recusar
          </button>
        </>
      )
    case 'CONVITE_ACEITO':
    case 'CONVITE_RECUSADO':
    case 'NOVO_MEMBRO':
    case 'INICIATIVA_APROVADA':
    case 'INICIATIVA_RECUSADA':
    case 'REMOCAO_INICIATIVA':
      return iniciativaId ? (
        <Link href={`/vitrine/projetos/${iniciativaId}`} onClick={(e) => e.stopPropagation()} className={linkCls('mint')}>
          Ver projeto
        </Link>
      ) : null
    case 'CONVITE_NEGOCIO':
    case 'NEGOCIO_APROVADO':
    case 'NEGOCIO_RECUSADO':
    case 'REMOCAO_NEGOCIO':
    case 'BUSINESS_CLAIM_APROVADO':
    case 'BUSINESS_CLAIM_RECUSADO':
      return negocioId ? (
        <Link href={`/vitrine/negocios/${negocioId}`} onClick={(e) => e.stopPropagation()} className={linkCls('purple')}>
          Ver negócio
        </Link>
      ) : null
    case 'LAB_CLAIM_APROVADO':
    case 'LAB_CLAIM_RECUSADO':
      return data.lab_uid ? (
        <Link href={`/vitrine/laboratorios/${data.lab_uid}`} onClick={(e) => e.stopPropagation()} className={linkCls('blue')}>
          Ver laboratório
        </Link>
      ) : null
    case 'NOVA_MENSAGEM':
    case 'NOVA_CONVERSA':
      return (
        <Link
          href={data.thread_id ? `/mensagens?thread=${data.thread_id}` : '/mensagens'}
          onClick={(e) => e.stopPropagation()}
          className={linkCls('purple')}
        >
          Responder
        </Link>
      )
    case 'MEETING_CREATED':
    case 'MEETING_UPDATED':
      return (
        <Link href="/reunioes" onClick={(e) => e.stopPropagation()} className={linkCls('orange')}>
          Ver reunião
        </Link>
      )
    case 'NOVO_SEGUIDOR':
    case 'CONVITE_CONEXAO':
    case 'CONEXAO_ACEITA':
    case 'CONEXAO_RECUSADA':
      return (
        <>
          {followerId && (
            <Link href={`/perfil/${followerId}`} onClick={(e) => e.stopPropagation()} className={linkCls('blue')}>
              Ver perfil
            </Link>
          )}
          {followerId && (n.tipo === 'NOVO_SEGUIDOR' || n.tipo === 'CONVITE_CONEXAO') && (
            <button
              onClick={(e) => { e.stopPropagation(); followBackM.mutate() }}
              disabled={followBackM.isPending}
              className={cn(linkCls('mint'), 'disabled:opacity-40')}
            >
              Seguir de volta
            </button>
          )}
        </>
      )
    default:
      return null
  }
}

function NotifPageRow({ n, onRead, onDelete }: { n: Notification; onRead: () => void; onDelete: () => void }) {
  const ico = TIPO_ICONS[n.tipo] ?? { Icon: Bell, cls: 'blue' }
  const Ic = ico.Icon
  return (
    <div className={cn('notif-page-row', !n.lida && 'unread')} onClick={onRead}>
      {!n.lida && <span className="notif-dot" aria-hidden />}
      <div className={`icon-wrap ${ico.cls}`}>
        <Ic size={18} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ font: '600 14px var(--font-body)', lineHeight: 1.45, color: 'var(--color-fg-1)' }}>
          {n.titulo ?? n.tipo}
        </div>
        {n.mensagem && (
          <div style={{ fontSize: 13, color: 'var(--color-fg-2)', marginTop: 3, lineHeight: 1.45 }}>
            {n.mensagem}
          </div>
        )}
        <div className="row" style={{ gap: 12, marginTop: 8, fontSize: 12, color: 'var(--color-fg-3)', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>
            {new Date(n.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
          </span>
          <NotifActions n={n} />
        </div>
      </div>
      <button
        className="btn-icon notif-del"
        title="Remover notificação"
        onClick={(e) => { e.stopPropagation(); onDelete() }}
      >
        <Trash2 size={15} />
      </button>
    </div>
  )
}

export default function NotifsPage() {
  const qc = useQueryClient()
  const sentinelRef = useRef<HTMLDivElement>(null)
  const [primary, setPrimary] = useState<PrimaryFilter>('todas')
  const [tipo, setTipo] = useState<string>('')

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
    onSuccess: () => { toast.success('Tudo marcado como lido'); qc.invalidateQueries({ queryKey: ['notifications'] }) },
  })
  const delM = useMutation({
    mutationFn: deleteNotif,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
    onError: (e) => toastApiError(e, 'Não foi possível remover.'),
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
  const unreadCount = allItems.filter((n) => !n.lida).length

  const filtered = allItems.filter((n) => {
    if (primary === 'naolida' && n.lida) return false
    if (tipo && n.tipo !== tipo) return false
    return true
  })

  return (
    <div className="page page-narrow fade-in">
      <div className="page-header">
        <div>
          <h1>Notificações</h1>
          <div className="sub">Tudo que aconteceu envolvendo você e os projetos que você acompanha.</div>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <Link href="/configuracoes?tab=notificacoes" className="btn btn-tertiary btn-sm">
            <Settings2 size={14} />Preferências
          </Link>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => allM.mutate()}
            disabled={unreadCount === 0 || allM.isPending}
          >
            <CheckCheck size={14} />Marcar tudo como lido
          </button>
        </div>
      </div>

      {/* Filtros: visão (segmented) + tipo (dropdown). Substitui a antiga barra
          de ~20 abas que estourava a largura horizontal. */}
      <div className="notif-toolbar">
        <div className="seg" role="tablist">
          <button
            role="tab"
            className={cn('seg-item', primary === 'todas' && 'active')}
            onClick={() => setPrimary('todas')}
          >
            Todas <span className="seg-count">{allItems.length}</span>
          </button>
          <button
            role="tab"
            className={cn('seg-item', primary === 'naolida' && 'active')}
            onClick={() => setPrimary('naolida')}
          >
            Não lidas <span className="seg-count">{unreadCount}</span>
          </button>
        </div>
        <select
          className="select notif-tipo"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          aria-label="Filtrar por tipo"
        >
          <option value="">Todos os tipos</option>
          {tiposEnum.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      {q.isLoading ? (
        <SkeletonList count={5} showAvatar />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Bell size={24} />}
          title="Tudo em dia"
          description={
            primary === 'naolida'
              ? 'Você não tem notificações não lidas.'
              : tipo
                ? 'Nenhuma notificação deste tipo por aqui.'
                : 'Quando algo acontecer envolvendo você, aparece aqui.'
          }
        />
      ) : (
        <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
          {filtered.map((n) => (
            <NotifPageRow
              key={n.id}
              n={n}
              onRead={() => { if (!n.lida) readM.mutate(n.id) }}
              onDelete={() => delM.mutate(n.id)}
            />
          ))}
          <div ref={sentinelRef} />
          {q.isFetchingNextPage && (
            <div style={{ padding: '14px 0', textAlign: 'center', fontSize: 12, color: 'var(--color-fg-3)' }}>
              Carregando…
            </div>
          )}
        </div>
      )}
    </div>
  )
}
