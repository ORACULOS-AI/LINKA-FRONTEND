'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useMutation } from '@tanstack/react-query'
import { ArrowLeft, Briefcase } from 'lucide-react'
import { createBusiness } from '@/lib/api/business'
import { useEnum } from '@/lib/hooks/useEnum'
import { toast, toastApiError } from '@/lib/toast'

const CATEGORIA_FALLBACK = [
  { value: 'startup', label: 'Startup' },
  { value: 'spinoff', label: 'Spin-off acadêmica' },
  { value: 'empresa_jr', label: 'Empresa Júnior' },
  { value: 'consultoria', label: 'Consultoria' },
  { value: 'industria', label: 'Indústria' },
  { value: 'outro', label: 'Outro' },
]

export default function NovoNegocioPage() {
  const router = useRouter()
  const catEnum = useEnum('negocio_categoria')
  const cats = catEnum.length ? catEnum.map((e) => ({ value: e.value, label: e.label })) : CATEGORIA_FALLBACK

  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [categoria, setCategoria] = useState(cats[0]!.value)

  const mut = useMutation({
    mutationFn: () =>
      createBusiness({
        nome: nome.trim(),
        descricao: descricao.trim(),
        categoria,
      }),
    onSuccess: (created) => {
      toast.success('Negócio enviado para aprovação')
      router.push(`/vitrine/negocios/${created.id}`)
    },
    onError: (err) => toastApiError(err, 'Não foi possível criar o negócio.'),
  })

  const canSubmit = !!nome.trim() && !!descricao.trim() && !!categoria && !mut.isPending

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 lg:py-8">
      <Link
        href="/vitrine?tab=negocios"
        className="mb-4 inline-flex items-center gap-1 text-sm text-[var(--color-fg-3)]"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>
      <h1 className="font-display text-2xl font-semibold flex items-center gap-2">
        <Briefcase className="h-6 w-6 text-[var(--color-purple)]" /> Novo negócio
      </h1>
      <p className="mt-1 text-sm text-[var(--color-fg-3)]">
        Comece com o essencial. Após a aprovação, você poderá completar o cadastro
        (CNPJ, área de atuação, estágio, contatos, fotos e membros do time).
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (canSubmit) mut.mutate()
        }}
        className="mt-6 space-y-5"
      >
        <Field label="Nome do negócio" required>
          <input
            type="text"
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="input"
            placeholder="Ex: Aurum AI"
          />
        </Field>

        <Field label="Descrição" required hint="O que sua empresa faz, em 2-3 frases.">
          <textarea
            required
            rows={5}
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            className="input resize-none"
            placeholder="Plataforma de inteligência artificial para automação de fluxos jurídicos..."
          />
        </Field>

        <Field label="Categoria">
          <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="input">
            {cats.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>

        <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface-2)] p-3 text-xs text-[var(--color-fg-3)]">
          <strong>Próximos passos após a aprovação:</strong> completar dados institucionais
          (CNPJ, telefone, e-mail), convidar membros do time e publicar projetos/eventos
          em nome do negócio.
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Link
            href="/vitrine?tab=negocios"
            className="inline-flex h-10 items-center justify-center rounded-md border border-[var(--color-border)] px-4 text-sm"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={!canSubmit}
            className="inline-flex h-10 items-center justify-center rounded-md bg-[var(--color-ink)] px-4 text-sm font-medium text-[var(--color-on-dark-1)] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {mut.isPending ? 'Enviando…' : 'Enviar para aprovação'}
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

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string
  required?: boolean
  hint?: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-[var(--color-fg-1)]">
        {label}
        {required && <span className="text-[var(--color-orange)]"> *</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-[var(--color-fg-3)]">{hint}</span>}
    </label>
  )
}
