'use client'

import { use } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { BadgeCheck, MapPin, Mail, Globe, Pencil, Share2, ShieldAlert } from 'lucide-react'
import { getBusiness, getBusinessMembers } from '@/lib/api/business'
import { listInitiatives } from '@/lib/api/initiatives'
import { listEvents } from '@/lib/api/events'
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

// Rótulos amigáveis para as chaves do JSONB `metricas` (campos do formulário sem
// coluna própria). Startups e empresas juniores usam subconjuntos distintos.
const METRICA_LABELS: Record<string, string> = {
  lider_nome: 'Líder',
  status_contrato: 'Status do contrato',
  modelo_instalacao: 'Modelo de instalação',
  modalidade_instalacao: 'Modalidade de instalação',
  local_incubacao: 'Local de incubação',
  observacao: 'Observação',
  presidente: 'Presidente',
  coordenador: 'Coordenador(a)',
  email_presidente: 'E-mail do presidente',
  regularizacao_prex: 'Regularização (PREX)',
  destaque: 'Destaque',
  servico_inovador: 'Serviço inovador',
  faturamento_anual: 'Faturamento anual',
  atendimento_externo: 'Atendimento externo',
  capacitacao_interna: 'Capacitação interna',
  acompanhamento_impacto: 'Acompanhamento de impacto',
}

type MetricaItem = { label: string; value: string }

/** Extrai entradas escalares não vazias de `metricas`, na ordem dos rótulos conhecidos. */
function scalarMetricas(metricas?: Record<string, unknown> | null): MetricaItem[] {
  if (!metricas) return []
  const out: MetricaItem[] = []
  for (const [key, label] of Object.entries(METRICA_LABELS)) {
    const v = metricas[key]
    if (typeof v === 'string' && v.trim()) out.push({ label, value: v.trim() })
    else if (typeof v === 'number') out.push({ label, value: String(v) })
  }
  return out
}

export default function NegocioDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const me = useAuth((s) => s.me)

  const q = useQuery({ queryKey: ['negocio', id], queryFn: () => getBusiness(id) })
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
  const membrosQ = useQuery({
    queryKey: ['negocio', id, 'membros'],
    queryFn: () => getBusinessMembers(id),
    enabled: !!q.data,
  })
  const { data: followers = 0 } = useFollowersCount('negocio', id, !!q.data)

  if (q.isLoading) {
    return <div className="mx-auto max-w-5xl px-4 py-6"><SkeletonCard lines={3} /></div>
  }
  if (!q.data) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <EmptyState title="Negócio não encontrado" action={{ label: 'Voltar à Vitrine', href: '/vitrine' }} />
      </div>
    )
  }

  const n = q.data
  const isOwner = !!me && n.uid_admin === me.id
  const isOrphan = !n.uid_admin

  const projetos = (projetosQ.data?.items ?? []).filter(
    (i) => (i as { host_type?: string; host_id?: string }).host_type === 'negocio'
      && (i as { host_id?: string }).host_id === id,
  )
  const eventos = (eventosQ.data?.items ?? []).filter(
    (e) => (e as { host_type?: string; host_id?: string }).host_type === 'negocio'
      && (e as { host_id?: string }).host_id === id,
  )

  const detalhes = scalarMetricas(n.metricas)
  const competencias = Array.isArray(n.metricas?.competencias_desenvolvidas)
    ? (n.metricas!.competencias_desenvolvidas as unknown[]).filter((c): c is string => typeof c === 'string' && c.trim() !== '')
    : []

  return (
    <EntityProfileShell
      accentColor="purple"
      coverImage={n.foto_capa}
      avatarImage={n.foto_perfil}
      initials={initials(n.nome)}
      title={n.nome}
      subtitle={n.categoria ?? 'Negócio'}
      titleBadges={
        n.status === 'aprovado' && n.claimed ? (
          <BadgeCheck size={20} style={{ color: 'var(--color-blue)' }} />
        ) : null
      }
      metadata={[
        ...(n.campus ? [{ icon: MapPin, value: `Campus ${n.campus}` }] : []),
        ...(n.email ? [{ icon: Mail, value: n.email }] : []),
        ...(n.website ? [{ icon: Globe, value: 'Website', href: n.website }] : []),
      ]}
      statusPill={
        <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
          {n.status === 'pendente' && <span className="pill pill-pendente">Aguardando aprovação</span>}
          {n.status === 'recusado' && <span className="pill pill-cancelado">Recusado</span>}
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
            <Link href={`/reivindicar?tipo=negocio&id=${id}`} className="btn btn-primary btn-sm">
              Reivindicar
            </Link>
          )}
          {!isOwner && <FollowButton type="negocio" id={id} size="sm" />}
          {!isOwner && <LikeButton type="negocio" id={id} size="sm" showCount={false} />}
          {isOwner && (
            <Link href={`/vitrine/negocios/${id}/editar`} className="btn btn-secondary btn-sm">
              <Pencil size={14} /> Editar
            </Link>
          )}
          <ShareButton />
        </>
      }
      stats={[
        { label: 'Seguidores', value: followers },
        { label: 'Projetos', value: projetos.length },
        { label: 'Eventos', value: eventos.length },
      ]}
      tabs={[
        {
          id: 'atividade',
          label: 'Atividade',
          content: <FeedTimeline targetType="negocio" targetId={id} emptyText="Nenhuma publicação vinculada a este negócio ainda." />,
        },
        {
          id: 'sobre',
          label: 'Sobre',
          content: (
            <div className="card">
              <div className="card-body">
                <p style={{ color: 'var(--color-fg-2)', lineHeight: 1.55, fontSize: 14 }}>
                  {n.descricao || 'Sem descrição disponível.'}
                </p>
                {n.palavras_chave?.length ? (
                  <>
                    <div style={{ borderTop: '1px solid var(--color-border)', margin: '16px 0' }} />
                    <div className="eyebrow" style={{ marginBottom: 8 }}>Palavras-chave</div>
                    <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>
                      {n.palavras_chave.map((k, i) => <span key={i} className="tag tag-purple">{k}</span>)}
                    </div>
                  </>
                ) : null}
                {detalhes.length ? (
                  <>
                    <div style={{ borderTop: '1px solid var(--color-border)', margin: '16px 0' }} />
                    <div className="eyebrow" style={{ marginBottom: 8 }}>Detalhes</div>
                    <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '6px 16px', margin: 0, fontSize: 14 }}>
                      {detalhes.map((d) => (
                        <div key={d.label} style={{ display: 'contents' }}>
                          <dt style={{ color: 'var(--color-fg-3)', whiteSpace: 'nowrap' }}>{d.label}</dt>
                          <dd style={{ margin: 0, color: 'var(--color-fg-1)' }}>{d.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </>
                ) : null}
                {competencias.length ? (
                  <>
                    <div style={{ borderTop: '1px solid var(--color-border)', margin: '16px 0' }} />
                    <div className="eyebrow" style={{ marginBottom: 8 }}>Competências desenvolvidas</div>
                    <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>
                      {competencias.map((c, i) => <span key={i} className="tag tag-mint">{c}</span>)}
                    </div>
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
            <EmptyState title="Nenhum projeto vinculado" description="Este negócio ainda não hospeda projetos." />
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
            <EmptyState title="Nenhum evento programado" description="Este negócio ainda não tem eventos." />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {eventos.map((e) => (
                <EntityCard key={e.uid} id={e.uid} kind="evento" href={`/vitrine/eventos/${e.uid}`} nome={e.titulo} descricao={e.descricao} categoria={e.categoria} />
              ))}
            </div>
          ),
        },
        {
          id: 'membros',
          label: 'Membros',
          count: membrosQ.data?.length,
          content: membrosQ.isLoading ? <SkeletonList count={3} /> : (
            <MemberList
              items={(membrosQ.data ?? []).map((m) => ({
                uid: m.uid, nome: m.nome, foto_perfil: m.foto_perfil, papel: m.papel,
                href: `/perfil/${m.uid}`,
              }))}
              emptyTitle="Sem membros cadastrados"
            />
          ),
        },
      ]}
    />
  )
}
