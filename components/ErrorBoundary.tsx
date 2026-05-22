'use client'

import { Component, type ReactNode } from 'react'
import * as Sentry from '@sentry/nextjs'

type Props = { children: ReactNode; fallback?: ReactNode }
type State = { hasError: boolean }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    Sentry.captureException(error, { extra: { componentStack: info.componentStack } })
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 p-8 text-center">
            <h1 className="font-display text-2xl font-semibold">
              Algo inesperado aconteceu
            </h1>
            <p className="text-sm text-fg-2">
              Tente recarregar a página. Se persistir, nossa equipe já foi notificada.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-2 rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper transition-all duration-150 active:scale-[0.98]"
            >
              Recarregar
            </button>
          </div>
        )
      )
    }
    return this.props.children
  }
}
