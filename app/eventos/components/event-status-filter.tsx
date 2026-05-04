'use client'

import { Button } from '@/components/ui/button'
import type { EventStatus } from '@/lib/types/event'

interface EventStatusFilterProps {
  onStatusChange: (status: EventStatus) => void
}

export default function EventStatusFilter({
  onStatusChange,
}: EventStatusFilterProps) {
  const statuses: EventStatus[] = ['ATIVO', 'PAUSADO', 'CONCLUIDO', 'CANCELADO']

  return (
    <div className="flex gap-2">
      {statuses.map((status) => (
        <Button
          key={status}
          variant="outline"
          className="hover:bg-gray-100"
          size="sm"
          onClick={() => onStatusChange(status)}
        >
          {status.charAt(0) + status.slice(1).toLowerCase()}
        </Button>
      ))}
    </div>
  )
}
