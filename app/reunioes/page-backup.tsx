'use client'

import { useState, useMemo, useEffect } from 'react'
import { addMinutes, format, formatISO, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameMonth, startOfWeek, endOfWeek, isAfter, isBefore, subMinutes, differenceInMinutes, differenceInSeconds } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Sparkles, Users, Video, Clock, ChevronLeft, ChevronRight, Plus, Calendar, Check, X, Trash2, MessageCircle, Play, AlertCircle, Timer, Loader2, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useAllUsers } from '@/hooks/allUsers'
import { useConnectionRequests } from '@/lib/api/connections'
import { useMeetingApi } from '@/lib/api/meetings'
import type { Meeting, MeetingStatus } from '@/lib/api/meetings'
import { useAuth } from '@/lib/context/AuthContext'
import { toast } from '@/hooks/use-toast'
import PrivateRoute from '@/components/private_route'
import { useRouter, useSearchParams } from 'next/navigation'

export default function MeetingsPage() {
  // Data & hooks ------------------------------------------------------------
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

  // State para o calendário
  const [currentDate, setCurrentDate] = useState(new Date())
  const [dialogOpen, setDialogOpen] = useState(false)
  const [participantId, setParticipantId] = useState<string>('')
  const [message, setMessage] = useState('')

  // Novos states para o modal melhorado
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'))
  const [selectedTime, setSelectedTime] = useState<string>('09:00')
  const [selectedDuration, setSelectedDuration] = useState<string>('60') // em minutos

  // States para edição de reuniões
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null)
  const [editDate, setEditDate] = useState<string>('')
  const [editTime, setEditTime] = useState<string>('')
  const [editDuration, setEditDuration] = useState<string>('')
  const [editMessage, setEditMessage] = useState('')

  // State para o modal do dia
  const [dayModalOpen, setDayModalOpen] = useState(false)
  const [selectedDayDate, setSelectedDayDate] = useState<Date | null>(null)
  
  // State para atualizações em tempo real
  const [currentTime, setCurrentTime] = useState(new Date())

  // Timer para atualizar tempo em tempo real
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000) // Atualiza a cada segundo

    return () => clearInterval(timer)
  }, [])

  // Auto-open scheduling modal from query params
  useEffect(() => {
    const shouldSchedule = searchParams.get('schedule') === 'true'
    const userIdParam = searchParams.get('userId')

    if (shouldSchedule && userIdParam) {
      // Pre-populate the participant field
      setParticipantId(userIdParam)

      // Set default date/time
      setSelectedDate(format(new Date(), 'yyyy-MM-dd'))
      setSelectedTime('09:00')
      setSelectedDuration('60')

      // Open the scheduling modal
      setDialogOpen(true)

      // Clean up URL (remove query params)
      const newUrl = window.location.pathname
      window.history.replaceState({}, '', newUrl)
    }
  }, [searchParams])

  // Função para determinar o status da reunião baseado no horário
  const getMeetingTimeStatus = (meeting: Meeting) => {
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

  // Função para entrar na reunião
  const handleJoinMeeting = (meetingId: string) => {
    router.push(`/reunioes/${meetingId}`)
  }

  // Gerar dias do mês atual
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  
  // Calcular o início e fim do calendário (6 semanas completas)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }) // Domingo
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 }) // Sábado
  
  // Gerar todos os dias do calendário (incluindo dias do mês anterior e próximo)
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  // Agrupar reuniões por dia
  const meetingsByDay = useMemo(() => {
    const grouped: { [key: string]: Meeting[] } = {}
    meetings.forEach((meeting: Meeting) => {
      const dayKey = format(new Date(meeting.scheduled_start), 'yyyy-MM-dd')
      if (!grouped[dayKey]) {
        grouped[dayKey] = []
      }
      grouped[dayKey].push(meeting)
    })
    return grouped
  }, [meetings])

  // Reuniões do dia selecionado
  const selectedDayMeetings = useMemo(() => {
    if (!selectedDayDate) return []
    const dayKey = format(selectedDayDate, 'yyyy-MM-dd')
    return meetingsByDay[dayKey] || []
  }, [selectedDayDate, meetingsByDay])

  // Reuniões de hoje que precisam de atenção
  const todayMeetings = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd')
    const todayMeetingsList = meetingsByDay[today] || []
    return todayMeetingsList
      .filter(meeting => meeting.status === 'accepted')
      .map(meeting => ({
        ...meeting,
        timeStatus: getMeetingTimeStatus(meeting)
      }))
      .filter(meeting => 
        meeting.timeStatus.status === 'can_enter' || 
        meeting.timeStatus.status === 'waiting'
      )
      .sort((a, b) => new Date(a.scheduled_start).getTime() - new Date(b.scheduled_start).getTime())
  }, [meetingsByDay, currentTime, allUsers, userId])

  // Handlers ----------------------------------------------------------------
  const handleSchedule = () => {
    if (!participantId || !selectedDate || !selectedTime || !selectedDuration) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      })
      return
    }

    // Combinar data e horário para criar o Date de início em fuso de Brasília
    const [hours, minutes] = selectedTime.split(':').map(Number)
    const startDateTime = new Date(selectedDate + 'T' + selectedTime + ':00.000-03:00') // Forçar fuso de Brasília
    
    // Verificar se a data/hora não é no passado (comparar em Brasília)
    const nowBrasilia = new Date(new Date().toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}))
    if (isBefore(startDateTime, nowBrasilia)) {
      toast({
        title: "Erro",
        description: "Não é possível agendar reuniões em datas ou horários passados",
        variant: "destructive"
      })
      return
    }

    // Calcular horário de fim baseado na duração
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
        toast({
          title: "Sucesso",
          description: "Reunião agendada com sucesso!"
        })
      }
    })
  }

  const handleUpdateMeeting = (meetingId: string, status: MeetingStatus) => {
    updateMeeting.mutate({
      id: meetingId,
      update: { status }
    }, {
      onSuccess: () => {
        toast({
          title: "Sucesso",
          description: `Reunião ${status === 'accepted' ? 'aceita' : status === 'declined' ? 'recusada' : 'cancelada'} com sucesso!`
        })
      }
    })
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'declined':
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'accepted': return 'default'
      case 'pending': return 'secondary'
      case 'declined':
      case 'cancelled': return 'destructive'
      case 'completed': return 'outline'
      default: return 'secondary'
    }
  }

  const handleDayClick = (day: Date) => {
    setSelectedDayDate(day)
    setDayModalOpen(true)
  }

  const handleNewMeetingForDay = () => {
    if (selectedDayDate) {
      setSelectedDate(format(selectedDayDate, 'yyyy-MM-dd'))
      setSelectedTime('09:00')
      setSelectedDuration('60')
      setDayModalOpen(false)
      setDialogOpen(true)
    }
  }

  // Função para abrir modal de edição
  const handleEditMeeting = (meeting: Meeting) => {
    setEditingMeeting(meeting)
    
    // Converter as datas para fuso de Brasília para edição
    const startDate = new Date(meeting.scheduled_start)
    const endDate = new Date(meeting.scheduled_end)
    
    setEditDate(format(startDate, 'yyyy-MM-dd'))
    setEditTime(format(startDate, 'HH:mm'))
    
    // Calcular duração
    const durationMinutes = differenceInMinutes(endDate, startDate)
    setEditDuration(durationMinutes.toString())
    setEditMessage('') // Limpar mensagem já que não está disponível no Meeting
    setEditDialogOpen(true)
  }

  // Função para salvar edição
  const handleSaveEdit = () => {
    if (!editingMeeting || !editDate || !editTime || !editDuration) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      })
      return
    }

    // Combinar data e horário para criar o Date de início em fuso de Brasília
    const startDateTime = new Date(editDate + 'T' + editTime + ':00.000-03:00')
    
    // Verificar se a data/hora não é no passado (comparar em Brasília)
    const nowBrasilia = new Date(new Date().toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}))
    if (isBefore(startDateTime, nowBrasilia)) {
      toast({
        title: "Erro",
        description: "Não é possível alterar reunião para datas ou horários passados",
        variant: "destructive"
      })
      return
    }

    // Calcular horário de fim baseado na duração
    const endDateTime = addMinutes(startDateTime, parseInt(editDuration))

    updateMeeting.mutate({
      id: editingMeeting.id,
      update: {
        scheduled_start: formatISO(startDateTime),
        scheduled_end: formatISO(endDateTime),
      }
    }, {
      onSuccess: () => {
        setEditDialogOpen(false)
        setEditingMeeting(null)
        toast({
          title: "Sucesso",
          description: "Reunião atualizada com sucesso!"
        })
      }
    })
  }

  // Loading state
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

  // ------------------------------------------------------------------------
  return (
    <PrivateRoute>
      <div className="min-h-screen bg-white flex flex-col">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-purple-600 to-purple-700 text-white">
          <div className="absolute inset-0 overflow-hidden opacity-20">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          </div>
          <div className="relative z-10 container mx-auto px-4 py-12 sm:py-16">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm mb-6">
                <Sparkles className="h-4 w-4 text-white" />
                <span className="text-sm font-medium text-white">Calendário de Reuniões</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-white">
                Reuniões
              </h1>
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-purple-200">
                <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span className="text-base sm:text-lg font-medium">{connectedUsers.length}</span>
                  <span className="text-sm sm:text-base">conexões</span>
                </div>
                <div className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  <span className="text-base sm:text-lg font-medium">{meetings.length}</span>
                  <span className="text-sm sm:text-base">reuniões</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span className="text-base sm:text-lg font-medium">
                    {meetings.filter((m: Meeting) => m.status === 'pending').length}
                  </span>
                  <span className="text-sm sm:text-base">pendentes</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Seção de Reuniões de Hoje */}
        {todayMeetings.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
            <div className="container mx-auto px-4 py-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-purple-600" />
                Reuniões de Hoje - Requerem Atenção
              </h2>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {todayMeetings.map((meeting) => {
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
                            onClick={() => handleJoinMeeting(meeting.id)}
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
        )}

        {/* Calendar Section */}
        <div className="container mx-auto px-4 py-8 flex-1">
          <Card>
            <CardContent className="p-6">
              {/* Header do calendário */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <Calendar className="h-6 w-6 text-purple-600" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
                  </h2>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={prevMonth}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={nextMonth}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button 
                    onClick={() => {
                      setSelectedDate(format(new Date(), 'yyyy-MM-dd'))
                      setSelectedTime('09:00')
                      setSelectedDuration('60')
                      setDialogOpen(true)
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white w-full sm:w-auto"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Reunião
                  </Button>
                </div>
              </div>

              {/* Dias da semana */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
                  <div key={day} className="p-1 sm:p-2 text-center text-xs sm:text-sm font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>

              {/* Grid do calendário */}
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
                      onClick={() => handleDayClick(day)}
                    >
                      <div className={`
                        text-xs sm:text-sm font-medium mb-1
                        ${isToday(day) ? 'text-purple-600' : 'text-gray-900'}
                      `}>
                        {format(day, 'd')}
                      </div>
                      
                      {/* Reuniões do dia */}
                      <div className="space-y-1">
                        {dayMeetings.slice(0, 2).map((meeting: Meeting) => {
                          const otherUserId = meeting.creator_id === userId ? meeting.participant_id : meeting.creator_id
                          const otherUser = allUsers.find((u: any) => u.uid === otherUserId)
                          const otherUserName = otherUser?.nome || otherUser?.email || 'Usuário'
                          const timeStatus = getMeetingTimeStatus(meeting)
                          
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
                                  handleJoinMeeting(meeting.id)
                                } else {
                                  handleDayClick(day)
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

          {/* Legenda de Status */}
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
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span>Concluída</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-gray-800">Acesso à Reunião:</h4>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-400 rounded ring-2 ring-green-400 ring-opacity-50"></div>
                  <Play className="h-3 w-3 text-green-600" />
                  <span>Pode entrar agora</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-400 rounded ring-2 ring-blue-400 ring-opacity-50"></div>
                  <Timer className="h-3 w-3 text-blue-600" />
                  <span>Aguardando liberação (10min antes)</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-3 w-3 text-gray-500" />
                  <span>Reunião encerrada</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal do Dia */}
        <Dialog open={dayModalOpen} onOpenChange={setDayModalOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                {selectedDayDate && format(selectedDayDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Botão para nova reunião */}
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  {selectedDayMeetings.length === 0 
                    ? 'Nenhuma reunião agendada para este dia' 
                    : `${selectedDayMeetings.length} reunião${selectedDayMeetings.length > 1 ? 'ões' : ''} agendada${selectedDayMeetings.length > 1 ? 's' : ''}`
                  }
                </p>
                <Button 
                  onClick={handleNewMeetingForDay}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Reunião
                </Button>
              </div>

              {selectedDayMeetings.length > 0 && <Separator />}

              {/* Lista de reuniões */}
              <div className="space-y-4">
                {selectedDayMeetings.map((meeting: Meeting) => {
                  const otherUserId = meeting.creator_id === userId ? meeting.participant_id : meeting.creator_id
                  const otherUser = allUsers.find((u: any) => u.uid === otherUserId)
                  const otherUserName = otherUser?.nome || otherUser?.email || 'Usuário'
                  const isCreator = meeting.creator_id === userId
                  const isParticipant = meeting.participant_id === userId

                  const statusInfo = getMeetingTimeStatus(meeting)

                  return (
                    <Card key={meeting.id} className="border-l-4 border-l-purple-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold text-gray-900">
                                Reunião com {otherUserName}
                              </h4>
                              <Badge variant={getStatusBadgeVariant(meeting.status)}>
                                {meeting.status === 'accepted' && 'Aceita'}
                                {meeting.status === 'pending' && 'Pendente'}
                                {meeting.status === 'declined' && 'Recusada'}
                                {meeting.status === 'cancelled' && 'Cancelada'}
                                {meeting.status === 'completed' && 'Concluída'}
                              </Badge>
                              
                              {/* Status de tempo da reunião */}
                              {meeting.status === 'accepted' && (
                                <Badge 
                                  variant="outline" 
                                  className={`
                                    ${statusInfo.color === 'green' ? 'border-green-500 text-green-700 bg-green-50' : ''}
                                    ${statusInfo.color === 'blue' ? 'border-blue-500 text-blue-700 bg-blue-50' : ''}
                                    ${statusInfo.color === 'gray' ? 'border-gray-500 text-gray-700 bg-gray-50' : ''}
                                  `}
                                >
                                  {statusInfo.status === 'waiting' && <Timer className="h-3 w-3 mr-1" />}
                                  {statusInfo.status === 'can_enter' && <Play className="h-3 w-3 mr-1" />}
                                  {statusInfo.status === 'finished' && <AlertCircle className="h-3 w-3 mr-1" />}
                                  {statusInfo.label}
                                </Badge>
                              )}
                            </div>
                            
                            <div className="text-sm text-gray-600 space-y-1">
                              <p>
                                <Clock className="h-4 w-4 inline mr-2" />
                                {format(new Date(meeting.scheduled_start), 'HH:mm')} - {format(new Date(meeting.scheduled_end), 'HH:mm')}
                              </p>
                              <p>
                                <Users className="h-4 w-4 inline mr-2" />
                                {isCreator ? 'Você criou esta reunião' : 'Você foi convidado'}
                              </p>
                            </div>
                          </div>

                          {/* Ações */}
                          <div className="flex flex-col gap-2 ml-4">
                            {/* Botão de entrar na reunião */}
                            {statusInfo.canEnter && (
                              <Button
                                size="sm"
                                onClick={() => handleJoinMeeting(meeting.id)}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <Play className="h-4 w-4 mr-2" />
                                Entrar na Reunião
                              </Button>
                            )}
                            
                            <div className="flex gap-2">
                              {/* Botão de editar para criador ou participante */}
                              {(meeting.status === 'pending' || meeting.status === 'accepted') && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditMeeting(meeting)}
                                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                  disabled={updateMeeting.isPending}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              )}

                              {/* Ações de aceitar/recusar para convites pendentes */}
                              {meeting.status === 'pending' && isParticipant && !isCreator && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleUpdateMeeting(meeting.id, 'accepted')}
                                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                    disabled={updateMeeting.isPending}
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleUpdateMeeting(meeting.id, 'declined')}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    disabled={updateMeeting.isPending}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                              
                              {/* Botão de cancelar para reuniões ativas */}
                              {(meeting.status === 'pending' || meeting.status === 'accepted') && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUpdateMeeting(meeting.id, 'cancelled')}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  disabled={updateMeeting.isPending}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDayModalOpen(false)}>
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de Agendamento Melhorado */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                Agendar Nova Reunião
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-5">
              {/* Participante */}
              <div className="space-y-2">
                <Label htmlFor="participant" className="text-sm font-medium text-gray-700">
                  Participante *
                </Label>
                <Select value={participantId} onValueChange={setParticipantId}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Selecione um participante" />
                  </SelectTrigger>
                  <SelectContent>
                    {connectedUsers.map((user: any) => (
                      <SelectItem key={user.uid} value={user.uid}>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-xs font-medium text-purple-600">
                            {(user.nome || user.email || 'U').charAt(0).toUpperCase()}
                          </div>
                          {user.nome || user.email}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Data */}
              <div className="space-y-2">
                <Label htmlFor="date" className="text-sm font-medium text-gray-700">
                  Data *
                </Label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="h-11"
                  min={format(new Date(), 'yyyy-MM-dd')}
                />
              </div>

              {/* Horário */}
              <div className="space-y-2">
                <Label htmlFor="time" className="text-sm font-medium text-gray-700">
                  Horário *
                </Label>
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Selecione o horário" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i.toString().padStart(2, '0')
                      return [
                        <SelectItem key={`${hour}:00`} value={`${hour}:00`}>
                          {`${hour}:00`}
                        </SelectItem>,
                        <SelectItem key={`${hour}:30`} value={`${hour}:30`}>
                          {`${hour}:30`}
                        </SelectItem>
                      ]
                    }).flat()}
                  </SelectContent>
                </Select>
              </div>

              {/* Duração */}
              <div className="space-y-2">
                <Label htmlFor="duration" className="text-sm font-medium text-gray-700">
                  Duração *
                </Label>
                <Select value={selectedDuration} onValueChange={setSelectedDuration}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Selecione a duração" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        30 minutos
                      </div>
                    </SelectItem>
                    <SelectItem value="60">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        1 hora
                      </div>
                    </SelectItem>
                    <SelectItem value="90">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        1 hora e 30 minutos
                      </div>
                    </SelectItem>
                    <SelectItem value="120">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        2 horas
                      </div>
                    </SelectItem>
                    <SelectItem value="180">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        3 horas
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Mensagem */}
              <div className="space-y-2">
                <Label htmlFor="message" className="text-sm font-medium text-gray-700">
                  Mensagem (opcional)
                </Label>
                <Textarea
                  placeholder="Adicione uma descrição ou agenda para a reunião..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 mt-6">
              <Button 
                variant="outline" 
                onClick={() => setDialogOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSchedule} 
                disabled={createMeeting.isPending || !participantId || !selectedDate || !selectedTime} 
                className="bg-purple-600 hover:bg-purple-700 text-white flex-1"
              >
                {createMeeting.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Agendando...
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4 mr-2" />
                    Agendar
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de Edição de Reunião */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                Editar Reunião
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-5">
              {/* Informação do Participante (apenas visualização) */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Participante
                </Label>
                <div className="p-3 bg-gray-50 rounded-lg border">
                  {editingMeeting && (() => {
                    const otherUserId = editingMeeting.creator_id === userId ? editingMeeting.participant_id : editingMeeting.creator_id
                    const otherUser = allUsers.find((u: any) => u.uid === otherUserId)
                    return (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-xs font-medium text-purple-600">
                          {(otherUser?.nome || otherUser?.email || 'U').charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm text-gray-700">{otherUser?.nome || otherUser?.email || 'Usuário'}</span>
                      </div>
                    )
                  })()}
                </div>
              </div>

              {/* Data */}
              <div className="space-y-2">
                <Label htmlFor="editDate" className="text-sm font-medium text-gray-700">
                  Data *
                </Label>
                <Input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="h-11"
                  min={format(new Date(), 'yyyy-MM-dd')}
                />
              </div>

              {/* Horário */}
              <div className="space-y-2">
                <Label htmlFor="time" className="text-sm font-medium text-gray-700">
                  Horário *
                </Label>
                <Select value={editTime} onValueChange={setEditTime}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Selecione o horário" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i.toString().padStart(2, '0')
                      return [
                        <SelectItem key={`${hour}:00`} value={`${hour}:00`}>
                          {`${hour}:00`}
                        </SelectItem>,
                        <SelectItem key={`${hour}:30`} value={`${hour}:30`}>
                          {`${hour}:30`}
                        </SelectItem>
                      ]
                    }).flat()}
                  </SelectContent>
                </Select>
              </div>

              {/* Duração */}
              <div className="space-y-2">
                <Label htmlFor="duration" className="text-sm font-medium text-gray-700">
                  Duração *
                </Label>
                <Select value={editDuration} onValueChange={setEditDuration}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Selecione a duração" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        30 minutos
                      </div>
                    </SelectItem>
                    <SelectItem value="60">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        1 hora
                      </div>
                    </SelectItem>
                    <SelectItem value="90">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        1 hora e 30 minutos
                      </div>
                    </SelectItem>
                    <SelectItem value="120">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        2 horas
                      </div>
                    </SelectItem>
                    <SelectItem value="180">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        3 horas
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Mensagem */}
              <div className="space-y-2">
                <Label htmlFor="message" className="text-sm font-medium text-gray-700">
                  Mensagem (opcional)
                </Label>
                <Textarea
                  placeholder="Adicione uma descrição ou agenda para a reunião..."
                  value={editMessage}
                  onChange={(e) => setEditMessage(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 mt-6">
              <Button 
                variant="outline" 
                onClick={() => setEditDialogOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSaveEdit} 
                disabled={updateMeeting.isPending || !editingMeeting || !editDate || !editTime || !editDuration} 
                className="bg-purple-600 hover:bg-purple-700 text-white flex-1"
              >
                {updateMeeting.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4 mr-2" />
                    Salvar Edição
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PrivateRoute>
  )
}
