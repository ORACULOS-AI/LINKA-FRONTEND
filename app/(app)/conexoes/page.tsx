'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Search, MessageCircle, MoreHorizontal, UserPlus,
  User, Briefcase, FlaskConical, Lightbulb, Calendar,
} from 'lucide-react'
import { getMyConnections, type ConnectionUser } from '@/lib/api/connections'
import {
  listFollowers, listMyFollowing, unfollow,
  type FollowUser, type FollowedItem, type FollowTargetType,
} from '@/lib/api/follow'
import { fetchUser } from '@/lib/api/users'
import { getBusiness } from '@/lib/api/business'
import { getLab } from '@/lib/api/labs'
import { getInitiative } from '@/lib/api/initiatives'
import { getEvent } from '@/lib/api/events'
import { useAuth } from '@/lib/stores/auth'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { PresenceDot } from '@/components/social/PresenceDot'

type Tab = 'conexoes' | 'seguindo' | 'seguidores'

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

export default function ConexoesPage() {
  const [tab, setTab] = useState<Tab>('conexoes')
  const [search, setSearch] = useState('')
  const qc = useQueryClient()
  const myUid = useAuth((s) => s.me?.id ?? '')

  const { data: connections = [] as ConnectionUser[] } = useQuery({
    queryKey: ['connections', 'mine', myUid],
    queryFn: () => getMyConnections(myUid),
    enabled: !!myUid,
  })
  const { data: followers = [] as FollowUser[] } = useQuery({
    queryKey: ['follow', 'followers', myUid],
    queryFn: () => listFollowers('user', myUid),
    enabled: !!myUid,
  })
  const { data: following = [] as FollowedItem[] } = useQuery({
    queryKey: ['follow', 'following', myUid],
    queryFn: () => listMyFollowing(),
    enabled: !!myUid,
  })

  const filteredConnections = connections.filter(
    (c: ConnectionUser) => !search || c.nome.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="page page-narrow fade-in">
      <div className="page-header">
        <div>
          <h1>Conexões</h1>
          <div className="sub">
            {connections.length} conexões · seguindo {following.length} · {followers.length} seguidores.
          </div>
        </div>
        <Link href="/conexoes/sugestoes" className="btn btn-primary btn-sm">
          <UserPlus size={14} />Encontrar pessoas
        </Link>
      </div>

      <div className="tabs-bar">
        {([
          { id: 'conexoes'   as Tab, label: `Conexões · ${connections.length}` },
          { id: 'seguindo'   as Tab, label: `Seguindo · ${following.length}` },
          { id: 'seguidores' as Tab, label: `Seguidores · ${followers.length}` },
        ]).map((t) => (
          <button key={t.id} className={cn('tab', tab === t.id && 'active')} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ─ Conexões (follows mútuos de pessoas) ─ */}
      {tab === 'conexoes' && (
        <>
          <div className="row" style={{ gap: 8, marginBottom: 16 }}>
            <div className="input-affix" style={{ flex: 1 }}>
              <Search size={14} className="ix" />
              <input className="input" placeholder="Filtrar suas conexões…" style={{ paddingLeft: 38 }} value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
          {filteredConnections.length === 0 ? (
            <div className="empty">
              <h3>Sem conexões ainda</h3>
              <p>Conexão acontece quando você e outra pessoa se seguem mutuamente.</p>
              <Link href="/conexoes/sugestoes" className="btn btn-primary"><UserPlus size={14} />Ver sugestões</Link>
            </div>
          ) : (
            <div className="col" style={{ gap: 12 }}>
              {filteredConnections.map((c: ConnectionUser) => (
                <div key={c.uid} className="person-row">
                  <div style={{ position: 'relative', flex: 'none' }}>
                    <Link href={`/perfil/${c.uid}`}>
                      <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--color-purple)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '700 18px var(--font-display)' }}>
                        {getInitials(c.nome)}
                      </div>
                    </Link>
                    <PresenceDot uid={c.uid} className="absolute right-0 bottom-0" />
                  </div>
                  <div className="body">
                    <Link href={`/perfil/${c.uid}`} className="nm">{c.nome}</Link>
                    <div className="sub">{c.tipo_usuario?.replace('_', ' ') ?? 'Membro'}</div>
                  </div>
                  <div className="row" style={{ gap: 8 }}>
                    <Link href={`/mensagens?to=${c.uid}`} className="btn btn-tertiary btn-sm">
                      <MessageCircle size={13} />Mensagem
                    </Link>
                    <button className="btn-icon"><MoreHorizontal size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ─ Seguindo (polimórfico: pessoas + negócios + labs + projetos + eventos) ─ */}
      {tab === 'seguindo' && (
        following.length === 0 ? (
          <div className="empty">
            <h3>Você ainda não segue ninguém</h3>
            <p>Siga pessoas, laboratórios, projetos, negócios e eventos para acompanhá-los no feed.</p>
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
        followers.length === 0 ? (
          <div className="empty"><h3>Nenhum seguidor ainda</h3></div>
        ) : (
          <div className="col" style={{ gap: 12 }}>
            {followers.map((f) => (
              <div key={f.uid} className="person-row">
                <div style={{ position: 'relative', flex: 'none' }}>
                  <Link href={`/perfil/${f.uid}`}>
                    <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--color-purple)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '700 18px var(--font-display)' }}>
                      {getInitials(f.nome)}
                    </div>
                  </Link>
                  <PresenceDot uid={f.uid} className="absolute right-0 bottom-0" />
                </div>
                <div className="body">
                  <Link href={`/perfil/${f.uid}`} className="nm">{f.nome}</Link>
                  <div className="sub">{f.tipo_usuario?.replace('_', ' ') ?? 'Membro'}</div>
                </div>
                <Link href={`/perfil/${f.uid}`} className="btn btn-tertiary btn-sm">Ver perfil</Link>
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
        <div style={{ width: 52, height: 52, borderRadius: 'var(--radius-md)', background: 'var(--color-surface-2)', color: 'var(--color-fg-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
