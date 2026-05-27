'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Search, Grid2x2, List, Plus, Users, ArrowRight } from 'lucide-react'
import { listAllInitiatives, type Iniciativa } from '@/lib/api/initiatives'
import { Pagination, usePagedList } from '@/components/vitrine/Pagination'
import { cn } from '@/lib/utils'

const CORES = ['purple', 'blue', 'mint', 'orange']
function getCor(idx: number): string { return CORES[idx % CORES.length] ?? 'purple' }
function getInitials(nome: string) {
  return nome.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

/** Deriva valores distintos (não vazios) de um campo dos itens, ordenados. */
function facet(items: Iniciativa[], pick: (p: Iniciativa) => string | null | undefined): string[] {
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

function statusPill(status: string) {
  return status === 'ATIVA' ? 'pill-ativo' : status === 'PAUSADA' ? 'pill-pausada' : 'pill-pendente'
}

function ProjetoCard({ proj, idx, href }: { proj: Iniciativa; idx: number; href: string }) {
  const cor = getCor(idx)
  return (
    <Link href={href} className="vcard">
      <div className={`cover ${cor}`}>
        <span className="badge-tl">{proj.tipo}</span>
        <div className="logo">{getInitials(proj.titulo)}</div>
      </div>
      <div className="body">
        <div className="ti">{proj.titulo}</div>
        <div className="sub">{proj.nivel_maturidade} · {proj.tipo}</div>
        <div className="desc">{proj.descricao}</div>
        <div className="meta-row">
          <span className={cn('pill', statusPill(proj.status))}>
            <span className="dot" />{proj.status}
          </span>
          {proj.ods_relacionados.slice(0, 1).map(o => (
            <span key={o} className="tag tag-blue">{o}</span>
          ))}
        </div>
        <div className="footer">
          <div className="stats">
            <span className="row" style={{ gap: 4 }}><Users size={12} /> —</span>
          </div>
          <button className="btn btn-tertiary btn-sm">Ver <ArrowRight size={13} /></button>
        </div>
      </div>
    </Link>
  )
}

function ProjetoRow({ proj, idx, href }: { proj: Iniciativa; idx: number; href: string }) {
  const cor = getCor(idx)
  return (
    <Link href={href} className="card is-clickable">
      <div className="card-body" style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <div style={{ width: 52, height: 52, borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '700 18px var(--font-display)', flex: 'none', background: bgMap[cor], color: clrMap[cor] }}>
          {getInitials(proj.titulo)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span className={cn('pill', statusPill(proj.status))} style={{ marginBottom: 4, display: 'inline-flex' }}>
            <span className="dot" />{proj.status}
          </span>
          <div style={{ font: '600 16px var(--font-display)', letterSpacing: '-0.005em' }}>{proj.titulo}</div>
          <div className="muted" style={{ marginTop: 2 }}>{proj.nivel_maturidade} · {proj.tipo}</div>
        </div>
        <button className="btn btn-tertiary btn-sm">Ver <ArrowRight size={13} /></button>
      </div>
    </Link>
  )
}

type Props = {
  /** Quando definido, os cards linkam para o CTA (cadastro) em vez do detalhe. */
  ctaHref?: string
}

export function ProjetosVitrine({ ctaHref }: Props) {
  const isPublic = !!ctaHref
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('relevancia')
  const [selTipo, setSelTipo] = useState<string[]>([])
  const [selStatus, setSelStatus] = useState<string[]>([])

  const { data, isLoading } = useQuery({
    queryKey: ['projetos', 'list', 'all'],
    queryFn: () => listAllInitiatives(),
    staleTime: 5 * 60_000,
  })

  const items = data ?? []

  const TIPOS  = facet(items, p => p.tipo)
  const STATUS = facet(items, p => p.status)

  const toggle = (arr: string[], set: (v: string[]) => void, val: string) =>
    set(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val])

  const filtered = items.filter(p => {
    if (search && !p.titulo.toLowerCase().includes(search.toLowerCase())) return false
    if (!matchesFacet(selTipo, p.tipo)) return false
    if (!matchesFacet(selStatus, p.status)) return false
    return true
  })

  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'az') return a.titulo.localeCompare(b.titulo, 'pt-BR')
    if (sort === 'recentes') return (b.created_at ?? '').localeCompare(a.created_at ?? '')
    return 0
  })

  const resetKey = JSON.stringify([search, sort, selTipo, selStatus])
  const { pageItems, page, setPage, totalPages } = usePagedList(sorted, resetKey)

  const hrefFor = (proj: Iniciativa) => ctaHref ?? `/vitrine/projetos/${proj.uid}`

  return (
    <div className="page fade-in" style={{ paddingTop: 24 }}>
      <div className="page-header" style={{ marginBottom: 14 }}>
        <div>
          <div className="crumbs">
            <span>Vitrines</span>
            <span style={{ color: 'var(--color-fg-1)' }}>Projetos</span>
          </div>
          <h1>Projetos</h1>
          <div className="sub">Projetos ativos — pesquisa, inovação, extensão e mais.</div>
        </div>
        {!isPublic && (
          <div className="row" style={{ gap: 8 }}>
            <Link href="/vitrine/projetos/novo" className="btn btn-primary btn-sm"><Plus size={14} />Criar projeto</Link>
          </div>
        )}
      </div>

      <div className="vitrine-grid" style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 24, alignItems: 'flex-start' }}>
        {/* Filter pane */}
        <div className="filter-pane">
          <div className="row between" style={{ marginBottom: 8 }}>
            <h4>Filtros</h4>
            <a style={{ fontSize: 12, color: 'var(--color-fg-3)', cursor: 'pointer' }} onClick={() => { setSelTipo([]); setSelStatus([]); setSearch('') }}>Limpar</a>
          </div>
          <div className="input-affix">
            <Search size={14} className="ix" />
            <input className="input" placeholder="Buscar…" style={{ padding: '9px 12px 9px 38px', fontSize: 13 }} value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          {TIPOS.length > 0 && (
            <div className="fgroup">
              <div className="lab">Tipo</div>
              {TIPOS.map(t => (
                <label key={t} className="fopt">
                  <input type="checkbox" checked={selTipo.includes(t)} onChange={() => toggle(selTipo, setSelTipo, t)} />
                  <span>{t}</span>
                </label>
              ))}
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
            <div className="empty"><p>Carregando projetos…</p></div>
          ) : filtered.length === 0 ? (
            <div className="empty">
              <div className="eyebrow">Sem resultados</div>
              <h3>Nenhum projeto encontrado</h3>
              <p>Tente ajustar os filtros{isPublic ? '.' : ' ou crie um novo projeto.'}</p>
              {!isPublic && (
                <Link href="/vitrine/projetos/novo" className="btn btn-primary"><Plus size={14} />Criar projeto</Link>
              )}
            </div>
          ) : (
            <>
              <div className={view === 'grid' ? 'grid-3' : 'col'} style={view === 'grid' ? { gap: 16 } : { gap: 12 }}>
                {pageItems.map((p, i) => view === 'grid'
                  ? <ProjetoCard key={p.uid} proj={p} idx={i} href={hrefFor(p)} />
                  : <ProjetoRow key={p.uid} proj={p} idx={i} href={hrefFor(p)} />)}
              </div>
              <Pagination page={page} totalPages={totalPages} onPage={setPage} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
