'use client'

import { type ReactNode, useState } from 'react'
import { ArrowLeft, type LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { Briefcase, FlaskConical, Lightbulb, Calendar } from 'lucide-react'
import { FollowButton } from '@/components/social/FollowButton'
import { LikeButton } from '@/components/social/LikeButton'
import type { FollowTargetType } from '@/lib/api/follow'
import type { LikeTargetType } from '@/lib/api/like'
import type { EntityKind } from './EntityCard'
import { cn } from '@/lib/utils'

const KIND_META: Record<EntityKind, { label: string; icon: LucideIcon; color: string; bg: string; follow: FollowTargetType; like: LikeTargetType }> = {
  negocio: { label: 'Negócio', icon: Briefcase, color: 'var(--color-purple)', bg: 'var(--color-purple-15)', follow: 'negocio', like: 'negocio' },
  laboratorio: { label: 'Laboratório', icon: FlaskConical, color: 'var(--color-blue)', bg: 'var(--color-blue-15)', follow: 'laboratorio', like: 'laboratorio' },
  projeto: { label: 'Projeto', icon: Lightbulb, color: 'var(--color-mint)', bg: 'var(--color-mint-15)', follow: 'iniciativa', like: 'iniciativa' },
  evento: { label: 'Evento', icon: Calendar, color: 'var(--color-orange)', bg: 'var(--color-orange-15)', follow: 'evento', like: 'evento' },
}

export type Tab = {
  id: string
  label: string
  content: ReactNode
  count?: number
}

type Props = {
  kind: EntityKind
  id: string
  nome: string
  categoria?: string | null
  descricao?: string | null
  imagem?: string | null
  chips?: ReactNode
  actions?: ReactNode
  backHref?: string
  tabs: Tab[]
  defaultTab?: string
  canFollow?: boolean
}

function initials(nome: string) {
  return nome
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

export function EntityDetailShell({
  kind, id, nome, categoria, descricao, imagem, chips,
  actions, backHref = '/vitrine', tabs, defaultTab, canFollow = true,
}: Props) {
  const meta = KIND_META[kind]
  const Icon = meta.icon
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.id ?? '')
  const current = tabs.find((t) => t.id === active) ?? tabs[0]

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 lg:py-8">
      <Link
        href={backHref}
        className="mb-4 inline-flex items-center gap-1 text-sm text-[var(--color-fg-3)] hover:text-[var(--color-fg-1)]"
      >
        <ArrowLeft className="h-4 w-4" /> Vitrine
      </Link>

      <header className="overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="h-1 w-full" style={{ background: meta.color }} aria-hidden />
        <div
          className="flex flex-col gap-4 px-6 py-6 sm:flex-row sm:items-start"
          style={{ background: meta.bg }}
        >
          <div className="shrink-0">
            {imagem ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imagem} alt="" className="h-24 w-24 rounded-full object-cover" />
            ) : (
              <div
                className="flex h-24 w-24 items-center justify-center rounded-full font-display text-2xl font-bold"
                style={{ background: meta.color, color: '#fff' }}
              >
                {initials(nome)}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-fg-3)]">
              <Icon className="h-3.5 w-3.5" style={{ color: meta.color }} aria-hidden />
              {categoria ?? meta.label}
            </div>
            <h1 className="font-display text-2xl font-semibold">{nome}</h1>
            {descricao && (
              <p className="mt-2 max-w-2xl text-sm text-[var(--color-fg-2)]">{descricao}</p>
            )}
            {chips && <div className="mt-3 flex flex-wrap gap-1.5">{chips}</div>}
          </div>
          {canFollow && (
            <div className="flex shrink-0 items-center gap-2">
              <LikeButton type={meta.like} id={id} size="sm" />
              <FollowButton type={meta.follow} id={id} size="sm" showCount />
            </div>
          )}
        </div>
        {actions && (
          <div className="flex flex-wrap items-center gap-2 border-t border-[var(--color-border)] px-6 py-3">
            {actions}
          </div>
        )}
      </header>

      <nav className="mt-6 flex gap-1 overflow-x-auto border-b border-[var(--color-border)]">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActive(t.id)}
            className={cn(
              '-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
              active === t.id
                ? 'border-[var(--color-ink)] text-[var(--color-ink)]'
                : 'border-transparent text-[var(--color-fg-3)] hover:text-[var(--color-fg-1)]',
            )}
          >
            {t.label}
            {typeof t.count === 'number' && (
              <span className="ml-1.5 rounded-sm bg-[var(--color-surface-2)] px-1.5 py-0.5 text-xs tabular-nums">
                {t.count}
              </span>
            )}
          </button>
        ))}
      </nav>

      <section className="mt-6">{current?.content}</section>
    </div>
  )
}
