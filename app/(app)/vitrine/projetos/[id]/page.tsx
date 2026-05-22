'use client'

import { use } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Calendar, Target, Pencil, Share2, MoreHorizontal } from 'lucide-react'
import { getInitiative, type ParticipanteIniciativa } from '@/lib/api/initiatives'
import { fetchUser } from '@/lib/api/users'
import { useFollowersCount } from '@/lib/hooks/useFollow'
import { EntityProfileShell } from '@/components/entity/EntityProfileShell'
import { MemberList } from '@/components/entity/MemberList'
import { FeedTimeline } from '@/components/feed/FeedTimeline'
import { FollowButton } from '@/components/social/FollowButton'
import { LikeButton } from '@/components/social/LikeButton'
import { ShareButton } from '@/components/social/ShareButton'
import { EmptyState, SkeletonCard } from '@/components/primitives'
import { useAuth } from '@/lib/stores/auth'

function initials(nome: string) {
  return nome.split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('')
}

const STATUS_PILL: Record<string, string> = {
  ATIVA: 'pill-ativo',
  PAUSADA: 'pill-pausada',
  CONCLUIDA: 'pill-info',
  CANCELADA: 'pill-cancelado',
}

export default function ProjetoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const me = useAuth((s) => s.me)

  const q = useQuery({ queryKey: ['projeto', id], queryFn: () => getInitiative(id) })
  const { data: followers = 0 } = useFollowersCount('iniciativa', id, !!q.data)

  const participantesUids = (q.data?.participantes ?? []).map((m) => m.uid)
  const membrosQ = useQuery({
    queryKey: ['projeto', id, 'membros-users', participantesUids],
    queryFn: () => Promise.all(participantesUids.map((u) => fetchUser(u).catch(() => null))),
    enabled: participantesUids.length > 0,
  })

  if (q.isLoading) {
    return <div className="mx-auto max-w-5xl px-4 py-6"><SkeletonCard lines={3} /></div>
  }
  if (!q.data) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <EmptyState title="Projeto não encontrado" action={{ label: 'Voltar à Vitrine', href: '/vitrine?tab=projetos' }} />
      </div>
    )
  }

  const p = q.data
  const isOwner = !!me && p.uid_owner === me.id
  const participantes = p.participantes ?? []

  return (
    <EntityProfileShell
      accentColor="mint"
      coverImage={(p as { foto_capa?: string | null }).foto_capa ?? null}
      avatarImage={(p as { foto_perfil?: string | null }).foto_perfil ?? null}
      initials={initials(p.titulo)}
      title={p.titulo}
      subtitle={p.tipo}
      metadata={[
        { icon: Calendar, value: `Início ${new Date(p.data_inicio).toLocaleDateString('pt-BR')}` },
        ...(p.data_fim ? [{ icon: Calendar, value: `Fim ${new Date(p.data_fim).toLocaleDateString('pt-BR')}` }] : []),
        { icon: Target, value: p.nivel_maturidade },
      ]}
      statusPill={
        <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
          <span className={`pill ${STATUS_PILL[p.status] ?? 'pill-info'}`}>{p.status}</span>
          {p.aceita_colaboradores && <span className="pill pill-info">Aceita colaboradores</span>}
        </div>
      }
      actions={
        <>
          {!isOwner && <FollowButton type="iniciativa" id={id} size="sm" />}
          {!isOwner && <LikeButton type="iniciativa" id={id} size="sm" showCount={false} />}
          {isOwner && (
            <Link href={`/vitrine/projetos/${id}/editar`} className="btn btn-secondary btn-sm">
              <Pencil size={14} /> Editar
            </Link>
          )}
          <ShareButton />
          <button className="btn-icon" aria-label="Mais opções"><MoreHorizontal size={16} /></button>
        </>
      }
      stats={[
        { label: 'Seguidores', value: followers },
        { label: 'Membros', value: participantes.length },
        { label: 'Status', value: p.status },
      ]}
      tabs={[
        {
          id: 'atividade',
          label: 'Atividade',
          content: <FeedTimeline targetType="iniciativa" targetId={id} emptyText="Nenhuma publicação vinculada a este projeto ainda." />,
        },
        {
          id: 'sobre',
          label: 'Sobre',
          content: (
            <div className="card">
              <div className="card-body">
                <div className="space-y-3 text-sm" style={{ color: 'var(--color-fg-1)' }}>
                  <p>{p.descricao || 'Sem descrição.'}</p>
                  {p.impacto_esperado && <p><strong>Impacto esperado:</strong> {p.impacto_esperado}</p>}
                  {p.publico_alvo && <p><strong>Público-alvo:</strong> {p.publico_alvo}</p>}
                </div>
                {(p.areas_conhecimento?.length || p.tecnologias_utilizadas?.length || p.ods_relacionados?.length) ? (
                  <div style={{ borderTop: '1px solid var(--color-border)', margin: '16px 0' }} />
                ) : null}
                {p.areas_conhecimento?.length > 0 && (
                  <>
                    <div className="eyebrow" style={{ marginBottom: 6 }}>Áreas de conhecimento</div>
                    <div className="row" style={{ flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                      {p.areas_conhecimento.map((a) => <span key={a} className="tag tag-mint">{a}</span>)}
                    </div>
                  </>
                )}
                {p.tecnologias_utilizadas?.length > 0 && (
                  <>
                    <div className="eyebrow" style={{ marginBottom: 6 }}>Tecnologias</div>
                    <div className="row" style={{ flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                      {p.tecnologias_utilizadas.map((a) => <span key={a} className="tag tag-blue">{a}</span>)}
                    </div>
                  </>
                )}
                {p.ods_relacionados?.length > 0 && (
                  <>
                    <div className="eyebrow" style={{ marginBottom: 6 }}>ODS relacionados</div>
                    <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>
                      {p.ods_relacionados.map((a) => <span key={a} className="tag tag-orange">{a}</span>)}
                    </div>
                  </>
                )}
              </div>
            </div>
          ),
        },
        {
          id: 'membros',
          label: 'Membros',
          count: participantes.length,
          content: (
            <MemberList
              items={participantes.map((m: ParticipanteIniciativa) => {
                const u = membrosQ.data?.find((x) => x?.uid === m.uid)
                return {
                  uid: m.uid,
                  nome: u?.nome ?? m.uid,
                  foto_perfil: u?.foto_perfil ?? null,
                  papel: m.papel,
                  href: `/perfil/${m.uid}`,
                }
              })}
              emptyTitle="Nenhum membro vinculado"
            />
          ),
        },
      ]}
    />
  )
}
