'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, ...props }, ref) => (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        'flex h-11 w-full rounded-md border bg-white px-3 text-sm text-fg-1 placeholder:text-fg-4 transition-colors',
        'border-ink/15 focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/30',
        'disabled:cursor-not-allowed disabled:opacity-60',
        invalid && 'border-[#E5102E] focus:border-[#E5102E] focus:ring-[#E5102E]/30',
        className,
      )}
      {...props}
    />
  ),
)
Input.displayName = 'Input'
