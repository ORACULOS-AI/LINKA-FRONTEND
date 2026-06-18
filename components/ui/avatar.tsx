'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

const PALETTE = ['#5C079E', '#0022FF', '#FF9E00', '#06070F', '#06F283']

function colorFor(seed: string) {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return PALETTE[h % PALETTE.length]
}

function initials(nome: string) {
  const parts = nome.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return (parts[0] ?? '').slice(0, 2).toUpperCase()
  return ((parts[0]?.[0] ?? '') + (parts[parts.length - 1]?.[0] ?? '')).toUpperCase()
}

type Props = {
  nome?: string | null
  src?: string | null
  size?: number
  className?: string
}

export function Avatar({ nome, src, size = 40, className }: Props) {
  const [imgError, setImgError] = useState(false)

  const seed = nome ?? '?'
  const bg = colorFor(seed)
  const fallback = (
    <div
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-display font-semibold text-white',
        className,
      )}
      style={{ width: size, height: size, background: bg, fontSize: Math.round(size * 0.38) }}
      aria-label={nome ?? undefined}
    >
      {initials(seed)}
    </div>
  )

  if (src && !imgError) {
    // <img> puro (não next/image): o otimizador do next/image quebra avatares
    // remotos no deploy standalone, e o resto do app já usa <img>. Mantém o
    // fallback de iniciais via onError. Ver #3a (avatar do autor sumindo no feed).
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={nome ?? ''}
        width={size}
        height={size}
        className={cn('rounded-full object-cover', className)}
        style={{ width: size, height: size }}
        onError={() => setImgError(true)}
      />
    )
  }

  return fallback
}
