'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { BadgeCheck, MapPin, Mail, ExternalLink, Badge, Share2, MoreHorizontal, MessageCircle, BookOpen, Link as LinkIcon } from 'lucide-react'
import { fetchUser, TIPO_LABEL } from '@/lib/api/users'
import { isMutual, isFollowing } from '@/lib/api/follow'
import { useFollowersCount } from '@/lib/hooks/useFollow'
import { getFollowCounts } from '@/lib/api/connections'
import { getInitiativesByUser } from '@/lib/api/initiatives'
import { FeedTimeline } from '@/components/feed/FeedTimeline'
import { FollowButton } from '@/components/social/FollowButton'
import { LikeButton } from '@/components/social/LikeButton'
import { ShareButton } from '@/components/social/ShareButton'
import { SkeletonCard, EmptyState } from '@/components/primitives'
import { useAuth } from '@/lib/stores/auth'
import { cn } from '@/lib/utils'

type ProfileTab = 'atividade' | 'sobre' | 'projetos' | 'labs' | 'negocios' | 'publicacoes'

function getInitials(nome: string) {
  return nome.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
}

export default function PublicProfilePage({ params }: { params: Promise<{ uid: string }> }) {
  const { uid } = use(params)
  const me = useAuth((s) => s.me)
  const isMe = me?.id === uid
  const [tab, setTab] = useState<ProfileTab>('atividade')

  const { data: profile, isLoading } = useQuery({
    queryKey: ['user', uid],
    queryFn: () => fetchUser(uid),
    staleTime: 5 * 60_000,
  })

  const { data: mutual = false } = useQuery({
    queryKey: ['is-mutual', uid],
    queryFn: () => isMutual(uid),
    enabled: !!me && !isMe,
    staleTime: 30_000,
  })

  const { data: iFollow = false } = useQuery({
    queryKey: ['is-following', 'user', uid],
    queryFn: () => isFollowing('user', uid),
    enabled: !!me && !isMe,
    staleTime: 30_000,
  })

  const { data: followers = 0 } = useFollowersCount('user', uid, !!profile)
  const { data: counts } = useQuery({
    queryKey: ['follow-counts', uid],
    queryFn: () => getFollowCounts(uid),
    enabled: !!profile,
  })
  const following = counts?.following ?? 0

  const { data: meusProjetos = [], isLoading: projetosLoading } = useQuery({
    queryKey: ['profile-public', 'projetos', uid],
    queryFn: () => getInitiativesByUser(uid),
    enabled: !!profile && tab === 'projetos',
  })

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-6 lg:py-8">
        <SkeletonCard lines={5} />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <EmptyState
          title="Usuário não encontrado"
          description="Esse perfil pode ter sido removido ou o link está incorreto."
          action={{ label: 'Voltar ao feed', href: '/feed' }}
        />
      </div>
    )
  }

  const initials = getInitials(profile.nome)

  return (
    <div className="page fade-in">
      {/* Capa */}
      {(() => {
        const capa = (profile as { foto_capa?: string | null }).foto_capa ?? null
        return (
          <div
            className="profile-cover"
            style={{
              backgroundImage: capa ? `url(${capa})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        )
      })()}

      <div className="profile-meta">
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div
            className="av-lg"
            style={{
              background: profile.foto_perfil ? `url(${profile.foto_perfil}) center/cover` : 'var(--color-purple)',
              color: '#fff',
            }}
          >
            {!profile.foto_perfil && initials}
          </div>
        </div>

        <div className="head-row">
          <div style={{ minWidth: 0 }}>
            <h1 style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              {profile.nome}
              {profile.is_verified && (
                <BadgeCheck size={20} style={{ color: 'var(--color-blue)', verticalAlign: '-2px' }} />
              )}
            </h1>
            <div className="sub">{profile.cargo ?? TIPO_LABEL[profile.tipo_usuario] ?? 'Membro'}</div>
            <div
              className="row"
              style={{ gap: 12, marginTop: 8, flexWrap: 'wrap', fontSize: 13, color: 'var(--color-fg-3)' }}
            >
              {profile.campus && (
                <span className="row" style={{ gap: 4 }}>
                  <MapPin size={14} /> Campus {profile.campus}
                </span>
              )}
              {profile.email && (
                <span className="row" style={{ gap: 4 }}>
                  <Mail size={14} /> {profile.email}
                </span>
              )}
              {profile.lattes && (
                <span className="row" style={{ gap: 4 }}>
                  <ExternalLink size={14} />
                  <a href={profile.lattes} target="_blank" rel="noopener" style={{ color: 'inherit' }}>
                    Lattes
                  </a>
                </span>
              )}
              {profile.siape && (
                <span className="row" style={{ gap: 4 }}>
                  <Badge size={14} /> SIAPE {profile.siape}
                </span>
              )}
            </div>
            {mutual && (
              <p className="mt-2 inline-flex items-center gap-1 rounded-sm bg-[var(--color-mint-15)] px-2 py-0.5 text-xs text-[var(--color-fg-2)]">
                Vocês se seguem mutuamente
              </p>
            )}
          </div>

          {!isMe && me && (
            <div className="actions" style={{ gap: 8 }}>
              <FollowButton type="user" id={uid} size="sm" />
              <LikeButton type="user" id={uid} size="sm" showCount={false} />
              <MessageCTA targetUid={uid} mutual={mutual} iFollow={iFollow} />
              <ShareButton />
              <button className="btn-icon"><MoreHorizontal size={16} /></button>
            </div>
          )}
        </div>

        <div className="stats">
          <div className="stat"><div className="n">{followers}</div><div className="l">Seguidores</div></div>
          <div className="stat"><div className="n">{following}</div><div className="l">Seguindo</div></div>
          <div className="stat"><div className="n">—</div><div className="l">Projetos</div></div>
        </div>

        <div style={{ borderTop: '1px solid var(--color-border)', margin: '18px 0 0' }} />
        <div className="tabs-bar" style={{ borderBottom: 0, margin: 0 }}>
          {([
            { id: 'atividade' as ProfileTab, l: 'Atividade' },
            { id: 'sobre' as ProfileTab, l: 'Sobre' },
            { id: 'projetos' as ProfileTab, l: 'Projetos' },
            { id: 'labs' as ProfileTab, l: 'Laboratórios' },
            { id: 'negocios' as ProfileTab, l: 'Negócios' },
            { id: 'publicacoes' as ProfileTab, l: 'Publicações' },
          ]).map((t) => (
            <button
              key={t.id}
              className={cn('tab', tab === t.id && 'active')}
              onClick={() => setTab(t.id)}
            >
              {t.l}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 24 }} className="grid-feed">
        <div className="col" style={{ gap: 14 }}>
          {tab === 'atividade' && (
            <>
              <div className="eyebrow" style={{ marginBottom: 4 }}>
                Publicações de {profile.nome.split(' ')[0]}
              </div>
              <FeedTimeline userUid={uid} emptyText="Nenhuma publicação ainda." />
            </>
          )}

          {tab === 'sobre' && (
            <div className="card">
              <div className="card-body">
                {profile.bio ? (
                  <>
                    <h4 style={{ font: '600 16px var(--font-display)', marginBottom: 8 }}>Bio</h4>
                    <p style={{ color: 'var(--color-fg-2)', lineHeight: 1.55, fontSize: 14 }}>{profile.bio}</p>
                  </>
                ) : (
                  <p className="muted">Este usuário ainda não preencheu a bio.</p>
                )}
                {profile.palavras_chave?.length ? (
                  <>
                    <div style={{ borderTop: '1px solid var(--color-border)', margin: '16px 0' }} />
                    <div className="eyebrow" style={{ marginBottom: 8 }}>Áreas de interesse</div>
                    <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>
                      {profile.palavras_chave.map((k: string, i: number) => (
                        <span key={i} className="tag tag-purple">{k}</span>
                      ))}
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          )}

          {tab === 'projetos' && (
            projetosLoading ? (
              <div className="empty"><p>Carregando projetos…</p></div>
            ) : meusProjetos.length === 0 ? (
              <div className="empty">
                <h3>Nenhum projeto vinculado</h3>
                <p>{profile.nome.split(' ')[0]} ainda não participa de iniciativas.</p>
              </div>
            ) : (
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {meusProjetos.map((p) => (
                  <li key={p.uid}>
                    <Link
                      href={`/vitrine/projetos/${p.uid}`}
                      className="block rounded-md border border-border bg-surface p-4 transition-colors hover:bg-surface-2"
                    >
                      <div className="text-xs uppercase tracking-wide text-fg-3">{p.tipo}</div>
                      <div className="mt-1 truncate text-sm font-semibold text-fg-1">{p.titulo}</div>
                      {p.descricao && <p className="mt-1 line-clamp-2 text-xs text-fg-2">{p.descricao}</p>}
                    </Link>
                  </li>
                ))}
              </ul>
            )
          )}

          {(tab === 'labs' || tab === 'negocios') && (
            <div className="empty">
              <h3>Listagem indisponível</h3>
              <p>Ainda não expomos {tab === 'labs' ? 'laboratórios' : 'negócios'} filtrados por membro.</p>
            </div>
          )}

          {tab === 'publicacoes' && (
            <div className="card">
              <div className="card-body">
                <div className="empty" style={{ border: 0, padding: 0 }}>
                  <BookOpen size={28} style={{ color: 'var(--color-fg-3)' }} />
                  <h3>Sem publicações importadas</h3>
                  <p>
                    {profile.lattes
                      ? 'Lattes vinculado — em breve mostraremos as publicações aqui.'
                      : 'Este usuário não conectou o Lattes.'}
                  </p>
                  {profile.lattes && (
                    <a className="btn btn-secondary btn-sm" href={profile.lattes} target="_blank" rel="noopener">
                      <LinkIcon size={13} /> Abrir Lattes
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <aside className="col" style={{ gap: 16 }}>
          <div className="card">
            <div className="card-body">
              <div className="eyebrow">Contatos diretos</div>
              <div className="col" style={{ marginTop: 12, gap: 12 }}>
                {profile.email && (
                  <div className="row" style={{ gap: 10 }}>
                    <Mail size={16} style={{ color: 'var(--color-fg-3)' }} />
                    <span style={{ fontSize: 13.5 }}>{profile.email}</span>
                  </div>
                )}
                {profile.campus && (
                  <div className="row" style={{ gap: 10 }}>
                    <MapPin size={16} style={{ color: 'var(--color-fg-3)' }} />
                    <span style={{ fontSize: 13.5 }}>Campus {profile.campus}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

function MessageCTA({
  targetUid,
  mutual,
  iFollow,
}: {
  targetUid: string
  mutual: boolean
  iFollow: boolean
}) {
  if (mutual) {
    return (
      <Link
        href={`/mensagens?novo=1&para=${targetUid}`}
        className="btn btn-primary btn-sm"
      >
        <MessageCircle size={14} /> Mensagem
      </Link>
    )
  }
  const tooltip = iFollow
    ? 'Aguardando esta pessoa te seguir de volta para liberar mensagens.'
    : 'Siga esta pessoa e aguarde follow de volta para enviar mensagens.'
  return (
    <span className="btn btn-tertiary btn-sm" title={tooltip} style={{ cursor: 'not-allowed', opacity: 0.7 }}>
      <MessageCircle size={14} />
      {iFollow ? 'Aguardando' : 'Mensagem'}
    </span>
  )
}
