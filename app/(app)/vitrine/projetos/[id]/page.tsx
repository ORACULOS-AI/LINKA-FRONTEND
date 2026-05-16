'use client'

import { use } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getInitiative } from '@/lib/api/initiatives'
import { EntityDetailShell } from '@/components/entity/EntityDetailShell'
import { EmptyState, SkeletonCard } from '@/components/primitives'

export default function ProjetoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  const q = useQuery({ queryKey: ['projeto', id], queryFn: () => getInitiative(id) })

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
          title="Projeto não encontrado"
          action={{ label: 'Voltar à Vitrine', href: '/vitrine?tab=projetos' }}
        />
      </div>
    )
  }

  const p = q.data
  const participantes = p.participantes ?? []

  return (
    <EntityDetailShell
      kind="projeto"
      id={p.uid}
      nome={p.titulo}
      categoria={p.tipo}
      descricao={p.descricao}
      backHref="/vitrine?tab=projetos"
      chips={
        <>
          <Chip>{p.status}</Chip>
          <Chip>{p.nivel_maturidade}</Chip>
          {p.areas_conhecimento?.slice(0, 3).map((a) => <Chip key={a}>{a}</Chip>)}
        </>
      }
      tabs={[
        {
          id: 'sobre',
          label: 'Sobre',
          content: (
            <div className="space-y-3 text-sm text-[var(--color-fg-1)]">
              <p>{p.descricao}</p>
              {p.impacto_esperado && <p><strong>Impacto esperado:</strong> {p.impacto_esperado}</p>}
              {p.publico_alvo && <p><strong>Público-alvo:</strong> {p.publico_alvo}</p>}
              {p.tecnologias_utilizadas?.length > 0 && (
                <p><strong>Tecnologias:</strong> {p.tecnologias_utilizadas.join(', ')}</p>
              )}
              {p.ods_relacionados?.length > 0 && (
                <p><strong>ODS:</strong> {p.ods_relacionados.join(', ')}</p>
              )}
            </div>
          ),
        },
        {
          id: 'membros',
          label: 'Membros',
          count: participantes.length,
          content: participantes.length === 0 ? (
            <EmptyState title="Nenhum membro vinculado" />
          ) : (
            <ul className="space-y-2 text-sm">
              {participantes.map((m) => (
                <li key={m.uid} className="flex items-center justify-between rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2">
                  <span>{m.uid}</span>
                  <span className="text-xs uppercase tracking-wide text-[var(--color-fg-3)]">{m.papel}</span>
                </li>
              ))}
            </ul>
          ),
        },
        {
          id: 'atualizacoes',
          label: 'Atualizações',
          content: <EmptyState title="Em breve" description="Publicações vinculadas a este projeto." />,
        },
      ]}
    />
  )
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-sm bg-[var(--color-surface-2)] px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-[var(--color-fg-2)]">
      {children}
    </span>
  )
}
