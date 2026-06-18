'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Search, Grid2x2, List, Plus, Users, Lightbulb, User, ArrowRight } from 'lucide-react'
import { listAllLabs, type LabSummary } from '@/lib/api/labs'
import { Pagination, usePagedList } from '@/components/vitrine/Pagination'
import { cn } from '@/lib/utils'

const CORES = ['purple', 'blue', 'mint', 'orange']
function getCor(idx: number): string { return CORES[idx % CORES.length] ?? 'purple' }
function getInitials(nome: string) {
  return nome.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

type Facet = { value: string; count: number }

/** Facet de campo escalar: valores distintos com contagem, ordenados por frequência. */
function facet(items: LabSummary[], pick: (l: LabSummary) => string | null | undefined): Facet[] {
  const counts = new Map<string, number>()
  for (const it of items) {
    const v = pick(it)?.trim()
    if (v) counts.set(v, (counts.get(v) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value, 'pt-BR'))
}

/** Facet de campo array (ex.: areas_pesquisa): conta cada valor individual. */
function facetArray(items: LabSummary[], pick: (l: LabSummary) => string[] | null | undefined): Facet[] {
  const counts = new Map<string, number>()
  for (const it of items) {
    for (const raw of pick(it) ?? []) {
      const v = raw?.trim()
      if (v) counts.set(v, (counts.get(v) ?? 0) + 1)
    }
  }
  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value, 'pt-BR'))
}

const matchesFacet = (selected: string[], value?: string | null) =>
  selected.length === 0 || (value != null && selected.includes(value))

/** Match de array: o lab passa se possui ALGUMA das áreas selecionadas. */
const matchesArray = (selected: string[], values?: string[] | null) =>
  selected.length === 0 || (!!values && values.some(v => selected.includes(v)))

const bgMap: Record<string, string> = {
  purple: 'var(--color-purple-08)', blue: 'var(--color-blue-08)',
  mint: 'var(--color-mint-15)', orange: 'var(--color-orange-15)',
}
const clrMap: Record<string, string> = {
  purple: 'var(--color-purple)', blue: 'var(--color-blue)',
  mint: 'var(--color-mint)', orange: 'var(--color-orange)',
}

function LabCard({ lab, idx, href }: { lab: LabSummary; idx: number; href: string }) {
  const cor = getCor(idx)
  return (
    <Link href={href} className="vcard">
      <div className={`cover ${cor}`}>
        <span className="badge-tl">{lab.tipo}</span>
        <div className="logo">{getInitials(lab.nome)}</div>
      </div>
      <div className="body">
        <div className="ti">{lab.nome}</div>
        <div className="sub">{lab.unidade}{lab.campus ? ` · ${lab.campus}` : ''}</div>
        <div className="desc">{lab.areas_pesquisa.slice(0, 2).join(', ')}</div>
        <div className="meta-row">
          <span className="tag tag-blue"><User size={11} style={{ marginRight: 4 }} />{lab.responsavel}</span>
        </div>
        <div className="footer">
          <div className="stats">
            <span className="row" style={{ gap: 4 }}><Users size={12} /> —</span>
            <span className="row" style={{ gap: 4 }}><Lightbulb size={12} /> —</span>
          </div>
          <button className="btn btn-tertiary btn-sm">Ver <ArrowRight size={13} /></button>
        </div>
      </div>
    </Link>
  )
}

function LabRow({ lab, idx, href }: { lab: LabSummary; idx: number; href: string }) {
  const cor = getCor(idx)
  return (
    <Link href={href} className="card is-clickable">
      <div className="card-body" style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <div style={{ width: 52, height: 52, borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '700 18px var(--font-display)', flex: 'none', background: bgMap[cor], color: clrMap[cor] }}>
          {getInitials(lab.nome)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="row" style={{ gap: 8, marginBottom: 4 }}>
            <span className="tag tag-blue"><User size={11} style={{ marginRight: 4 }} />{lab.responsavel}</span>
          </div>
          <div style={{ font: '600 16px var(--font-display)', letterSpacing: '-0.005em' }}>{lab.nome}</div>
          <div className="muted" style={{ marginTop: 2 }}>{lab.unidade}{lab.campus ? ` · ${lab.campus}` : ''}</div>
        </div>
        <button className="btn btn-tertiary btn-sm">Ver <ArrowRight size={13} /></button>
      </div>
    </Link>
  )
}

type Props = {
  /**
   * Quando definido, os cards linkam para este destino (ex.: CTA de cadastro na
   * vitrine pública) em vez do detalhe do laboratório. Ativa também o modo público:
   * esconde a ação de "Cadastrar laboratório".
   */
  ctaHref?: string
}

export function LaboratoriosVitrine({ ctaHref }: Props) {
  const isPublic = !!ctaHref
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('relevancia')
  const [selTipo, setSelTipo] = useState<string[]>([])
  const [selUnidade, setSelUnidade] = useState<string[]>([])
  const [selAreas, setSelAreas] = useState<string[]>([])
  const [selStatus, setSelStatus] = useState<string[]>([])

  const { data, isLoading } = useQuery({
    queryKey: ['labs', 'list', 'all'],
    queryFn: () => listAllLabs(),
    staleTime: 5 * 60_000,
  })

  const items = data ?? []

  // Opções derivadas dos dados reais, com contagem. Áreas é multi-valor (array).
  // `campus` é omitido: no CSV ele replica `unidade` (mesma string).
  const TIPOS    = facet(items, l => l.tipo)
  const UNIDADES = facet(items, l => l.unidade)
  const STATUS   = facet(items, l => l.status)
  const AREAS    = facetArray(items, l => l.areas_pesquisa).slice(0, 12)

  const toggle = (arr: string[], set: (v: string[]) => void, val: string) =>
    set(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val])

  const activeCount = selTipo.length + selUnidade.length + selAreas.length + selStatus.length

  const clearAll = () => {
    setSelTipo([]); setSelUnidade([]); setSelAreas([]); setSelStatus([]); setSearch('')
  }

  const filtered = items.filter(l => {
    if (search) {
      const hay = `${l.nome} ${l.responsavel} ${l.unidade} ${(l.areas_pesquisa ?? []).join(' ')}`.toLowerCase()
      if (!hay.includes(search.toLowerCase())) return false
    }
    if (!matchesFacet(selTipo, l.tipo)) return false
    if (!matchesFacet(selUnidade, l.unidade)) return false
    if (!matchesArray(selAreas, l.areas_pesquisa)) return false
    if (!matchesFacet(selStatus, l.status)) return false
    return true
  })

  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'az') return a.nome.localeCompare(b.nome, 'pt-BR')
    if (sort === 'recentes') return (b.created_at ?? '').localeCompare(a.created_at ?? '')
    return 0
  })

  const resetKey = JSON.stringify([search, sort, selTipo, selUnidade, selAreas, selStatus])
  const { pageItems, page, setPage, totalPages } = usePagedList(sorted, resetKey)

  const hrefFor = (lab: LabSummary) => ctaHref ?? `/vitrine/laboratorios/${lab.uid}`

  return (
    <div className="page fade-in" style={{ paddingTop: 24 }}>
      <div className="page-header" style={{ marginBottom: 14 }}>
        <div>
          <div className="crumbs">
            <span>Vitrines</span>
            <span style={{ color: 'var(--color-fg-1)' }}>Laboratórios</span>
          </div>
          <h1>Laboratórios</h1>
          <div className="sub">Laboratórios da UFC ativos na rede — pesquise por unidade, área ou equipamento.</div>
        </div>
        {!isPublic && (
          <div className="row" style={{ gap: 8 }}>
            <Link href="/vitrine/laboratorios/novo" className="btn btn-primary btn-sm"><Plus size={14} />Cadastrar laboratório</Link>
          </div>
        )}
      </div>

      <div className="vitrine-grid" style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 24, alignItems: 'flex-start' }}>
        {/* Filter pane */}
        <div className="filter-pane">
          <div className="row between" style={{ marginBottom: 8 }}>
            <h4>Filtros{activeCount > 0 ? ` · ${activeCount}` : ''}</h4>
            <a style={{ fontSize: 12, color: 'var(--color-fg-3)', cursor: 'pointer' }} onClick={clearAll}>Limpar</a>
          </div>
          <div className="input-affix">
            <Search size={14} className="ix" />
            <input className="input" placeholder="Nome, responsável, área…" style={{ padding: '9px 12px 9px 38px', fontSize: 13 }} value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          {TIPOS.length > 1 && (
            <div className="fgroup">
              <div className="lab">Tipo</div>
              {TIPOS.map(({ value, count }) => (
                <label key={value} className="fopt">
                  <input type="checkbox" checked={selTipo.includes(value)} onChange={() => toggle(selTipo, setSelTipo, value)} />
                  <span>{value}</span>
                  <span className="count">{count}</span>
                </label>
              ))}
            </div>
          )}

          {UNIDADES.length > 1 && (
            <div className="fgroup">
              <div className="lab">Unidade</div>
              <div style={{ maxHeight: 196, overflowY: 'auto', display: 'grid', gap: 2, paddingRight: 2 }}>
                {UNIDADES.map(({ value, count }) => (
                  <label key={value} className="fopt">
                    <input type="checkbox" checked={selUnidade.includes(value)} onChange={() => toggle(selUnidade, setSelUnidade, value)} />
                    <span>{value}</span>
                    <span className="count">{count}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {AREAS.length > 1 && (
            <div className="fgroup">
              <div className="lab">Áreas de pesquisa</div>
              <div className="chips">
                {AREAS.map(({ value, count }) => (
                  <span key={value} className={cn('chip', selAreas.includes(value) && 'active')} onClick={() => toggle(selAreas, setSelAreas, value)} title={`${count} laboratório(s)`}>{value}</span>
                ))}
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-fg-4)', marginTop: 8 }}>Áreas mais comuns — use a busca para as demais.</div>
            </div>
          )}

          {STATUS.length > 1 && (
            <div className="fgroup">
              <div className="lab">Status</div>
              <div className="chips">
                {STATUS.map(({ value }) => (
                  <span key={value} className={cn('chip', selStatus.includes(value) && 'active')} onClick={() => toggle(selStatus, setSelStatus, value)}>{value}</span>
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
            <div className="empty"><p>Carregando laboratórios…</p></div>
          ) : filtered.length === 0 ? (
            <div className="empty">
              <div className="eyebrow">Sem resultados</div>
              <h3>Nenhum laboratório encontrado</h3>
              <p>Tente ajustar os filtros{isPublic ? '.' : ' ou cadastre um novo laboratório.'}</p>
              {!isPublic && (
                <Link href="/vitrine/laboratorios/novo" className="btn btn-primary"><Plus size={14} />Cadastrar laboratório</Link>
              )}
            </div>
          ) : (
            <>
              <div className={view === 'grid' ? 'grid-3' : 'col'} style={view === 'grid' ? { gap: 16 } : { gap: 12 }}>
                {pageItems.map((l, i) => view === 'grid'
                  ? <LabCard key={l.uid} lab={l} idx={i} href={hrefFor(l)} />
                  : <LabRow key={l.uid} lab={l} idx={i} href={hrefFor(l)} />)}
              </div>
              <Pagination page={page} totalPages={totalPages} onPage={setPage} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
