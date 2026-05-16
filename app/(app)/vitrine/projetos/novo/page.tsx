'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useMutation } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { createInitiative, type TipoIniciativa } from '@/lib/api/initiatives'
import { HostPicker, type HostValue } from '@/components/forms/HostPicker'
import { useEnum } from '@/lib/hooks/useEnum'
import { toast, toastApiError } from '@/lib/toast'

const TIPOS_FALLBACK: { value: TipoIniciativa; label: string }[] = [
  { value: 'PESQUISA', label: 'Pesquisa' },
  { value: 'INOVACAO', label: 'Inovação' },
  { value: 'EMPREENDEDORISMO', label: 'Empreendedorismo' },
  { value: 'EXTENSAO', label: 'Extensão' },
  { value: 'DESENVOLVIMENTO', label: 'Desenvolvimento' },
  { value: 'CONSULTORIA', label: 'Consultoria' },
  { value: 'OUTROS', label: 'Outros' },
]

export default function NovoProjetoPage() {
  const router = useRouter()
  const tiposEnum = useEnum('iniciativa_tipo')
  const tipos = tiposEnum.length ? tiposEnum.map((e) => ({ value: e.value as TipoIniciativa, label: e.label })) : TIPOS_FALLBACK

  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [tipo, setTipo] = useState<TipoIniciativa>(tipos[0]!.value)
  const [host, setHost] = useState<HostValue | null>(null)
  const [dataInicio, setDataInicio] = useState(new Date().toISOString().slice(0, 10))

  const mut = useMutation({
    mutationFn: async () => {
      if (!host) throw new Error('Escolha um host.')
      return createInitiative({
        titulo,
        descricao,
        tipo,
        host_type: host.type as 'user' | 'negocio' | 'laboratorio',
        host_id: host.id,
        data_inicio: dataInicio,
      })
    },
    onSuccess: (created) => {
      toast.success('Projeto criado')
      router.push(`/vitrine/projetos/${created.uid}`)
    },
    onError: (err) => toastApiError(err, 'Não foi possível criar o projeto.'),
  })

  const canSubmit = !!titulo.trim() && !!descricao.trim() && !!host && !mut.isPending

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 lg:py-8">
      <Link href="/vitrine?tab=projetos" className="mb-4 inline-flex items-center gap-1 text-sm text-[var(--color-fg-3)]">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>
      <h1 className="font-display text-2xl font-semibold">Novo projeto</h1>
      <p className="mt-1 text-sm text-[var(--color-fg-3)]">
        Crie um projeto colaborativo. Você pode hospedá-lo em seu perfil pessoal, em um negócio ou em um laboratório.
      </p>

      <form
        onSubmit={(e) => { e.preventDefault(); if (canSubmit) mut.mutate() }}
        className="mt-6 space-y-5"
      >
        <Field label="Título" required>
          <input
            type="text" required value={titulo} onChange={(e) => setTitulo(e.target.value)}
            className="input"
            placeholder="Ex: Plataforma de Triagem Inteligente"
          />
        </Field>

        <Field label="Descrição" required>
          <textarea
            required rows={4} value={descricao} onChange={(e) => setDescricao(e.target.value)}
            className="input resize-none"
            placeholder="Descreva o objetivo, escopo e contexto do projeto."
          />
        </Field>

        <Field label="Tipo">
          <select value={tipo} onChange={(e) => setTipo(e.target.value as TipoIniciativa)} className="input">
            {tipos.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </Field>

        <Field label="Data de início">
          <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className="input" />
        </Field>

        <HostPicker value={host} onChange={setHost} allowedTypes={['user', 'negocio', 'laboratorio']} />

        <div className="flex justify-end gap-2 pt-2">
          <Link
            href="/vitrine?tab=projetos"
            className="inline-flex h-10 items-center justify-center rounded-md border border-[var(--color-border)] px-4 text-sm"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={!canSubmit}
            className="inline-flex h-10 items-center justify-center rounded-md bg-[var(--color-ink)] px-4 text-sm font-medium text-[var(--color-on-dark-1)] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {mut.isPending ? 'Criando…' : 'Criar projeto'}
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
