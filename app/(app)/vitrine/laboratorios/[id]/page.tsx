'use client'

import { use } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import {
  BadgeCheck,
  BookOpen,
  Calendar,
  FileText,
  FlaskConical,
  GraduationCap,
  Mail,
  MapPin,
  Pencil,
  Phone,
  ScrollText,
  Settings,
  ShieldAlert,
  Sparkles,
  Users,
} from 'lucide-react'
import { getLab } from '@/lib/api/labs'
import { listInitiatives } from '@/lib/api/initiatives'
import { listEvents } from '@/lib/api/events'
import { fetchUser } from '@/lib/api/users'
import { useFollowersCount } from '@/lib/hooks/useFollow'
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

function stringList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0) : []
}

function statValue(value: number | undefined) {
  return value ?? 0
}

function DetailSection({
  title,
  icon,
  action,
  children,
}: {
  title: string
  icon: React.ReactNode
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="card">
      <div className="card-body" style={{ padding: 18 }}>
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <h2 className="row font-display" style={{ gap: 8, fontSize: 14, fontWeight: 700, textTransform: 'uppercase' }}>
            {icon}
            {title}
          </h2>
          {action}
        </div>
        {children}
      </div>
    </section>
  )
}

function EmptyBlock({ children }: { children: React.ReactNode }) {
  return <p style={{ margin: 0, color: 'var(--color-fg-3)', fontSize: 13 }}>{children}</p>
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
  const fotoCapa = (l as { foto_capa?: string | null }).foto_capa ?? null
  const fotoPerfil = (l as { foto_perfil?: string | null }).foto_perfil ?? null
  const keywords = stringList((l as { palavras_chave?: unknown }).palavras_chave)
  const documentos = stringList((l as { documentos?: unknown }).documentos)
  const fotos = stringList((l as { fotos?: unknown }).fotos)
  const servicos = stringList((l as { servicos?: unknown }).servicos)
  const atividades = stringList((l as { atividades_pesquisa?: unknown }).atividades_pesquisa)
  const rawWebsite = (l as { website?: unknown }).website
  const website = typeof rawWebsite === 'string' ? rawWebsite : null

  const projetos = (projetosQ.data?.items ?? []).filter(
    (i) => (i as { host_type?: string; host_id?: string }).host_type === 'laboratorio'
      && (i as { host_id?: string }).host_id === id,
  )
  const eventos = (eventosQ.data?.items ?? []).filter(
    (e) => (e as { host_type?: string; host_id?: string }).host_type === 'laboratorio'
      && (e as { host_id?: string }).host_id === id,
  )

  return (
    <div className="page fade-in">
      <div
        className="profile-cover"
        style={fotoCapa
          ? { backgroundImage: `url(${fotoCapa})`, backgroundSize: 'cover', backgroundPosition: 'center' }
          : { backgroundColor: 'var(--color-blue)', backgroundImage: "url('/selinka/pattern-orange-on-blue.png')" }}
      />

      <div className="profile-meta">
        <div className="head-row" style={{ alignItems: 'flex-start' }}>
          <div className="row" style={{ gap: 16, alignItems: 'flex-start', minWidth: 0 }}>
            <div
              className="av-lg"
              style={fotoPerfil ? { background: `url(${fotoPerfil}) center/cover`, color: '#fff' } : { background: 'var(--color-blue)', color: '#fff' }}
            >
              {!fotoPerfil && initials(l.nome)}
            </div>
            <div style={{ minWidth: 0 }}>
              <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
                <span className="eyebrow">Laboratório</span>
                {l.status === 'APROVADO' && l.claimed && <BadgeCheck size={18} style={{ color: 'var(--color-blue)' }} />}
                {l.status === 'PENDENTE' && <span className="pill pill-pendente">Aguardando aprovação</span>}
                {l.status === 'RECUSADO' && <span className="pill pill-cancelado">Recusado</span>}
                {isOrphan && (
                  <span className="pill" style={{ background: 'var(--color-orange-15)', color: 'var(--color-orange)' }}>
                    <ShieldAlert size={12} /> Sem dono
                  </span>
                )}
              </div>
              <h1 style={{ marginTop: 4 }}>{l.nome}</h1>
              <div className="row" style={{ gap: 12, marginTop: 8, flexWrap: 'wrap', fontSize: 13, color: 'var(--color-fg-3)' }}>
                {l.unidade && <span className="row" style={{ gap: 4 }}><Users size={14} />{l.unidade}</span>}
                {l.campus && <span className="row" style={{ gap: 4 }}><MapPin size={14} />Campus {l.campus}</span>}
                {l.email && <span className="row" style={{ gap: 4 }}><Mail size={14} />{l.email}</span>}
              </div>
            </div>
          </div>

          <div className="actions" style={{ gap: 8 }}>
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
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]" style={{ marginTop: 18 }}>
        <main className="col" style={{ gap: 14 }}>
          <DetailSection title="Sobre o laboratório" icon={<FlaskConical size={16} />}>
            {l.descricao ? (
              <p style={{ margin: 0, color: 'var(--color-fg-2)', fontSize: 14, lineHeight: 1.6 }}>{l.descricao}</p>
            ) : (
              <EmptyBlock>Descrição ainda não informada.</EmptyBlock>
            )}
          </DetailSection>

          <div className="grid gap-4 md:grid-cols-2">
            <DetailSection title="Áreas de atuação" icon={<Sparkles size={16} />}>
              {l.areas_pesquisa?.length ? (
                <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>
                  {l.areas_pesquisa.map((area, i) => <span key={i} className="tag tag-blue">{area}</span>)}
                </div>
              ) : (
                <EmptyBlock>Nenhuma área cadastrada.</EmptyBlock>
              )}
            </DetailSection>

            <DetailSection title="Atividades de pesquisa" icon={<BookOpen size={16} />}>
              {atividades.length ? (
                <ul style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 6, fontSize: 13, color: 'var(--color-fg-2)' }}>
                  {atividades.map((atividade, i) => <li key={i}>{atividade}</li>)}
                </ul>
              ) : projetosQ.isLoading ? (
                <SkeletonList count={2} showAvatar={false} />
              ) : projetos.length ? (
                <ul style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 6, fontSize: 13 }}>
                  {projetos.slice(0, 4).map((p) => (
                    <li key={p.uid}><Link href={`/vitrine/projetos/${p.uid}`}>{p.titulo}</Link></li>
                  ))}
                </ul>
              ) : (
                <EmptyBlock>Nenhuma atividade cadastrada.</EmptyBlock>
              )}
            </DetailSection>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <DetailSection title="Prestação de serviços" icon={<ScrollText size={16} />}>
              {servicos.length ? (
                <ul style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 6, fontSize: 13, color: 'var(--color-fg-2)' }}>
                  {servicos.map((servico, i) => <li key={i}>{servico}</li>)}
                </ul>
              ) : (
                <EmptyBlock>Nenhum serviço cadastrado.</EmptyBlock>
              )}
            </DetailSection>

            <DetailSection title="Principais equipamentos" icon={<Settings size={16} />}>
              {l.equipamentos?.length ? (
                <ul style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 6, fontSize: 13, color: 'var(--color-fg-2)' }}>
                  {l.equipamentos.map((eq, i) => <li key={i}>{eq}</li>)}
                </ul>
              ) : (
                <EmptyBlock>Nenhum equipamento cadastrado.</EmptyBlock>
              )}
            </DetailSection>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <DetailSection title="Fotos" icon={<FileText size={16} />}>
              {fotos.length ? (
                <div className="grid grid-cols-3 gap-2">
                  {fotos.slice(0, 6).map((foto, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={i} src={foto} alt="" className="aspect-video rounded-md object-cover" />
                  ))}
                </div>
              ) : (
                <EmptyBlock>Nenhuma foto cadastrada.</EmptyBlock>
              )}
            </DetailSection>

            <DetailSection title="Palavras-chave" icon={<Sparkles size={16} />}>
              {(keywords.length ? keywords : l.areas_pesquisa ?? []).length ? (
                <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>
                  {(keywords.length ? keywords : l.areas_pesquisa ?? []).map((keyword, i) => <span key={i} className="tag tag-blue"># {keyword}</span>)}
                </div>
              ) : (
                <EmptyBlock>Nenhuma palavra-chave cadastrada.</EmptyBlock>
              )}
            </DetailSection>
          </div>

          <DetailSection title="Projetos vinculados" icon={<BookOpen size={16} />}>
            {projetosQ.isLoading ? <SkeletonList count={3} /> : projetos.length === 0 ? (
              <EmptyState title="Nenhum projeto vinculado" />
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {projetos.map((p) => (
                  <EntityCard key={p.uid} id={p.uid} kind="projeto" href={`/vitrine/projetos/${p.uid}`} nome={p.titulo} descricao={p.descricao} categoria={p.tipo} />
                ))}
              </div>
            )}
          </DetailSection>

          <DetailSection title="Publicações" icon={<FileText size={16} />}>
            <FeedTimeline targetType="laboratorio" targetId={id} emptyText="Nenhuma publicação vinculada a este laboratório ainda." />
          </DetailSection>
        </main>

        <aside className="col" style={{ gap: 14 }}>
          <DetailSection title="Estatísticas" icon={<BookOpen size={16} />}>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Pesquisadores', value: pesquisadoresUids.length, icon: Users },
                { label: 'Projetos', value: projetos.length, icon: BookOpen },
                { label: 'Eventos', value: eventos.length, icon: Calendar },
                { label: 'Seguidores', value: statValue(followers), icon: Users },
              ].map((stat) => {
                const Icon = stat.icon
                return (
                  <div key={stat.label} className="rounded-md border border-[var(--color-border)] p-3">
                    <Icon size={16} style={{ color: 'var(--color-blue)' }} />
                    <div className="n" style={{ fontSize: 20, marginTop: 4 }}>{stat.value}</div>
                    <div className="l" style={{ fontSize: 12 }}>{stat.label}</div>
                  </div>
                )
              })}
            </div>
          </DetailSection>

          <DetailSection title="Pesquisadores" icon={<GraduationCap size={16} />}>
            {pesquisadoresQ.isLoading ? <SkeletonList count={3} /> : (
              <MemberList
                items={(pesquisadoresQ.data ?? [])
                  .filter((u): u is NonNullable<typeof u> => !!u)
                  .map((u) => ({ uid: u.uid, nome: u.nome, foto_perfil: u.foto_perfil, papel: u.cargo ?? null, href: `/perfil/${u.uid}` }))}
                emptyTitle="Nenhum pesquisador cadastrado"
              />
            )}
          </DetailSection>

          <DetailSection title="Atividade recente" icon={<Calendar size={16} />}>
            {eventosQ.isLoading ? <SkeletonList count={2} showAvatar={false} /> : eventos.length ? (
              <div className="col" style={{ gap: 10 }}>
                {eventos.slice(0, 3).map((evento) => (
                  <Link key={evento.uid} href={`/vitrine/eventos/${evento.uid}`} className="rounded-md border border-[var(--color-border)] p-3 text-sm">
                    <strong>{evento.titulo}</strong>
                    <div className="sub" style={{ marginTop: 2 }}>{evento.categoria}</div>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyBlock>Nenhuma atividade recente.</EmptyBlock>
            )}
          </DetailSection>

          <DetailSection title="Contatos" icon={<Mail size={16} />}>
            <div className="col" style={{ gap: 8, fontSize: 13, color: 'var(--color-fg-2)' }}>
              {l.responsavel && <span><strong>Responsável:</strong> {l.responsavel}</span>}
              {l.email && <span className="row" style={{ gap: 6 }}><Mail size={14} />{l.email}</span>}
              {l.telefone && <span className="row" style={{ gap: 6 }}><Phone size={14} />{l.telefone}</span>}
              {website && <a href={website} target="_blank" rel="noopener">Site do laboratório</a>}
              {l.subunidade && <span><strong>Subunidade:</strong> {l.subunidade}</span>}
              {l.campus && <span><strong>Campus:</strong> {l.campus}</span>}
            </div>
          </DetailSection>

          <DetailSection title="Documentos" icon={<FileText size={16} />}>
            {documentos.length ? (
              <div className="col" style={{ gap: 8 }}>
                {documentos.map((doc, i) => (
                  <a key={i} href={doc} target="_blank" rel="noopener" className="row" style={{ gap: 6, fontSize: 13 }}>
                    <FileText size={14} /> Documento {i + 1}
                  </a>
                ))}
              </div>
            ) : (
              <EmptyBlock>Nenhum documento complementar.</EmptyBlock>
            )}
          </DetailSection>
        </aside>
      </div>
    </div>
  )
}
