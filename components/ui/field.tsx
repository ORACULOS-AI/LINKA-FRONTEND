'use client'

import * as React from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Input, type InputProps } from './input'
import { Label } from './label'
import { cn } from '@/lib/utils'

type BaseFieldProps = {
  label: string
  hint?: string
  error?: string
  className?: string
}

export const FormField = React.forwardRef<
  HTMLInputElement,
  BaseFieldProps & InputProps
>(({ label, hint, error, className, id, ...props }, ref) => {
  const reactId = React.useId()
  const fieldId = id ?? `f-${reactId}`
  const hintId = hint ? `${fieldId}-hint` : undefined
  const errorId = error ? `${fieldId}-err` : undefined
  return (
    <div className={cn('w-full', className)}>
      <Label htmlFor={fieldId}>{label}</Label>
      <Input
        ref={ref}
        id={fieldId}
        invalid={Boolean(error)}
        aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}
        {...props}
      />
      {hint && !error ? (
        <p id={hintId} className="mt-1 text-xs text-fg-3">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="mt-1 text-xs text-[#E5102E]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
})
FormField.displayName = 'FormField'

export const EmailField = React.forwardRef<HTMLInputElement, BaseFieldProps & InputProps>(
  (props, ref) => (
    <FormField
      ref={ref}
      type="email"
      autoComplete="email"
      inputMode="email"
      placeholder="voce@ufc.br"
      {...props}
    />
  ),
)
EmailField.displayName = 'EmailField'

export const PasswordField = React.forwardRef<HTMLInputElement, BaseFieldProps & InputProps>(
  ({ label, hint, error, className, id, autoComplete = 'current-password', ...props }, ref) => {
    const [show, setShow] = React.useState(false)
    const reactId = React.useId()
    const fieldId = id ?? `p-${reactId}`
    const hintId = hint ? `${fieldId}-hint` : undefined
    const errorId = error ? `${fieldId}-err` : undefined
    return (
      <div className={cn('w-full', className)}>
        <Label htmlFor={fieldId}>{label}</Label>
        <div className="relative">
          <Input
            ref={ref}
            id={fieldId}
            type={show ? 'text' : 'password'}
            autoComplete={autoComplete}
            invalid={Boolean(error)}
            aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}
            className="pr-11"
            {...props}
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-fg-3 hover:text-fg-1"
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {hint && !error ? (
          <p id={hintId} className="mt-1 text-xs text-fg-3">
            {hint}
          </p>
        ) : null}
        {error ? (
          <p id={errorId} className="mt-1 text-xs text-[#E5102E]" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    )
  },
)
PasswordField.displayName = 'PasswordField'
