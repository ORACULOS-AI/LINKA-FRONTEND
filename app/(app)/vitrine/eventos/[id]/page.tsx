'use client'

import { use } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Calendar, MapPin, Users, ExternalLink, Pencil, Share2, MoreHorizontal, Settings } from 'lucide-react'
import { getEvent, getEventParticipants } from '@/lib/api/events'
import { useFollowersCount } from '@/lib/hooks/useFollow'
import { EntityProfileShell } from '@/components/entity/EntityProfileShell'
import { MemberList } from '@/components/entity/MemberList'
import { FeedTimeline } from '@/components/feed/FeedTimeline'
import { FollowButton } from '@/components/social/FollowButton'
import { LikeButton } from '@/components/social/LikeButton'
import { ShareButton } from '@/components/social/ShareButton'
import { EmptyState, SkeletonCard, SkeletonList } from '@/components/primitives'
import { useAuth } from '@/lib/stores/auth'

function initials(nome: string) {
  return nome.split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('')
}

const STATUS_PILL: Record<string, string> = {
  ativo: 'pill-ativo',
  concluido: 'pill-info',
  cancelado: 'pill-cancelado',
}

export default function EventoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const me = useAuth((s) => s.me)

  const q = useQuery({ queryKey: ['evento', id], queryFn: () => getEvent(id) })
  const participantesQ = useQuery({
    queryKey: ['evento', id, 'participantes'],
    queryFn: () => getEventParticipants(id),
    enabled: !!q.data,
  })
  const { data: followers = 0 } = useFollowersCount('evento', id, !!q.data)

  if (q.isLoading) {
    return <div className="mx-auto max-w-5xl px-4 py-6"><SkeletonCard lines={3} /></div>
  }
  if (!q.data) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <EmptyState title="Evento não encontrado" action={{ label: 'Voltar à Vitrine', href: '/vitrine?tab=eventos' }} />
      </div>
    )
  }

  const e = q.data
  const isOwner = !!me && e.uid_owner === me.id
  const dataInicioFmt = new Date(e.data_inicio).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
  const now = Date.now()
  const isLive = now >= new Date(e.data_inicio).getTime() && now <= new Date(e.data_fim).getTime()

  return (
    <EntityProfileShell
      accentColor="orange"
      coverImage={e.imagem_capa ?? null}
      avatarImage={e.logo_url ?? null}
      initials={initials(e.titulo)}
      title={e.titulo}
      subtitle={e.categoria}
      metadata={[
        { icon: Calendar, value: dataInicioFmt },
        { icon: MapPin, value: e.local || (e.is_online ? 'Online' : '—') },
        ...(typeof e.capacidade_maxima === 'number'
          ? [{ icon: Users, value: `${e.total_participantes ?? 0}/${e.capacidade_maxima} vagas` }]
          : [{ icon: Users, value: `${e.total_participantes ?? 0} inscritos` }]),
      ]}
      statusPill={
        <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
          <span className={`pill ${STATUS_PILL[e.status] ?? 'pill-info'}`}>{e.status}</span>
          {isLive && <span className="pill pill-ativo">Em curso</span>}
        </div>
      }
      actions={
        <>
          {e.is_online && e.link_online && (
            <Link href={e.link_online} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
              <ExternalLink size={14} /> Entrar
            </Link>
          )}
          {!isOwner && <FollowButton type="evento" id={id} size="sm" />}
          {!isOwner && <LikeButton type="evento" id={id} size="sm" showCount={false} />}
          {isOwner && (
            <>
              <Link href={`/eventos/${id}/painel`} className="btn btn-primary btn-sm">
                <Settings size={14} /> Painel
              </Link>
              <Link href={`/vitrine/eventos/${id}/editar`} className="btn btn-secondary btn-sm">
                <Pencil size={14} /> Editar
              </Link>
            </>
          )}
          <ShareButton />
          <button className="btn-icon" aria-label="Mais opções"><MoreHorizontal size={16} /></button>
        </>
      }
      stats={[
        { label: 'Seguidores', value: followers },
        { label: 'Inscritos', value: e.total_participantes ?? 0 },
        { label: 'Certificados', value: e.total_certificados ?? 0 },
      ]}
      tabs={[
        {
          id: 'atividade',
          label: 'Atividade',
          content: <FeedTimeline targetType="evento" targetId={id} emptyText="Nenhuma publicação vinculada a este evento ainda." />,
        },
        {
          id: 'sobre',
          label: 'Sobre',
          content: (
            <div className="card">
              <div className="card-body">
                <div className="space-y-3 text-sm" style={{ color: 'var(--color-fg-1)' }}>
                  <p>{e.descricao || 'Sem descrição.'}</p>
                  {e.requisitos && <p><strong>Requisitos:</strong> {e.requisitos}</p>}
                  {e.carga_horaria && <p><strong>Carga horária:</strong> {e.carga_horaria}h</p>}
                </div>
                {e.tags?.length ? (
                  <>
                    <div style={{ borderTop: '1px solid var(--color-border)', margin: '16px 0' }} />
                    <div className="eyebrow" style={{ marginBottom: 8 }}>Tags</div>
                    <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>
                      {e.tags.map((t) => <span key={t} className="tag tag-orange">{t}</span>)}
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          ),
        },
        {
          id: 'participantes',
          label: 'Participantes',
          count: participantesQ.data?.length ?? e.total_participantes,
          content: participantesQ.isLoading ? <SkeletonList count={3} /> : (
            <MemberList
              items={(participantesQ.data ?? []).map((p) => ({
                uid: p.uid_usuario, nome: p.nome, papel: p.status, href: `/perfil/${p.uid_usuario}`,
              }))}
              emptyTitle="Sem inscritos até o momento"
            />
          ),
        },
      ]}
    />
  )
}
