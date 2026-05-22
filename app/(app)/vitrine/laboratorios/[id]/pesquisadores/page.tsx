'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Search, UserPlus, UserMinus, Loader2 } from 'lucide-react'
import { getLab, addLabResearcher, removeLabResearcher } from '@/lib/api/labs'
import { autocomplete, type AutocompleteHit } from '@/lib/api/search'
import { fetchUser } from '@/lib/api/users'
import { useAuth } from '@/lib/stores/auth'
import { Avatar } from '@/components/ui/avatar'
import { toast, toastApiError } from '@/lib/toast'

export default function LabPesquisadoresPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const me = useAuth((s) => s.me)
  const qc = useQueryClient()

  const labQ = useQuery({ queryKey: ['lab', id], queryFn: () => getLab(id) })

  const [query, setQuery] = useState('')
  const acQ = useQuery({
    queryKey: ['autocomplete-user', query],
    queryFn: () => autocomplete(query, 8),
    enabled: query.length >= 2,
  })

  const addM = useMutation({
    mutationFn: (uid: string) => addLabResearcher(id, uid),
    onSuccess: () => {
      toast.success('Pesquisador adicionado')
      qc.invalidateQueries({ queryKey: ['lab', id] })
      setQuery('')
    },
    onError: (e) => toastApiError(e, 'Falha ao adicionar.'),
  })

  const removeM = useMutation({
    mutationFn: (uid: string) => removeLabResearcher(id, uid),
    onSuccess: () => {
      toast.success('Pesquisador removido')
      qc.invalidateQueries({ queryKey: ['lab', id] })
    },
    onError: (e) => toastApiError(e, 'Falha ao remover.'),
  })

  if (labQ.isLoading) return <div className="p-6 text-sm">Carregando…</div>
  if (!labQ.data) return <div className="p-6 text-sm">Laboratório não encontrado.</div>
  const lab = labQ.data

  const isOwner = me?.id === (lab as { uid_admin?: string }).uid_admin || !!me?.is_admin
  if (me && !isOwner) {
    return (
      <div className="mx-auto max-w-2xl p-6 text-center">
        <p className="text-sm text-[var(--color-fg-3)]">
          Apenas o responsável pelo laboratório pode gerenciar pesquisadores.
        </p>
        <Link href={`/vitrine/laboratorios/${id}`} className="mt-3 inline-block text-sm font-semibold">
          Voltar
        </Link>
      </div>
    )
  }

  const userHits = (acQ.data ?? []).filter((h: AutocompleteHit) => h.tipo === 'user')

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 lg:py-8">
      <Link href={`/vitrine/laboratorios/${id}`} className="mb-3 inline-flex items-center gap-1 text-sm text-[var(--color-fg-3)]">
        <ArrowLeft className="h-4 w-4" /> Voltar ao laboratório
      </Link>
      <h1 className="font-display text-2xl font-semibold">Pesquisadores · {lab.nome}</h1>
      <p className="mt-1 text-sm text-[var(--color-fg-3)]">
        Adicione pesquisadores ao time do laboratório. Eles aparecerão na página pública.
      </p>

      {/* Search */}
      <div className="mt-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Buscar pesquisador</span>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-fg-3)]" />
            <input
              type="search"
              placeholder="Nome do pesquisador"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-10 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-blue)]"
            />
          </div>
        </label>

        {query.length >= 2 && (
          <div className="mt-3">
            {acQ.isLoading ? (
              <p className="flex items-center gap-2 text-sm text-[var(--color-fg-3)]">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Buscando…
              </p>
            ) : userHits.length === 0 ? (
              <p className="text-sm text-[var(--color-fg-3)]">Nenhum usuário encontrado.</p>
            ) : (
              <ul className="space-y-1">
                {userHits.map((h) => (
                  <li
                    key={h.id}
                    className="flex items-center justify-between rounded-md border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-2 text-sm"
                  >
                    <span>
                      <strong>{h.label}</strong>
                      {h.sublabel && (
                        <span className="ml-2 text-xs text-[var(--color-fg-3)]">{h.sublabel}</span>
                      )}
                    </span>
                    <button
                      onClick={() => addM.mutate(h.id)}
                      disabled={addM.isPending}
                      className="inline-flex h-8 items-center gap-1 rounded-md bg-[var(--color-ink)] px-3 text-xs text-[var(--color-on-dark-1)] hover:opacity-90 disabled:opacity-50"
                    >
                      <UserPlus className="h-3.5 w-3.5" /> Adicionar
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Lista de pesquisadores atuais */}
      <div className="mt-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <h2 className="font-display font-semibold">Time atual ({lab.pesquisadores?.length ?? 0})</h2>
        {(!lab.pesquisadores || lab.pesquisadores.length === 0) ? (
          <p className="mt-3 text-sm text-[var(--color-fg-3)]">Nenhum pesquisador vinculado ainda.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {lab.pesquisadores.map((uid) => (
              <ResearcherRow key={uid} uid={uid} onRemove={() => removeM.mutate(uid)} removing={removeM.isPending} />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function ResearcherRow({ uid, onRemove, removing }: { uid: string; onRemove: () => void; removing: boolean }) {
  const q = useQuery({ queryKey: ['user-lite', uid], queryFn: () => fetchUser(uid) })
  const u = q.data
  return (
    <li className="flex items-center justify-between rounded-md border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-2 text-sm">
      <Link href={`/perfil/${uid}`} className="flex items-center gap-3 min-w-0">
        <Avatar nome={u?.nome ?? '?'} src={u?.foto_perfil ?? null} size={32} />
        <div className="min-w-0">
          <div className="truncate font-medium">{u?.nome ?? uid.slice(-8)}</div>
          {u?.email && <div className="truncate text-xs text-[var(--color-fg-3)]">{u.email}</div>}
        </div>
      </Link>
      <button
        onClick={() => { if (confirm('Remover pesquisador?')) onRemove() }}
        disabled={removing}
        className="inline-flex h-8 items-center gap-1 rounded-md border border-red-200 px-3 text-xs text-red-700 hover:bg-red-50 disabled:opacity-50"
      >
        <UserMinus className="h-3.5 w-3.5" /> Remover
      </button>
    </li>
  )
}
