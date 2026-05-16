'use client'

import Link from 'next/link'
import { Briefcase, FlaskConical, Lightbulb, Calendar, Users, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type EntityKind = 'negocio' | 'laboratorio' | 'projeto' | 'evento'

const KIND_META: Record<EntityKind, { label: string; icon: LucideIcon; color: string; bg: string }> = {
  negocio: { label: 'Negócio', icon: Briefcase, color: 'var(--color-purple)', bg: 'var(--color-purple-15)' },
  laboratorio: { label: 'Laboratório', icon: FlaskConical, color: 'var(--color-blue)', bg: 'var(--color-blue-15)' },
  projeto: { label: 'Projeto', icon: Lightbulb, color: 'var(--color-mint)', bg: 'var(--color-mint-15)' },
  evento: { label: 'Evento', icon: Calendar, color: 'var(--color-orange)', bg: 'var(--color-orange-15)' },
}

export type EntityMeta = {
  label: string
  icon?: 'map-pin' | 'calendar' | 'users' | 'lightbulb' | 'flask' | 'briefcase'
}

export type EntityCardProps = {
  id: string
  kind: EntityKind
  href: string
  nome: string
  descricao?: string | null
  categoria?: string | null
  imagem?: string | null
  followers?: number
  meta?: EntityMeta[]
  className?: string
}

function initials(nome: string) {
  return nome
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

export function EntityCard({
  kind,
  href,
  nome,
  descricao,
  categoria,
  imagem,
  followers,
  className,
}: EntityCardProps) {
  const meta = KIND_META[kind]
  const Icon = meta.icon

  return (
    <Link
      href={href}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] transition-shadow hover:shadow-md',
        className,
      )}
    >
      <div
        className="h-1 w-full"
        style={{ background: meta.color }}
        aria-hidden
      />
      <div
        className="relative flex items-center justify-center px-5 pb-3 pt-5"
        style={{ background: meta.bg }}
      >
        {imagem ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imagem}
            alt=""
            className="h-20 w-20 rounded-full object-cover"
          />
        ) : (
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full font-display text-xl font-bold"
            style={{ background: meta.color, color: '#fff' }}
          >
            {initials(nome)}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 px-5 py-4">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-fg-3)]">
          <Icon className="h-3.5 w-3.5" style={{ color: meta.color }} aria-hidden />
          {categoria ?? meta.label}
        </div>
        <h3 className="font-display text-base font-semibold text-[var(--color-fg-1)]">
          {nome}
        </h3>
        {descricao && (
          <p className="line-clamp-2 text-sm text-[var(--color-fg-3)]">{descricao}</p>
        )}
        {typeof followers === 'number' && (
          <div className="mt-2 flex items-center gap-1 text-xs text-[var(--color-fg-3)]">
            <Users className="h-3.5 w-3.5" aria-hidden />
            <span className="tabular-nums">{followers}</span>
            <span>seguidores</span>
          </div>
        )}
      </div>
    </Link>
  )
}
