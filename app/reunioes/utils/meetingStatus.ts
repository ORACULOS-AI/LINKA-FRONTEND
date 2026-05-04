import { isBefore, isAfter, subMinutes, differenceInMinutes } from 'date-fns'
import type { Meeting } from '@/lib/api/meetings'

export interface MeetingTimeStatus {
  status: 'not_ready' | 'waiting' | 'can_enter' | 'finished' | 'unknown'
  label: string
  canEnter: boolean
  color: 'gray' | 'blue' | 'green'
  countdown?: number
  minutesRemaining?: number
}

export function getMeetingTimeStatus(meeting: Meeting, currentTime: Date): MeetingTimeStatus {
  const now = currentTime
  const startDate = new Date(meeting.scheduled_start)
  const endDate = new Date(meeting.scheduled_end)
  const canEnterTime = subMinutes(startDate, 10) // 10 minutos antes

  if (meeting.status !== 'accepted') {
    return {
      status: 'not_ready',
      label: 'Aguardando confirmação',
      canEnter: false,
      color: 'gray'
    }
  }

  if (isBefore(now, canEnterTime)) {
    const minutesUntilEntry = differenceInMinutes(canEnterTime, now)
    const hoursUntilEntry = Math.floor(minutesUntilEntry / 60)
    const remainingMinutes = minutesUntilEntry % 60

    let timeLabel = ''
    if (hoursUntilEntry > 0) {
      timeLabel = `${hoursUntilEntry}h ${remainingMinutes}min`
    } else {
      timeLabel = `${minutesUntilEntry}min`
    }

    return {
      status: 'waiting',
      label: `Disponível em ${timeLabel}`,
      canEnter: false,
      color: 'blue',
      countdown: minutesUntilEntry
    }
  }

  if (isAfter(now, canEnterTime) && isBefore(now, endDate)) {
    const minutesRemaining = differenceInMinutes(endDate, now)
    return {
      status: 'can_enter',
      label: `Entrar agora (${minutesRemaining}min restantes)`,
      canEnter: true,
      color: 'green',
      minutesRemaining
    }
  }

  if (isAfter(now, endDate)) {
    return {
      status: 'finished',
      label: 'Reunião encerrada',
      canEnter: false,
      color: 'gray'
    }
  }

  return {
    status: 'unknown',
    label: 'Status indeterminado',
    canEnter: false,
    color: 'gray'
  }
}

export function getStatusColor(status: string) {
  switch (status) {
    case 'accepted': return 'bg-green-100 text-green-800'
    case 'pending': return 'bg-yellow-100 text-yellow-800'
    case 'declined':
    case 'cancelled': return 'bg-red-100 text-red-800'
    case 'completed': return 'bg-blue-100 text-blue-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export function getStatusBadgeVariant(status: string) {
  switch (status) {
    case 'accepted': return 'default'
    case 'pending': return 'secondary'
    case 'declined':
    case 'cancelled': return 'destructive'
    case 'completed': return 'outline'
    default: return 'secondary'
  }
}
