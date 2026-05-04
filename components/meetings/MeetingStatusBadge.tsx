import { Badge } from '@/components/ui/badge'

export function MeetingStatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-green-100 text-green-800',
    declined: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-600',
    completed: 'bg-blue-100 text-blue-800',
  }
  return (
    <span className="inline-block">
      <Badge className={colorMap[status] || 'bg-gray-100'}>{status}</Badge>
    </span>
  )
} 