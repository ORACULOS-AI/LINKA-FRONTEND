'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Plus, Trash2, Copy, KeyRound } from 'lucide-react'
import { createClaimToken, listClaimTokens, deleteClaimToken, type ClaimTokenCreate } from '@/lib/api/admin'
import { useAuth } from '@/lib/stores/auth'
import { toast, toastApiError } from '@/lib/toast'

export default function AdminTokensPage() {
  const me = useAuth((s) => s.me)
  const qc = useQueryClient()

  const q = useQuery({
    queryKey: ['admin-tokens'],
    queryFn: () => listClaimTokens({ limit: 100 }),
    enabled: !!me?.is_admin,
  })

  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<ClaimTokenCreate>({
    resource_type: 'laboratorio',
    resource_id: '',
    resource_name: '',
    email: '',
    expires_in_days: 30,
  })

  const createM = useMutation({
    mutationFn: () => createClaimToken(form),
    onSuccess: (t) => {
      toast.success('Token gerado e enviado por e-mail')
      qc.invalidateQueries({ queryKey: ['admin-tokens'] })
      navigator.clipboard?.writeText(t.token).catch(() => {})
      setCreating(false)
      setForm({ resource_type: 'laboratorio', resource_id: '', resource_name: '', email: '', expires_in_days: 30 })
    },
    onError: (e) => toastApiError(e, 'Falha ao gerar token.'),
  })

  const delM = useMutation({
    mutationFn: (t: string) => deleteClaimToken(t),
    onSuccess: () => {
      toast.success('Token revogado')
      qc.invalidateQueries({ queryKey: ['admin-tokens'] })
    },
    onError: (e) => toastApiError(e, 'Falha ao revogar.'),
  })

  if (!me?.is_admin) {
    return <div className="mx-auto max-w-2xl p-6 text-center text-sm">Acesso restrito.</div>
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 lg:py-8">
      <Link href="/admin" className="mb-3 inline-flex items-center gap-1 text-sm text-[var(--color-fg-3)]">
        <ArrowLeft className="h-4 w-4" /> Admin
      </Link>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold flex items-center gap-2">
          <KeyRound className="h-6 w-6" /> Tokens de claim
        </h1>
        <button
          onClick={() => setCreating((v) => !v)}
          className="inline-flex h-10 items-center gap-1.5 rounded-md bg-[var(--color-ink)] px-4 text-sm font-medium text-[var(--color-on-dark-1)] hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Gerar token
        </button>
      </div>
      <p className="mt-1 text-sm text-[var(--color-fg-3)]">
        Tokens que permitem que um usuário reivindique a propriedade de um laboratório ou negócio
        pré-cadastrado, mediante verificação de e-mail institucional.
      </p>

      {creating && (
        <form
          onSubmit={(e) => { e.preventDefault(); createM.mutate() }}
          className="mt-4 grid grid-cols-1 gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:grid-cols-2"
        >
          <label className="text-sm">
            <span className="mb-1 block">Tipo</span>
            <select
              value={form.resource_type}
              onChange={(e) => setForm({ ...form, resource_type: e.target.value as 'laboratorio' | 'negocio' })}
              className="input"
            >
              <option value="laboratorio">Laboratório</option>
              <option value="negocio">Negócio</option>
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block">E-mail destinatário</span>
            <input
              type="email" required value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input" placeholder="responsavel@ufc.br"
            />
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="mb-1 block">ID do recurso (UUID)</span>
            <input
              required value={form.resource_id}
              onChange={(e) => setForm({ ...form, resource_id: e.target.value })}
              className="input" placeholder="00000000-0000-0000-0000-000000000000"
            />
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="mb-1 block">Nome do recurso (para o e-mail)</span>
            <input
              required value={form.resource_name}
              onChange={(e) => setForm({ ...form, resource_name: e.target.value })}
              className="input" placeholder="Laboratório de Engenharia"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block">Validade (dias)</span>
            <input
              type="number" min={1} max={365} value={form.expires_in_days ?? 30}
              onChange={(e) => setForm({ ...form, expires_in_days: Number(e.target.value) })}
              className="input"
            />
          </label>
          <div className="flex items-end justify-end gap-2">
            <button type="button" onClick={() => setCreating(false)} className="inline-flex h-10 items-center rounded-md border border-[var(--color-border)] px-4 text-sm">
              Cancelar
            </button>
            <button
              type="submit" disabled={createM.isPending}
              className="inline-flex h-10 items-center rounded-md bg-[var(--color-ink)] px-4 text-sm font-medium text-[var(--color-on-dark-1)] disabled:opacity-50"
            >
              {createM.isPending ? 'Gerando…' : 'Gerar'}
            </button>
          </div>
          <style jsx>{`
            .input { width: 100%; height: 40px; padding: 0 12px; border: 1px solid var(--color-border); border-radius: 8px; background: var(--color-surface); font-size: 14px; }
          `}</style>
        </form>
      )}

      <div className="mt-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
        {q.isLoading ? (
          <p className="p-6 text-sm">Carregando…</p>
        ) : (q.data?.items ?? []).length === 0 ? (
          <p className="p-6 text-sm text-[var(--color-fg-3)]">Nenhum token emitido.</p>
        ) : (
          <ul className="divide-y divide-[var(--color-border)]">
            {(q.data?.items ?? []).map((t) => (
              <li key={t.token} className="flex items-center justify-between gap-3 p-3 text-sm">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <code className="truncate font-mono text-xs">{t.token}</code>
                    <button onClick={() => navigator.clipboard?.writeText(t.token)} title="Copiar" className="text-[var(--color-fg-3)]">
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="text-xs text-[var(--color-fg-3)]">
                    {t.resource_type} · {t.resource_name ?? '—'} · {t.email} · expira{' '}
                    {new Date(t.expires_at).toLocaleDateString('pt-BR')}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${t.claimed ? 'bg-[var(--color-mint-15)] text-[var(--color-mint)]' : 'bg-[var(--color-surface-2)] text-[var(--color-fg-3)]'}`}>
                    {t.claimed ? 'Usado' : 'Ativo'}
                  </span>
                  {!t.claimed && (
                    <button
                      onClick={() => { if (confirm('Revogar token?')) delM.mutate(t.token) }}
                      className="inline-flex h-8 items-center gap-1 rounded-md border border-red-200 px-2 text-xs text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Revogar
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
