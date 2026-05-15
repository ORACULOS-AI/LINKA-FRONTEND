'use client'

import { useAuth } from '@/lib/stores/auth'
import { useWS } from '@/lib/ws/useWS'

const tipoLabel: Record<string, string> = {
  pesquisador: 'Pesquisador',
  estudante: 'Estudante',
  tecnico_admin: 'Técnico administrativo',
  externo: 'Externo',
}

export default function SmokePage() {
  const me = useAuth((s) => s.me)
  const { status } = useWS(false)

  if (!me) return null

  return (
    <section className="mx-auto max-w-article p-6 lg:p-12">
      <header className="mb-8">
        <p className="font-display text-xs uppercase tracking-wider text-ink/50">
          Fundação · SLK-245
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold">
          Olá, {me.nome.split(' ')[0]}
        </h1>
        <p className="mt-2 text-sm text-ink/70">
          Esta é a tela de smoke do novo frontend. Confirma que autenticação,
          axios, TanStack Query, Zustand, Sentry e a Shell estão de pé.
        </p>
      </header>

      <dl className="grid gap-4 rounded-lg border border-border bg-surface p-6 sm:grid-cols-2">
        <Row label="Nome">{me.nome}</Row>
        <Row label="E-mail">{me.email}</Row>
        <Row label="Tipo">{tipoLabel[me.tipo] ?? me.tipo}</Row>
        <Row label="Verificado">{me.verificado ? 'Sim' : 'Não'}</Row>
        <Row label="ID" mono>
          {me.id}
        </Row>
        <Row label="WebSocket">{status}</Row>
      </dl>
    </section>
  )
}

function Row({
  label,
  children,
  mono,
}: {
  label: string
  children: React.ReactNode
  mono?: boolean
}) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs uppercase tracking-wider text-ink/50">{label}</dt>
      <dd className={mono ? 'font-mono text-sm' : 'text-sm'}>{children}</dd>
    </div>
  )
}
