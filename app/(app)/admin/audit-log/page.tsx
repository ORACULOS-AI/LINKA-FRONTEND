'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, FileText } from 'lucide-react'
import { listAuditLog } from '@/lib/api/admin'
import { useAuth } from '@/lib/stores/auth'

export default function AuditLogPage() {
  const me = useAuth((s) => s.me)
  const [action, setAction] = useState('')
  const [resourceType, setResourceType] = useState('')

  const q = useQuery({
    queryKey: ['audit-log', action, resourceType],
    queryFn: () =>
      listAuditLog({
        action: action || undefined,
        resource_type: resourceType || undefined,
        limit: 100,
      }),
    enabled: !!me?.is_admin,
  })

  if (!me?.is_admin) return <div className="p-6 text-sm">Acesso restrito.</div>

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 lg:py-8">
      <Link href="/admin" className="mb-3 inline-flex items-center gap-1 text-sm text-[var(--color-fg-3)]">
        <ArrowLeft className="h-4 w-4" /> Admin
      </Link>
      <h1 className="font-display text-2xl font-semibold flex items-center gap-2">
        <FileText className="h-6 w-6" /> Log de auditoria
      </h1>

      <div className="mt-4 flex flex-wrap gap-2">
        <input
          placeholder="Filtrar por ação (ex: USER_VERIFIED)"
          value={action}
          onChange={(e) => setAction(e.target.value)}
          className="h-10 w-72 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm"
        />
        <input
          placeholder="Filtrar por resource_type"
          value={resourceType}
          onChange={(e) => setResourceType(e.target.value)}
          className="h-10 w-72 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm"
        />
      </div>

      <div className="mt-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
        {q.isLoading ? (
          <p className="p-6 text-sm">Carregando…</p>
        ) : (q.data ?? []).length === 0 ? (
          <p className="p-6 text-sm text-[var(--color-fg-3)]">Nenhum evento.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-[var(--color-fg-3)]">
              <tr>
                <th className="p-3">Quando</th>
                <th className="p-3">Ator</th>
                <th className="p-3">Ação</th>
                <th className="p-3">Recurso</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {(q.data ?? []).map((e) => (
                <tr key={e.id}>
                  <td className="p-3 text-xs text-[var(--color-fg-3)]">
                    {new Date(e.created_at).toLocaleString('pt-BR')}
                  </td>
                  <td className="p-3">
                    {e.actor_uid ? (
                      <Link href={`/perfil/${e.actor_uid}`} className="font-mono text-xs">
                        {e.actor_uid.slice(-8)}
                      </Link>
                    ) : (
                      <span className="text-xs text-[var(--color-fg-3)]">sistema</span>
                    )}
                  </td>
                  <td className="p-3">
                    <code className="rounded bg-[var(--color-surface-2)] px-1.5 py-0.5 text-xs">{e.action}</code>
                  </td>
                  <td className="p-3 text-xs text-[var(--color-fg-3)]">
                    {e.resource_type ?? '—'} {e.resource_id && `· ${e.resource_id.slice(-8)}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
