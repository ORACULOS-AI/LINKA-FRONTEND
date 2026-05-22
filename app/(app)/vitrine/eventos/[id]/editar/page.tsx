'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { getEvent, updateEvent, deleteEvent, type EventCategoria } from '@/lib/api/events'
import { useAuth } from '@/lib/stores/auth'
import { useEnum } from '@/lib/hooks/useEnum'
import { toast, toastApiError } from '@/lib/toast'

export default function EditarEventoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const qc = useQueryClient()
  const me = useAuth((s) => s.me)
  const catEnum = useEnum('event_categoria')

  const q = useQuery({ queryKey: ['event', id], queryFn: () => getEvent(id) })

  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [categoria, setCategoria] = useState<EventCategoria>('workshop')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [local, setLocal] = useState('')
  const [isOnline, setIsOnline] = useState(false)
  const [linkOnline, setLinkOnline] = useState('')
  const [capacidade, setCapacidade] = useState<number | ''>('')

  useEffect(() => {
    const e = q.data
    if (!e) return
    setTitulo(e.titulo)
    setDescricao(e.descricao)
    setCategoria(e.categoria)
    setDataInicio(e.data_inicio.slice(0, 16))
    setDataFim(e.data_fim.slice(0, 16))
    setLocal(e.local)
    setIsOnline(e.is_online)
    setLinkOnline(e.link_online ?? '')
    setCapacidade(e.capacidade_maxima ?? '')
  }, [q.data])

  const mut = useMutation({
    mutationFn: () =>
      updateEvent(id, {
        titulo,
        descricao,
        categoria,
        data_inicio: new Date(dataInicio).toISOString(),
        data_fim: new Date(dataFim || dataInicio).toISOString(),
        local: isOnline ? '' : local,
        is_online: isOnline,
        link_online: isOnline ? linkOnline : undefined,
        capacidade_maxima: capacidade === '' ? null : Number(capacidade),
      }),
    onSuccess: () => {
      toast.success('Evento atualizado')
      qc.invalidateQueries({ queryKey: ['event', id] })
      router.push(`/vitrine/eventos/${id}`)
    },
    onError: (e) => toastApiError(e, 'Não foi possível salvar.'),
  })

  const delM = useMutation({
    mutationFn: () => deleteEvent(id),
    onSuccess: () => {
      toast.success('Evento removido')
      router.push('/vitrine?tab=eventos')
    },
    onError: (e) => toastApiError(e, 'Não foi possível remover.'),
  })

  if (q.isLoading) return <div className="p-6 text-sm">Carregando…</div>
  if (q.isError || !q.data) return <div className="p-6 text-sm">Evento não encontrado.</div>

  const isOwner = me?.id === q.data.uid_owner || !!me?.is_admin
  if (me && !isOwner) {
    return (
      <div className="mx-auto max-w-2xl p-6 text-center">
        <p className="text-sm text-[var(--color-fg-3)]">Apenas o organizador pode editar.</p>
        <Link href={`/vitrine/eventos/${id}`} className="mt-3 inline-block text-sm font-semibold">Voltar</Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 lg:py-8">
      <Link href={`/vitrine/eventos/${id}`} className="mb-4 inline-flex items-center gap-1 text-sm text-[var(--color-fg-3)]">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>
      <h1 className="font-display text-2xl font-semibold">Editar evento</h1>

      <form onSubmit={(e) => { e.preventDefault(); mut.mutate() }} className="mt-6 space-y-5">
        <Field label="Título"><input className="input" value={titulo} onChange={(e) => setTitulo(e.target.value)} /></Field>
        <Field label="Descrição">
          <textarea rows={4} className="input" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
        </Field>
        <Field label="Categoria">
          <select className="input" value={categoria} onChange={(e) => setCategoria(e.target.value as EventCategoria)}>
            {catEnum.length === 0 && <option value={categoria}>{categoria}</option>}
            {catEnum.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </Field>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Início"><input type="datetime-local" className="input" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} /></Field>
          <Field label="Fim"><input type="datetime-local" className="input" value={dataFim} onChange={(e) => setDataFim(e.target.value)} /></Field>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isOnline} onChange={(e) => setIsOnline(e.target.checked)} />
          Evento online
        </label>
        {isOnline ? (
          <Field label="Link de acesso"><input type="url" className="input" value={linkOnline} onChange={(e) => setLinkOnline(e.target.value)} /></Field>
        ) : (
          <Field label="Local"><input className="input" value={local} onChange={(e) => setLocal(e.target.value)} /></Field>
        )}
        <Field label="Capacidade máxima (opcional)">
          <input type="number" min={1} className="input" value={capacidade} onChange={(e) => setCapacidade(e.target.value === '' ? '' : Number(e.target.value))} />
        </Field>

        <div className="flex items-center justify-between gap-2 pt-2">
          <button
            type="button"
            onClick={() => { if (confirm('Remover evento?')) delM.mutate() }}
            className="inline-flex h-10 items-center gap-1.5 rounded-md border border-red-200 px-3 text-sm text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" /> Remover
          </button>
          <div className="flex gap-2">
            <Link href={`/vitrine/eventos/${id}`} className="inline-flex h-10 items-center rounded-md border border-[var(--color-border)] px-4 text-sm">Cancelar</Link>
            <button
              type="submit" disabled={mut.isPending}
              className="inline-flex h-10 items-center rounded-md bg-[var(--color-ink)] px-4 text-sm font-medium text-[var(--color-on-dark-1)] hover:opacity-90 disabled:opacity-50"
            >
              {mut.isPending ? 'Salvando…' : 'Salvar'}
            </button>
          </div>
        </div>
      </form>

      <style jsx>{`
        .input { width: 100%; height: 40px; padding: 0 12px; border: 1px solid var(--color-border); border-radius: 8px; background: var(--color-surface); font-size: 14px; }
        textarea.input { height: auto; padding: 10px 12px; }
        .input:focus { outline: 2px solid var(--color-blue); border-color: var(--color-blue); }
      `}</style>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-sm font-medium">{label}</span>{children}</label>
}
