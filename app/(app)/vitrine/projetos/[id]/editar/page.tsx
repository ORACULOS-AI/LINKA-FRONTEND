'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Trash2 } from 'lucide-react'
import {
  getInitiative,
  updateInitiative,
  deleteInitiative,
  setInitiativeStatus,
  publishInitiative,
  unpublishInitiative,
  type StatusIniciativa,
  type TipoIniciativa,
} from '@/lib/api/initiatives'
import { useAuth } from '@/lib/stores/auth'
import { toast, toastApiError } from '@/lib/toast'

const STATUS_OPTIONS: StatusIniciativa[] = ['ATIVA', 'PAUSADA', 'CONCLUIDA', 'CANCELADA']
const TIPOS: TipoIniciativa[] = ['PESQUISA', 'INOVACAO', 'EMPREENDEDORISMO', 'EXTENSAO', 'DESENVOLVIMENTO', 'CONSULTORIA', 'OUTROS']

export default function EditarProjetoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const qc = useQueryClient()
  const me = useAuth((s) => s.me)

  const q = useQuery({ queryKey: ['iniciativa', id], queryFn: () => getInitiative(id) })

  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [tipo, setTipo] = useState<TipoIniciativa>('PESQUISA')
  const [status, setStatus] = useState<StatusIniciativa>('ATIVA')

  useEffect(() => {
    if (!q.data) return
    setTitulo(q.data.titulo)
    setDescricao(q.data.descricao)
    setTipo(q.data.tipo)
    setStatus(q.data.status)
  }, [q.data])

  const mut = useMutation({
    mutationFn: async () => {
      await updateInitiative(id, { titulo, descricao, tipo })
      if (q.data && status !== q.data.status) {
        await setInitiativeStatus(id, status)
      }
    },
    onSuccess: () => {
      toast.success('Projeto atualizado')
      qc.invalidateQueries({ queryKey: ['iniciativa', id] })
      router.push(`/vitrine/projetos/${id}`)
    },
    onError: (e) => toastApiError(e, 'Não foi possível salvar.'),
  })

  const pubM = useMutation({
    mutationFn: () => q.data?.visivel ? unpublishInitiative(id) : publishInitiative(id),
    onSuccess: () => {
      toast.success(q.data?.visivel ? 'Projeto despublicado' : 'Projeto publicado')
      qc.invalidateQueries({ queryKey: ['iniciativa', id] })
    },
    onError: (e) => toastApiError(e, 'Não foi possível alterar visibilidade. O projeto precisa estar ativo.'),
  })

  const delM = useMutation({
    mutationFn: () => deleteInitiative(id),
    onSuccess: () => {
      toast.success('Projeto removido')
      router.push('/vitrine?tab=projetos')
    },
    onError: (e) => toastApiError(e, 'Não foi possível remover.'),
  })

  if (q.isLoading) return <div className="p-6 text-sm">Carregando…</div>
  if (q.isError || !q.data) return <div className="p-6 text-sm">Projeto não encontrado.</div>

  const isOwner = me?.id === q.data.uid_owner || !!me?.is_admin
  if (me && !isOwner) {
    return (
      <div className="mx-auto max-w-2xl p-6 text-center">
        <p className="text-sm text-[var(--color-fg-3)]">Apenas o coordenador pode editar.</p>
        <Link href={`/vitrine/projetos/${id}`} className="mt-3 inline-block text-sm font-semibold">Voltar</Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 lg:py-8">
      <Link href={`/vitrine/projetos/${id}`} className="mb-4 inline-flex items-center gap-1 text-sm text-[var(--color-fg-3)]">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>
      <h1 className="font-display text-2xl font-semibold">Editar projeto</h1>

      <form onSubmit={(e) => { e.preventDefault(); mut.mutate() }} className="mt-6 space-y-5">
        <Field label="Título"><input className="input" value={titulo} onChange={(e) => setTitulo(e.target.value)} /></Field>
        <Field label="Descrição">
          <textarea rows={5} className="input" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
        </Field>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Tipo">
            <select className="input" value={tipo} onChange={(e) => setTipo(e.target.value as TipoIniciativa)}>
              {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Status">
            <select className="input" value={status} onChange={(e) => setStatus(e.target.value as StatusIniciativa)}>
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
        </div>
        {q.data?.status === 'ATIVA' && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => pubM.mutate()}
              disabled={pubM.isPending}
              className={`inline-flex h-9 items-center rounded-md px-3 text-sm font-medium ${
                q.data?.visivel
                  ? 'border border-orange-300 text-orange-700 hover:bg-orange-50'
                  : 'bg-green-600 text-white hover:bg-green-700'
              } disabled:opacity-50`}
            >
              {pubM.isPending ? 'Alterando…' : q.data?.visivel ? 'Despublicar' : 'Publicar na vitrine'}
            </button>
            <span className="text-xs text-[var(--color-fg-3)]">
              {q.data?.visivel ? 'Visível na vitrine pública' : 'Não visível na vitrine'}
            </span>
          </div>
        )}
        {q.data?.status !== 'ATIVA' && (
          <p className="text-xs text-[var(--color-fg-3)]">
            Visibilidade: aguardando aprovação do administrador (status: {q.data?.status})
          </p>
        )}

        <div className="flex items-center justify-between gap-2 pt-2">
          <button
            type="button"
            onClick={() => { if (confirm('Remover projeto?')) delM.mutate() }}
            className="inline-flex h-10 items-center gap-1.5 rounded-md border border-red-200 px-3 text-sm text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" /> Remover
          </button>
          <div className="flex gap-2">
            <Link href={`/vitrine/projetos/${id}`} className="inline-flex h-10 items-center rounded-md border border-[var(--color-border)] px-4 text-sm">Cancelar</Link>
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
