'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { BadgeCheck, MapPin, Mail, ExternalLink, Badge, Share2, MoreHorizontal, Image, BookOpen, Link } from 'lucide-react'
import { fetchMyProfile, updateMyProfile, TIPO_LABEL, type UserProfile } from '@/lib/api/users'
import { getMyConnections, getFollowCounts, type ConnectionUser } from '@/lib/api/connections'
import { fetchFeed } from '@/lib/api/feed'
import { getInitiativesByUser } from '@/lib/api/initiatives'
import { EditProfileModal } from '@/components/profile/EditProfileModal'
import { cn } from '@/lib/utils'

type ProfileTab = 'atividade' | 'sobre' | 'projetos' | 'labs' | 'negocios' | 'publicacoes'

function getInitials(nome: string) {
  return nome.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

export default function MyProfilePage() {
  const qc = useQueryClient()
  const [tab, setTab] = useState<ProfileTab>('atividade')
  const [editing, setEditing] = useState(false)

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', 'me'],
    queryFn: fetchMyProfile,
  })

  const { data: counts } = useQuery({
    queryKey: ['follow-counts', profile?.uid],
    queryFn: () => getFollowCounts(profile!.uid),
    enabled: !!profile?.uid,
  })

  const { data: connections = [] as ConnectionUser[] } = useQuery({
    queryKey: ['connections', 'mine', profile?.uid],
    queryFn: () => getMyConnections(profile!.uid),
    enabled: !!profile?.uid,
  })

  const { data: feedData } = useQuery({
    queryKey: ['feed', 'profile', profile?.uid],
    queryFn: () => fetchFeed({ limit: 10 }),
    enabled: !!profile?.uid,
  })
  const posts = feedData?.items?.filter((p) => p.autor_uid === profile?.uid) ?? []

  const { data: meusProjetos = [], isLoading: projetosLoading } = useQuery({
    queryKey: ['profile', 'me', 'projetos', profile?.uid],
    queryFn: () => getInitiativesByUser(profile!.uid),
    enabled: !!profile?.uid && tab === 'projetos',
  })

  const updateM = useMutation({
    mutationFn: updateMyProfile,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profile', 'me'] })
      setEditing(false)
    },
  })

  if (isLoading || !profile) {
    return (
      <div className="page fade-in">
        <div className="empty"><p>Carregando perfil…</p></div>
      </div>
    )
  }

  const initials = getInitials(profile.nome)
  const connCount = connections.length
  const followers = counts?.followers ?? 0
  const following = counts?.following ?? 0

  return (
    <div className="page fade-in">
      <div className="profile-cover">
        <div style={{ position: 'absolute', right: 16, top: 16 }}>
          <button className="btn btn-tertiary btn-sm">
            <Image size={14} />Trocar capa
          </button>
        </div>
      </div>

      <div className="profile-meta">
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div className="av-lg" style={{ background: 'var(--color-purple)', color: '#fff' }}>
            {initials}
          </div>
        </div>
        <div className="head-row">
          <div style={{ minWidth: 0 }}>
            <h1 style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              {profile.nome}
              {profile.is_verified && <BadgeCheck size={20} style={{ color: 'var(--color-blue)', verticalAlign: '-2px' }} />}
            </h1>
            <div className="sub">{profile.cargo ?? TIPO_LABEL[profile.tipo_usuario] ?? 'Membro'}</div>
            <div className="row" style={{ gap: 12, marginTop: 8, flexWrap: 'wrap', fontSize: 13, color: 'var(--color-fg-3)' }}>
              {profile.campus && (
                <span className="row" style={{ gap: 4 }}><MapPin size={14} /> Campus {profile.campus}</span>
              )}
              {profile.email && (
                <span className="row" style={{ gap: 4 }}><Mail size={14} /> {profile.email}</span>
              )}
              {profile.lattes && (
                <span className="row" style={{ gap: 4 }}>
                  <ExternalLink size={14} />
                  <a href={profile.lattes} target="_blank" rel="noopener" style={{ color: 'inherit' }}>Lattes</a>
                </span>
              )}
              {profile.siape && (
                <span className="row" style={{ gap: 4 }}><Badge size={14} /> SIAPE {profile.siape}</span>
              )}
            </div>
          </div>
          <div className="actions">
            <button className="btn btn-tertiary btn-sm" onClick={() => setEditing(true)}>
              Editar perfil
            </button>
            <button className="btn btn-secondary btn-sm">
              <Share2 size={14} />Compartilhar
            </button>
            <button className="btn-icon"><MoreHorizontal size={16} /></button>
          </div>
        </div>

        <div className="stats">
          <div className="stat"><div className="n">{connCount}</div><div className="l">Conexões</div></div>
          <div className="stat"><div className="n">{followers}</div><div className="l">Seguidores</div></div>
          <div className="stat"><div className="n">{following}</div><div className="l">Seguindo</div></div>
          <div className="stat"><div className="n">—</div><div className="l">Projetos ativos</div></div>
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
          ]).map(t => (
            <button key={t.id} className={cn('tab', tab === t.id && 'active')} onClick={() => setTab(t.id)}>
              {t.l}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 24 }} className="grid-feed">
        <div className="col" style={{ gap: 14 }}>
          {tab === 'sobre' && (
            <div className="card">
              <div className="card-body">
                {profile.bio && (
                  <>
                    <h4 style={{ font: '600 16px var(--font-display)', marginBottom: 8 }}>Bio</h4>
                    <p style={{ color: 'var(--color-fg-2)', lineHeight: 1.55, fontSize: 14 }}>{profile.bio}</p>
                    <div style={{ borderTop: '1px solid var(--color-border)', margin: '16px 0' }} />
                  </>
                )}
                {profile.palavras_chave?.length ? (
                  <>
                    <div className="eyebrow" style={{ marginBottom: 8 }}>Áreas de interesse</div>
                    <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>
                      {profile.palavras_chave.map((k: string, i: number) => (
                        <span key={i} className="tag tag-purple">{k}</span>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="muted">Nenhuma informação adicional ainda.</p>
                )}
              </div>
            </div>
          )}

          {tab === 'atividade' && (
            <>
              <div className="eyebrow" style={{ marginBottom: 4 }}>
                Publicações recentes de {profile.nome.split(' ')[0]}
              </div>
              {posts.length === 0 ? (
                <div className="empty">
                  <h3>Nenhuma publicação ainda</h3>
                  <p>Suas publicações aparecerão aqui.</p>
                </div>
              ) : posts.slice(0, 5).map((p) => (
                <div key={p.id} className="post">
                  <div className="post-body">
                    <p>{p.conteudo}</p>
                  </div>
                </div>
              ))}
            </>
          )}

          {tab === 'projetos' && (
            projetosLoading ? (
              <div className="empty"><p>Carregando projetos…</p></div>
            ) : meusProjetos.length === 0 ? (
              <div className="empty">
                <h3>Nenhum projeto vinculado</h3>
                <p>Você ainda não participa de iniciativas.</p>
              </div>
            ) : (
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {meusProjetos.map((p) => (
                  <li key={p.uid}>
                    <a
                      href={`/vitrine/projetos/${p.uid}`}
                      className="block rounded-md border border-border bg-surface p-4 transition-colors duration-fast ease-standard hover:bg-surface-2"
                    >
                      <div className="text-xs uppercase tracking-wide text-fg-3">{p.tipo}</div>
                      <div className="mt-1 truncate text-sm font-semibold text-fg-1">{p.titulo}</div>
                      {p.descricao && (
                        <p className="mt-1 line-clamp-2 text-xs text-fg-2">{p.descricao}</p>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            )
          )}

          {(tab === 'labs' || tab === 'negocios') && (
            <div className="empty">
              <h3>Listagem por usuário pendente</h3>
              <p>O backend ainda não expõe {tab === 'labs' ? 'laboratórios' : 'negócios'} filtrados por membro. Sinalizado para o time de API.</p>
            </div>
          )}

          {tab === 'publicacoes' && (
            <div className="card">
              <div className="card-body">
                <div className="empty" style={{ border: 0, padding: 0 }}>
                  <BookOpen size={28} style={{ color: 'var(--color-fg-3)' }} />
                  <h3>Importar do Lattes</h3>
                  <p>Conecte sua conta Lattes para listar suas publicações automaticamente.</p>
                  <button className="btn btn-secondary btn-sm">
                    <Link size={13} />Conectar Lattes
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <aside className="col" style={{ gap: 16 }}>
          {connections.length > 0 && (
            <div className="card">
              <div className="card-body">
                <div className="eyebrow">Conexões</div>
                <div className="row" style={{ marginTop: 12, gap: 8, flexWrap: 'wrap' }}>
                  {connections.slice(0, 5).map((c: { uid: string; nome: string }, i: number) => (
                    <div
                      key={i}
                      style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--color-purple)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12 }}
                    >
                      {getInitials(c.nome)}
                    </div>
                  ))}
                </div>
                <div className="muted" style={{ marginTop: 10 }}>{connCount} conexões</div>
              </div>
            </div>
          )}

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
                {profile.telefone && (
                  <div className="row" style={{ gap: 10 }}>
                    <span style={{ fontSize: 13.5 }}>{profile.telefone}</span>
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

      {editing && (
        <EditProfileModal
          profile={profile}
          onClose={() => setEditing(false)}
          onSave={(patch) => updateM.mutate(patch)}
          saving={updateM.isPending}
        />
      )}
    </div>
  )
}
