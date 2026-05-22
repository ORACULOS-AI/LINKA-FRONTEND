'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useMutation } from '@tanstack/react-query'
import { ArrowLeft, FlaskConical, Shield } from 'lucide-react'
import { createLab } from '@/lib/api/labs'
import { useAuth } from '@/lib/stores/auth'
import { useEnum } from '@/lib/hooks/useEnum'
import { toast, toastApiError } from '@/lib/toast'

const TIPO_FALLBACK = [
  { value: 'pesquisa', label: 'Pesquisa' },
  { value: 'ensino', label: 'Ensino' },
  { value: 'extensao', label: 'Extensão' },
  { value: 'inovacao', label: 'Inovação' },
  { value: 'misto', label: 'Misto' },
]

export default function NovoLabPage() {
  const router = useRouter()
  const me = useAuth((s) => s.me)

  const tipoEnum = useEnum('laboratorio_tipo')
  const tipos = tipoEnum.length ? tipoEnum.map((e) => ({ value: e.value, label: e.label })) : TIPO_FALLBACK
  const campusEnum = useEnum('campus')

  const [nome, setNome] = useState('')
  const [unidade, setUnidade] = useState('')
  const [responsavel, setResponsavel] = useState(me?.nome ?? '')
  const [telefone, setTelefone] = useState('')
  const [email, setEmail] = useState(me?.email ?? '')
  const [tipo, setTipo] = useState(tipos[0]!.value)
  const [campus, setCampus] = useState<string>(campusEnum[0]?.value ?? '')
  const [areas, setAreas] = useState('')
  const [subunidade, setSubunidade] = useState('')

  const mut = useMutation({
    mutationFn: () =>
      createLab({
        nome: nome.trim(),
        unidade: unidade.trim(),
        responsavel: responsavel.trim(),
        telefone: telefone.trim(),
        email: email.trim(),
        tipo,
        campus: campus || null,
        subunidade: subunidade.trim() || null,
        areas_pesquisa: areas.split(',').map((a) => a.trim()).filter(Boolean),
      }),
    onSuccess: (created) => {
      toast.success('Laboratório enviado para aprovação')
      router.push(`/vitrine/laboratorios/${created.uid}`)
    },
    onError: (err) => toastApiError(err, 'Não foi possível criar o laboratório.'),
  })

  const canSubmit =
    !!nome.trim() &&
    !!unidade.trim() &&
    !!responsavel.trim() &&
    !!telefone.trim() &&
    !!email.trim() &&
    !!tipo &&
    !mut.isPending

  // 🔒 Apenas pesquisadores podem criar laboratório (regra do backend).
  if (me && me.tipo !== 'pesquisador') {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center">
          <Shield className="mx-auto mb-3 h-10 w-10 text-[var(--color-fg-3)]" />
          <h1 className="font-display text-xl font-semibold">Restrito a pesquisadores</h1>
          <p className="mt-2 text-sm text-[var(--color-fg-3)]">
            Apenas usuários do tipo <strong>pesquisador</strong> podem cadastrar laboratórios.
            Você está vinculado como <strong>{me.tipo}</strong>.
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <Link
              href="/vitrine?tab=laboratorios"
              className="inline-flex h-10 items-center justify-center rounded-md border border-[var(--color-border)] px-4 text-sm"
            >
              Voltar à vitrine
            </Link>
            <Link
              href="/reivindicar"
              className="inline-flex h-10 items-center justify-center rounded-md bg-[var(--color-ink)] px-4 text-sm font-medium text-[var(--color-on-dark-1)] hover:opacity-90"
            >
              Reivindicar lab existente
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 lg:py-8">
      <Link
        href="/vitrine?tab=laboratorios"
        className="mb-4 inline-flex items-center gap-1 text-sm text-[var(--color-fg-3)]"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>
      <h1 className="font-display text-2xl font-semibold flex items-center gap-2">
        <FlaskConical className="h-6 w-6 text-[var(--color-blue)]" /> Novo laboratório
      </h1>
      <p className="mt-1 text-sm text-[var(--color-fg-3)]">
        Após o cadastro, o laboratório passará por <strong>análise da administração</strong> antes
        de aparecer na vitrine pública. Você poderá adicionar pesquisadores ao time depois.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (canSubmit) mut.mutate()
        }}
        className="mt-6 space-y-5"
      >
        <Field label="Nome do laboratório" required>
          <input
            type="text"
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="input"
            placeholder="Ex: Laboratório de Engenharia de Software"
          />
        </Field>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Unidade / Departamento" required>
            <input
              type="text"
              required
              value={unidade}
              onChange={(e) => setUnidade(e.target.value)}
              className="input"
              placeholder="Ex: Departamento de Computação"
            />
          </Field>
          <Field label="Subunidade (opcional)">
            <input
              type="text"
              value={subunidade}
              onChange={(e) => setSubunidade(e.target.value)}
              className="input"
              placeholder="Ex: Grupo de Software"
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Tipo">
            <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="input">
              {tipos.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </Field>
          {!!campusEnum.length && (
            <Field label="Campus">
              <select value={campus} onChange={(e) => setCampus(e.target.value)} className="input">
                {campusEnum.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </Field>
          )}
        </div>

        <Field label="Responsável" required>
          <input
            type="text"
            required
            value={responsavel}
            onChange={(e) => setResponsavel(e.target.value)}
            className="input"
            placeholder="Nome do responsável científico"
          />
        </Field>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Telefone" required>
            <input
              type="tel"
              required
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              className="input"
              placeholder="(85) 3366-0000"
            />
          </Field>
          <Field label="E-mail institucional" required>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="lab@ufc.br"
            />
          </Field>
        </div>

        <Field label="Áreas de pesquisa" hint="Separe por vírgula (ex: IA, Sistemas Embarcados, HCI)">
          <input
            type="text"
            value={areas}
            onChange={(e) => setAreas(e.target.value)}
            className="input"
            placeholder="IA, Computação Quântica, Robótica"
          />
        </Field>

        <div className="flex justify-end gap-2 pt-2">
          <Link
            href="/vitrine?tab=laboratorios"
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
      {hint && (
        <span className="mt-1 block text-xs text-[var(--color-fg-3)]">{hint}</span>
      )}
    </label>
  )
}
