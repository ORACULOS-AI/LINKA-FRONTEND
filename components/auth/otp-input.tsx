'use client'

import * as React from 'react'

type Props = {
  value: string
  onChange: (v: string) => void
  length?: number
  autoFocus?: boolean
  disabled?: boolean
  invalid?: boolean
  onComplete?: (v: string) => void
}

export function OtpInput({ value, onChange, length = 6, autoFocus, disabled, invalid, onComplete }: Props) {
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

  return (
    <div className="row" style={{ gap: 8 }} role="group" aria-label="Código de verificação">
      {chars.map((c, idx) => (
        <input
          key={idx}
          ref={(el) => {
            refs.current[idx] = el
          }}
          value={c}
          onChange={(e) => {
            const digit = e.target.value.replace(/\D/g, '')
            if (!digit) return
            if (digit.length > 1) {
              update((value + digit).slice(0, length))
              refs.current[Math.min(length - 1, value.length + digit.length)]?.focus()
              return
            }
            const arr = chars.slice()
            arr[idx] = digit
            update(arr.join(''))
            if (idx < length - 1) refs.current[idx + 1]?.focus()
          }}
          onKeyDown={(e) => {
            if (e.key === 'Backspace') {
              const arr = chars.slice()
              if (arr[idx]) {
                arr[idx] = ''
                update(arr.join(''))
              } else if (idx > 0) {
                refs.current[idx - 1]?.focus()
                arr[idx - 1] = ''
                update(arr.join(''))
              }
              e.preventDefault()
            } else if (e.key === 'ArrowLeft' && idx > 0) refs.current[idx - 1]?.focus()
            else if (e.key === 'ArrowRight' && idx < length - 1) refs.current[idx + 1]?.focus()
          }}
          onPaste={(e) => {
            const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
            if (!text) return
            e.preventDefault()
            update(text)
            refs.current[Math.min(length - 1, text.length)]?.focus()
          }}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          aria-label={`Dígito ${idx + 1}`}
          className="input"
          style={{
            width: 52,
            height: 56,
            textAlign: 'center',
            font: '700 20px var(--font-display)',
            padding: 0,
            borderColor: invalid ? '#c50e29' : undefined,
          }}
        />
      ))}
    </div>
  )
}
