'use client'

import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'

interface EventRefreshProps {
  onRefresh: () => void
}

export default function EventRefresh({ onRefresh }: EventRefreshProps) {
  return (
    <Button size="icon" onClick={onRefresh}>
      <RefreshCw className="h-4 w-4" />
    </Button>
  )
} 