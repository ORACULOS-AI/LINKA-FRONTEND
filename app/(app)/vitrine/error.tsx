'use client'

import { RouteError } from '@/components/primitives'

export default function VitrineError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <RouteError
      error={error}
      reset={reset}
      title="Não foi possível carregar a Vitrine"
      description="Tente novamente em instantes."
    />
  )
}
