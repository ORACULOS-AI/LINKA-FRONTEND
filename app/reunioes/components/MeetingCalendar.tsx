"use client"

import { format, isToday, isSameMonth } from 'date-fns'
import { Calendar, ChevronLeft, ChevronRight, Plus, Play, Timer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { Meeting } from '@/lib/api/meetings'
import { getMeetingTimeStatus, getStatusColor } from '../utils/meetingStatus'

interface MeetingCalendarProps {
  currentDate: Date
  calendarDays: Date[]
  meetingsByDay: { [key: string]: Meeting[] }
  allUsers: any[]
  userId: string | null
  currentTime: Date
  onPrevMonth: () => void
  onNextMonth: () => void
  onNewMeeting: () => void
  onDayClick: (day: Date) => void
  onJoinMeeting: (meetingId: string) => void
}

export function MeetingCalendar({
  currentDate,
  calendarDays,
  meetingsByDay,
  allUsers,
  userId,
  currentTime,
  onPrevMonth,
  onNextMonth,
  onNewMeeting,
  onDayClick,
  onJoinMeeting,
}: MeetingCalendarProps) {
  return (
    <Card>
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Calendar className="h-6 w-6 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              {format(currentDate, 'MMMM yyyy', { locale: require('date-fns/locale/pt-BR').ptBR })}
            </h2>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <Button
                variant="outline"
                size="sm"
                onClick={onPrevMonth}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onNextMonth}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button
              onClick={onNewMeeting}
              className="bg-purple-600 hover:bg-purple-700 text-white w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Reunião
            </Button>
          </div>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
            <div key={day} className="p-1 sm:p-2 text-center text-xs sm:text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day) => {
            const dayKey = format(day, 'yyyy-MM-dd')
            const dayMeetings = meetingsByDay[dayKey] || []
            const isCurrentMonth = isSameMonth(day, currentDate)

            return (
              <div
                key={dayKey}
                className={`
                  min-h-[80px] sm:min-h-[100px] p-1 sm:p-2 border border-gray-200 cursor-pointer hover:bg-gray-50
                  ${isToday(day) ? 'bg-purple-50 border-purple-200' : ''}
                  ${!isCurrentMonth ? 'opacity-50' : ''}
                `}
                onClick={() => onDayClick(day)}
              >
                <div className={`
                  text-xs sm:text-sm font-medium mb-1
                  ${isToday(day) ? 'text-purple-600' : 'text-gray-900'}
                `}>
                  {format(day, 'd')}
                </div>

                {/* Day meetings */}
                <div className="space-y-1">
                  {dayMeetings.slice(0, 2).map((meeting: Meeting) => {
                    const otherUserId = meeting.creator_id === userId ? meeting.participant_id : meeting.creator_id
                    const otherUser = allUsers.find((u: any) => u.uid === otherUserId)
                    const otherUserName = otherUser?.nome || otherUser?.email || 'Usuário'
                    const timeStatus = getMeetingTimeStatus(meeting, currentTime)

                    return (
                      <div
                        key={meeting.id}
                        className={`
                          text-[10px] sm:text-xs p-1 rounded truncate flex items-center gap-1
                          ${getStatusColor(meeting.status)}
                          ${timeStatus.canEnter ? 'ring-2 ring-green-400 ring-opacity-75' : ''}
                          ${timeStatus.status === 'waiting' ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}
                        `}
                        onClick={(e) => {
                          e.stopPropagation()
                          if (timeStatus.canEnter) {
                            onJoinMeeting(meeting.id)
                          } else {
                            onDayClick(day)
                          }
                        }}
                      >
                        {timeStatus.canEnter && <Play className="h-2 w-2 text-green-600 hidden sm:block" />}
                        {timeStatus.status === 'waiting' && <Timer className="h-2 w-2 text-blue-600 hidden sm:block" />}
                        <span className="truncate">
                          <span className="hidden sm:inline">{format(new Date(meeting.scheduled_start), 'HH:mm')} - </span>
                          {otherUserName}
                        </span>
                      </div>
                    )
                  })}
                  {dayMeetings.length > 2 && (
                    <div className="text-[10px] sm:text-xs text-gray-500 p-1">
                      +{dayMeetings.length - 2}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
