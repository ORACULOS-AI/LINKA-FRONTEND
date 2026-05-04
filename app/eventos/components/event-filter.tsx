'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface EventFilterProps {
  onFilterChange: (type: string) => void
}

export default function EventFilter({ onFilterChange }: EventFilterProps) {
  return (
    <Select onValueChange={onFilterChange} defaultValue="todos">
      <SelectTrigger className="w-[180px] bg-white">
        <SelectValue placeholder="Filtrar por tipo" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="todos">Todos</SelectItem>
        <SelectItem value="workshop">Workshop</SelectItem>
        <SelectItem value="palestra">Palestra</SelectItem>
        <SelectItem value="curso">Curso</SelectItem>
        <SelectItem value="meetup">Meetup</SelectItem>
      </SelectContent>
    </Select>
  )
} 