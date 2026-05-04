'use client'

import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

interface EventSearchProps {
  onSearch: (term: string) => void
}

export default function EventSearch({ onSearch }: EventSearchProps) {
  return (
    <div className="relative flex-1">
      <Search className="absolute left-2 top-2.5 h-4 w-4" />
      <Input
        placeholder="Buscar eventos..."
        className="pl-8 bg-white"
        onChange={(e) => onSearch(e.target.value)}
      />
    </div>
  )
} 