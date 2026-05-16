'use client'

import { use } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getBusiness } from '@/lib/api/business'
import { listInitiatives } from '@/lib/api/initiatives'
import { listEvents } from '@/lib/api/events'
import { EntityDetailShell } from '@/components/entity/EntityDetailShell'
import { EntityCard } from '@/components/entity/EntityCard'
import { EmptyState, SkeletonCard, SkeletonList } from '@/components/primitives'

export default function NegocioDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  const q = useQuery({
    queryKey: ['negocio', id],
    queryFn: () => getBusiness(id),
  })

  const projetosQ = useQuery({
    queryKey: ['negocio', id, 'projetos'],
    queryFn: () => listInitiatives({ limit: 24 }),
    enabled: !!q.data,
  })

  const eventosQ = useQuery({
    queryKey: ['negocio', id, 'eventos'],
    queryFn: () => listEvents({ limit: 24 }),
    enabled: !!q.data,
  })

  if (q.isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-6">
        <SkeletonCard lines={3} />
      </div>
    )
  }

  if (!q.data) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <EmptyState
          title="Negócio não encontrado"
          action={{ label: 'Voltar à Vitrine', href: '/vitrine' }}
        />
      </div>
    )
  }

  const n = q.data
  const projetos = (projetosQ.data?.items ?? []).filter(
    (i) => (i as { host_type?: string; host_id?: string }).host_type === 'negocio'
      && (i as { host_id?: string }).host_id === id,
  )
  const eventos = (eventosQ.data?.items ?? []).filter(
    (e) => (e as { host_type?: string; host_id?: string }).host_type === 'negocio'
      && (e as { host_id?: string }).host_id === id,
  )

  return (
    <EntityDetailShell
      kind="negocio"
      id={n.uid}
      nome={n.nome}
      categoria={n.categoria}
      descricao={n.descricao}
      tabs={[
        {
          id: 'sobre',
          label: 'Sobre',
          content: (
            <div className="prose max-w-none text-sm text-[var(--color-fg-1)]">
              <p>{n.descricao || 'Sem descrição disponível.'}</p>
            </div>
          ),
        },
        {
          id: 'projetos',
          label: 'Projetos',
          count: projetos.length,
          content: projetosQ.isLoading ? (
            <SkeletonList count={3} />
          ) : projetos.length === 0 ? (
            <EmptyState
              title="Nenhum projeto vinculado"
              description="Este negócio ainda não hospeda projetos."
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {projetos.map((p) => (
                <EntityCard
                  key={p.uid}
                  id={p.uid}
                  kind="projeto"
                  href={`/vitrine/projetos/${p.uid}`}
                  nome={p.titulo}
                  descricao={p.descricao}
                  categoria={p.tipo}
                />
              ))}
            </div>
          ),
        },
        {
          id: 'eventos',
          label: 'Eventos',
          count: eventos.length,
          content: eventosQ.isLoading ? (
            <SkeletonList count={3} />
          ) : eventos.length === 0 ? (
            <EmptyState
              title="Nenhum evento programado"
              description="Este negócio ainda não tem eventos."
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {eventos.map((e) => (
                <EntityCard
                  key={e.uid}
                  id={e.uid}
                  kind="evento"
                  href={`/vitrine/eventos/${e.uid}`}
                  nome={e.titulo}
                  descricao={e.descricao}
                  categoria={e.categoria}
                />
              ))}
            </div>
          ),
        },
        {
          id: 'membros',
          label: 'Membros',
          content: <EmptyState title="Em breve" description="Lista de membros." />,
        },
        {
          id: 'publicacoes',
          label: 'Publicações',
          content: <EmptyState title="Em breve" description="Posts vinculados a este negócio." />,
        },
      ]}
    />
  )
}
