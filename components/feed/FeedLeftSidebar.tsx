'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import {
  Newspaper, Lightbulb, Briefcase, FlaskConical, Calendar,
  PlusCircle, Shield, PenSquare,
} from 'lucide-react'
import { useAuth } from '@/lib/stores/auth'
import { Avatar } from '@/components/ui/avatar'
import { getMyConnectionCount, getFollowCounts } from '@/lib/api/connections'

export const FEED_FILTERS = [
  { id: 'all',      label: 'Tudo',          Icon: Newspaper },
  { id: 'projetos', label: 'Projetos',       Icon: Lightbulb },
  { id: 'negocios', label: 'Negócios',       Icon: Briefcase },
  { id: 'labs',     label: 'Laboratórios',   Icon: FlaskConical },
  { id: 'eventos',  label: 'Eventos',        Icon: Calendar },
]

type Props = {
  /** Filtro ativo. Quando ausente, o sidebar é apenas decorativo (ex.: página de post). */
  filter?: string
  onFilterChange?: (id: string) => void
  onCompose?: () => void
}

export function FeedLeftSidebar({ filter, onFilterChange, onCompose }: Props) {
  const router = useRouter()
  const me = useAuth((s) => s.me)

  const { data: counts } = useQuery({
    queryKey: ['follow-counts', me?.id],
    queryFn: () => getFollowCounts(me!.id),
    enabled: !!me?.id,
  })

  const { data: connectionCount = 0 } = useQuery({
    queryKey: ['my-connection-count', me?.id],
    queryFn: async () => (await getMyConnectionCount(me!.id)) ?? 0,
    enabled: !!me?.id,
    staleTime: 60_000,
  })

  if (!me) return null

  // Laboratório só pode ser cadastrado por pesquisador/admin (backend: check_pesquisador_or_admin).
  const canManageLab = me.tipo === 'pesquisador' || me.is_admin
  const shortcuts = [
    { Icon: PlusCircle,   label: 'Cadastrar negócio',     href: '/vitrine/negocios/novo' },
    ...(canManageLab ? [{ Icon: FlaskConical, label: 'Cadastrar laboratório', href: '/vitrine/laboratorios/novo' }] : []),
    { Icon: Calendar,     label: 'Publicar evento',        href: '/vitrine/eventos/novo' },
    { Icon: Shield,       label: 'Reivindicar entidade',   href: '/reivindicar' },
  ]

  function handleFilter(id: string) {
    if (onFilterChange) onFilterChange(id)
    else router.push('/feed')
  }

  return (
    <aside
      className="col feed-col-left"
      style={{ gap: 16, position: 'sticky', top: 'calc(var(--nav-height-top) + 16px)', maxHeight: 'calc(100vh - var(--nav-height-top) - 32px)', overflowY: 'auto' }}
    >
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ height: 70, background: 'var(--color-purple)', backgroundImage: 'url(/selinka/pattern-mint-on-purple.png)', backgroundSize: 'cover' }} />
        <div className="card-body" style={{ paddingTop: 0, textAlign: 'center' }}>
          <div style={{ marginTop: -32, display: 'inline-block', border: '3px solid #fff', borderRadius: '9999px', lineHeight: 0 }}>
            <Avatar nome={me.nome} src={me.avatar_url ?? undefined} size={64} />
          </div>
          <Link href="/perfil" style={{ display: 'block', font: '700 15px var(--font-display)', marginTop: 10 }}>
            {me.nome}
          </Link>
          <div className="muted" style={{ marginTop: 2 }}>{me.tipo?.replace('_', ' ')}</div>
          <div style={{ borderTop: '1px solid var(--color-border)', margin: '14px -22px' }} />
          <Link href="/conexoes" className="row" style={{ justifyContent: 'space-between', fontSize: 12.5, textDecoration: 'none' }}>
            <span style={{ color: 'var(--color-fg-3)' }}>Conexões</span>
            <span style={{ fontWeight: 700, color: 'var(--color-blue)' }}>{connectionCount}</span>
          </Link>
          <div className="row" style={{ justifyContent: 'space-between', fontSize: 12.5, marginTop: 6 }}>
            <span style={{ color: 'var(--color-fg-3)' }}>Seguidores</span>
            <span style={{ fontWeight: 700, color: 'var(--color-blue)' }}>{counts?.followers ?? 0}</span>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="eyebrow" style={{ marginBottom: 10 }}>Filtros do feed</div>
          <div className="col" style={{ gap: 8 }}>
            {FEED_FILTERS.map(({ id, label, Icon }) => (
              <div
                key={id}
                className="row"
                style={{ gap: 10, padding: '6px 0', cursor: 'pointer', color: filter === id ? 'var(--color-ink)' : 'var(--color-fg-2)' }}
                onClick={() => handleFilter(id)}
              >
                <Icon size={16} />
                <span style={{ fontSize: 13.5, fontWeight: filter === id ? 600 : 500, flex: 1 }}>{label}</span>
                {filter === id && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-mint)' }} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="eyebrow">Atalhos</div>
          <div className="col" style={{ marginTop: 10, gap: 10 }}>
            {shortcuts.map(({ Icon, label, href }) => (
              <Link key={href} href={href} className="row" style={{ gap: 10, fontSize: 13.5, color: 'var(--color-fg-1)' }}>
                <Icon size={16} style={{ color: 'var(--color-fg-3)' }} /> {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Publicar destaque */}
      <button
        className="btn btn-secondary"
        style={{ width: '100%', justifyContent: 'center', gap: 8, borderRadius: 'var(--radius-full)' }}
        onClick={() => (onCompose ? onCompose() : router.push('/feed'))}
      >
        <PenSquare size={16} /> Publicar post
      </button>
    </aside>
  )
}
