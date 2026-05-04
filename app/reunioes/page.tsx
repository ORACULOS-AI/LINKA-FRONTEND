'use client'

import { useState, useMemo, useEffect } from 'react'
import { addMinutes, format, formatISO, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isBefore } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Sparkles, Users, Video, Clock } from 'lucide-react'
import { useAllUsers } from '@/hooks/allUsers'
import { useConnectionRequests } from '@/lib/api/connections'
import { useMeetingApi } from '@/lib/api/meetings'
import type { Meeting, MeetingStatus } from '@/lib/api/meetings'
import { useAuth } from '@/lib/context/AuthContext'
import { toast } from '@/hooks/use-toast'
import PrivateRoute from '@/components/private_route'
import { useRouter, useSearchParams } from 'next/navigation'
import { CommunityHero } from '@/components/comunidade/shared/CommunityHero'
import { TodayMeetings } from './components/TodayMeetings'
import { MeetingCalendar } from './components/MeetingCalendar'
import { ScheduleMeetingModal } from './components/ScheduleMeetingModal'
import { getMeetingTimeStatus } from './utils/meetingStatus'

export default function MeetingsPage() {
  const { userId } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { useGetUserConnections } = useConnectionRequests()
  const { data: connectionIds = [] } = useGetUserConnections()
  const { data: allUsers = [] } = useAllUsers()

  const connectedUsers = useMemo(() => {
    return connectionIds
      .filter((id: string) => id !== userId)
      .map((id: string) => allUsers.find((u: any) => u.uid === id))
      .filter(Boolean)
  }, [connectionIds, allUsers, userId])

  const { useCreateMeeting, useListMeetings, useUpdateMeeting } = useMeetingApi()
  const createMeeting = useCreateMeeting()
  const updateMeeting = useUpdateMeeting()
  const { data: meetings = [], isLoading: meetingsLoading } = useListMeetings()

  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date())
  const [dialogOpen, setDialogOpen] = useState(false)
  const [participantId, setParticipantId] = useState<string>('')
  const [message, setMessage] = useState('')
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'))
  const [selectedTime, setSelectedTime] = useState<string>('09:00')
  const [selectedDuration, setSelectedDuration] = useState<string>('60')
  const [currentTime, setCurrentTime] = useState(new Date())

  // Real-time timer
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Auto-open modal from query params
  useEffect(() => {
    const shouldSchedule = searchParams.get('schedule') === 'true'
    const userIdParam = searchParams.get('userId')

    if (shouldSchedule && userIdParam) {
      setParticipantId(userIdParam)
      setSelectedDate(format(new Date(), 'yyyy-MM-dd'))
      setSelectedTime('09:00')
      setSelectedDuration('60')
      setDialogOpen(true)
      const newUrl = window.location.pathname
      window.history.replaceState({}, '', newUrl)
    }
  }, [searchParams])

  // Calculate calendar days
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  // Group meetings by day
  const meetingsByDay = useMemo(() => {
    const grouped: { [key: string]: Meeting[] } = {}
    meetings.forEach((meeting: Meeting) => {
      const dayKey = format(new Date(meeting.scheduled_start), 'yyyy-MM-dd')
      if (!grouped[dayKey]) grouped[dayKey] = []
      grouped[dayKey].push(meeting)
    })
    return grouped
  }, [meetings])

  // Today's important meetings
  const todayMeetings = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd')
    const todayMeetingsList = meetingsByDay[today] || []
    return todayMeetingsList
      .filter(meeting => meeting.status === 'accepted')
      .map(meeting => ({ ...meeting, timeStatus: getMeetingTimeStatus(meeting, currentTime) }))
      .filter(meeting => meeting.timeStatus.status === 'can_enter' || meeting.timeStatus.status === 'waiting')
      .sort((a, b) => new Date(a.scheduled_start).getTime() - new Date(b.scheduled_start).getTime())
  }, [meetingsByDay, currentTime])

  // Handlers
  const handleSchedule = () => {
    if (!participantId || !selectedDate || !selectedTime || !selectedDuration) {
      toast({ title: "Erro", description: "Preencha todos os campos obrigatórios", variant: "destructive" })
      return
    }

    const startDateTime = new Date(selectedDate + 'T' + selectedTime + ':00.000-03:00')
    const nowBrasilia = new Date(new Date().toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}))

    if (isBefore(startDateTime, nowBrasilia)) {
      toast({ title: "Erro", description: "Não é possível agendar reuniões em datas ou horários passados", variant: "destructive" })
      return
    }

    const endDateTime = addMinutes(startDateTime, parseInt(selectedDuration))

    createMeeting.mutate({
      participant_id: participantId,
      scheduled_start: formatISO(startDateTime),
      scheduled_end: formatISO(endDateTime),
      message: message || undefined,
    }, {
      onSuccess: () => {
        setDialogOpen(false)
        setParticipantId('')
        setMessage('')
        setSelectedDate(format(new Date(), 'yyyy-MM-dd'))
        setSelectedTime('09:00')
        setSelectedDuration('60')
        toast({ title: "Sucesso", description: "Reunião agendada com sucesso!" })
      }
    })
  }

  const handleJoinMeeting = (meetingId: string) => {
    router.push(`/reunioes/${meetingId}`)
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const handleDayClick = (day: Date) => {
    // Simplified - open modal to schedule for this day
    setSelectedDate(format(day, 'yyyy-MM-dd'))
    setSelectedTime('09:00')
    setSelectedDuration('60')
    setDialogOpen(true)
  }

  const handleNewMeeting = () => {
    setSelectedDate(format(new Date(), 'yyyy-MM-dd'))
    setSelectedTime('09:00')
    setSelectedDuration('60')
    setDialogOpen(true)
  }

  if (meetingsLoading) {
    return (
      <PrivateRoute>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p>Carregando reuniões...</p>
          </div>
        </div>
      </PrivateRoute>
    )
  }

  return (
    <PrivateRoute>
      <div className="min-h-screen bg-white flex flex-col">
        {/* Hero */}
        <CommunityHero
          icon={Video}
          badge="Calendário de Reuniões"
          title="Reuniões"
          stats={[
            { icon: Users, value: connectedUsers.length, label: 'conexões' },
            { icon: Video, value: meetings.length, label: 'reuniões' },
            { icon: Clock, value: meetings.filter((m: Meeting) => m.status === 'pending').length, label: 'pendentes' },
          ]}
        />

        {/* Today's Meetings Section */}
        <TodayMeetings
          meetings={todayMeetings}
          allUsers={allUsers}
          userId={userId}
          onJoinMeeting={handleJoinMeeting}
        />

        {/* Calendar Section */}
        <div className="container mx-auto px-4 py-8 flex-1">
          <MeetingCalendar
            currentDate={currentDate}
            calendarDays={calendarDays}
            meetingsByDay={meetingsByDay}
            allUsers={allUsers}
            userId={userId}
            currentTime={currentTime}
            onPrevMonth={prevMonth}
            onNextMonth={nextMonth}
            onNewMeeting={handleNewMeeting}
            onDayClick={handleDayClick}
            onJoinMeeting={handleJoinMeeting}
          />

          {/* Legend */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Legenda de Status:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-medium text-gray-800">Status da Reunião:</h4>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span>Aceita</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                  <span>Pendente</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span>Recusada/Cancelada</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Modal */}
      <ScheduleMeetingModal
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        participantId={participantId}
        onParticipantChange={setParticipantId}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        selectedTime={selectedTime}
        onTimeChange={setSelectedTime}
        selectedDuration={selectedDuration}
        onDurationChange={setSelectedDuration}
        message={message}
        onMessageChange={setMessage}
        connectedUsers={connectedUsers}
        onSchedule={handleSchedule}
        isScheduling={createMeeting.isPending}
      />
    </PrivateRoute>
  )
}
