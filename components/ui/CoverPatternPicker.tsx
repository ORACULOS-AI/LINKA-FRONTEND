'use client'

import { cn } from '@/lib/utils'

export const COVER_PATTERNS = [
  { key: 'purple', url: '/selinka/pattern-mint-on-purple.png', label: 'Roxo' },
  { key: 'blue',   url: '/selinka/pattern-orange-on-blue.png', label: 'Azul' },
  { key: 'mint',   url: '/selinka/pattern-blue-on-mint.png',   label: 'Mint' },
  { key: 'orange', url: '/selinka/pattern-white-on-orange.png', label: 'Laranja' },
] as const

type Props = {
  value?: string | null
  onChange: (url: string) => void
  className?: string
}

export function CoverPatternPicker({ value, onChange, className }: Props) {
  return (
    <div className={cn('flex gap-3', className)}>
      {COVER_PATTERNS.map((p) => {
        const selected = value === p.url
        return (
          <button
            key={p.key}
            type="button"
            title={p.label}
            onClick={() => onChange(p.url)}
            className={cn(
              'h-14 w-20 shrink-0 rounded-md border-2 transition-all',
              selected ? 'border-purple ring-2 ring-purple/40' : 'border-transparent hover:border-border-strong',
            )}
            style={{ backgroundImage: `url(${p.url})`, backgroundSize: 'cover' }}
            aria-pressed={selected}
            aria-label={`Capa ${p.label}`}
          />
        )
      })}
    </div>
  )
}
