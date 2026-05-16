'use client'

import { useQuery } from '@tanstack/react-query'
import { User as UserIcon, Briefcase, FlaskConical, Lightbulb } from 'lucide-react'
import { listBusinesses } from '@/lib/api/business'
import { listLabs } from '@/lib/api/labs'
import { listInitiatives } from '@/lib/api/initiatives'
import { useAuth } from '@/lib/stores/auth'
import { cn } from '@/lib/utils'

export type HostType = 'user' | 'negocio' | 'laboratorio' | 'iniciativa'
export type HostValue = { type: HostType; id: string }

type Props = {
  value: HostValue | null
  onChange: (v: HostValue) => void
  allowedTypes?: HostType[]
  className?: string
}

export function HostPicker({
  value,
  onChange,
  allowedTypes = ['user', 'negocio', 'laboratorio'],
  className,
}: Props) {
  const me = useAuth((s) => s.me)

  const businessQ = useQuery({
    queryKey: ['my-businesses-options'],
    queryFn: () => listBusinesses({ limit: 50 }),
    enabled: allowedTypes.includes('negocio'),
  })
  const labsQ = useQuery({
    queryKey: ['my-labs-options'],
    queryFn: () => listLabs({ limit: 50 }),
    enabled: allowedTypes.includes('laboratorio'),
  })
  const initsQ = useQuery({
    queryKey: ['my-iniciativas-options'],
    queryFn: () => listInitiatives({ limit: 50 }),
    enabled: allowedTypes.includes('iniciativa'),
  })

  const options: Array<{ type: HostType; id: string; label: string; sub?: string }> = []
  if (allowedTypes.includes('user') && me) {
    options.push({ type: 'user', id: me.id, label: `Eu (${me.nome})`, sub: 'Pessoal' })
  }
  if (allowedTypes.includes('negocio')) {
    for (const b of businessQ.data?.items ?? []) {
      options.push({ type: 'negocio', id: b.uid, label: b.nome, sub: 'Negócio' })
    }
  }
  if (allowedTypes.includes('laboratorio')) {
    for (const l of labsQ.data?.items ?? []) {
      options.push({ type: 'laboratorio', id: l.uid, label: l.nome, sub: 'Laboratório' })
    }
  }
  if (allowedTypes.includes('iniciativa')) {
    for (const i of initsQ.data?.items ?? []) {
      options.push({ type: 'iniciativa', id: i.uid, label: i.titulo, sub: 'Projeto' })
    }
  }

  const iconFor = (t: HostType) =>
    t === 'user' ? UserIcon : t === 'negocio' ? Briefcase : t === 'laboratorio' ? FlaskConical : Lightbulb

  return (
    <div className={cn('space-y-2', className)}>
      <label className="block text-sm font-medium text-[var(--color-fg-1)]">
        Hospedar como
      </label>
      <p className="text-xs text-[var(--color-fg-3)]">
        Escolha em nome de quem este item será criado. Só aparecem as entidades em que você é membro.
      </p>
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {options.map((opt) => {
          const Icon = iconFor(opt.type)
          const selected = value?.type === opt.type && value?.id === opt.id
          return (
            <li key={`${opt.type}:${opt.id}`}>
              <button
                type="button"
                onClick={() => onChange({ type: opt.type, id: opt.id })}
                className={cn(
                  'flex w-full items-center gap-3 rounded-md border px-3 py-2.5 text-left text-sm transition-colors',
                  selected
                    ? 'border-[var(--color-ink)] bg-[var(--color-surface)]'
                    : 'border-[var(--color-border)] hover:bg-[var(--color-surface-2)]',
                )}
              >
                <Icon className="h-4 w-4 shrink-0 text-[var(--color-fg-3)]" />
                <span className="flex min-w-0 flex-col">
                  <span className="truncate font-medium">{opt.label}</span>
                  {opt.sub && (
                    <span className="text-xs text-[var(--color-fg-3)]">{opt.sub}</span>
                  )}
                </span>
              </button>
            </li>
          )
        })}
        {!options.length && (
          <li className="col-span-full rounded-md border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-4 text-sm text-[var(--color-fg-3)]">
            Você não tem nenhum host disponível para esta opção.
          </li>
        )}
      </ul>
    </div>
  )
}
