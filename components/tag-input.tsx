'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'

interface TagInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  maxTags?: number
  maxLength?: number
  className?: string
}

export function TagInput({
  value,
  onChange,
  placeholder = 'Digite e pressione Enter',
  maxTags = 15,
  maxLength = 50,
  className = '',
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('')

  // Garantir que value seja sempre um array
  const tags = Array.isArray(value) ? value : []

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault()

      // Validações
      if (tags.length >= maxTags) {
        return
      }

      if (inputValue.length > maxLength) {
        return
      }

      if (!tags.includes(inputValue.trim())) {
        onChange([...tags, inputValue.trim()])
      }

      setInputValue('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    onChange(tags.filter((tag) => tag !== tagToRemove))
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <Input
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={tags.length >= maxTags}
          className="flex-1"
        />
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {tags.length}/{maxTags}
        </span>
      </div>

      <div
        className="flex flex-wrap gap-2 min-h-[2.5rem] p-3 border rounded-md"
        style={{
          borderColor: '#e9d5ff',
          backgroundColor: 'rgba(243, 232, 255, 0.3)',
        }}
      >
        {tags.map((tag) => (
          <Badge
            key={tag}
            className="cursor-pointer transition-all px-3 py-1 shadow-sm"
            style={{
              background: 'linear-gradient(to right, #9333ea, #7c3aed)',
              color: '#ffffff',
            }}
            onClick={() => handleRemoveTag(tag)}
          >
            <span className="mr-1.5">{tag}</span>
            <X className="h-3 w-3 hover:scale-110 transition-transform" />
          </Badge>
        ))}
        {tags.length === 0 && (
          <span className="text-sm" style={{ color: 'rgba(192, 132, 252, 0.7)' }}>
            Nenhuma tag adicionada
          </span>
        )}
      </div>
    </div>
  )
}
