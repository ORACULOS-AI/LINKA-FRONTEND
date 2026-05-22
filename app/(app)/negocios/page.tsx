'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import {
  Search, Grid2x2, List, Upload, Plus, Users, Lightbulb,
  Briefcase, BadgeAlert, ArrowRight,
} from 'lucide-react'
import { listBusinesses, type Negocio } from '@/lib/api/business'
import { cn } from '@/lib/utils'

const CATEGORIAS = ['Startup', 'Empresa Júnior', 'Spin-off', 'Outro']
const ESTAGIOS   = ['Ideação', 'Validação', 'MVP', 'Operação', 'Crescimento', 'Escala']
const AREAS      = ['Saúde', 'Educação', 'Tecnologia', 'Sustentabilidade', 'Finanças', 'Serviços', 'Indústria']
const VINCULOS   = ['Pré-incubada', 'Incubada', 'Parceira']
const CAMPI      = ['Pici', 'Quixadá', 'Sobral', 'Crateús', 'Russas', 'Benfica', 'Porangabussu', 'Itapajé']

const CORES = ['purple', 'blue', 'mint', 'orange']

function getInitials(nome: string) {
  return nome.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}
function getCor(idx: number): string { return CORES[idx % CORES.length] ?? 'purple' }

function NegocioCard({ negocio, idx, href }: { negocio: Negocio; idx: number; href: string }) {
  const cor = getCor(idx)
  const iniciais = getInitials(negocio.nome)
  return (
    <Link href={href} className="vcard">
      <div className={`cover ${cor}`}>
        <span className="badge-tl">{negocio.categoria.toUpperCase()}</span>
        <div className="logo">{iniciais}</div>
      </div>
      <div className="body">
        <div className="ti">{negocio.nome}</div>
        <div className="sub">{negocio.categoria}</div>
        <div className="desc">{negocio.descricao}</div>
        <div className="meta-row">
          <span className="tag tag-purple"><Briefcase size={11} style={{ marginRight: 4 }} />{negocio.categoria}</span>
          {!negocio.visivel && (
            <span className="tag tag-orange"><BadgeAlert size={11} style={{ marginRight: 4 }} />Não reivindicado</span>
          )}
        </div>
        <div className="footer">
          <div className="stats">
            <span className="row" style={{ gap: 4 }}><Users size={12} /> —</span>
            <span className="row" style={{ gap: 4 }}><Lightbulb size={12} /> —</span>
          </div>
          <button className="btn btn-tertiary btn-sm">
            Ver <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </Link>
  )
}

function NegocioRow({ negocio, idx, href }: { negocio: Negocio; idx: number; href: string }) {
  const cor = getCor(idx)
  const iniciais = getInitials(negocio.nome)
  const bgMap: Record<string, string> = {
    purple: 'var(--color-purple-08)', blue: 'var(--color-blue-08)',
    mint: 'var(--color-mint-15)', orange: 'var(--color-orange-15)',
  }
  const clrMap: Record<string, string> = {
    purple: 'var(--color-purple)', blue: 'var(--color-blue)',
    mint: 'var(--color-mint)', orange: 'var(--color-orange)',
  }
  return (
    <Link href={href} className="card is-clickable">
      <div className="card-body" style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <div style={{ width: 52, height: 52, borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '700 18px var(--font-display)', flex: 'none', background: bgMap[cor], color: clrMap[cor] }}>
          {iniciais}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="row" style={{ gap: 8, marginBottom: 4 }}>
            <span className="tag tag-purple"><Briefcase size={11} style={{ marginRight: 4 }} />{negocio.categoria}</span>
          </div>
          <div style={{ font: '600 16px var(--font-display)', letterSpacing: '-0.005em' }}>{negocio.nome}</div>
          <div className="muted" style={{ marginTop: 2 }}>{negocio.categoria}</div>
        </div>
        <div className="row" style={{ gap: 14 }}>
          <span className="row" style={{ gap: 4, fontSize: 12, color: 'var(--color-fg-3)' }}><Users size={12} /> —</span>
        </div>
        <button className="btn btn-tertiary btn-sm">Ver <ArrowRight size={13} /></button>
      </div>
    </Link>
  )
}

export default function NegociosPage() {
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [search, setSearch] = useState('')
  const [activeAreas, setActiveAreas] = useState<string[]>([])
  const [activeVinculos, setActiveVinculos] = useState<string[]>([])
  const [activeCampi, setActiveCampi] = useState<string[]>([])
  const [selectedCats, setSelectedCats] = useState<string[]>([])
  const [selectedEst, setSelectedEst] = useState<string[]>([])
  const [sort, setSort] = useState('relevancia')

  const { data, isLoading } = useQuery({
    queryKey: ['negocios', 'list'],
    queryFn: () => listBusinesses({ limit: 48 }),
  })

  const items = data?.items ?? []

  const filtered = items.filter(n => {
    if (search && !n.nome.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  function toggleChip(arr: string[], setArr: (v: string[]) => void, val: string) {
    setArr(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val])
  }

  return (
    <div className="page fade-in" style={{ paddingTop: 24 }}>
      <div className="page-header" style={{ marginBottom: 14 }}>
        <div>
          <div className="crumbs">
            <span>Vitrines</span>
            <span style={{ color: 'var(--color-fg-1)' }}>Negócios</span>
          </div>
          <h1>Negócios</h1>
          <div className="sub">Startups, empresas juniores e spin-offs vinculados à UFC.</div>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn btn-tertiary btn-sm"><Upload size={14} />Exportar</button>
          <Link href="/negocios/novo" className="btn btn-primary btn-sm"><Plus size={14} />Cadastrar negócio</Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 24, alignItems: 'flex-start' }}>
        {/* Filter pane */}
        <div className="filter-pane">
          <div className="row between" style={{ marginBottom: 8 }}>
            <h4>Filtros</h4>
            <a style={{ fontSize: 12, color: 'var(--color-fg-3)', cursor: 'pointer' }} onClick={() => { setSelectedCats([]); setSelectedEst([]); setActiveAreas([]); setActiveVinculos([]); setActiveCampi([]); setSearch('') }}>Limpar</a>
          </div>
          <div className="input-affix">
            <Search size={14} className="ix" />
            <input
              className="input"
              placeholder="Buscar…"
              style={{ padding: '9px 12px 9px 38px', fontSize: 13 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="fgroup">
            <div className="lab">Categoria</div>
            {CATEGORIAS.map(cat => (
              <label key={cat} className="fopt">
                <input
                  type="checkbox"
                  checked={selectedCats.includes(cat)}
                  onChange={() => toggleChip(selectedCats, setSelectedCats, cat)}
                />
                <span>{cat}</span>
              </label>
            ))}
          </div>

          <div className="fgroup">
            <div className="lab">Estágio</div>
            {ESTAGIOS.map(e => (
              <label key={e} className="fopt">
                <input
                  type="checkbox"
                  checked={selectedEst.includes(e)}
                  onChange={() => toggleChip(selectedEst, setSelectedEst, e)}
                />
                <span>{e}</span>
              </label>
            ))}
          </div>

          <div className="fgroup">
            <div className="lab">Área de atuação</div>
            <div className="chips">
              {AREAS.map(a => (
                <span
                  key={a}
                  className={cn('chip', activeAreas.includes(a) && 'active')}
                  onClick={() => toggleChip(activeAreas, setActiveAreas, a)}
                >{a}</span>
              ))}
            </div>
          </div>

          <div className="fgroup">
            <div className="lab">Tipo de vínculo</div>
            <div className="chips">
              {VINCULOS.map(v => (
                <span
                  key={v}
                  className={cn('chip', activeVinculos.includes(v) && 'active')}
                  onClick={() => toggleChip(activeVinculos, setActiveVinculos, v)}
                >{v}</span>
              ))}
            </div>
          </div>

          <div className="fgroup">
            <div className="lab">Campus</div>
            <div className="chips">
              {CAMPI.map(c => (
                <span
                  key={c}
                  className={cn('chip', activeCampi.includes(c) && 'active')}
                  onClick={() => toggleChip(activeCampi, setActiveCampi, c)}
                >{c}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div>
          <div className="row between" style={{ marginBottom: 14 }}>
            <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
              <span className="muted">{isLoading ? '…' : `${filtered.length} resultados`}</span>
            </div>
            <div className="row" style={{ gap: 8 }}>
              <select
                className="select"
                style={{ width: 'auto', padding: '7px 10px', fontSize: 13 }}
                value={sort}
                onChange={e => setSort(e.target.value)}
              >
                <option value="relevancia">Mais relevantes</option>
                <option value="recentes">Mais recentes</option>
                <option value="az">A → Z</option>
              </select>
              <div style={{ display: 'inline-flex', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--color-border-strong)' }}>
                <button
                  onClick={() => setView('grid')}
                  style={{ padding: '7px 10px', border: 0, background: view === 'grid' ? 'var(--color-ink)' : '#fff', color: view === 'grid' ? '#fff' : 'var(--color-fg-1)', cursor: 'pointer' }}
                >
                  <Grid2x2 size={14} />
                </button>
                <button
                  onClick={() => setView('list')}
                  style={{ padding: '7px 10px', border: 0, background: view === 'list' ? 'var(--color-ink)' : '#fff', color: view === 'list' ? '#fff' : 'var(--color-fg-1)', cursor: 'pointer' }}
                >
                  <List size={14} />
                </button>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="empty">
              <p>Carregando negócios…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty">
              <div className="eyebrow">Sem resultados</div>
              <h3>Nenhum negócio encontrado</h3>
              <p>Tente ajustar os filtros ou cadastre um novo negócio.</p>
              <Link href="/negocios/novo" className="btn btn-primary"><Plus size={14} />Cadastrar negócio</Link>
            </div>
          ) : (
            <div className={view === 'grid' ? 'grid-3' : 'col'} style={view === 'grid' ? { gap: 16 } : { gap: 12 }}>
              {filtered.map((n, i) => (
                view === 'grid'
                  ? <NegocioCard key={n.id} negocio={n} idx={i} href={`/negocios/${n.id}`} />
                  : <NegocioRow  key={n.id} negocio={n} idx={i} href={`/negocios/${n.id}`} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
