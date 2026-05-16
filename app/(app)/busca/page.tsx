'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Search, MapPin, Users, BadgeCheck, MessageCircle, UserPlus } from 'lucide-react'
import { search as searchApi, type SearchHit, type SearchFilters } from '@/lib/api/search'
import { sendConnectionRequest } from '@/lib/api/connections'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

type TabId = 'pessoas' | 'negocios' | 'labs' | 'projetos' | 'eventos' | 'posts'

const TABS: { id: TabId; label: string }[] = [
  { id: 'pessoas',  label: 'Pessoas' },
  { id: 'negocios', label: 'Negócios' },
  { id: 'labs',     label: 'Laboratórios' },
  { id: 'projetos', label: 'Projetos' },
  { id: 'eventos',  label: 'Eventos' },
  { id: 'posts',    label: 'Posts' },
]

const TAB_TYPE_MAP: Record<TabId, SearchFilters['type']> = {
  pessoas:  'user',
  negocios: 'negocio',
  labs:     'laboratorio',
  projetos: 'iniciativa',
  eventos:  'evento',
  posts:    'all',
}

function PersonRow({ hit }: { hit: SearchHit }) {
  const [requested, setRequested] = useState(false)
  const connect = async () => {
    try {
      await sendConnectionRequest(hit.id)
      setRequested(true)
      toast.success('Solicitação enviada!')
    } catch { toast.error('Erro ao enviar solicitação') }
  }
  return (
    <div className="person-row">
      <div style={{ width: 56, height: 56, borderRadius: 12, background: 'var(--color-purple-08)', color: 'var(--color-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '700 18px var(--font-display)', flex: 'none' }}>
        {(hit.nome ?? hit.titulo ?? '?')[0]?.toUpperCase()}
      </div>
      <div className="body">
        <div className="nm">
          {hit.nome ?? hit.titulo}
          {!!(hit as Record<string, unknown>).verificado && <BadgeCheck size={14} style={{ color: 'var(--color-blue)', verticalAlign: '-2px', marginLeft: 4 }} />}
        </div>
        <div className="sub">{(hit as Record<string, unknown>).tipo_usuario as string ?? 'Usuário'}</div>
        <div className="meta">
          {(hit as Record<string, unknown>).campus ? (
            <span className="row" style={{ gap: 4 }}><MapPin size={12} /> {(hit as Record<string, unknown>).campus as string}</span>
          ) : null}
        </div>
      </div>
      <div className="row" style={{ gap: 8 }}>
        <Link href={`/mensagens?to=${hit.id}`} className="btn btn-tertiary btn-sm">
          <MessageCircle size={13} />Mensagem
        </Link>
        {!requested ? (
          <button className="btn btn-secondary btn-sm" onClick={connect}>
            <UserPlus size={13} />Conectar
          </button>
        ) : (
          <span className="btn btn-tertiary btn-sm" style={{ opacity: 0.5 }}>Solicitado</span>
        )}
      </div>
    </div>
  )
}

function EntityRow({ hit }: { hit: SearchHit }) {
  const href = hit.tipo === 'negocio' ? `/negocios/${hit.id}` : hit.tipo === 'laboratorio' ? `/laboratorios/${hit.id}` : hit.tipo === 'iniciativa' ? `/iniciativas/${hit.id}` : hit.tipo === 'evento' ? `/eventos/${hit.id}` : '#'
  return (
    <Link href={href} className="person-row" style={{ textDecoration: 'none' }}>
      <div style={{ width: 52, height: 52, borderRadius: 10, background: 'var(--color-blue-08)', color: 'var(--color-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '700 16px var(--font-display)', flex: 'none' }}>
        {(hit.nome ?? hit.titulo ?? '?')[0]?.toUpperCase()}
      </div>
      <div className="body">
        <div className="nm">{hit.nome ?? hit.titulo}</div>
        <div className="sub">{hit.descricao}</div>
      </div>
    </Link>
  )
}

export default function BuscaPage() {
  const [q, setQ] = useState('')
  const [activeTab, setActiveTab] = useState<TabId>('pessoas')
  const [debouncedQ, setDebouncedQ] = useState('')

  const handleSearch = useCallback((val: string) => {
    setQ(val)
    const t = setTimeout(() => setDebouncedQ(val), 350)
    return () => clearTimeout(t)
  }, [])

  const { data: results = [], isLoading } = useQuery({
    queryKey: ['search', debouncedQ, activeTab],
    queryFn: () => searchApi({ q: debouncedQ, type: TAB_TYPE_MAP[activeTab], limit: 30 }),
    enabled: debouncedQ.length >= 2,
  })

  const byTab: Record<TabId, SearchHit[]> = {
    pessoas:  results.filter(r => r.tipo === 'user'),
    negocios: results.filter(r => r.tipo === 'negocio'),
    labs:     results.filter(r => r.tipo === 'laboratorio'),
    projetos: results.filter(r => r.tipo === 'iniciativa'),
    eventos:  results.filter(r => r.tipo === 'evento'),
    posts:    results.filter(r => r.tipo === 'post'),
  }

  return (
    <div className="page page-narrow fade-in">
      <div className="page-header">
        <div>
          <h1>Buscar pessoas</h1>
          <div className="sub">Encontre pesquisadores, estudantes, técnicos administrativos e parceiros externos.</div>
        </div>
      </div>

      {/* Search input */}
      <div className="input-affix" style={{ marginBottom: 18 }}>
        <Search size={18} className="ix" style={{ left: 16 }} />
        <input
          className="input"
          value={q}
          onChange={e => handleSearch(e.target.value)}
          placeholder="Buscar por nome, área de pesquisa, palavra-chave, campus…"
          style={{ height: 52, fontSize: 15, paddingLeft: 48 }}
        />
      </div>

      {/* Tabs */}
      <div className="tabs-bar">
        {TABS.map(t => (
          <button
            key={t.id}
            className={cn('tab', activeTab === t.id && 'active')}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}{byTab[t.id].length > 0 ? ` · ${byTab[t.id].length}` : ''}
          </button>
        ))}
      </div>

      {/* Results */}
      {debouncedQ.length < 2 ? (
        <div className="empty">
          <div className="eyebrow">Busca global</div>
          <h3>Digite para buscar</h3>
          <p>Pesquise por pessoas, negócios, laboratórios, projetos, eventos e posts na plataforma.</p>
        </div>
      ) : isLoading ? (
        <div className="empty"><p>Buscando…</p></div>
      ) : byTab[activeTab].length === 0 ? (
        <div className="empty">
          <div className="eyebrow">Sem resultados</div>
          <h3>Nenhum resultado encontrado</h3>
          <p>Tente termos mais gerais ou mude de aba.</p>
        </div>
      ) : (
        <div className="col" style={{ gap: 12 }}>
          <div className="muted">{byTab[activeTab].length} resultado{byTab[activeTab].length !== 1 ? 's' : ''} para &quot;{debouncedQ}&quot;</div>
          {byTab[activeTab].map(hit => (
            activeTab === 'pessoas'
              ? <PersonRow key={hit.id} hit={hit} />
              : <EntityRow key={hit.id} hit={hit} />
          ))}
        </div>
      )}
    </div>
  )
}
