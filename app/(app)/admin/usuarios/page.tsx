'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, BadgeCheck, Shield, Search, Users } from 'lucide-react'
import {
  listAllUsers,
  listUsersByTipo,
  setUserVerified,
  setUserAdmin,
  TIPO_LABEL,
  type UserTipo,
  type UserProfile,
} from '@/lib/api/users'
import { useAuth } from '@/lib/stores/auth'
import { Avatar } from '@/components/ui/avatar'
import { toast, toastApiError } from '@/lib/toast'

export default function AdminUsuariosPage() {
  const me = useAuth((s) => s.me)
  const qc = useQueryClient()
  const [tipo, setTipo] = useState<UserTipo | ''>('')
  const [search, setSearch] = useState('')

  const q = useQuery({
    queryKey: ['admin-users', tipo],
    queryFn: () => (tipo ? listUsersByTipo(tipo) : listAllUsers()),
    enabled: !!me?.is_admin,
  })

  const verifyM = useMutation({
    mutationFn: ({ uid, v }: { uid: string; v: boolean }) => setUserVerified(uid, v),
    onSuccess: () => {
      toast.success('Status de verificação atualizado')
      qc.invalidateQueries({ queryKey: ['admin-users'] })
    },
    onError: (e) => toastApiError(e, 'Falha ao verificar.'),
  })

  const adminM = useMutation({
    mutationFn: ({ uid, v }: { uid: string; v: boolean }) => setUserAdmin(uid, v),
    onSuccess: () => {
      toast.success('Permissão de admin atualizada')
      qc.invalidateQueries({ queryKey: ['admin-users'] })
    },
    onError: (e) => toastApiError(e, 'Falha ao alterar permissão.'),
  })

  if (!me?.is_admin) {
    return (
      <div className="mx-auto max-w-2xl p-6 text-center">
        <p className="text-sm text-[var(--color-fg-3)]">Acesso restrito a administradores.</p>
      </div>
    )
  }

  const filtered: UserProfile[] = (q.data ?? []).filter((u) =>
    !search ? true : `${u.nome} ${u.email}`.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 lg:py-8">
      <Link href="/admin" className="mb-3 inline-flex items-center gap-1 text-sm text-[var(--color-fg-3)]">
        <ArrowLeft className="h-4 w-4" /> Admin
      </Link>
      <h1 className="font-display text-2xl font-semibold flex items-center gap-2">
        <Users className="h-6 w-6" /> Usuários
      </h1>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-fg-3)]" />
          <input
            type="search"
            placeholder="Buscar por nome ou e-mail"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-72 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] pl-9 pr-3 text-sm"
          />
        </label>
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value as UserTipo | '')}
          className="h-10 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm"
        >
          <option value="">Todos os tipos</option>
          {(['pesquisador', 'estudante', 'tecnico_admin', 'externo'] as UserTipo[]).map((t) => (
            <option key={t} value={t}>
              {TIPO_LABEL[t]}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
        {q.isLoading ? (
          <p className="p-6 text-sm text-[var(--color-fg-3)]">Carregando…</p>
        ) : filtered.length === 0 ? (
          <p className="p-6 text-sm text-[var(--color-fg-3)]">Nenhum usuário.</p>
        ) : (
          <ul className="divide-y divide-[var(--color-border)]">
            {filtered.map((u) => (
              <li key={u.uid} className="flex items-center justify-between gap-3 p-3 text-sm">
                <Link href={`/perfil/${u.uid}`} className="flex min-w-0 items-center gap-3">
                  <Avatar nome={u.nome} src={u.foto_perfil ?? null} size={36} />
                  <div className="min-w-0">
                    <div className="truncate font-medium">
                      {u.nome}
                      {u.is_verified && <BadgeCheck className="ml-1 inline h-3.5 w-3.5 text-[var(--color-blue)]" />}
                      {u.is_admin && <Shield className="ml-1 inline h-3.5 w-3.5 text-[var(--color-purple)]" />}
                    </div>
                    <div className="truncate text-xs text-[var(--color-fg-3)]">
                      {u.email} · {TIPO_LABEL[u.tipo_usuario]}
                    </div>
                  </div>
                </Link>
                <div className="flex shrink-0 gap-1">
                  <button
                    onClick={() => verifyM.mutate({ uid: u.uid, v: !u.is_verified })}
                    className="inline-flex h-8 items-center gap-1 rounded-md border border-[var(--color-border)] px-2 text-xs hover:bg-[var(--color-surface-2)]"
                  >
                    <BadgeCheck className="h-3.5 w-3.5" />
                    {u.is_verified ? 'Desverificar' : 'Verificar'}
                  </button>
                  <button
                    onClick={() => adminM.mutate({ uid: u.uid, v: !u.is_admin })}
                    className="inline-flex h-8 items-center gap-1 rounded-md border border-[var(--color-border)] px-2 text-xs hover:bg-[var(--color-surface-2)]"
                  >
                    <Shield className="h-3.5 w-3.5" />
                    {u.is_admin ? 'Remover admin' : 'Tornar admin'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
