'use client'

import { Textarea } from '@/components/ui/textarea'

interface TextareaWithCounterProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  maxLength: number
  minHeight?: string
  showCounter?: boolean
}

export function TextareaWithCounter({
  value,
  onChange,
  maxLength,
  minHeight = '150px',
  showCounter = true,
  className,
  ...props
}: TextareaWithCounterProps) {
  const currentLength = value?.length || 0
  const percentage = (currentLength / maxLength) * 100

  return (
    <div className="space-y-2">
      <Textarea
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        className={`resize-none ${className || ''}`}
        style={{ minHeight }}
        {...props}
      />
      {showCounter && (
        <div className="flex justify-between items-center text-sm">
          <div
            className="transition-colors font-medium"
            style={{
              color:
                percentage >= 100
                  ? '#dc2626'
                  : percentage > 90
                  ? '#ea580c'
                  : '#6b7280',
            }}
          >
            {currentLength} / {maxLength} caracteres
          </div>
          <div
            className="w-32 h-2 rounded-full overflow-hidden"
            style={{ backgroundColor: '#e9d5ff' }}
          >
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${Math.min(percentage, 100)}%`,
                background:
                  percentage >= 100
                    ? 'linear-gradient(to right, #ef4444, #dc2626)'
                    : percentage >= 90
                    ? 'linear-gradient(to right, #f97316, #ea580c)'
                    : percentage >= 70
                    ? 'linear-gradient(to right, #9333ea, #7c3aed)'
                    : 'linear-gradient(to right, #a855f7, #9333ea)',
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
