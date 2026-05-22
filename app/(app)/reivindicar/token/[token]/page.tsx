'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery, useMutation } from '@tanstack/react-query'
import { ArrowLeft, KeyRound, BadgeCheck, Loader2, XCircle } from 'lucide-react'
import { verifyClaimToken, claimByToken } from '@/lib/api/claim'
import { toast, toastApiError } from '@/lib/toast'

export default function ClaimByTokenPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const router = useRouter()

  const verifyQ = useQuery({
    queryKey: ['claim-token', token],
    queryFn: () => verifyClaimToken(token),
    retry: false,
  })

  const claimM = useMutation({
    mutationFn: () => claimByToken(token),
    onSuccess: (r) => {
      toast.success('Reivindicação confirmada')
      const target =
        r.resource_type === 'laboratorio'
          ? `/vitrine/laboratorios/${r.resource_id}`
          : `/vitrine/negocios/${r.resource_id}`
      router.push(target)
    },
    onError: (e) => toastApiError(e, 'Não foi possível concluir.'),
  })

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <Link href="/reivindicar" className="mb-4 inline-flex items-center gap-1 text-sm text-[var(--color-fg-3)]">
        <ArrowLeft className="h-4 w-4" /> Reivindicações
      </Link>
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center">
        <KeyRound className="mx-auto mb-3 h-10 w-10 text-[var(--color-purple)]" />
        <h1 className="font-display text-xl font-semibold">Reivindicar com token</h1>

        {verifyQ.isLoading && (
          <p className="mt-4 flex items-center justify-center gap-2 text-sm text-[var(--color-fg-3)]">
            <Loader2 className="h-4 w-4 animate-spin" /> Verificando token…
          </p>
        )}

        {verifyQ.isError && (
          <div className="mt-4">
            <XCircle className="mx-auto mb-2 h-8 w-8 text-red-600" />
            <p className="text-sm text-[var(--color-fg-3)]">
              Token inválido, expirado ou já utilizado.
            </p>
          </div>
        )}

        {verifyQ.data && (
          <>
            <p className="mt-4 text-sm text-[var(--color-fg-3)]">Você está prestes a se tornar responsável por:</p>
            <div className="mt-3 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-2)] p-4 text-left">
              <div className="text-xs uppercase text-[var(--color-fg-3)]">{verifyQ.data.resource_type}</div>
              <div className="font-display text-lg font-semibold">{verifyQ.data.resource_id}</div>
              <div className="mt-2 text-xs text-[var(--color-fg-3)]">
                Validade até {new Date(verifyQ.data.expires_at).toLocaleString('pt-BR')}
              </div>
            </div>
            <button
              onClick={() => claimM.mutate()}
              disabled={claimM.isPending}
              className="mt-5 inline-flex h-10 items-center gap-1.5 rounded-md bg-[var(--color-ink)] px-5 text-sm font-medium text-[var(--color-on-dark-1)] hover:opacity-90 disabled:opacity-50"
            >
              {claimM.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <BadgeCheck className="h-4 w-4" />}
              Confirmar reivindicação
            </button>
          </>
        )}
      </div>
    </div>
  )
}
