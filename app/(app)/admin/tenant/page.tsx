'use client'

import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Save } from 'lucide-react'
import { getTenantConfig, updateTenantConfig } from '@/lib/api/admin'
import { useAuth } from '@/lib/stores/auth'
import { applyTenantTheme } from '@/lib/theme/apply'
import { EmptyState, SkeletonCard } from '@/components/primitives'
import { toast, toastApiError } from '@/lib/toast'

export default function AdminTenantPage() {
  const isAdmin = useAuth((s) => Boolean(s.me?.is_admin))
  const qc = useQueryClient()

  const q = useQuery({
    queryKey: ['admin', 'tenant'],
    queryFn: getTenantConfig,
    enabled: isAdmin,
  })

  const [name, setName] = useState('')
  const [primary, setPrimary] = useState('')
  const [secondary, setSecondary] = useState('')
  const [accent, setAccent] = useState('')
  const [logoUrl, setLogoUrl] = useState('')

  useEffect(() => {
    if (!q.data) return
    setName(q.data.name)
    setPrimary(q.data.primary_color ?? '')
    setSecondary(q.data.secondary_color ?? '')
    setAccent(q.data.accent_color ?? '')
    setLogoUrl(q.data.logo_url ?? '')
  }, [q.data])

  const save = useMutation({
    mutationFn: () =>
      updateTenantConfig({
        name,
        primary_color: primary || null,
        secondary_color: secondary || null,
        accent_color: accent || null,
        logo_url: logoUrl || null,
      }),
    onSuccess: (cfg) => {
      toast.success('Tenant atualizado')
      applyTenantTheme(cfg)
      qc.invalidateQueries({ queryKey: ['admin', 'tenant'] })
      qc.invalidateQueries({ queryKey: ['config'] })
    },
    onError: (err) => toastApiError(err),
  })

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <EmptyState title="Acesso restrito" />
      </div>
    )
  }

  if (q.isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6">
        <SkeletonCard lines={4} />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 lg:py-8">
      <h1 className="font-display text-2xl font-semibold">Tenant — White-label</h1>
      <p className="mt-1 text-sm text-[var(--color-fg-3)]">
        Aparência aplicada em toda a plataforma para este tenant.
      </p>

      <form
        onSubmit={(e) => { e.preventDefault(); save.mutate() }}
        className="mt-6 space-y-5"
      >
        <Field label="Nome">
          <input value={name} onChange={(e) => setName(e.target.value)} className="input" />
        </Field>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field label="Cor primária">
            <ColorInput value={primary} onChange={setPrimary} />
          </Field>
          <Field label="Cor secundária">
            <ColorInput value={secondary} onChange={setSecondary} />
          </Field>
          <Field label="Cor de destaque">
            <ColorInput value={accent} onChange={setAccent} />
          </Field>
        </div>

        <Field label="URL do logo">
          <input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://…" className="input" />
        </Field>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={save.isPending}
            className="inline-flex h-10 items-center gap-1.5 rounded-md bg-[var(--color-ink)] px-4 text-sm font-medium text-[var(--color-on-dark-1)] hover:opacity-90 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {save.isPending ? 'Salvando…' : 'Salvar alterações'}
          </button>
        </div>
      </form>

      <style jsx>{`
        .input {
          width: 100%; height: 40px; padding: 0 12px;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md, 8px);
          background: var(--color-surface);
          font-size: 14px;
        }
        .input:focus { outline: 2px solid var(--color-blue); }
      `}</style>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-[var(--color-fg-1)]">{label}</span>
      {children}
    </label>
  )
}

function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2">
      <input
        type="color"
        value={value || '#000000'}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 w-7 cursor-pointer border-0 bg-transparent p-0"
        aria-label="Selecionar cor"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="#000000"
        className="h-9 flex-1 bg-transparent text-sm font-mono outline-none"
      />
    </div>
  )
}
