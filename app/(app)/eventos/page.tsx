'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Calendar, Plus, Search, Filter, Loader2 } from 'lucide-react'
import { listEvents, type EventCategoria, type EventStatus } from '@/lib/api/events'
import { EntityCard } from '@/components/entity/EntityCard'
import { EmptyState } from '@/components/primitives'
import { useEnum } from '@/lib/hooks/useEnum'
import { cn } from '@/lib/utils'

const CATEGORIA_FALLBACK: { v: EventCategoria; l: string }[] = [
  { v: 'workshop', l: 'Workshop' },
  { v: 'palestra', l: 'Palestra' },
  { v: 'conferencia', l: 'Conferência' },
  { v: 'hackathon', l: 'Hackathon' },
  { v: 'networking', l: 'Networking' },
  { v: 'curso', l: 'Curso' },
  { v: 'seminario', l: 'Seminário' },
]

const STATUS_OPTS: { v: EventStatus | ''; l: string }[] = [
  { v: '', l: 'Todos os status' },
  { v: 'ativo', l: 'Ativos' },
  { v: 'concluido', l: 'Concluídos' },
  { v: 'cancelado', l: 'Cancelados' },
]

export default function EventosListPage() {
  const catEnum = useEnum('event_categoria')
  const cats = catEnum.length ? catEnum.map((e) => ({ v: e.value as EventCategoria, l: e.label })) : CATEGORIA_FALLBACK

  const [q, setQ] = useState('')
  const [categoria, setCategoria] = useState<EventCategoria | ''>('')
  const [status, setStatus] = useState<EventStatus | ''>('ativo')
  const [isOnline, setIsOnline] = useState<boolean | undefined>(undefined)

  const evQ = useQuery({
    queryKey: ['events-list', q, categoria, status, isOnline],
    queryFn: () => listEvents({
      q: q || undefined,
      categoria: categoria || undefined,
      status: status || undefined,
      is_online: isOnline,
      limit: 24,
    }),
  })

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <h1 style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <Calendar size={24} style={{ color: 'var(--color-orange)' }} /> Eventos
          </h1>
          <p className="sub">Workshops, palestras, hackathons e mais — no ecossistema SeLinka.</p>
        </div>
        <Link href="/vitrine/eventos/novo" className="btn btn-primary btn-sm">
          <Plus size={14} /> Criar evento
        </Link>
      </div>

      <div className="card" style={{ padding: 14, marginBottom: 16 }}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          <label className="relative col-span-2 sm:col-span-2">
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-fg-3)' }} />
            <input
              type="search"
              placeholder="Buscar por título, descrição…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="h-10 w-full rounded-md text-sm"
              style={{ border: '1px solid var(--color-border)', background: 'var(--color-surface)', paddingLeft: 36, paddingRight: 12 }}
            />
          </label>
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value as EventCategoria | '')}
            className="h-10 rounded-md text-sm"
            style={{ border: '1px solid var(--color-border)', background: 'var(--color-surface)', padding: '0 12px' }}
          >
            <option value="">Todas as categorias</option>
            {cats.map((c) => <option key={c.v} value={c.v}>{c.l}</option>)}
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as EventStatus | '')}
            className="h-10 rounded-md text-sm"
            style={{ border: '1px solid var(--color-border)', background: 'var(--color-surface)', padding: '0 12px' }}
          >
            {STATUS_OPTS.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
          </select>
        </div>
        <div className="row" style={{ alignItems: 'center', gap: 8, marginTop: 12, fontSize: 13 }}>
          <Filter size={14} style={{ color: 'var(--color-fg-3)' }} />
          {[
            { v: undefined, l: 'Todos' },
            { v: false, l: 'Presencial' },
            { v: true, l: 'Online' },
          ].map((opt) => (
            <button
              key={String(opt.v)}
              onClick={() => setIsOnline(opt.v as boolean | undefined)}
              className={cn('pill', isOnline === opt.v ? 'pill-ativo' : '')}
              style={isOnline !== opt.v ? { background: 'var(--color-surface-2)', color: 'var(--color-fg-2)', border: 0, cursor: 'pointer' } : { border: 0, cursor: 'pointer' }}
            >
              {opt.l}
            </button>
          ))}
        </div>
      </div>

      {evQ.isLoading ? (
        <p className="row" style={{ gap: 8, color: 'var(--color-fg-3)', fontSize: 14 }}>
          <Loader2 size={16} className="animate-spin" /> Carregando eventos…
        </p>
      ) : (evQ.data?.items ?? []).length === 0 ? (
        <EmptyState icon={<Calendar size={24} />} title="Nenhum evento encontrado" description="Tente ajustar os filtros." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(evQ.data?.items ?? []).map((e) => (
            <EntityCard
              key={e.uid}
              id={e.uid}
              kind="evento"
              href={`/vitrine/eventos/${e.uid}`}
              nome={e.titulo}
              descricao={e.descricao}
              categoria={`${e.categoria} · ${new Date(e.data_inicio).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}`}
              imagem={e.imagem_capa ?? undefined}
            />
          ))}
        </div>
      )}
    </div>
  )
}
