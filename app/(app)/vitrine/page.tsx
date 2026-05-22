'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Briefcase, FlaskConical, Lightbulb, Calendar } from 'lucide-react'
import { listBusinesses } from '@/lib/api/business'
import { listLabs } from '@/lib/api/labs'
import { listInitiatives } from '@/lib/api/initiatives'
import { listEvents } from '@/lib/api/events'
import { EntityCard, type EntityKind } from '@/components/entity/EntityCard'
import { EmptyState, SkeletonList } from '@/components/primitives'
import { cn } from '@/lib/utils'

type Tab = 'negocios' | 'laboratorios' | 'projetos' | 'eventos'
const TABS: Array<{ id: Tab; label: string; icon: typeof Briefcase; kind: EntityKind }> = [
  { id: 'negocios', label: 'Negócios', icon: Briefcase, kind: 'negocio' },
  { id: 'laboratorios', label: 'Laboratórios', icon: FlaskConical, kind: 'laboratorio' },
  { id: 'projetos', label: 'Projetos', icon: Lightbulb, kind: 'projeto' },
  { id: 'eventos', label: 'Eventos', icon: Calendar, kind: 'evento' },
]

function VitrineInner() {
  const router = useRouter()
  const params = useSearchParams()
  const tab = (params.get('tab') as Tab) ?? 'negocios'
  const setTab = (next: Tab) => {
    const sp = new URLSearchParams(params.toString())
    sp.set('tab', next)
    router.replace(`/vitrine?${sp.toString()}`)
  }

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <h1>Vitrine</h1>
          <p className="sub">Explore negócios, laboratórios, projetos e eventos da UFC.</p>
        </div>
      </div>

      <div className="tabs-bar">
        {TABS.map((t) => {
          const Icon = t.icon
          const active = tab === t.id
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn('tab', active && 'active')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Icon size={14} /> {t.label}
            </button>
          )
        })}
      </div>

      <div style={{ marginTop: 24 }}>
        <Suspense fallback={<SkeletonList count={6} />}>
          {tab === 'negocios' && <NegociosTab />}
          {tab === 'laboratorios' && <LaboratoriosTab />}
          {tab === 'projetos' && <ProjetosTab />}
          {tab === 'eventos' && <EventosTab />}
        </Suspense>
      </div>
    </div>
  )
}

export default function VitrinePage() {
  return (
    <Suspense fallback={<div className="p-6"><SkeletonList count={6} /></div>}>
      <VitrineInner />
    </Suspense>
  )
}

const grid = 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'

function NegociosTab() {
  const q = useQuery({ queryKey: ['vitrine', 'negocios'], queryFn: () => listBusinesses({ limit: 24 }) })
  if (q.isLoading) return <SkeletonList count={6} />
  if (q.isError) return <EmptyState title="Erro ao carregar negócios" action={{ label: 'Tentar novamente', onClick: () => q.refetch() }} />
  const items = q.data?.items ?? []
  if (!items.length) {
    return <EmptyState icon={<Briefcase size={24} />} title="Nenhum negócio encontrado" description="Em breve novos negócios aparecerão aqui." />
  }
  return (
    <div className={grid}>
      {items.map((n) => (
        <EntityCard
          key={n.id} id={n.id} kind="negocio" href={`/vitrine/negocios/${n.id}`}
          nome={n.nome} descricao={n.descricao} categoria={n.categoria}
          imagem={n.foto_perfil ?? null}
          followers={n.followers_count}
          orphan={!n.uid_admin}
        />
      ))}
    </div>
  )
}

function LaboratoriosTab() {
  const q = useQuery({ queryKey: ['vitrine', 'laboratorios'], queryFn: () => listLabs({ limit: 24 }) })
  if (q.isLoading) return <SkeletonList count={6} />
  if (q.isError) return <EmptyState title="Erro ao carregar laboratórios" action={{ label: 'Tentar novamente', onClick: () => q.refetch() }} />
  const items = q.data?.items ?? []
  if (!items.length) {
    return <EmptyState icon={<FlaskConical size={24} />} title="Nenhum laboratório encontrado" description="Em breve novos laboratórios aparecerão aqui." />
  }
  return (
    <div className={grid}>
      {items.map((l) => (
        <EntityCard
          key={l.uid} id={l.uid} kind="laboratorio" href={`/vitrine/laboratorios/${l.uid}`}
          nome={l.nome} descricao={l.unidade + (l.campus ? ` · ${l.campus}` : '')}
          categoria={l.tipo}
          orphan={!l.uid_admin}
        />
      ))}
    </div>
  )
}

function ProjetosTab() {
  const q = useQuery({ queryKey: ['vitrine', 'projetos'], queryFn: () => listInitiatives({ limit: 24 }) })
  if (q.isLoading) return <SkeletonList count={6} />
  if (q.isError) return <EmptyState title="Erro ao carregar projetos" action={{ label: 'Tentar novamente', onClick: () => q.refetch() }} />
  const items = q.data?.items ?? []
  if (!items.length) {
    return <EmptyState icon={<Lightbulb size={24} />} title="Nenhum projeto encontrado" description="Crie o primeiro projeto." action={{ label: 'Criar projeto', href: '/vitrine/projetos/novo' }} />
  }
  return (
    <div className={grid}>
      {items.map((p) => (
        <EntityCard
          key={p.uid} id={p.uid} kind="projeto" href={`/vitrine/projetos/${p.uid}`}
          nome={p.titulo} descricao={p.descricao} categoria={p.tipo}
        />
      ))}
    </div>
  )
}

function EventosTab() {
  const q = useQuery({ queryKey: ['vitrine', 'eventos'], queryFn: () => listEvents({ limit: 24 }) })
  if (q.isLoading) return <SkeletonList count={6} />
  if (q.isError) return <EmptyState title="Erro ao carregar eventos" action={{ label: 'Tentar novamente', onClick: () => q.refetch() }} />
  const items = q.data?.items ?? []
  if (!items.length) {
    return <EmptyState icon={<Calendar size={24} />} title="Nenhum evento encontrado" description="Em breve novos eventos aparecerão aqui." />
  }
  return (
    <div className={grid}>
      {items.map((e) => (
        <EntityCard
          key={e.uid} id={e.uid} kind="evento" href={`/vitrine/eventos/${e.uid}`}
          nome={e.titulo} descricao={e.descricao} categoria={e.categoria}
          imagem={e.imagem_capa ?? undefined}
        />
      ))}
    </div>
  )
}
