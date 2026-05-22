'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Trash2, ImagePlus } from 'lucide-react'
import { getBusiness, updateBusiness, deleteBusiness, updateBusinessFotos } from '@/lib/api/business'
import { useAuth } from '@/lib/stores/auth'
import { useEnum } from '@/lib/hooks/useEnum'
import { toast, toastApiError } from '@/lib/toast'

export default function EditarNegocioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const qc = useQueryClient()
  const me = useAuth((s) => s.me)
  const catEnum = useEnum('negocio_categoria')

  const q = useQuery({ queryKey: ['negocio', id], queryFn: () => getBusiness(id) })

  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [categoria, setCategoria] = useState('')

  useEffect(() => {
    if (!q.data) return
    setNome(q.data.nome)
    setDescricao(q.data.descricao)
    setCategoria(q.data.categoria)
  }, [q.data])

  const mut = useMutation({
    mutationFn: () => updateBusiness(id, { nome, descricao, categoria }),
    onSuccess: () => {
      toast.success('Negócio atualizado')
      qc.invalidateQueries({ queryKey: ['negocio', id] })
      router.push(`/vitrine/negocios/${id}`)
    },
    onError: (e) => toastApiError(e, 'Não foi possível salvar.'),
  })

  const fotosM = useMutation({
    mutationFn: ({ perfil, capa }: { perfil?: File; capa?: File }) =>
      updateBusinessFotos(id, perfil, capa),
    onSuccess: () => {
      toast.success('Fotos atualizadas')
      qc.invalidateQueries({ queryKey: ['negocio', id] })
    },
    onError: (e) => toastApiError(e, 'Falha ao enviar foto.'),
  })

  const delM = useMutation({
    mutationFn: () => deleteBusiness(id),
    onSuccess: () => {
      toast.success('Negócio removido')
      router.push('/vitrine?tab=negocios')
    },
    onError: (e) => toastApiError(e, 'Não foi possível remover.'),
  })

  if (q.isLoading) return <div className="p-6 text-sm">Carregando…</div>
  if (q.isError || !q.data) return <div className="p-6 text-sm">Negócio não encontrado.</div>

  const isOwner = me?.id === q.data.uid_admin || !!me?.is_admin
  if (me && !isOwner) {
    return (
      <div className="mx-auto max-w-2xl p-6 text-center">
        <p className="text-sm text-[var(--color-fg-3)]">Apenas o responsável pode editar.</p>
        <Link href={`/vitrine/negocios/${id}`} className="mt-3 inline-block text-sm font-semibold">
          Voltar
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 lg:py-8">
      <Link href={`/vitrine/negocios/${id}`} className="mb-4 inline-flex items-center gap-1 text-sm text-[var(--color-fg-3)]">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>
      <h1 className="font-display text-2xl font-semibold">Editar negócio</h1>

      <section className="mt-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <h2 className="font-display text-base font-semibold flex items-center gap-2">
          <ImagePlus className="h-4 w-4" /> Fotos
        </h2>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">Foto de perfil</span>
            <input
              type="file"
              accept="image/png,image/jpeg"
              disabled={fotosM.isPending}
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) fotosM.mutate({ perfil: f })
              }}
              className="text-xs"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">Foto de capa</span>
            <input
              type="file"
              accept="image/png,image/jpeg"
              disabled={fotosM.isPending}
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) fotosM.mutate({ capa: f })
              }}
              className="text-xs"
            />
          </label>
        </div>
        {fotosM.isPending && <p className="mt-2 text-xs text-[var(--color-fg-3)]">Enviando…</p>}
      </section>

      <form onSubmit={(e) => { e.preventDefault(); mut.mutate() }} className="mt-6 space-y-5">
        <Field label="Nome"><input className="input" value={nome} onChange={(e) => setNome(e.target.value)} /></Field>
        <Field label="Descrição">
          <textarea rows={5} className="input" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
        </Field>
        <Field label="Categoria">
          <select className="input" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
            {catEnum.length === 0 && <option value={categoria}>{categoria}</option>}
            {catEnum.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </Field>

        <div className="flex items-center justify-between gap-2 pt-2">
          <button
            type="button"
            onClick={() => { if (confirm('Remover negócio?')) delM.mutate() }}
            className="inline-flex h-10 items-center gap-1.5 rounded-md border border-red-200 px-3 text-sm text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" /> Remover
          </button>
          <div className="flex gap-2">
            <Link href={`/vitrine/negocios/${id}`} className="inline-flex h-10 items-center rounded-md border border-[var(--color-border)] px-4 text-sm">Cancelar</Link>
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
