'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'
import * as Sentry from '@sentry/nextjs'

type RouteErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
  title?: string
  description?: string
}

export function RouteError({
  error,
  reset,
  title = 'Algo deu errado nesta tela',
  description = 'Tente novamente em instantes. Se persistir, recarregue a página.',
}: RouteErrorProps) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-orange-15)] text-[var(--color-orange)]">
        <AlertTriangle size={28} strokeWidth={2} />
      </div>
      <h2 className="font-display text-xl font-semibold text-[var(--color-fg-1)]">
        {title}
      </h2>
      <p className="max-w-md text-sm text-[var(--color-fg-3)]">{description}</p>
      <button
        type="button"
        onClick={reset}
        className="mt-2 inline-flex h-10 items-center justify-center rounded-md bg-[var(--color-ink)] px-4 text-sm font-medium text-[var(--color-on-dark-1)] transition-opacity hover:opacity-90"
      >
        Tentar novamente
      </button>
    </div>
  )
}
