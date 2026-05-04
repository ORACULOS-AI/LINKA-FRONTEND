'use client'

import { Button } from '@/components/ui/button'
import type { EventStatus } from '@/lib/types/event'

interface EventStatusFilterProps {
  onStatusChange: (status: EventStatus) => void
}

export default function EventStatusFilter({ onStatusChange }: EventStatusFilterProps) {
  const statuses: EventStatus[] = ['ativo', 'pausado', 'concluido', 'cancelado']

  return (
    <div className="flex gap-2">
      {statuses.map((status) => (
        <Button
          key={status}
          variant="outline"
          size="sm"
          onClick={() => onStatusChange(status)}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Button>
      ))}
    </div>
  )
} 