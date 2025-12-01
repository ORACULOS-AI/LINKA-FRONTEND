"use client"

import { format } from 'date-fns'
import { AlertCircle, Play, Timer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Meeting } from '@/lib/api/meetings'
import type { MeetingTimeStatus } from '../utils/meetingStatus'

interface TodayMeetingsProps {
  meetings: Array<Meeting & { timeStatus: MeetingTimeStatus }>
  allUsers: any[]
  userId: string | null
  onJoinMeeting: (meetingId: string) => void
}

export function TodayMeetings({ meetings, allUsers, userId, onJoinMeeting }: TodayMeetingsProps) {
  if (meetings.length === 0) return null

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
      <div className="container mx-auto px-4 py-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-purple-600" />
          Reuniões de Hoje - Requerem Atenção
        </h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {meetings.map((meeting) => {
            const otherUserId = meeting.creator_id === userId ? meeting.participant_id : meeting.creator_id
            const otherUser = allUsers.find((u: any) => u.uid === otherUserId)
            const otherUserName = otherUser?.nome || otherUser?.email || 'Usuário'

            return (
              <Card key={meeting.id} className="bg-white shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900 truncate">
                      {otherUserName}
                    </h3>
                    <Badge
                      variant="outline"
                      className={`
                        ${meeting.timeStatus.color === 'green' ? 'border-green-500 text-green-700 bg-green-50' : ''}
                        ${meeting.timeStatus.color === 'blue' ? 'border-blue-500 text-blue-700 bg-blue-50' : ''}
                      `}
                    >
                      {meeting.timeStatus.status === 'waiting' && <Timer className="h-3 w-3 mr-1" />}
                      {meeting.timeStatus.status === 'can_enter' && <Play className="h-3 w-3 mr-1" />}
                      {meeting.timeStatus.status === 'can_enter' ? 'Disponível' : 'Aguardando'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {format(new Date(meeting.scheduled_start), 'HH:mm')} - {format(new Date(meeting.scheduled_end), 'HH:mm')}
                  </p>
                  {meeting.timeStatus.canEnter ? (
                    <Button
                      onClick={() => onJoinMeeting(meeting.id)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                      size="sm"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Entrar na Reunião
                    </Button>
                  ) : (
                    <div className="text-center">
                      <p className="text-sm font-medium text-blue-700">
                        {meeting.timeStatus.label}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
