'use client'

import { use } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { BadgeCheck, MapPin, Mail, Users, Pencil, Share2, ShieldAlert } from 'lucide-react'
import { getLab } from '@/lib/api/labs'
import { listInitiatives } from '@/lib/api/initiatives'
import { listEvents } from '@/lib/api/events'
import { fetchUser } from '@/lib/api/users'
import { useFollowersCount } from '@/lib/hooks/useFollow'
import { EntityProfileShell } from '@/components/entity/EntityProfileShell'
import { EntityCard } from '@/components/entity/EntityCard'
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

export default function LaboratorioDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const me = useAuth((s) => s.me)

  const q = useQuery({ queryKey: ['lab', id], queryFn: () => getLab(id) })
  const projetosQ = useQuery({
    queryKey: ['lab', id, 'projetos'],
    queryFn: () => listInitiatives({ limit: 24 }),
    enabled: !!q.data,
  })
  const eventosQ = useQuery({
    queryKey: ['lab', id, 'eventos'],
    queryFn: () => listEvents({ limit: 24 }),
    enabled: !!q.data,
  })
  const pesquisadoresUids = q.data?.pesquisadores ?? []
  const pesquisadoresQ = useQuery({
    queryKey: ['lab', id, 'pesquisadores', pesquisadoresUids],
    queryFn: async () => Promise.all(pesquisadoresUids.map((uid) => fetchUser(uid).catch(() => null))),
    enabled: pesquisadoresUids.length > 0,
  })
  const { data: followers = 0 } = useFollowersCount('laboratorio', id, !!q.data)

  if (q.isLoading) {
    return <div className="mx-auto max-w-5xl px-4 py-6"><SkeletonCard lines={3} /></div>
  }
  if (!q.data) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <EmptyState title="Laboratório não encontrado" action={{ label: 'Voltar à Vitrine', href: '/vitrine?tab=laboratorios' }} />
      </div>
    )
  }

  const l = q.data
  const isOwner = !!me && l.uid_admin === me.id
  const isOrphan = !l.uid_admin

  const projetos = (projetosQ.data?.items ?? []).filter(
    (i) => (i as { host_type?: string; host_id?: string }).host_type === 'laboratorio'
      && (i as { host_id?: string }).host_id === id,
  )
  const eventos = (eventosQ.data?.items ?? []).filter(
    (e) => (e as { host_type?: string; host_id?: string }).host_type === 'laboratorio'
      && (e as { host_id?: string }).host_id === id,
  )

  return (
    <EntityProfileShell
      accentColor="blue"
      coverImage={(l as { foto_capa?: string | null }).foto_capa ?? null}
      avatarImage={(l as { foto_perfil?: string | null }).foto_perfil ?? null}
      initials={initials(l.nome)}
      title={l.nome}
      subtitle={l.tipo}
      titleBadges={
        l.status === 'APROVADO' && l.claimed ? (
          <BadgeCheck size={20} style={{ color: 'var(--color-blue)' }} />
        ) : null
      }
      metadata={[
        ...(l.unidade ? [{ icon: Users, value: l.unidade }] : []),
        ...(l.campus ? [{ icon: MapPin, value: `Campus ${l.campus}` }] : []),
        ...((l as { email?: string }).email ? [{ icon: Mail, value: (l as { email: string }).email }] : []),
      ]}
      statusPill={
        <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
          {l.status === 'PENDENTE' && <span className="pill pill-pendente">Aguardando aprovação</span>}
          {l.status === 'RECUSADO' && <span className="pill pill-cancelado">Recusado</span>}
          {isOrphan && (
            <span className="pill" style={{ background: 'var(--color-orange-15)', color: 'var(--color-orange)' }}>
              <ShieldAlert size={12} /> Sem dono — pode reivindicar
            </span>
          )}
        </div>
      }
      actions={
        <>
          {isOrphan && !isOwner && (
            <Link href={`/reivindicar?tipo=laboratorio&id=${id}`} className="btn btn-primary btn-sm">Reivindicar</Link>
          )}
          {!isOwner && <FollowButton type="laboratorio" id={id} size="sm" />}
          {!isOwner && <LikeButton type="laboratorio" id={id} size="sm" showCount={false} />}
          {isOwner && (
            <>
              <Link href={`/vitrine/laboratorios/${id}/editar`} className="btn btn-secondary btn-sm">
                <Pencil size={14} /> Editar
              </Link>
              <Link href={`/vitrine/laboratorios/${id}/pesquisadores`} className="btn btn-secondary btn-sm">
                <Users size={14} /> Pesquisadores
              </Link>
            </>
          )}
          <ShareButton />
        </>
      }
      stats={[
        { label: 'Seguidores', value: followers },
        { label: 'Pesquisadores', value: pesquisadoresUids.length },
        { label: 'Projetos', value: projetos.length },
      ]}
      tabs={[
        {
          id: 'atividade',
          label: 'Atividade',
          content: <FeedTimeline targetType="laboratorio" targetId={id} emptyText="Nenhuma publicação vinculada a este laboratório ainda." />,
        },
        {
          id: 'sobre',
          label: 'Sobre',
          content: (
            <div className="card">
              <div className="card-body">
                <div className="space-y-2 text-sm" style={{ color: 'var(--color-fg-1)' }}>
                  <p><strong>Responsável:</strong> {l.responsavel}</p>
                  <p><strong>Unidade:</strong> {l.unidade}</p>
                  {l.campus && <p><strong>Campus:</strong> {l.campus}</p>}
                </div>
                {l.areas_pesquisa?.length ? (
                  <>
                    <div style={{ borderTop: '1px solid var(--color-border)', margin: '16px 0' }} />
                    <div className="eyebrow" style={{ marginBottom: 8 }}>Áreas de pesquisa</div>
                    <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>
                      {l.areas_pesquisa.map((k, i) => <span key={i} className="tag tag-blue">{k}</span>)}
                    </div>
                  </>
                ) : null}
                {l.equipamentos?.length ? (
                  <>
                    <div style={{ borderTop: '1px solid var(--color-border)', margin: '16px 0' }} />
                    <div className="eyebrow" style={{ marginBottom: 8 }}>Equipamentos</div>
                    <ul style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 4 }}>
                      {l.equipamentos.map((eq, i) => (
                        <li key={i} style={{ color: 'var(--color-fg-2)' }}>{eq}</li>
                      ))}
                    </ul>
                  </>
                ) : null}
              </div>
            </div>
          ),
        },
        {
          id: 'projetos',
          label: 'Projetos',
          count: projetos.length,
          content: projetosQ.isLoading ? <SkeletonList count={3} /> : projetos.length === 0 ? (
            <EmptyState title="Nenhum projeto vinculado" />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {projetos.map((p) => (
                <EntityCard key={p.uid} id={p.uid} kind="projeto" href={`/vitrine/projetos/${p.uid}`} nome={p.titulo} descricao={p.descricao} categoria={p.tipo} />
              ))}
            </div>
          ),
        },
        {
          id: 'eventos',
          label: 'Eventos',
          count: eventos.length,
          content: eventosQ.isLoading ? <SkeletonList count={3} /> : eventos.length === 0 ? (
            <EmptyState title="Nenhum evento programado" />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {eventos.map((e) => (
                <EntityCard key={e.uid} id={e.uid} kind="evento" href={`/vitrine/eventos/${e.uid}`} nome={e.titulo} descricao={e.descricao} categoria={e.categoria} />
              ))}
            </div>
          ),
        },
        {
          id: 'pesquisadores',
          label: 'Pesquisadores',
          count: pesquisadoresUids.length,
          content: pesquisadoresQ.isLoading ? <SkeletonList count={3} /> : (
            <MemberList
              items={(pesquisadoresQ.data ?? [])
                .filter((u): u is NonNullable<typeof u> => !!u)
                .map((u) => ({ uid: u.uid, nome: u.nome, foto_perfil: u.foto_perfil, papel: u.cargo ?? null, href: `/perfil/${u.uid}` }))}
              emptyTitle="Nenhum pesquisador cadastrado"
            />
          ),
        },
      ]}
    />
  )
}
