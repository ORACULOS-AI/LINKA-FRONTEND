'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useMutation } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { createEvent, type EventCategoria } from '@/lib/api/events'
import { HostPicker, type HostValue } from '@/components/forms/HostPicker'
import { useEnum } from '@/lib/hooks/useEnum'
import { toast, toastApiError } from '@/lib/toast'

const CAT_FALLBACK: { value: EventCategoria; label: string }[] = [
  { value: 'workshop', label: 'Workshop' },
  { value: 'palestra', label: 'Palestra' },
  { value: 'conferencia', label: 'Conferência' },
  { value: 'hackathon', label: 'Hackathon' },
  { value: 'networking', label: 'Networking' },
  { value: 'curso', label: 'Curso' },
  { value: 'seminario', label: 'Seminário' },
  { value: 'mesa_redonda', label: 'Mesa redonda' },
  { value: 'outro', label: 'Outro' },
]

export default function NovoEventoPage() {
  const router = useRouter()
  const catsEnum = useEnum('event_categoria')
  const cats = catsEnum.length ? catsEnum.map((e) => ({ value: e.value as EventCategoria, label: e.label })) : CAT_FALLBACK

  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [categoria, setCategoria] = useState<EventCategoria>(cats[0]!.value)
  const [host, setHost] = useState<HostValue | null>(null)
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [local, setLocal] = useState('')
  const [isOnline, setIsOnline] = useState(false)
  const [linkOnline, setLinkOnline] = useState('')

  const mut = useMutation({
    mutationFn: async () => {
      if (!host) throw new Error('Escolha um host.')
      return createEvent({
        titulo,
        descricao,
        categoria,
        host_type: host.type,
        host_id: host.id,
        data_inicio: new Date(dataInicio).toISOString(),
        data_fim: new Date(dataFim || dataInicio).toISOString(),
        local: isOnline ? '' : local,
        is_online: isOnline,
        link_online: isOnline ? linkOnline : undefined,
      })
    },
    onSuccess: (created) => {
      toast.success('Evento criado')
      router.push(`/vitrine/eventos/${created.uid}`)
    },
    onError: (err) => toastApiError(err, 'Não foi possível criar o evento.'),
  })

  const canSubmit = !!titulo.trim() && !!descricao.trim() && !!host && !!dataInicio && !mut.isPending

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 lg:py-8">
      <Link href="/vitrine?tab=eventos" className="mb-4 inline-flex items-center gap-1 text-sm text-[var(--color-fg-3)]">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>
      <h1 className="font-display text-2xl font-semibold">Novo evento</h1>

      <form
        onSubmit={(e) => { e.preventDefault(); if (canSubmit) mut.mutate() }}
        className="mt-6 space-y-5"
      >
        <Field label="Título" required>
          <input type="text" required value={titulo} onChange={(e) => setTitulo(e.target.value)} className="input" />
        </Field>

        <Field label="Descrição" required>
          <textarea required rows={4} value={descricao} onChange={(e) => setDescricao(e.target.value)} className="input resize-none" />
        </Field>

        <Field label="Categoria">
          <select value={categoria} onChange={(e) => setCategoria(e.target.value as EventCategoria)} className="input">
            {cats.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </Field>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Início" required>
            <input type="datetime-local" required value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className="input" />
          </Field>
          <Field label="Fim">
            <input type="datetime-local" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className="input" />
          </Field>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isOnline} onChange={(e) => setIsOnline(e.target.checked)} />
          Evento online
        </label>

        {isOnline ? (
          <Field label="Link de acesso">
            <input type="url" value={linkOnline} onChange={(e) => setLinkOnline(e.target.value)} placeholder="https://" className="input" />
          </Field>
        ) : (
          <Field label="Local">
            <input type="text" value={local} onChange={(e) => setLocal(e.target.value)} placeholder="Ex: Auditório Bloco 950 — Pici" className="input" />
          </Field>
        )}

        <HostPicker
          value={host}
          onChange={setHost}
          allowedTypes={['user', 'negocio', 'laboratorio', 'iniciativa']}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Link href="/vitrine?tab=eventos" className="inline-flex h-10 items-center justify-center rounded-md border border-[var(--color-border)] px-4 text-sm">
            Cancelar
          </Link>
          <button
            type="submit" disabled={!canSubmit}
            className="inline-flex h-10 items-center justify-center rounded-md bg-[var(--color-ink)] px-4 text-sm font-medium text-[var(--color-on-dark-1)] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {mut.isPending ? 'Criando…' : 'Criar evento'}
          </button>
        </div>
      </form>

      <style jsx>{`
        .input {
          width: 100%;
          height: 40px;
          padding: 0 12px;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md, 8px);
          background: var(--color-surface);
          font-size: 14px;
          color: var(--color-fg-1);
        }
        textarea.input { height: auto; padding: 10px 12px; }
        .input:focus { outline: 2px solid var(--color-blue); outline-offset: 1px; border-color: var(--color-blue); }
      `}</style>
    </div>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-[var(--color-fg-1)]">
        {label}{required && <span className="text-[var(--color-orange)]"> *</span>}
      </span>
      {children}
    </label>
  )
}
