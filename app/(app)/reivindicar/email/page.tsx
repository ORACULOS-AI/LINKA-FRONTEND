'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { ArrowLeft, Mail, KeyRound, Loader2 } from 'lucide-react'
import { initiateClaim, confirmClaim, type ResourceType } from '@/lib/api/claim'
import { toast, toastApiError } from '@/lib/toast'

export default function ClaimEmailPage() {
  const router = useRouter()
  const sp = useSearchParams()
  const initialId = sp.get('id') ?? ''
  const initialType = (sp.get('tipo') as ResourceType | null) ?? 'laboratorio'

  const [phase, setPhase] = useState<'initiate' | 'confirm'>('initiate')
  const [resourceId, setResourceId] = useState(initialId)
  const [resourceType, setResourceType] = useState<ResourceType>(initialType)
  const [code, setCode] = useState('')

  const initM = useMutation({
    mutationFn: () => initiateClaim(resourceId, resourceType),
    onSuccess: (r) => {
      toast.success(`Código enviado para ${r.email_sent_to ?? 'seu e-mail institucional'}`)
      setPhase('confirm')
    },
    onError: (e) => toastApiError(e, 'Falha ao iniciar reivindicação.'),
  })

  const confirmM = useMutation({
    mutationFn: () => confirmClaim(resourceId, resourceType, code),
    onSuccess: (r) => {
      toast.success('Reivindicação confirmada')
      router.push(
        r.resource_type === 'laboratorio'
          ? `/vitrine/laboratorios/${r.resource_id}`
          : `/vitrine/negocios/${r.resource_id}`,
      )
    },
    onError: (e) => toastApiError(e, 'Código incorreto ou expirado.'),
  })

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <Link href="/reivindicar" className="mb-4 inline-flex items-center gap-1 text-sm text-[var(--color-fg-3)]">
        <ArrowLeft className="h-4 w-4" /> Reivindicações
      </Link>
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8">
        <h1 className="font-display text-xl font-semibold flex items-center gap-2">
          {phase === 'initiate' ? (
            <>
              <Mail className="h-5 w-5 text-[var(--color-blue)]" /> Solicitar código por e-mail
            </>
          ) : (
            <>
              <KeyRound className="h-5 w-5 text-[var(--color-purple)]" /> Confirmar com código
            </>
          )}
        </h1>

        {phase === 'initiate' ? (
          <form
            onSubmit={(e) => { e.preventDefault(); initM.mutate() }}
            className="mt-4 space-y-4"
          >
            <p className="text-sm text-[var(--color-fg-3)]">
              Enviaremos um código para o e-mail institucional cadastrado no recurso. Use-o para
              comprovar que você é o responsável.
            </p>
            <label className="block text-sm">
              <span className="mb-1 block">Tipo</span>
              <select
                value={resourceType}
                onChange={(e) => setResourceType(e.target.value as ResourceType)}
                className="input"
              >
                <option value="laboratorio">Laboratório</option>
                <option value="negocio">Negócio</option>
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block">ID do recurso</span>
              <input
                required value={resourceId} onChange={(e) => setResourceId(e.target.value)}
                className="input" placeholder="UUID"
              />
            </label>
            <button
              type="submit" disabled={initM.isPending || !resourceId}
              className="inline-flex h-10 items-center gap-1.5 rounded-md bg-[var(--color-ink)] px-4 text-sm font-medium text-[var(--color-on-dark-1)] disabled:opacity-50"
            >
              {initM.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
              Enviar código
            </button>
          </form>
        ) : (
          <form
            onSubmit={(e) => { e.preventDefault(); confirmM.mutate() }}
            className="mt-4 space-y-4"
          >
            <p className="text-sm text-[var(--color-fg-3)]">
              Digite o código de 6 dígitos enviado para o e-mail institucional.
            </p>
            <input
              required value={code} onChange={(e) => setCode(e.target.value)}
              className="input text-center font-mono text-lg tracking-widest"
              placeholder="------" maxLength={6}
            />
            <button
              type="submit" disabled={confirmM.isPending || code.length < 4}
              className="inline-flex h-10 items-center gap-1.5 rounded-md bg-[var(--color-ink)] px-4 text-sm font-medium text-[var(--color-on-dark-1)] disabled:opacity-50"
            >
              {confirmM.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
              Confirmar
            </button>
            <button
              type="button" onClick={() => setPhase('initiate')}
              className="ml-2 inline-flex h-10 items-center text-sm text-[var(--color-fg-3)]"
            >
              Reenviar código
            </button>
          </form>
        )}

        <style jsx>{`
          .input { width: 100%; height: 40px; padding: 0 12px; border: 1px solid var(--color-border); border-radius: 8px; background: var(--color-surface); font-size: 14px; }
        `}</style>
      </div>
    </div>
  )
}
