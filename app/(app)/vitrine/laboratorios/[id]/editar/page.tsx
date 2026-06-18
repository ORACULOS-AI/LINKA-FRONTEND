'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Trash2, ImagePlus } from 'lucide-react'
import { getLab, updateLab, deleteLab, updateLabFotos, updateLabCoverUrl, publishLab, unpublishLab } from '@/lib/api/labs'
import { useAuth } from '@/lib/stores/auth'
import { useEnum } from '@/lib/hooks/useEnum'
import { toast, toastApiError } from '@/lib/toast'
import { AvatarCropModal } from '@/components/ui/AvatarCropModal'
import { CoverPatternPicker } from '@/components/ui/CoverPatternPicker'

export default function EditarLabPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const qc = useQueryClient()
  const me = useAuth((s) => s.me)
  const tipoEnum = useEnum('laboratorio_tipo')
  const campusEnum = useEnum('campus')

  const q = useQuery({ queryKey: ['lab', id], queryFn: () => getLab(id) })

  const [nome, setNome] = useState('')
  const [unidade, setUnidade] = useState('')
  const [subunidade, setSubunidade] = useState('')
  const [responsavel, setResponsavel] = useState('')
  const [telefone, setTelefone] = useState('')
  const [email, setEmail] = useState('')
  const [tipo, setTipo] = useState('')
  const [campus, setCampus] = useState('')
  const [areas, setAreas] = useState('')
  const [pendingPerfilFile, setPendingPerfilFile] = useState<File | null>(null)

  useEffect(() => {
    const l = q.data
    if (!l) return
    setNome(l.nome)
    setUnidade(l.unidade)
    setSubunidade(l.subunidade ?? '')
    setResponsavel(l.responsavel)
    setTelefone(l.telefone)
    setEmail(l.email)
    setTipo(l.tipo)
    setCampus(l.campus ?? '')
    setAreas((l.areas_pesquisa ?? []).join(', '))
  }, [q.data])

  const mut = useMutation({
    mutationFn: () =>
      updateLab(id, {
        nome,
        unidade,
        subunidade: subunidade || null,
        responsavel,
        telefone,
        email,
        tipo,
        campus: campus || null,
        areas_pesquisa: areas.split(',').map((a) => a.trim()).filter(Boolean),
      }),
    onSuccess: () => {
      toast.success('Laboratório atualizado')
      qc.invalidateQueries({ queryKey: ['lab', id] })
      router.push(`/vitrine/laboratorios/${id}`)
    },
    onError: (e) => toastApiError(e, 'Não foi possível salvar.'),
  })

  const fotosM = useMutation({
    mutationFn: ({ perfil, capa }: { perfil?: File; capa?: File }) =>
      updateLabFotos(id, perfil, capa),
    onSuccess: () => {
      toast.success('Fotos atualizadas')
      qc.invalidateQueries({ queryKey: ['lab', id] })
    },
    onError: (e) => toastApiError(e, 'Falha ao enviar foto.'),
  })

  const coverUrlM = useMutation({
    mutationFn: (url: string) => updateLabCoverUrl(id, url),
    onSuccess: () => {
      toast.success('Capa atualizada')
      qc.invalidateQueries({ queryKey: ['lab', id] })
    },
    onError: (e) => toastApiError(e, 'Falha ao salvar capa.'),
  })

  const pubM = useMutation({
    mutationFn: () => q.data?.visivel ? unpublishLab(id) : publishLab(id),
    onSuccess: () => {
      toast.success(q.data?.visivel ? 'Laboratório despublicado' : 'Laboratório publicado')
      qc.invalidateQueries({ queryKey: ['lab', id] })
    },
    onError: (e) => toastApiError(e, 'Não foi possível alterar visibilidade. O lab precisa estar aprovado.'),
  })

  const delM = useMutation({
    mutationFn: () => deleteLab(id),
    onSuccess: () => {
      toast.success('Laboratório removido')
      router.push('/vitrine?tab=laboratorios')
    },
    onError: (e) => toastApiError(e, 'Não foi possível remover.'),
  })

  if (q.isLoading) return <div className="p-6 text-sm text-[var(--color-fg-3)]">Carregando…</div>
  if (q.isError || !q.data)
    return <div className="p-6 text-sm text-[var(--color-fg-3)]">Laboratório não encontrado.</div>

  // Só responsável (uid_admin) ou admin pode editar
  const lab = q.data
  const isOwner = me?.id === (lab as { uid_admin?: string }).uid_admin || !!me?.is_admin
  if (me && !isOwner) {
    return (
      <div className="mx-auto max-w-2xl p-6 text-center">
        <p className="text-sm text-[var(--color-fg-3)]">
          Apenas o responsável pelo laboratório pode editá-lo.
        </p>
        <Link href={`/vitrine/laboratorios/${id}`} className="mt-3 inline-block text-sm font-semibold">
          Voltar
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 lg:py-8">
      <Link href={`/vitrine/laboratorios/${id}`} className="mb-4 inline-flex items-center gap-1 text-sm text-[var(--color-fg-3)]">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>
      <h1 className="font-display text-2xl font-semibold">Editar laboratório</h1>

      {pendingPerfilFile && (
        <AvatarCropModal
          file={pendingPerfilFile}
          onConfirm={(blob) => {
            setPendingPerfilFile(null)
            fotosM.mutate({ perfil: new File([blob], 'perfil.jpg', { type: 'image/jpeg' }) })
          }}
          onCancel={() => setPendingPerfilFile(null)}
        />
      )}

      <section className="mt-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <h2 className="font-display text-base font-semibold flex items-center gap-2">
          <ImagePlus className="h-4 w-4" /> Fotos
        </h2>
        <div className="mt-3 space-y-4">
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">Foto de perfil</span>
            <input
              type="file"
              accept="image/png,image/jpeg"
              disabled={fotosM.isPending}
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) { setPendingPerfilFile(f); e.target.value = '' }
              }}
              className="text-xs"
            />
          </label>
          <div className="text-sm">
            <span className="mb-2 block font-medium">Capa do laboratório</span>
            <CoverPatternPicker
              value={(q.data as { foto_capa?: string | null } | undefined)?.foto_capa ?? null}
              onChange={(url) => coverUrlM.mutate(url)}
            />
          </div>
        </div>
        {(fotosM.isPending || coverUrlM.isPending) && (
          <p className="mt-2 text-xs text-[var(--color-fg-3)]">Enviando…</p>
        )}
      </section>

      <form onSubmit={(e) => { e.preventDefault(); mut.mutate() }} className="mt-6 space-y-5">
        <Field label="Nome"><input className="input" value={nome} onChange={(e) => setNome(e.target.value)} /></Field>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Unidade"><input className="input" value={unidade} onChange={(e) => setUnidade(e.target.value)} /></Field>
          <Field label="Subunidade"><input className="input" value={subunidade} onChange={(e) => setSubunidade(e.target.value)} /></Field>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Tipo">
            <select className="input" value={tipo} onChange={(e) => setTipo(e.target.value)}>
              {tipoEnum.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </Field>
          {campusEnum.length > 0 && (
            <Field label="Campus">
              <select className="input" value={campus} onChange={(e) => setCampus(e.target.value)}>
                <option value="">—</option>
                {campusEnum.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </Field>
          )}
        </div>
        <Field label="Responsável"><input className="input" value={responsavel} onChange={(e) => setResponsavel(e.target.value)} /></Field>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Telefone"><input className="input" value={telefone} onChange={(e) => setTelefone(e.target.value)} /></Field>
          <Field label="E-mail"><input className="input" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
        </div>
        <Field label="Áreas de pesquisa (vírgula)">
          <input className="input" value={areas} onChange={(e) => setAreas(e.target.value)} />
        </Field>
        {lab.status === 'APROVADO' && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => pubM.mutate()}
              disabled={pubM.isPending}
              className={`inline-flex h-9 items-center rounded-md px-3 text-sm font-medium ${
                lab.visivel
                  ? 'border border-orange-300 text-orange-700 hover:bg-orange-50'
                  : 'bg-green-600 text-white hover:bg-green-700'
              } disabled:opacity-50`}
            >
              {pubM.isPending ? 'Alterando…' : lab.visivel ? 'Despublicar' : 'Publicar na vitrine'}
            </button>
            <span className="text-xs text-[var(--color-fg-3)]">
              {lab.visivel ? 'Visível na vitrine pública' : 'Não visível na vitrine'}
            </span>
          </div>
        )}
        {lab.status !== 'APROVADO' && (
          <p className="text-xs text-[var(--color-fg-3)]">
            Visibilidade: aguardando aprovação do administrador (status: {lab.status})
          </p>
        )}

        <div className="flex items-center justify-between gap-2 pt-2">
          <button
            type="button"
            onClick={() => {
              if (confirm('Tem certeza que deseja remover este laboratório?')) delM.mutate()
            }}
            className="inline-flex h-10 items-center gap-1.5 rounded-md border border-red-200 px-3 text-sm text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" /> Remover
          </button>
          <div className="flex gap-2">
            <Link href={`/vitrine/laboratorios/${id}`} className="inline-flex h-10 items-center rounded-md border border-[var(--color-border)] px-4 text-sm">
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={mut.isPending}
              className="inline-flex h-10 items-center rounded-md bg-[var(--color-ink)] px-4 text-sm font-medium text-[var(--color-on-dark-1)] hover:opacity-90 disabled:opacity-50"
            >
              {mut.isPending ? 'Salvando…' : 'Salvar'}
            </button>
          </div>
        </div>
      </form>

      <style jsx>{`
        .input {
          width: 100%; height: 40px; padding: 0 12px;
          border: 1px solid var(--color-border); border-radius: 8px;
          background: var(--color-surface); font-size: 14px;
        }
        .input:focus { outline: 2px solid var(--color-blue); border-color: var(--color-blue); }
      `}</style>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
    </label>
  )
}
