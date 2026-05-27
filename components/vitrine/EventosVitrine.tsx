'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Search, Grid2x2, List, Plus, Users, ArrowRight, MapPin, Globe } from 'lucide-react'
import { listAllEvents, type EventSummary } from '@/lib/api/events'
import { Pagination, usePagedList } from '@/components/vitrine/Pagination'
import { cn } from '@/lib/utils'

const CORES = ['purple', 'blue', 'mint', 'orange']
function getCor(idx: number): string { return CORES[idx % CORES.length] ?? 'purple' }
function getInitials(nome: string) {
  return nome.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

/** Deriva valores distintos (não vazios) de um campo dos itens, ordenados. */
function facet(items: EventSummary[], pick: (e: EventSummary) => string | null | undefined): string[] {
  const set = new Set<string>()
  for (const it of items) {
    const v = pick(it)?.trim()
    if (v) set.add(v)
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR'))
}

const matchesFacet = (selected: string[], value?: string | null) =>
  selected.length === 0 || (value != null && selected.includes(value))

const bgMap: Record<string, string> = {
  purple: 'var(--color-purple-08)', blue: 'var(--color-blue-08)',
  mint: 'var(--color-mint-15)', orange: 'var(--color-orange-15)',
}
const clrMap: Record<string, string> = {
  purple: 'var(--color-purple)', blue: 'var(--color-blue)',
  mint: 'var(--color-mint)', orange: 'var(--color-orange)',
}

function EventoCard({ evento, idx, href }: { evento: EventSummary; idx: number; href: string }) {
  const cor = getCor(idx)
  return (
    <Link href={href} className="vcard">
      <div className={`cover ${cor}`}>
        <span className="badge-tl">{evento.categoria.toUpperCase()}</span>
        <div className="logo">{getInitials(evento.titulo)}</div>
      </div>
      <div className="body">
        <div className="ti">{evento.titulo}</div>
        <div className="sub">{fmtDate(evento.data_inicio)}</div>
        <div className="desc">{evento.descricao}</div>
        <div className="meta-row">
          {evento.is_online
            ? <span className="tag tag-blue"><Globe size={11} style={{ marginRight: 4 }} />Online</span>
            : <span className="tag tag-ink"><MapPin size={11} style={{ marginRight: 4 }} />{evento.local}</span>}
          {evento.capacidade_maxima && evento.total_participantes >= evento.capacidade_maxima && (
            <span className="tag tag-orange">Lotado</span>
          )}
        </div>
        <div className="footer">
          <div className="stats">
            <span className="row" style={{ gap: 4 }}><Users size={12} /> {evento.total_participantes}/{evento.capacidade_maxima ?? '∞'}</span>
          </div>
          <button className="btn btn-tertiary btn-sm">Ver <ArrowRight size={13} /></button>
        </div>
      </div>
    </Link>
  )
}

function EventoRow({ evento, idx, href }: { evento: EventSummary; idx: number; href: string }) {
  const cor = getCor(idx)
  return (
    <Link href={href} className="card is-clickable">
      <div className="card-body" style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <div style={{ width: 52, height: 52, borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '700 18px var(--font-display)', flex: 'none', background: bgMap[cor], color: clrMap[cor] }}>
          {getInitials(evento.titulo)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ font: '600 16px var(--font-display)', letterSpacing: '-0.005em' }}>{evento.titulo}</div>
          <div className="muted" style={{ marginTop: 2 }}>{fmtDate(evento.data_inicio)} · {evento.is_online ? 'Online' : evento.local}</div>
        </div>
        <span className="muted">{evento.total_participantes}/{evento.capacidade_maxima ?? '∞'}</span>
        <button className="btn btn-tertiary btn-sm">Ver <ArrowRight size={13} /></button>
      </div>
    </Link>
  )
}

type Props = {
  /** Quando definido, os cards linkam para o CTA (cadastro) em vez do detalhe. */
  ctaHref?: string
}

export function EventosVitrine({ ctaHref }: Props) {
  const isPublic = !!ctaHref
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('relevancia')
  const [selCat, setSelCat] = useState<string[]>([])
  const [selStatus, setSelStatus] = useState<string[]>([])
  const [selFormato, setSelFormato] = useState<string[]>([])

  const { data, isLoading } = useQuery({
    queryKey: ['eventos', 'list', 'all'],
    queryFn: () => listAllEvents(),
    staleTime: 5 * 60_000,
  })

  const items = data ?? []

  const CATEGORIAS = facet(items, e => e.categoria)
  const STATUS     = facet(items, e => e.status)
  const FORMATOS   = facet(items, e => (e.is_online ? 'Online' : 'Presencial'))

  const toggle = (arr: string[], set: (v: string[]) => void, val: string) =>
    set(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val])

  const filtered = items.filter(e => {
    if (search && !e.titulo.toLowerCase().includes(search.toLowerCase())) return false
    if (!matchesFacet(selCat, e.categoria)) return false
    if (!matchesFacet(selStatus, e.status)) return false
    if (!matchesFacet(selFormato, e.is_online ? 'Online' : 'Presencial')) return false
    return true
  })

  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'az') return a.titulo.localeCompare(b.titulo, 'pt-BR')
    if (sort === 'recentes') return (b.data_inicio ?? '').localeCompare(a.data_inicio ?? '')
    return 0
  })

  const resetKey = JSON.stringify([search, sort, selCat, selStatus, selFormato])
  const { pageItems, page, setPage, totalPages } = usePagedList(sorted, resetKey)

  const hrefFor = (e: EventSummary) => ctaHref ?? `/vitrine/eventos/${e.uid}`

  return (
    <div className="page fade-in" style={{ paddingTop: 24 }}>
      <div className="page-header" style={{ marginBottom: 14 }}>
        <div>
          <div className="crumbs">
            <span>Vitrines</span>
            <span style={{ color: 'var(--color-fg-1)' }}>Eventos</span>
          </div>
          <h1>Eventos</h1>
          <div className="sub">Workshops, palestras, hackathons e mais — no ecossistema SeLinka.</div>
        </div>
        {!isPublic && (
          <div className="row" style={{ gap: 8 }}>
            <Link href="/vitrine/eventos/novo" className="btn btn-primary btn-sm"><Plus size={14} />Publicar evento</Link>
          </div>
        )}
      </div>

      <div className="vitrine-grid" style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 24, alignItems: 'flex-start' }}>
        {/* Filter pane */}
        <div className="filter-pane">
          <div className="row between" style={{ marginBottom: 8 }}>
            <h4>Filtros</h4>
            <a style={{ fontSize: 12, color: 'var(--color-fg-3)', cursor: 'pointer' }} onClick={() => { setSelCat([]); setSelStatus([]); setSelFormato([]); setSearch('') }}>Limpar</a>
          </div>
          <div className="input-affix">
            <Search size={14} className="ix" />
            <input className="input" placeholder="Buscar…" style={{ padding: '9px 12px 9px 38px', fontSize: 13 }} value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          {CATEGORIAS.length > 0 && (
            <div className="fgroup">
              <div className="lab">Categoria</div>
              {CATEGORIAS.map(c => (
                <label key={c} className="fopt">
                  <input type="checkbox" checked={selCat.includes(c)} onChange={() => toggle(selCat, setSelCat, c)} />
                  <span>{c}</span>
                </label>
              ))}
            </div>
          )}

          {FORMATOS.length > 0 && (
            <div className="fgroup">
              <div className="lab">Formato</div>
              <div className="chips">
                {FORMATOS.map(f => (
                  <span key={f} className={cn('chip', selFormato.includes(f) && 'active')} onClick={() => toggle(selFormato, setSelFormato, f)}>{f}</span>
                ))}
              </div>
            </div>
          )}

          {STATUS.length > 0 && (
            <div className="fgroup">
              <div className="lab">Status</div>
              <div className="chips">
                {STATUS.map(s => (
                  <span key={s} className={cn('chip', selStatus.includes(s) && 'active')} onClick={() => toggle(selStatus, setSelStatus, s)}>{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div>
          <div className="row between" style={{ marginBottom: 14 }}>
            <span className="muted">{isLoading ? '…' : `${filtered.length} resultados`}</span>
            <div className="row" style={{ gap: 8 }}>
              <select className="select" style={{ width: 'auto', padding: '7px 10px', fontSize: 13 }} value={sort} onChange={e => setSort(e.target.value)}>
                <option value="relevancia">Mais relevantes</option>
                <option value="recentes">Mais recentes</option>
                <option value="az">A → Z</option>
              </select>
              <div style={{ display: 'inline-flex', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--color-border-strong)' }}>
                <button onClick={() => setView('grid')} style={{ padding: '7px 10px', border: 0, background: view === 'grid' ? 'var(--color-ink)' : '#fff', color: view === 'grid' ? '#fff' : 'var(--color-fg-1)', cursor: 'pointer' }}><Grid2x2 size={14} /></button>
                <button onClick={() => setView('list')} style={{ padding: '7px 10px', border: 0, background: view === 'list' ? 'var(--color-ink)' : '#fff', color: view === 'list' ? '#fff' : 'var(--color-fg-1)', cursor: 'pointer' }}><List size={14} /></button>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="empty"><p>Carregando eventos…</p></div>
          ) : filtered.length === 0 ? (
            <div className="empty">
              <div className="eyebrow">Sem resultados</div>
              <h3>Nenhum evento encontrado</h3>
              <p>Tente ajustar os filtros{isPublic ? '.' : ' ou publique um novo evento.'}</p>
              {!isPublic && (
                <Link href="/vitrine/eventos/novo" className="btn btn-primary"><Plus size={14} />Publicar evento</Link>
              )}
            </div>
          ) : (
            <>
              <div className={view === 'grid' ? 'grid-3' : 'col'} style={view === 'grid' ? { gap: 16 } : { gap: 12 }}>
                {pageItems.map((e, i) => view === 'grid'
                  ? <EventoCard key={e.uid} evento={e} idx={i} href={hrefFor(e)} />
                  : <EventoRow key={e.uid} evento={e} idx={i} href={hrefFor(e)} />)}
              </div>
              <Pagination page={page} totalPages={totalPages} onPage={setPage} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
