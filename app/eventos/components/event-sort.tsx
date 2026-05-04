'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface EventSortProps {
  onSortChange: (order: 'asc' | 'desc') => void
}

export default function EventSort({ onSortChange }: EventSortProps) {
  return (
    <Select
      onValueChange={onSortChange as (value: string) => void}
      defaultValue="asc"
    >
      <SelectTrigger className="w-[180px] bg-white">
        <SelectValue placeholder="Ordenar por data" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem className="bg-white hover:bg-gray-100" value="asc">
          Mais antigos primeiro
        </SelectItem>
        <SelectItem className="bg-white hover:bg-gray-100" value="desc">
          Mais recentes primeiro
        </SelectItem>
      </SelectContent>
    </Select>
  )
}
