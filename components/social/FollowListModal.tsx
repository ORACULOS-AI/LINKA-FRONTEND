'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { X, User, Briefcase, FlaskConical, Lightbulb, Calendar } from 'lucide-react'
import { getMyConnections } from '@/lib/api/connections'
import { listFollowers, listMyFollowing, type FollowTargetType, type FollowedItem } from '@/lib/api/follow'
import { fetchUser } from '@/lib/api/users'
import { getBusiness } from '@/lib/api/business'
import { getLab } from '@/lib/api/labs'
import { getInitiative } from '@/lib/api/initiatives'
import { getEvent } from '@/lib/api/events'

export type FollowModalMode = 'conexoes' | 'seguidores' | 'seguindo'

const TITLES: Record<FollowModalMode, string> = {
  conexoes: 'Conexões',
  seguidores: 'Seguidores',
  seguindo: 'Seguindo',
}

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

type Props = {
  mode: FollowModalMode
  /** uid do dono do perfil (para conexões/seguidores). "seguindo" usa sempre o user logado. */
  uid: string
  onClose: () => void
}

export function FollowListModal({ mode, uid, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-xl border border-border bg-surface shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-display font-semibold">{TITLES[mode]}</h2>
          <button type="button" onClick={onClose} className="rounded p-1 hover:bg-surface-2">
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="max-h-[60vh] overflow-y-auto px-2 py-2">
          {mode === 'seguindo' ? <FollowingList /> : <PeopleList mode={mode} uid={uid} />}
        </div>
      </div>
    </div>
  )
}

function PeopleList({ mode, uid }: { mode: 'conexoes' | 'seguidores'; uid: string }) {
  const { data = [], isLoading } = useQuery({
    queryKey: ['follow-modal', mode, uid],
    queryFn: async () => {
      if (mode === 'conexoes') return getMyConnections(uid)
      const followers = await listFollowers('user', uid)
      return followers.map((f) => ({ uid: f.uid, nome: f.nome, tipo_usuario: f.tipo_usuario }))
    },
  })

  if (isLoading) return <p className="px-3 py-6 text-center text-sm text-fg-3">Carregando…</p>
  if (data.length === 0) return <p className="px-3 py-6 text-center text-sm text-fg-3">Nada por aqui ainda.</p>

  return (
    <ul>
      {data.map((p) => (
        <li key={p.uid}>
          <Link href={`/perfil/${p.uid}`} className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-surface-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple text-sm font-bold text-white">
              {getInitials(p.nome)}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-fg-1">{p.nome}</div>
              <div className="text-xs text-fg-3">{p.tipo_usuario?.replace('_', ' ') ?? 'Membro'}</div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  )
}

function FollowingList() {
  const { data = [], isLoading } = useQuery({
    queryKey: ['follow-modal', 'seguindo'],
    queryFn: () => listMyFollowing(),
  })

  if (isLoading) return <p className="px-3 py-6 text-center text-sm text-fg-3">Carregando…</p>
  if (data.length === 0) return <p className="px-3 py-6 text-center text-sm text-fg-3">Você ainda não segue ninguém.</p>

  return (
    <ul>
      {data.map((item) => <FollowingItem key={`${item.target_type}:${item.target_id}`} item={item} />)}
    </ul>
  )
}

function FollowingItem({ item }: { item: FollowedItem }) {
  const meta = TYPE_META[item.target_type]
  const Icon = meta.Icon
  const { data: nome } = useQuery({
    queryKey: ['follow-target', item.target_type, item.target_id],
    staleTime: 5 * 60_000,
    queryFn: async () => {
      switch (item.target_type) {
        case 'user':        return (await fetchUser(item.target_id)).nome
        case 'negocio':     return (await getBusiness(item.target_id)).nome
        case 'laboratorio': return (await getLab(item.target_id)).nome
        case 'iniciativa':  return (await getInitiative(item.target_id)).titulo
        case 'evento':      return (await getEvent(item.target_id)).titulo
      }
    },
  })

  return (
    <li>
      <Link href={meta.href(item.target_id)} className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-surface-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-surface-2 text-fg-2">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-fg-1">{nome ?? '…'}</div>
          <div className="text-xs text-fg-3">{meta.label}</div>
        </div>
      </Link>
    </li>
  )
}
