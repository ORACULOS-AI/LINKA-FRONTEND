'use client'

import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Check, X, FlaskConical, Briefcase, Lightbulb, Calendar } from 'lucide-react'
import { listAllLabs, approveLab, rejectLab } from '@/lib/api/labs'
import { listBusinesses, approveBusiness, rejectBusiness } from '@/lib/api/business'
import { listAdminInitiatives, approveInitiative, rejectInitiative } from '@/lib/api/initiatives'
import { listEvents, approveEvent, rejectEvent } from '@/lib/api/events'
import { useAuth } from '@/lib/stores/auth'
import { toast, toastApiError } from '@/lib/toast'

export default function AprovacoesPage() {
  const me = useAuth((s) => s.me)
  const qc = useQueryClient()

  const labsQ = useQuery({
    queryKey: ['admin', 'labs-pending'],
    // status não é filtro server-side (CursorParams só lê limit/cursor); buscamos
    // todos e filtramos PENDENTE no client, abaixo — senão pendentes além da 1ª página somem.
    queryFn: () => listAllLabs(),
    enabled: !!me?.is_admin,
  })
  const bizQ = useQuery({
    queryKey: ['admin', 'biz-pending'],
    queryFn: () => listBusinesses({ limit: 100 }),
    enabled: !!me?.is_admin,
  })
  const initsQ = useQuery({
    queryKey: ['admin', 'inits-pending'],
    queryFn: listAdminInitiatives,
    enabled: !!me?.is_admin,
  })
  const evtsQ = useQuery({
    queryKey: ['admin', 'events-pending'],
    queryFn: () => listEvents({ status: 'pendente_aprovacao', limit: 100 }),
    enabled: !!me?.is_admin,
  })

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['admin'] })
  }

  if (!me?.is_admin) {
    return <div className="mx-auto max-w-2xl p-6 text-center text-sm">Acesso restrito.</div>
  }

  const labsPend = (labsQ.data ?? []).filter(
    (l) => l.status?.toUpperCase?.() === 'PENDENTE',
  )
  const bizPend = (bizQ.data?.items ?? []).filter((b) => b.status === 'pendente')
  const initsPend = initsQ.data ?? []
  const evtsPend = (evtsQ.data?.items ?? []).filter((e) => e.status === 'pendente_aprovacao')

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 lg:py-8">
      <Link href="/admin" className="mb-3 inline-flex items-center gap-1 text-sm text-[var(--color-fg-3)]">
        <ArrowLeft className="h-4 w-4" /> Admin
      </Link>
      <h1 className="font-display text-2xl font-semibold">Aprovações pendentes</h1>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <ApprovalSection
          title="Laboratórios"
          Icon={FlaskConical}
          items={labsPend.map((l) => ({ id: l.uid, label: l.nome, sub: l.unidade, href: `/vitrine/laboratorios/${l.uid}` }))}
          onApprove={async (id) => {
            try {
              await approveLab(id)
              toast.success('Lab aprovado')
              invalidate()
            } catch (e) { toastApiError(e, 'Falha ao aprovar.') }
          }}
          onReject={async (id) => {
            try {
              await rejectLab(id)
              toast.success('Lab recusado')
              invalidate()
            } catch (e) { toastApiError(e, 'Falha ao recusar.') }
          }}
        />
        <ApprovalSection
          title="Negócios"
          Icon={Briefcase}
          items={bizPend.map((b) => ({ id: b.id, label: b.nome, sub: b.categoria, href: `/vitrine/negocios/${b.id}` }))}
          onApprove={async (id) => {
            try { await approveBusiness(id); toast.success('Negócio aprovado'); invalidate() } catch (e) { toastApiError(e, 'Falha.') }
          }}
          onReject={async (id) => {
            try { await rejectBusiness(id); toast.success('Negócio recusado'); invalidate() } catch (e) { toastApiError(e, 'Falha.') }
          }}
        />
        <ApprovalSection
          title="Projetos"
          Icon={Lightbulb}
          items={initsPend.map((i) => ({ id: i.uid, label: i.titulo, sub: i.tipo, href: `/vitrine/projetos/${i.uid}` }))}
          onApprove={async (id) => {
            try { await approveInitiative(id); toast.success('Projeto aprovado'); invalidate() } catch (e) { toastApiError(e, 'Falha.') }
          }}
          onReject={async (id) => {
            try { await rejectInitiative(id); toast.success('Projeto recusado'); invalidate() } catch (e) { toastApiError(e, 'Falha.') }
          }}
        />
        <ApprovalSection
          title="Eventos"
          Icon={Calendar}
          items={evtsPend.map((e) => ({ id: e.uid, label: e.titulo, sub: new Date(e.data_inicio).toLocaleDateString('pt-BR'), href: `/vitrine/eventos/${e.uid}` }))}
          onApprove={async (id) => {
            try { await approveEvent(id); toast.success('Evento aprovado'); invalidate() } catch (e) { toastApiError(e, 'Falha.') }
          }}
          onReject={async (id) => {
            try { await rejectEvent(id); toast.success('Evento recusado'); invalidate() } catch (e) { toastApiError(e, 'Falha.') }
          }}
        />
      </div>
    </div>
  )
}

function ApprovalSection({
  title, Icon, items, onApprove, onReject,
}: {
  title: string
  Icon: typeof FlaskConical
  items: { id: string; label: string; sub?: string; href: string }[]
  onApprove: (id: string) => Promise<void>
  onReject: (id: string) => Promise<void>
}) {
  return (
    <section className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <header className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-display font-semibold">
          <Icon className="h-5 w-5 text-[var(--color-fg-3)]" /> {title}
          <span className="rounded-full bg-[var(--color-surface-2)] px-2 py-0.5 text-xs text-[var(--color-fg-3)]">
            {items.length}
          </span>
        </h2>
      </header>
      {items.length === 0 ? (
        <p className="rounded-md border border-dashed border-[var(--color-border)] bg-[var(--color-surface-2)] p-3 text-center text-sm text-[var(--color-fg-3)]">
          Nada pendente.
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((it) => (
            <li key={it.id} className="flex items-center justify-between gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-2 text-sm">
              <Link href={it.href} className="min-w-0">
                <div className="truncate font-medium">{it.label}</div>
                {it.sub && <div className="truncate text-xs text-[var(--color-fg-3)]">{it.sub}</div>}
              </Link>
              <div className="flex shrink-0 gap-1">
                <button
                  onClick={() => onApprove(it.id)}
                  className="inline-flex h-8 items-center gap-1 rounded-md bg-[var(--color-mint-15)] px-2 text-xs text-[var(--color-mint)] hover:bg-[var(--color-mint)] hover:text-[var(--color-on-dark-1)]"
                >
                  <Check className="h-3.5 w-3.5" /> Aprovar
                </button>
                <button
                  onClick={() => onReject(it.id)}
                  className="inline-flex h-8 items-center gap-1 rounded-md border border-red-200 px-2 text-xs text-red-700 hover:bg-red-50"
                >
                  <X className="h-3.5 w-3.5" /> Recusar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
