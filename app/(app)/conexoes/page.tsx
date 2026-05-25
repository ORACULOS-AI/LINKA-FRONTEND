'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import {
  Search, MessageCircle, UserPlus, Users, Eye, UserCheck,
  User, Briefcase, FlaskConical, Lightbulb, Calendar,
} from 'lucide-react'
import { getMyConnections, type ConnectionUser } from '@/lib/api/connections'
import {
  listFollowers, listMyFollowing, unfollow,
  type FollowUser, type FollowedItem, type FollowTargetType,
} from '@/lib/api/follow'
import { getPresenceMap } from '@/lib/api/presence'
import { fetchUser } from '@/lib/api/users'
import { getBusiness } from '@/lib/api/business'
import { getLab } from '@/lib/api/labs'
import { getInitiative } from '@/lib/api/initiatives'
import { getEvent } from '@/lib/api/events'
import { useAuth } from '@/lib/stores/auth'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { PresenceDotBulk } from '@/components/social/PresenceDot'
import { FollowButton } from '@/components/social/FollowButton'

type Tab = 'conexoes' | 'seguindo' | 'seguidores'

const TABS: { id: Tab; label: string; Icon: typeof Users }[] = [
  { id: 'conexoes',   label: 'Conexões',   Icon: Users },
  { id: 'seguindo',   label: 'Seguindo',   Icon: Eye },
  { id: 'seguidores', label: 'Seguidores', Icon: UserCheck },
]

const TYPE_META: Record<FollowTargetType, { label: string; Icon: typeof User; href: (id: string) => string }> = {
  user:        { label: 'Pessoa',       Icon: User,         href: (id) => `/perfil/${id}` },
  negocio:     { label: 'Negócio',      Icon: Briefcase,    href: (id) => `/vitrine/negocios/${id}` },
  laboratorio: { label: 'Laboratório',  Icon: FlaskConical, href: (id) => `/vitrine/laboratorios/${id}` },
  iniciativa:  { label: 'Projeto',      Icon: Lightbulb,    href: (id) => `/vitrine/projetos/${id}` },
  evento:      { label: 'Evento',       Icon: Calendar,     href: (id) => `/vitrine/eventos/${id}` },
}

function getInitials(nome: string) {
  return nome.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
}

function PersonAvatar({ nome, foto, size = 48 }: { nome: string; foto?: string | null; size?: number }) {
  if (foto) {
    return (
      <img
        src={foto}
        alt={nome}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }}
      />
    )
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'var(--color-purple)', color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      font: `700 ${Math.round(size * 0.36)}px var(--font-display)`,
    }}>
      {getInitials(nome)}
    </div>
  )
}

function SkeletonRows({ count = 4 }: { count?: number }) {
  return (
    <div className="col" style={{ gap: 12 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="person-row skeleton-row">
          <div className="skeleton-circle" style={{ width: 48, height: 48 }} />
          <div className="body" style={{ gap: 6, display: 'flex', flexDirection: 'column' }}>
            <div className="skeleton-line" style={{ width: '60%', height: 14 }} />
            <div className="skeleton-line" style={{ width: '35%', height: 12 }} />
          </div>
          <div className="skeleton-line" style={{ width: 80, height: 32, borderRadius: 'var(--radius-md)' }} />
        </div>
      ))}
    </div>
  )
}

export default function ConexoesPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialTab = (searchParams.get('tab') as Tab) || 'conexoes'
  const [tab, setTab] = useState<Tab>(initialTab)
  const [search, setSearch] = useState('')
  const qc = useQueryClient()
  const myUid = useAuth((s) => s.me?.id ?? '')

  const handleTabChange = (t: Tab) => {
    setTab(t)
    router.replace(`/conexoes?tab=${t}`, { scroll: false })
  }

  const { data: connections = [], isLoading: loadingConns } = useQuery({
    queryKey: ['connections', 'mine', myUid],
    queryFn: () => getMyConnections(myUid),
    enabled: !!myUid,
  })
  const { data: followers = [], isLoading: loadingFollowers } = useQuery({
    queryKey: ['follow', 'followers', myUid],
    queryFn: () => listFollowers('user', myUid),
    enabled: !!myUid,
  })
  const { data: following = [], isLoading: loadingFollowing } = useQuery({
    queryKey: ['follow', 'following', myUid],
    queryFn: () => listMyFollowing(),
    enabled: !!myUid,
  })

  // Batch presence for connections + followers
  const allUserUids = useMemo(() => {
    const uids = new Set<string>()
    connections.forEach((c: ConnectionUser) => uids.add(c.uid))
    followers.forEach((f: FollowUser) => uids.add(f.uid))
    return Array.from(uids)
  }, [connections, followers])

  const { data: presenceMap } = useQuery({
    queryKey: ['presence', 'bulk', ...allUserUids],
    queryFn: () => getPresenceMap(allUserUids),
    enabled: allUserUids.length > 0,
    staleTime: 60_000,
    refetchInterval: 90_000,
  })

  const filteredConnections = connections.filter(
    (c: ConnectionUser) => !search || c.nome.toLowerCase().includes(search.toLowerCase()),
  )

  const tabCounts = {
    conexoes: connections.length,
    seguindo: following.length,
    seguidores: followers.length,
  }

  return (
    <div className="page page-narrow fade-in">
      <div className="page-header">
        <div>
          <h1>Conexões</h1>
          <div className="sub">
            {connections.length} conexões · seguindo {following.length} · {followers.length} seguidores
          </div>
        </div>
        <Link href="/conexoes/sugestoes" className="btn btn-primary btn-sm">
          <UserPlus size={14} />Encontrar pessoas
        </Link>
      </div>

      <div className="tabs-bar">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={cn('tab', tab === t.id && 'active')}
            onClick={() => handleTabChange(t.id)}
          >
            <t.Icon size={14} />
            {t.label} · {tabCounts[t.id]}
          </button>
        ))}
      </div>

      {/* ─ Conexões (follows mútuos de pessoas) ─ */}
      {tab === 'conexoes' && (
        <>
          <div className="row" style={{ gap: 8, marginBottom: 16 }}>
            <div className="input-affix" style={{ flex: 1 }}>
              <Search size={14} className="ix" />
              <input
                className="input"
                placeholder="Filtrar suas conexões…"
                style={{ paddingLeft: 38 }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          {loadingConns ? (
            <SkeletonRows />
          ) : filteredConnections.length === 0 ? (
            <div className="empty">
              <Users size={32} style={{ color: 'var(--color-fg-3)', marginBottom: 8 }} />
              <div className="eyebrow">CONEXÕES</div>
              <h3>Sem conexões ainda</h3>
              <p>Conexão acontece quando você e outra pessoa se seguem mutuamente.</p>
              <Link href="/conexoes/sugestoes" className="btn btn-primary">
                <UserPlus size={14} />Ver sugestões
              </Link>
            </div>
          ) : (
            <div className="col" style={{ gap: 12 }}>
              {filteredConnections.map((c: ConnectionUser) => (
                <div key={c.uid} className="person-row">
                  <div style={{ position: 'relative', flex: 'none' }}>
                    <Link href={`/perfil/${c.uid}`}>
                      <PersonAvatar nome={c.nome} foto={c.foto_url} size={48} />
                    </Link>
                    <PresenceDotBulk uid={c.uid} presenceMap={presenceMap} className="absolute right-0 bottom-0" />
                  </div>
                  <div className="body">
                    <Link href={`/perfil/${c.uid}`} className="nm">{c.nome}</Link>
                    <div className="sub">{c.tipo_usuario?.replace('_', ' ') ?? 'Membro'}</div>
                  </div>
                  <Link href={`/mensagens?to=${c.uid}`} className="btn btn-tertiary btn-sm">
                    <MessageCircle size={13} />Mensagem
                  </Link>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ─ Seguindo (polimórfico: pessoas + negócios + labs + projetos + eventos) ─ */}
      {tab === 'seguindo' && (
        loadingFollowing ? (
          <SkeletonRows />
        ) : following.length === 0 ? (
          <div className="empty">
            <Eye size={32} style={{ color: 'var(--color-fg-3)', marginBottom: 8 }} />
            <div className="eyebrow">SEGUINDO</div>
            <h3>Você ainda não segue ninguém</h3>
            <p>Siga pessoas, laboratórios, projetos, negócios e eventos para acompanhá-los no feed.</p>
            <Link href="/conexoes/sugestoes" className="btn btn-primary">
              <UserPlus size={14} />Ver sugestões
            </Link>
          </div>
        ) : (
          <div className="col" style={{ gap: 12 }}>
            {following.map((item) => (
              <FollowingRow
                key={`${item.target_type}:${item.target_id}`}
                item={item}
                onUnfollow={async () => {
                  await unfollow(item.target_type, item.target_id)
                  qc.invalidateQueries({ queryKey: ['follow', 'following', myUid] })
                  qc.invalidateQueries({ queryKey: ['connections', 'mine', myUid] })
                  toast.success('Deixou de seguir')
                }}
              />
            ))}
          </div>
        )
      )}

      {/* ─ Seguidores (quem segue você) ─ */}
      {tab === 'seguidores' && (
        loadingFollowers ? (
          <SkeletonRows />
        ) : followers.length === 0 ? (
          <div className="empty">
            <UserCheck size={32} style={{ color: 'var(--color-fg-3)', marginBottom: 8 }} />
            <div className="eyebrow">SEGUIDORES</div>
            <h3>Nenhum seguidor ainda</h3>
            <p>Participe de projetos e siga pessoas para aumentar sua visibilidade.</p>
          </div>
        ) : (
          <div className="col" style={{ gap: 12 }}>
            {followers.map((f) => (
              <div key={f.uid} className="person-row">
                <div style={{ position: 'relative', flex: 'none' }}>
                  <Link href={`/perfil/${f.uid}`}>
                    <PersonAvatar nome={f.nome} foto={f.foto_perfil} size={48} />
                  </Link>
                  <PresenceDotBulk uid={f.uid} presenceMap={presenceMap} className="absolute right-0 bottom-0" />
                </div>
                <div className="body">
                  <Link href={`/perfil/${f.uid}`} className="nm">{f.nome}</Link>
                  <div className="sub">{f.tipo_usuario?.replace('_', ' ') ?? 'Membro'}</div>
                </div>
                <div className="row" style={{ gap: 8 }}>
                  <FollowButton type="user" id={f.uid} size="sm" />
                  <Link href={`/perfil/${f.uid}`} className="btn btn-tertiary btn-sm">Ver perfil</Link>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}

function FollowingRow({ item, onUnfollow }: { item: FollowedItem; onUnfollow: () => Promise<void> }) {
  const meta = TYPE_META[item.target_type]
  const Icon = meta.Icon

  const { data: nome } = useQuery({
    queryKey: ['follow-target', item.target_type, item.target_id],
    queryFn: async () => {
      switch (item.target_type) {
        case 'user':        return (await fetchUser(item.target_id)).nome
        case 'negocio':     return (await getBusiness(item.target_id)).nome
        case 'laboratorio': return (await getLab(item.target_id)).nome
        case 'iniciativa':  return (await getInitiative(item.target_id)).titulo
        case 'evento':      return (await getEvent(item.target_id)).titulo
      }
    },
    staleTime: 5 * 60_000,
  })

  const unfollowM = useMutation({
    mutationFn: onUnfollow,
    onError: () => toast.error('Falha ao deixar de seguir'),
  })

  return (
    <div className="person-row">
      <Link href={meta.href(item.target_id)} style={{ flex: 'none' }}>
        <div style={{
          width: 48, height: 48, borderRadius: 'var(--radius-md)',
          background: 'var(--color-surface-2)', color: 'var(--color-fg-2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={20} />
        </div>
      </Link>
      <div className="body">
        <Link href={meta.href(item.target_id)} className="nm">{nome ?? '…'}</Link>
        <div className="sub">{meta.label}</div>
      </div>
      <button className="btn btn-tertiary btn-sm" onClick={() => unfollowM.mutate()} disabled={unfollowM.isPending}>
        Seguindo
      </button>
    </div>
  )
}
