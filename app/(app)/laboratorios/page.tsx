'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import {
  Search, Grid2x2, List, Upload, Plus, Users, Lightbulb,
  FlaskConical, Calendar, User, BadgeAlert, ArrowRight, MapPin, Globe,
} from 'lucide-react'
import { listLabs, type LabSummary } from '@/lib/api/labs'
import { listEvents, type EventSummary } from '@/lib/api/events'
import { listInitiatives, type Iniciativa } from '@/lib/api/initiatives'
import { cn } from '@/lib/utils'

type Tab = 'labs' | 'projetos' | 'eventos'

/* ─── helpers ───────────────────────────────────────────────── */
const CORES = ['purple', 'blue', 'mint', 'orange']
function getCor(idx: number): string { return CORES[idx % CORES.length] ?? 'purple' }
function getInitials(nome: string) {
  return nome.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

const bgMap: Record<string, string> = {
  purple: 'var(--color-purple-08)', blue: 'var(--color-blue-08)',
  mint: 'var(--color-mint-15)', orange: 'var(--color-orange-15)',
}
const clrMap: Record<string, string> = {
  purple: 'var(--color-purple)', blue: 'var(--color-blue)',
  mint: 'var(--color-mint)', orange: 'var(--color-orange)',
}

/* ─── Lab card ──────────────────────────────────────────────── */
function LabCard({ lab, idx }: { lab: LabSummary; idx: number }) {
  const cor = getCor(idx)
  const iniciais = getInitials(lab.nome)
  return (
    <Link href={`/laboratorios/${lab.uid}`} className="vcard">
      <div className={`cover ${cor}`}>
        <span className="badge-tl">{lab.tipo}</span>
        <div className="logo">{iniciais}</div>
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

function LabRow({ lab, idx }: { lab: LabSummary; idx: number }) {
  const cor = getCor(idx)
  return (
    <Link href={`/laboratorios/${lab.uid}`} className="card is-clickable">
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

/* ─── Projeto card ──────────────────────────────────────────── */
function ProjetoCard({ proj, idx }: { proj: Iniciativa; idx: number }) {
  const cor = getCor(idx)
  const iniciais = getInitials(proj.titulo)
  return (
    <Link href={`/iniciativas/${proj.uid}`} className="vcard">
      <div className={`cover ${cor}`}>
        <span className="badge-tl">{proj.tipo}</span>
        <div className="logo">{iniciais}</div>
      </div>
      <div className="body">
        <div className="ti">{proj.titulo}</div>
        <div className="sub">{proj.nivel_maturidade} · {proj.tipo}</div>
        <div className="desc">{proj.descricao}</div>
        <div className="meta-row">
          <span className={cn('pill', proj.status === 'ATIVA' ? 'pill-ativo' : proj.status === 'PAUSADA' ? 'pill-pausada' : 'pill-pendente')}>
            <span className="dot" />
            {proj.status}
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

function ProjetoRow({ proj, idx }: { proj: Iniciativa; idx: number }) {
  const cor = getCor(idx)
  return (
    <Link href={`/iniciativas/${proj.uid}`} className="card is-clickable">
      <div className="card-body" style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <div style={{ width: 52, height: 52, borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '700 18px var(--font-display)', flex: 'none', background: bgMap[cor], color: clrMap[cor] }}>
          {getInitials(proj.titulo)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span className={cn('pill', proj.status === 'ATIVA' ? 'pill-ativo' : 'pill-pendente')} style={{ marginBottom: 4, display: 'inline-flex' }}>
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

/* ─── Evento card ───────────────────────────────────────────── */
function EventoCard({ evento, idx }: { evento: EventSummary; idx: number }) {
  const cor = getCor(idx)
  const iniciais = getInitials(evento.titulo)
  const date = new Date(evento.data_inicio).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
  return (
    <Link href={`/eventos/${evento.uid}`} className="vcard">
      <div className={`cover ${cor}`}>
        <span className="badge-tl">{evento.categoria.toUpperCase()}</span>
        <div className="logo">{iniciais}</div>
      </div>
      <div className="body">
        <div className="ti">{evento.titulo}</div>
        <div className="sub">{date}</div>
        <div className="desc">{evento.descricao}</div>
        <div className="meta-row">
          {evento.is_online
            ? <span className="tag tag-blue"><Globe size={11} style={{ marginRight: 4 }} />Online</span>
            : <span className="tag tag-ink"><MapPin size={11} style={{ marginRight: 4 }} />{evento.local}</span>
          }
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

function EventoRow({ evento, idx }: { evento: EventSummary; idx: number }) {
  const cor = getCor(idx)
  const date = new Date(evento.data_inicio).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
  return (
    <Link href={`/eventos/${evento.uid}`} className="card is-clickable">
      <div className="card-body" style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <div style={{ width: 52, height: 52, borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '700 18px var(--font-display)', flex: 'none', background: bgMap[cor], color: clrMap[cor] }}>
          {getInitials(evento.titulo)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ font: '600 16px var(--font-display)', letterSpacing: '-0.005em' }}>{evento.titulo}</div>
          <div className="muted" style={{ marginTop: 2 }}>{date} · {evento.is_online ? 'Online' : evento.local}</div>
        </div>
        <span className="muted">{evento.total_participantes}/{evento.capacidade_maxima ?? '∞'}</span>
        <button className="btn btn-tertiary btn-sm">Ver <ArrowRight size={13} /></button>
      </div>
    </Link>
  )
}

/* ─── Filter pane ───────────────────────────────────────────── */
const LAB_FILTERS = {
  tipo: ['Pesquisa', 'Ensino', 'Extensão', 'Desenvolvimento', 'Multidisciplinar'],
  campi: ['Pici', 'Quixadá', 'Sobral', 'Crateús', 'Russas', 'Benfica', 'Porangabussu', 'Itapajé'],
  status: ['Ativo', 'Inativo', 'Manutenção'],
}
const PROJ_FILTERS = {
  tipo: ['Pesquisa', 'Inovação', 'Extensão', 'Empreendedorismo', 'Desenvolvimento', 'Consultoria'],
  trl: ['TRL 1–3 · Conceito', 'TRL 4–6 · Protótipo', 'TRL 7–8 · Demonstração', 'TRL 9 · Comercialização'],
  ods: ['ODS 2', 'ODS 3', 'ODS 6', 'ODS 8', 'ODS 10', 'ODS 11', 'ODS 12', 'ODS 13', 'ODS 14'],
}
const EV_FILTERS = {
  cat: ['Workshop', 'Palestra', 'Conferência', 'Hackathon', 'Networking', 'Curso', 'Seminário'],
  formato: ['Presencial', 'Online'],
  quando: ['Esta semana', 'Este mês', 'Próximos 90 dias', 'Próximos 6 meses'],
}

function LabFilterPane({ search, setSearch }: { search: string; setSearch: (s: string) => void }) {
  const [activeCampi, setActiveCampi] = useState<string[]>([])
  const [activeStatus, setActiveStatus] = useState<string[]>([])
  const toggle = (arr: string[], set: (v: string[]) => void, val: string) =>
    set(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val])
  return (
    <div className="filter-pane">
      <div className="row between" style={{ marginBottom: 8 }}>
        <h4>Filtros</h4>
        <a style={{ fontSize: 12, color: 'var(--color-fg-3)', cursor: 'pointer' }}>Limpar</a>
      </div>
      <div className="input-affix">
        <Search size={14} className="ix" />
        <input className="input" placeholder="Buscar…" style={{ padding: '9px 12px 9px 38px', fontSize: 13 }} value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div className="fgroup">
        <div className="lab">Tipo</div>
        {LAB_FILTERS.tipo.map(t => <label key={t} className="fopt"><input type="checkbox" /><span>{t}</span></label>)}
      </div>
      <div className="fgroup">
        <div className="lab">Campus</div>
        <div className="chips">{LAB_FILTERS.campi.map(c => <span key={c} className={cn('chip', activeCampi.includes(c) && 'active')} onClick={() => toggle(activeCampi, setActiveCampi, c)}>{c}</span>)}</div>
      </div>
      <div className="fgroup">
        <div className="lab">Status</div>
        <div className="chips">{LAB_FILTERS.status.map(s => <span key={s} className={cn('chip', activeStatus.includes(s) && 'active')} onClick={() => toggle(activeStatus, setActiveStatus, s)}>{s}</span>)}</div>
      </div>
    </div>
  )
}

function ProjFilterPane({ search, setSearch }: { search: string; setSearch: (s: string) => void }) {
  const [activeTRL, setActiveTRL] = useState<string[]>([])
  const toggle = (arr: string[], set: (v: string[]) => void, val: string) =>
    set(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val])
  return (
    <div className="filter-pane">
      <div className="row between" style={{ marginBottom: 8 }}>
        <h4>Filtros</h4>
        <a style={{ fontSize: 12, color: 'var(--color-fg-3)', cursor: 'pointer' }}>Limpar</a>
      </div>
      <div className="input-affix">
        <Search size={14} className="ix" />
        <input className="input" placeholder="Buscar…" style={{ padding: '9px 12px 9px 38px', fontSize: 13 }} value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div className="fgroup">
        <div className="lab">Tipo</div>
        {PROJ_FILTERS.tipo.map(t => <label key={t} className="fopt"><input type="checkbox" /><span>{t}</span></label>)}
      </div>
      <div className="fgroup">
        <div className="lab">Maturidade (TRL)</div>
        <div className="chips">{PROJ_FILTERS.trl.map(t => <span key={t} className={cn('chip', activeTRL.includes(t) && 'active')} onClick={() => toggle(activeTRL, setActiveTRL, t)}>{t}</span>)}</div>
      </div>
      <div className="fgroup">
        <div className="lab">ODS</div>
        <div className="chips">{PROJ_FILTERS.ods.map(o => <span key={o} className="chip">{o}</span>)}</div>
      </div>
    </div>
  )
}

function EvFilterPane({ search, setSearch }: { search: string; setSearch: (s: string) => void }) {
  const [activeFormato, setActiveFormato] = useState<string[]>([])
  const toggle = (arr: string[], set: (v: string[]) => void, val: string) =>
    set(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val])
  return (
    <div className="filter-pane">
      <div className="row between" style={{ marginBottom: 8 }}>
        <h4>Filtros</h4>
        <a style={{ fontSize: 12, color: 'var(--color-fg-3)', cursor: 'pointer' }}>Limpar</a>
      </div>
      <div className="input-affix">
        <Search size={14} className="ix" />
        <input className="input" placeholder="Buscar…" style={{ padding: '9px 12px 9px 38px', fontSize: 13 }} value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div className="fgroup">
        <div className="lab">Categoria</div>
        {EV_FILTERS.cat.map(t => <label key={t} className="fopt"><input type="checkbox" /><span>{t}</span></label>)}
      </div>
      <div className="fgroup">
        <div className="lab">Formato</div>
        <div className="chips">{EV_FILTERS.formato.map(f => <span key={f} className={cn('chip', activeFormato.includes(f) && 'active')} onClick={() => toggle(activeFormato, setActiveFormato, f)}>{f}</span>)}</div>
      </div>
      <div className="fgroup">
        <div className="lab">Quando</div>
        <div className="chips">{EV_FILTERS.quando.map(q => <span key={q} className="chip">{q}</span>)}</div>
      </div>
    </div>
  )
}

/* ─── Main page ─────────────────────────────────────────────── */
export default function LaboratoriosPage() {
  const [activeTab, setActiveTab] = useState<Tab>('labs')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('relevancia')

  const { data: labsData, isLoading: labsLoading } = useQuery({
    queryKey: ['labs', 'list'],
    queryFn: () => listLabs({ limit: 48 }),
  })
  const { data: projData, isLoading: projLoading } = useQuery({
    queryKey: ['iniciativas', 'list'],
    queryFn: () => listInitiatives({ limit: 48 }),
    enabled: activeTab === 'projetos',
  })
  const { data: evData, isLoading: evLoading } = useQuery({
    queryKey: ['eventos', 'vitrine'],
    queryFn: () => listEvents({ limit: 48 }),
    enabled: activeTab === 'eventos',
  })

  const labs     = (labsData?.items ?? []).filter(l => !search || l.nome.toLowerCase().includes(search.toLowerCase()))
  const projetos = (projData?.items ?? []).filter(p => !search || p.titulo.toLowerCase().includes(search.toLowerCase()))
  const eventos  = (evData?.items  ?? []).filter(e => !search || e.titulo.toLowerCase().includes(search.toLowerCase()))

  const tabMeta: Record<Tab, { label: string; count: number; icon: React.ReactNode; action: string; actionHref: string }> = {
    labs:     { label: 'Laboratórios', count: labsData?.items.length ?? 0, icon: <FlaskConical size={14} />, action: 'Cadastrar laboratório', actionHref: '/laboratorios/novo' },
    projetos: { label: 'Projetos',     count: projData?.items.length ?? 0, icon: <Lightbulb size={14} />,   action: 'Criar projeto',           actionHref: '/iniciativas/novo' },
    eventos:  { label: 'Eventos',      count: evData?.items.length   ?? 0, icon: <Calendar size={14} />,   action: 'Publicar evento',         actionHref: '/eventos/novo' },
  }
  const meta = tabMeta[activeTab]
  const isLoading = activeTab === 'labs' ? labsLoading : activeTab === 'projetos' ? projLoading : evLoading

  const subMap: Record<Tab, string> = {
    labs: 'Laboratórios da UFC ativos na rede.',
    projetos: 'Projetos ativos — pesquisa, inovação, extensão e mais.',
    eventos: 'Eventos públicos nos próximos meses.',
  }

  return (
    <div className="page fade-in" style={{ paddingTop: 24 }}>
      <div className="page-header" style={{ marginBottom: 14 }}>
        <div>
          <div className="crumbs">
            <span>Vitrines</span>
            <span style={{ color: 'var(--color-fg-1)' }}>{meta.label}</span>
          </div>
          <h1>{meta.label}</h1>
          <div className="sub">{subMap[activeTab]}</div>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn btn-tertiary btn-sm"><Upload size={14} />Exportar</button>
          <Link href={meta.actionHref} className="btn btn-primary btn-sm"><Plus size={14} />{meta.action}</Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-bar" style={{ marginBottom: 18 }}>
        {(Object.entries(tabMeta) as [Tab, typeof tabMeta[Tab]][]).map(([id, t]) => (
          <button
            key={id}
            className={cn('tab', activeTab === id && 'active')}
            onClick={() => { setActiveTab(id); setSearch('') }}
          >
            <span style={{ marginRight: 6, verticalAlign: '-2px', display: 'inline-flex' }}>{t.icon}</span>
            {t.label}{t.count > 0 ? ` · ${t.count}` : ''}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 24, alignItems: 'flex-start' }}>
        {/* Filter pane */}
        {activeTab === 'labs'     && <LabFilterPane  search={search} setSearch={setSearch} />}
        {activeTab === 'projetos' && <ProjFilterPane search={search} setSearch={setSearch} />}
        {activeTab === 'eventos'  && <EvFilterPane   search={search} setSearch={setSearch} />}

        {/* Results */}
        <div>
          <div className="row between" style={{ marginBottom: 14 }}>
            <span className="muted">
              {isLoading ? '…' : `${activeTab === 'labs' ? labs.length : activeTab === 'projetos' ? projetos.length : eventos.length} resultados`}
            </span>
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
            <div className="empty"><p>Carregando…</p></div>
          ) : (
            <>
              {/* Labs tab */}
              {activeTab === 'labs' && (
                labs.length === 0
                  ? <div className="empty"><div className="eyebrow">Sem resultados</div><h3>Nenhum laboratório encontrado</h3><p>Tente ajustar os filtros ou cadastre um novo laboratório.</p><Link href="/laboratorios/novo" className="btn btn-primary"><Plus size={14} />Cadastrar laboratório</Link></div>
                  : <div className={view === 'grid' ? 'grid-3' : 'col'} style={view === 'grid' ? { gap: 16 } : { gap: 12 }}>
                      {labs.map((l, i) => view === 'grid' ? <LabCard key={l.uid} lab={l} idx={i} /> : <LabRow key={l.uid} lab={l} idx={i} />)}
                    </div>
              )}

              {/* Projetos tab */}
              {activeTab === 'projetos' && (
                projetos.length === 0
                  ? <div className="empty"><div className="eyebrow">Sem resultados</div><h3>Nenhum projeto encontrado</h3><p>Tente ajustar os filtros ou crie um novo projeto.</p><Link href="/iniciativas/novo" className="btn btn-primary"><Plus size={14} />Criar projeto</Link></div>
                  : <div className={view === 'grid' ? 'grid-3' : 'col'} style={view === 'grid' ? { gap: 16 } : { gap: 12 }}>
                      {projetos.map((p, i) => view === 'grid' ? <ProjetoCard key={p.uid} proj={p} idx={i} /> : <ProjetoRow key={p.uid} proj={p} idx={i} />)}
                    </div>
              )}

              {/* Eventos tab */}
              {activeTab === 'eventos' && (
                eventos.length === 0
                  ? <div className="empty"><div className="eyebrow">Sem resultados</div><h3>Nenhum evento encontrado</h3><p>Tente ajustar os filtros ou publique um novo evento.</p><Link href="/eventos/novo" className="btn btn-primary"><Plus size={14} />Publicar evento</Link></div>
                  : <div className={view === 'grid' ? 'grid-3' : 'col'} style={view === 'grid' ? { gap: 16 } : { gap: 12 }}>
                      {eventos.map((e, i) => view === 'grid' ? <EventoCard key={e.uid} evento={e} idx={i} /> : <EventoRow key={e.uid} evento={e} idx={i} />)}
                    </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
