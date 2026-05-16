'use client'

import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { X, Send } from 'lucide-react'
import { getMutualUids } from '@/lib/api/follow'
import { fetchUser } from '@/lib/api/users'
import { createThread } from '@/lib/api/messages'
import { useAuth } from '@/lib/stores/auth'
import { Avatar } from '@/components/ui/avatar'
import { EmptyState, SkeletonList } from '@/components/primitives'
import { toast, toastApiError } from '@/lib/toast'
import { cn } from '@/lib/utils'

type Props = {
  open: boolean
  onClose: () => void
  initialTarget?: string | null
  onCreated?: (threadId: string) => void
}

export function NewThreadModal({ open, onClose, initialTarget, onCreated }: Props) {
  const me = useAuth((s) => s.me)
  const [selected, setSelected] = useState<string | null>(initialTarget ?? null)
  const [msg, setMsg] = useState('')

  const mutuals = useQuery({
    queryKey: ['mutual-uids', me?.id],
    queryFn: () => getMutualUids(me!.id),
    enabled: open && !!me?.id,
  })

  const users = useQuery({
    queryKey: ['mutual-users', mutuals.data],
    queryFn: async () => {
      const uids = mutuals.data ?? []
      const results = await Promise.all(
        uids.map(async (uid) => {
          try { return await fetchUser(uid) } catch { return null }
        }),
      )
      return results.filter((u): u is NonNullable<typeof u> => u !== null)
    },
    enabled: !!mutuals.data?.length,
  })

  const send = useMutation({
    mutationFn: async () => {
      if (!selected || !msg.trim()) throw new Error('preencha')
      return createThread({ participantes: [selected], mensagem_inicial: msg.trim() })
    },
    onSuccess: (t) => {
      toast.success('Conversa iniciada')
      onCreated?.(t.id)
      onClose()
    },
    onError: (err) => toastApiError(err, 'Não foi possível iniciar a conversa.'),
  })

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Nova conversa"
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/60 px-4 py-6 sm:items-center"
      onClick={onClose}
    >
      <div
        className="flex max-h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-[var(--color-surface)] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
          <h2 className="font-display text-lg font-semibold">Nova conversa</h2>
          <button
            type="button" aria-label="Fechar"
            onClick={onClose}
            className="rounded-full p-1.5 text-[var(--color-fg-3)] hover:bg-[var(--color-surface-2)]"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="overflow-y-auto px-5 py-3">
          <p className="mb-3 text-xs text-[var(--color-fg-3)]">
            Só é possível iniciar conversas com pessoas que você segue e que te seguem de volta.
          </p>
          {mutuals.isLoading || users.isLoading ? (
            <SkeletonList count={3} />
          ) : !users.data?.length ? (
            <EmptyState
              title="Nenhum contato mútuo ainda"
              description="Siga pessoas e seja seguido para liberar conversas."
              action={{ label: 'Encontrar pessoas', href: '/vitrine' }}
            />
          ) : (
            <ul className="space-y-1">
              {users.data.map((u) => (
                <li key={u.uid}>
                  <button
                    type="button"
                    onClick={() => setSelected(u.uid)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left text-sm',
                      selected === u.uid ? 'bg-[var(--color-surface-2)]' : 'hover:bg-[var(--color-surface-2)]',
                    )}
                  >
                    <Avatar nome={u.nome} src={u.foto_perfil ?? u.foto_url ?? undefined} size={36} />
                    <span className="min-w-0 flex-1 truncate">
                      <span className="block font-medium">{u.nome}</span>
                      <span className="block text-xs text-[var(--color-fg-3)]">{u.tipo_usuario}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface-2)] px-5 py-3">
          <textarea
            rows={2}
            placeholder="Escreva sua mensagem…"
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            disabled={!selected}
            className="w-full resize-none rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm focus:border-[var(--color-blue)] focus:outline-none disabled:opacity-50"
          />
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              disabled={!selected || !msg.trim() || send.isPending}
              onClick={() => send.mutate()}
              className="inline-flex items-center gap-1.5 rounded-md bg-[var(--color-ink)] px-3 py-1.5 text-sm font-medium text-[var(--color-on-dark-1)] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              Enviar
            </button>
          </div>
        </footer>
      </div>
    </div>
  )
}
