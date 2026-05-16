'use client'

import { use } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Calendar, MapPin, Users, ExternalLink } from 'lucide-react'
import { getEvent } from '@/lib/api/events'
import { EntityDetailShell } from '@/components/entity/EntityDetailShell'
import { EmptyState, SkeletonCard } from '@/components/primitives'

export default function EventoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const q = useQuery({ queryKey: ['evento', id], queryFn: () => getEvent(id) })

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
          title="Evento não encontrado"
          action={{ label: 'Voltar à Vitrine', href: '/vitrine?tab=eventos' }}
        />
      </div>
    )
  }

  const e = q.data
  const dataFmt = new Date(e.data_inicio).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  return (
    <EntityDetailShell
      kind="evento"
      id={e.uid}
      nome={e.titulo}
      categoria={e.categoria}
      descricao={e.descricao}
      imagem={e.imagem_capa ?? null}
      backHref="/vitrine?tab=eventos"
      chips={
        <>
          <Chip><Calendar className="mr-1 h-3 w-3 inline" />{dataFmt}</Chip>
          <Chip><MapPin className="mr-1 h-3 w-3 inline" />{e.local || (e.is_online ? 'Online' : '—')}</Chip>
          {typeof e.total_participantes === 'number' && (
            <Chip><Users className="mr-1 h-3 w-3 inline" />{e.total_participantes} inscritos</Chip>
          )}
        </>
      }
      actions={
        e.is_online && e.link_online ? (
          <Link
            href={e.link_online}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md bg-[var(--color-ink)] px-3 py-1.5 text-sm font-medium text-[var(--color-on-dark-1)] hover:opacity-90"
          >
            <ExternalLink className="h-4 w-4" /> Entrar na reunião
          </Link>
        ) : null
      }
      tabs={[
        {
          id: 'sobre',
          label: 'Sobre',
          content: (
            <div className="space-y-3 text-sm text-[var(--color-fg-1)]">
              <p>{e.descricao}</p>
              {e.requisitos && <p><strong>Requisitos:</strong> {e.requisitos}</p>}
              {e.carga_horaria && <p><strong>Carga horária:</strong> {e.carga_horaria}h</p>}
              {e.tags?.length > 0 && (
                <p><strong>Tags:</strong> {e.tags.join(', ')}</p>
              )}
            </div>
          ),
        },
        {
          id: 'participantes',
          label: 'Participantes',
          count: e.total_participantes,
          content: <EmptyState title="Em breve" description="Lista de participantes (visível ao organizador)." />,
        },
        {
          id: 'atualizacoes',
          label: 'Atualizações',
          content: <EmptyState title="Em breve" description="Publicações vinculadas a este evento." />,
        },
      ]}
    />
  )
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-sm bg-[var(--color-surface)] px-2 py-0.5 text-[11px] font-medium text-[var(--color-fg-2)]">
      {children}
    </span>
  )
}
