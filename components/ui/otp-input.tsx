'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

type Props = {
  value: string
  onChange: (v: string) => void
  length?: number
  autoFocus?: boolean
  disabled?: boolean
  invalid?: boolean
  onComplete?: (v: string) => void
}

export function OtpInput({
  value,
  onChange,
  length = 6,
  autoFocus,
  disabled,
  invalid,
  onComplete,
}: Props) {
  const refs = React.useRef<Array<HTMLInputElement | null>>([])
  const chars = React.useMemo(() => {
    const out = value.split('').slice(0, length)
    while (out.length < length) out.push('')
    return out
  }, [value, length])

  React.useEffect(() => {
    if (autoFocus) refs.current[0]?.focus()
  }, [autoFocus])

  function update(next: string) {
    const sanitized = next.replace(/\D/g, '').slice(0, length)
    onChange(sanitized)
    if (sanitized.length === length) onComplete?.(sanitized)
  }

  function handleChange(idx: number, raw: string) {
    const digit = raw.replace(/\D/g, '')
    if (!digit) return
    if (digit.length > 1) {
      update((value + digit).slice(0, length))
      const nextIdx = Math.min(length - 1, value.length + digit.length)
      refs.current[nextIdx]?.focus()
      return
    }
    const arr = chars.slice()
    arr[idx] = digit
    const merged = arr.join('').replace(/\s/g, '')
    update(merged)
    if (idx < length - 1) refs.current[idx + 1]?.focus()
  }

  function handleKey(idx: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') {
      if (chars[idx]) {
        const arr = chars.slice()
        arr[idx] = ''
        update(arr.join(''))
      } else if (idx > 0) {
        refs.current[idx - 1]?.focus()
        const arr = chars.slice()
        arr[idx - 1] = ''
        update(arr.join(''))
      }
      e.preventDefault()
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      refs.current[idx - 1]?.focus()
    } else if (e.key === 'ArrowRight' && idx < length - 1) {
      refs.current[idx + 1]?.focus()
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const text = e.clipboardData.getData('text')
    const sanitized = text.replace(/\D/g, '').slice(0, length)
    if (!sanitized) return
    e.preventDefault()
    update(sanitized)
    const focusIdx = Math.min(length - 1, sanitized.length)
    refs.current[focusIdx]?.focus()
  }

  return (
    <div className="flex gap-2" role="group" aria-label="Código de verificação">
      {chars.map((c, idx) => (
        <input
          key={idx}
          ref={(el) => {
            refs.current[idx] = el
          }}
          value={c}
          onChange={(e) => handleChange(idx, e.target.value)}
          onKeyDown={(e) => handleKey(idx, e)}
          onPaste={handlePaste}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          aria-label={`Dígito ${idx + 1}`}
          className={cn(
            'h-14 w-12 rounded-md border bg-white text-center text-xl font-semibold text-ink',
            'border-ink/15 focus:border-selinka-blue focus:outline-none focus:ring-2 focus:ring-selinka-blue/30',
            invalid && 'border-[#E5102E] focus:border-[#E5102E] focus:ring-[#E5102E]/30',
            disabled && 'opacity-60',
          )}
        />
      ))}
    </div>
  )
}
