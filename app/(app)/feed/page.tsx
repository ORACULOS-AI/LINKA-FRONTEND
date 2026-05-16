'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import {
  Newspaper, Lightbulb, Briefcase, FlaskConical, Calendar,
  PlusCircle, Shield, ArrowDownUp, UserPlus,
} from 'lucide-react'
import { useAuth } from '@/lib/stores/auth'
import { FeedTimeline } from '@/components/feed/FeedTimeline'
import { PostComposer } from '@/components/feed/PostComposer'
import { fetchShowcaseEventos } from '@/lib/api/showcase'
import { getSuggestions, getMyConnectionCount, sendConnectionRequest, getFollowCounts } from '@/lib/api/connections'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const FEED_FILTERS = [
  { id: 'all',      label: 'Tudo',          Icon: Newspaper },
  { id: 'projetos', label: 'Projetos',       Icon: Lightbulb },
  { id: 'negocios', label: 'Negócios',       Icon: Briefcase },
  { id: 'labs',     label: 'Laboratórios',   Icon: FlaskConical },
  { id: 'eventos',  label: 'Eventos',        Icon: Calendar },
]

const SHORTCUTS = [
  { Icon: PlusCircle,   label: 'Cadastrar negócio',    href: '/negocios/novo' },
  { Icon: FlaskConical, label: 'Cadastrar laboratório', href: '/laboratorios/novo' },
  { Icon: Calendar,     label: 'Publicar evento',       href: '/eventos/novo' },
  { Icon: Shield,       label: 'Reivindicar entidade',  href: '/reivindicar' },
]

function daysUntil(dateStr: string): number {
  return Math.max(0, Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86_400_000))
}

function getInitials(nome: string) {
  return nome.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

export default function FeedPage() {
  const me = useAuth((s) => s.me)
  const [composerOpen, setComposerOpen] = useState(false)
  const [filter, setFilter] = useState('all')

  const { data: counts } = useQuery({
    queryKey: ['follow-counts', me?.id],
    queryFn: () => getFollowCounts(me!.id),
    enabled: !!me?.id,
  })

  const { data: connectionCount = 0 } = useQuery({
    queryKey: ['my-connection-count'],
    queryFn: async () => (await getMyConnectionCount()) ?? 0,
    enabled: !!me,
    staleTime: 60_000,
  })

  const { data: eventos = [] } = useQuery({
    queryKey: ['showcase', 'eventos', 3],
    queryFn: async () => {
      const list = await fetchShowcaseEventos(3)
      return Array.isArray(list) ? list : []
    },
    staleTime: 5 * 60_000,
  })

  const { data: sugestoes = [] } = useQuery({
    queryKey: ['connections', 'suggestions'],
    queryFn: async () => {
      const list = await getSuggestions(3)
      return Array.isArray(list) ? list : []
    },
    staleTime: 2 * 60_000,
  })

  if (!me) return null

  const firstName = me.nome.split(' ')[0]
  const initials = getInitials(me.nome)

  return (
    <div className="page fade-in">
      <div className="grid-feed-3">

        {/* Left sidebar: mini-profile + filters + shortcuts */}
        <aside className="col" style={{ gap: 16 }}>
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ height: 70, background: 'var(--color-purple)', backgroundImage: 'url(/selinka/pattern-mint-on-purple.png)', backgroundSize: 'cover' }} />
            <div className="card-body" style={{ paddingTop: 0, textAlign: 'center' }}>
              <div
                className="avatar"
                style={{ width: 64, height: 64, marginTop: -32, fontSize: 22, border: '3px solid #fff', background: 'var(--color-purple)', color: '#fff' }}
              >
                {initials}
              </div>
              <Link href="/perfil" style={{ display: 'block', font: '700 15px var(--font-display)', marginTop: 10 }}>
                {me.nome}
              </Link>
              <div className="muted" style={{ marginTop: 2 }}>{me.tipo?.replace('_', ' ')}</div>
              <div style={{ borderTop: '1px solid var(--color-border)', margin: '14px -22px' }} />
              <div className="row" style={{ justifyContent: 'space-between', fontSize: 12.5 }}>
                <span style={{ color: 'var(--color-fg-3)' }}>Conexões</span>
                <span style={{ fontWeight: 700, color: 'var(--color-blue)' }}>{connectionCount}</span>
              </div>
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
                    onClick={() => setFilter(id)}
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
                {SHORTCUTS.map(({ Icon, label, href }) => (
                  <Link key={href} href={href} className="row" style={{ gap: 10, fontSize: 13.5, color: 'var(--color-fg-1)' }}>
                    <Icon size={16} style={{ color: 'var(--color-fg-3)' }} /> {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Center: composer + timeline */}
        <main className="col" style={{ gap: 14 }}>
          <div className="compose-card">
            <div className="top">
              <div className="avatar" style={{ width: 44, height: 44, background: 'var(--color-purple)', color: '#fff', fontSize: 16 }}>
                {initials}
              </div>
              <div className="stub" onClick={() => setComposerOpen(true)}>
                Compartilhe uma novidade, {firstName}…
              </div>
            </div>
            <div className="actions">
              <button className="compose-act mint" onClick={() => setComposerOpen(true)}>
                <Lightbulb size={16} /> Vincular projeto
              </button>
              <button className="compose-act orange" onClick={() => setComposerOpen(true)}>
                <Calendar size={16} /> Evento
              </button>
              <button className="compose-act purple" onClick={() => setComposerOpen(true)}>
                <Briefcase size={16} /> Negócio
              </button>
            </div>
          </div>

          <div className="row" style={{ justifyContent: 'space-between', padding: '8px 4px 0' }}>
            <div className="eyebrow">Feed cronológico</div>
            <button className="btn btn-ghost btn-sm" style={{ padding: '4px 8px' }}>
              <ArrowDownUp size={13} /> Mais recentes
            </button>
          </div>

          <FeedTimeline emptyText="Seu feed está vazio. Siga colegas para ver posts aqui." />
        </main>

        {/* Right sidebar: events + suggestions */}
        <aside className="col" style={{ gap: 16 }}>
          <div className="card">
            <div className="card-body">
              <div className="row" style={{ justifyContent: 'space-between', marginBottom: 6 }}>
                <div className="eyebrow">Eventos próximos</div>
                <Link href="/eventos" style={{ fontSize: 12, color: 'var(--color-fg-3)' }}>Agenda →</Link>
              </div>
              {eventos.length === 0 ? (
                <p style={{ fontSize: 13, color: 'var(--color-fg-3)', marginTop: 10 }}>Nenhum evento próximo.</p>
              ) : (
                <div className="col" style={{ gap: 12, marginTop: 10 }}>
                  {eventos.map((ev) => {
                    const days = daysUntil(ev.data_inicio)
                    const dateStr = new Date(ev.data_inicio).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
                    return (
                      <Link key={ev.uid} href={`/eventos/${ev.uid}`} className="row" style={{ gap: 12 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'var(--color-orange-15)', color: '#8c5500', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
                          <Calendar size={18} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.titulo}</div>
                          <div className="muted" style={{ marginTop: 2 }}>{dateStr}{days > 0 ? ` · em ${days} dias` : ' · hoje'}</div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="row" style={{ justifyContent: 'space-between', marginBottom: 6 }}>
                <div className="eyebrow">Quem conhecer</div>
                <Link href="/conexoes/sugestoes" style={{ fontSize: 12, color: 'var(--color-fg-3)' }}>Ver todas →</Link>
              </div>
              {sugestoes.length === 0 ? (
                <p style={{ fontSize: 13, color: 'var(--color-fg-3)', marginTop: 10 }}>Sem sugestões no momento.</p>
              ) : (
                <div className="col" style={{ gap: 0, borderTop: '1px solid var(--color-border)', marginTop: 10 }}>
                  {sugestoes.map((s) => (
                    <SuggestionRow key={s.uid} user={s} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>

      <PostComposer open={composerOpen} onClose={() => setComposerOpen(false)} />
    </div>
  )
}

function SuggestionRow({
  user,
}: {
  user: { uid: string; nome: string; foto_url?: string | null; tipo_usuario?: string; campus?: string | null }
}) {
  const [requested, setRequested] = useState(false)

  async function handleConnect() {
    try {
      await sendConnectionRequest(user.uid)
      setRequested(true)
      toast.success('Solicitação enviada')
    } catch {
      toast.error('Não foi possível enviar solicitação')
    }
  }

  const initials = user.nome.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()

  return (
    <div className="row" style={{ gap: 10, padding: '10px 0', borderBottom: '1px solid var(--color-border)' }}>
      <Link href={`/perfil/${user.uid}`} style={{ flex: 'none' }}>
        <div className="avatar" style={{ width: 36, height: 36, fontSize: 13, background: 'var(--color-purple)', color: '#fff' }}>
          {initials}
        </div>
      </Link>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Link href={`/perfil/${user.uid}`} style={{ display: 'block', fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user.nome}
        </Link>
        <div className="muted" style={{ fontSize: 11.5, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user.tipo_usuario?.replace('_', ' ')}{user.campus ? ` · ${user.campus}` : ''}
        </div>
      </div>
      <button
        className={cn('btn-icon', requested && 'opacity-50')}
        disabled={requested}
        onClick={handleConnect}
        title={requested ? 'Solicitação enviada' : `Conectar com ${user.nome}`}
      >
        <UserPlus size={14} />
      </button>
    </div>
  )
}
