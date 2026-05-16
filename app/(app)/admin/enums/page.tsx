'use client'

import { useState, useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Save, Trash2, Loader2 } from 'lucide-react'
import {
  listAdminEnums,
  createEnumValue,
  updateEnumValue,
  deleteEnumValue,
} from '@/lib/api/admin'
import { useAuth } from '@/lib/stores/auth'
import { EmptyState, SkeletonList } from '@/components/primitives'
import { toast, toastApiError } from '@/lib/toast'
import { cn } from '@/lib/utils'

export default function AdminEnumsPage() {
  const isAdmin = useAuth((s) => Boolean(s.me?.is_admin))
  const qc = useQueryClient()
  const [selectedKey, setSelectedKey] = useState<string | null>(null)

  const q = useQuery({
    queryKey: ['admin', 'enums'],
    queryFn: listAdminEnums,
    enabled: isAdmin,
  })

  const groups = q.data ?? []
  const current = groups.find((g) => g.enum_key === selectedKey) ?? groups[0]

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <EmptyState
          title="Acesso restrito"
          description="Esta página é exclusiva de administradores do tenant."
          action={{ label: 'Ir para o feed', href: '/feed' }}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-6xl gap-6 px-4 py-6 lg:py-8">
      <aside className="w-56 shrink-0">
        <h1 className="font-display text-lg font-semibold">Enums</h1>
        <p className="mt-1 text-xs text-[var(--color-fg-3)]">
          Configure listas dinâmicas do tenant.
        </p>
        {q.isLoading ? (
          <SkeletonList count={4} showAvatar={false} lines={1} />
        ) : (
          <ul className="mt-4 space-y-0.5">
            {groups.map((g) => (
              <li key={g.enum_key}>
                <button
                  type="button"
                  onClick={() => setSelectedKey(g.enum_key)}
                  className={cn(
                    'w-full rounded-md px-3 py-2 text-left text-sm',
                    (current?.enum_key === g.enum_key)
                      ? 'bg-[var(--color-ink)] text-[var(--color-on-dark-1)]'
                      : 'hover:bg-[var(--color-surface-2)]',
                  )}
                >
                  <span className="block font-medium">{g.enum_key}</span>
                  <span className="block text-[11px] opacity-70">{g.values.length} valor(es)</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>

      <section className="flex-1 min-w-0">
        {current ? (
          <EnumEditor
            enumKey={current.enum_key}
            values={current.values}
            onMutated={() => qc.invalidateQueries({ queryKey: ['admin', 'enums'] })}
          />
        ) : (
          <EmptyState title="Selecione um enum à esquerda" />
        )}
      </section>
    </div>
  )
}

type EnumEditorProps = {
  enumKey: string
  values: { value: string; label: string; order: number; active: boolean; metadata?: Record<string, unknown> | null }[]
  onMutated: () => void
}

function EnumEditor({ enumKey, values, onMutated }: EnumEditorProps) {
  const sorted = useMemo(() => [...values].sort((a, b) => a.order - b.order), [values])

  return (
    <div>
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold">{enumKey}</h2>
          <p className="text-xs text-[var(--color-fg-3)]">
            Adicione, edite e reordene valores. Atenção: novos valores podem exigir migration se houver CheckConstraint.
          </p>
        </div>
      </header>

      <div className="overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-surface-2)] text-xs uppercase tracking-wide text-[var(--color-fg-3)]">
            <tr>
              <th className="px-3 py-2 text-left">Value</th>
              <th className="px-3 py-2 text-left">Label</th>
              <th className="px-3 py-2 text-left w-20">Ordem</th>
              <th className="px-3 py-2 text-left w-20">Ativo</th>
              <th className="px-3 py-2 w-32"></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((v) => (
              <EnumRow key={`${enumKey}-${v.value}`} enumKey={enumKey} value={v} onMutated={onMutated} />
            ))}
          </tbody>
        </table>
      </div>

      <NewValueRow enumKey={enumKey} onMutated={onMutated} />
    </div>
  )
}

function EnumRow({
  enumKey,
  value,
  onMutated,
}: {
  enumKey: string
  value: EnumEditorProps['values'][number]
  onMutated: () => void
}) {
  const [label, setLabel] = useState(value.label)
  const [order, setOrder] = useState(value.order)
  const [active, setActive] = useState(value.active)
  const dirty = label !== value.label || order !== value.order || active !== value.active

  const save = useMutation({
    mutationFn: () => updateEnumValue(enumKey, value.value, { label, order, active }),
    onSuccess: () => { toast.success('Atualizado'); onMutated() },
    onError: (err) => toastApiError(err),
  })

  const del = useMutation({
    mutationFn: () => deleteEnumValue(enumKey, value.value),
    onSuccess: () => { toast.success('Removido'); onMutated() },
    onError: (err) => toastApiError(err),
  })

  return (
    <tr className="border-t border-[var(--color-border)]">
      <td className="px-3 py-2 font-mono text-xs">{value.value}</td>
      <td className="px-3 py-2">
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-sm"
        />
      </td>
      <td className="px-3 py-2">
        <input
          type="number"
          value={order}
          onChange={(e) => setOrder(Number(e.target.value))}
          className="w-16 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-sm tabular-nums"
        />
      </td>
      <td className="px-3 py-2">
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
        />
      </td>
      <td className="px-3 py-2 text-right">
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            disabled={!dirty || save.isPending}
            onClick={() => save.mutate()}
            className="inline-flex h-7 items-center gap-1 rounded-md bg-[var(--color-ink)] px-2 text-xs font-medium text-[var(--color-on-dark-1)] hover:opacity-90 disabled:opacity-50"
          >
            {save.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
            Salvar
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm(`Remover ${value.value}?`)) del.mutate()
            }}
            className="inline-flex h-7 items-center justify-center rounded-md border border-[var(--color-border)] px-2 text-xs text-[var(--color-fg-2)] hover:bg-[var(--color-surface-2)]"
            aria-label="Remover"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </td>
    </tr>
  )
}

function NewValueRow({ enumKey, onMutated }: { enumKey: string; onMutated: () => void }) {
  const [value, setValue] = useState('')
  const [label, setLabel] = useState('')
  const [order, setOrder] = useState(0)

  const create = useMutation({
    mutationFn: () => createEnumValue(enumKey, value, { label, order, active: true }),
    onSuccess: () => {
      toast.success('Valor criado')
      setValue('')
      setLabel('')
      setOrder(0)
      onMutated()
    },
    onError: (err) => toastApiError(err),
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (!value.trim() || !label.trim()) return
        create.mutate()
      }}
      className="mt-3 flex flex-wrap items-end gap-2 rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-3"
    >
      <label className="flex-1 text-xs">
        <span className="mb-1 block font-medium text-[var(--color-fg-2)]">Value</span>
        <input
          required value={value} onChange={(e) => setValue(e.target.value)}
          placeholder="ex: aprovado"
          className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1.5 text-sm"
        />
      </label>
      <label className="flex-1 text-xs">
        <span className="mb-1 block font-medium text-[var(--color-fg-2)]">Label</span>
        <input
          required value={label} onChange={(e) => setLabel(e.target.value)}
          placeholder="ex: Aprovado"
          className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1.5 text-sm"
        />
      </label>
      <label className="text-xs">
        <span className="mb-1 block font-medium text-[var(--color-fg-2)]">Ordem</span>
        <input
          type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))}
          className="w-20 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1.5 text-sm tabular-nums"
        />
      </label>
      <button
        type="submit"
        disabled={create.isPending || !value.trim() || !label.trim()}
        className="inline-flex h-9 items-center gap-1 rounded-md bg-[var(--color-ink)] px-3 text-sm font-medium text-[var(--color-on-dark-1)] hover:opacity-90 disabled:opacity-50"
      >
        <Plus className="h-4 w-4" />
        Adicionar
      </button>
    </form>
  )
}
