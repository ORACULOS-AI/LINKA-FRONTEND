'use client'

import { useParams, useRouter } from 'next/navigation'
import { useMeetingApi } from '@/lib/api/meetings'
import { useAuth } from '@/lib/context/AuthContext'
import { MeetingStatusBadge } from '@/components/meetings/MeetingStatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format, differenceInMinutes, isAfter, isBefore, subMinutes } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Clock, Users, Video, ArrowLeft, Play, Timer, AlertCircle } from 'lucide-react'
import MeetRoom from '@/components/meetings/MeetRoom'
import { useState, useEffect } from 'react'

export default function MeetingDetailPage() {
  const { id } = useParams() as { id: string }
  const router = useRouter()
  const { useGetMeeting, useUpdateMeeting } = useMeetingApi()
  const { data: meeting, isLoading } = useGetMeeting(id)
  const updateMut = useUpdateMeeting()
  const { userId } = useAuth()
  const [currentTime, setCurrentTime] = useState(new Date())

  // Timer para atualizar tempo em tempo real
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  if (isLoading || !meeting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p>Carregando reunião...</p>
        </div>
      </div>
    )
  }

  const isCreator = meeting.creator_id === userId
  const isParticipant = meeting.participant_id === userId

  const handleAction = (status: 'accepted' | 'declined' | 'cancelled') => {
    updateMut.mutate({ id, update: { status } })
  }

  // Calcular status da reunião baseado no horário
  const now = currentTime
  const startDate = new Date(meeting.scheduled_start)
  const endDate = new Date(meeting.scheduled_end)
  const canEnterTime = subMinutes(startDate, 10)

  const canEnter = meeting.status === 'accepted' && 
                   isAfter(now, canEnterTime) && 
                   isBefore(now, endDate)

  const getMeetingTimeStatus = () => {
    if (meeting.status !== 'accepted') {
      return {
        canEnter: false,
        status: 'not_ready',
        message: 'Aguardando confirmação da reunião',
        color: 'gray'
      }
    }

    if (isBefore(now, canEnterTime)) {
      const minutesUntil = differenceInMinutes(canEnterTime, now)
      const hoursUntil = Math.floor(minutesUntil / 60)
      const remainingMinutes = minutesUntil % 60

      let timeLabel = ''
      if (hoursUntil > 0) {
        timeLabel = `${hoursUntil}h ${remainingMinutes}min`
      } else {
        timeLabel = `${minutesUntil}min`
      }

      return {
        canEnter: false,
        status: 'waiting',
        message: `A reunião estará disponível em ${timeLabel}`,
        color: 'blue'
      }
    }

    if (canEnter) {
      const minutesRemaining = differenceInMinutes(endDate, now)
      return {
        canEnter: true,
        status: 'available',
        message: `Reunião disponível (${minutesRemaining}min restantes)`,
        color: 'green'
      }
    }

    if (isAfter(now, endDate)) {
      return {
        canEnter: false,
        status: 'finished',
        message: 'Reunião encerrada',
        color: 'gray'
      }
    }

    return {
      canEnter: false,
      status: 'unknown',
      message: 'Status indeterminado',
      color: 'gray'
    }
  }

  const timeStatus = getMeetingTimeStatus()

  if (canEnter) {
    return <MeetRoom meetingId={id} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          
          <h1 className="text-2xl font-bold text-gray-900">Detalhes da Reunião</h1>
        </div>

        {/* Card Principal */}
        <Card className="shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5 text-purple-600" />
                Reunião Agendada
              </CardTitle>
              <MeetingStatusBadge status={meeting.status} />
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Informações da Reunião */}
            <div className="grid gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Clock className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">Horário</p>
                  <p className="text-sm text-gray-600">
                    {format(startDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                  <p className="text-sm text-gray-600">
                    {format(startDate, 'HH:mm')} - {format(endDate, 'HH:mm')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Users className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">Participação</p>
                  <p className="text-sm text-gray-600">
                    {isCreator ? 'Você criou esta reunião' : 'Você foi convidado para esta reunião'}
                  </p>
                </div>
              </div>
            </div>

            {/* Status de Acesso */}
            <div className="border-t pt-4">
              <div className="flex items-center gap-3 mb-4">
                {timeStatus.status === 'waiting' && <Timer className="h-5 w-5 text-blue-600" />}
                {timeStatus.status === 'available' && <Play className="h-5 w-5 text-green-600" />}
                {timeStatus.status === 'finished' && <AlertCircle className="h-5 w-5 text-gray-500" />}
                {timeStatus.status === 'not_ready' && <Clock className="h-5 w-5 text-gray-500" />}
                
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">Status de Acesso</h3>
                  <p className={`text-sm ${
                    timeStatus.color === 'green' ? 'text-green-600' :
                    timeStatus.color === 'blue' ? 'text-blue-600' :
                    'text-gray-600'
                  }`}>
                    {timeStatus.message}
                  </p>
                </div>

                {timeStatus.status === 'available' && (
                  <Badge className="bg-green-100 text-green-800">
                    Disponível Agora
                  </Badge>
                )}
                {timeStatus.status === 'waiting' && (
                  <Badge className="bg-blue-100 text-blue-800">
                    Aguardando
                  </Badge>
                )}
              </div>

              {/* Botão de Entrar */}
              {timeStatus.canEnter && (
                <Button 
                  onClick={() => window.location.reload()} 
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  size="lg"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Entrar na Reunião
                </Button>
              )}

              {/* Informação sobre acesso */}
              {!timeStatus.canEnter && meeting.status === 'accepted' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Timer className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">Acesso à Reunião</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        A sala ficará disponível 10 minutos antes do horário agendado. 
                        Esta página será atualizada automaticamente quando for possível entrar.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Ações */}
            <div className="border-t pt-4">
              {meeting.status === 'pending' && isParticipant && !isCreator && (
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900">Responder ao Convite</h3>
                  <div className="flex gap-3">
                    <Button 
                      onClick={() => handleAction('accepted')}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      disabled={updateMut.isPending}
                    >
                      Aceitar
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={() => handleAction('declined')}
                      className="flex-1"
                      disabled={updateMut.isPending}
                    >
                      Recusar
                    </Button>
                  </div>
                </div>
              )}

              {meeting.status === 'pending' && isCreator && (
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900">Gerenciar Convite</h3>
                  <Button 
                    variant="destructive" 
                    onClick={() => handleAction('cancelled')}
                    disabled={updateMut.isPending}
                    className="w-full"
                  >
                    Cancelar Solicitação
                  </Button>
                </div>
              )}

              {meeting.status === 'accepted' && (
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900">Gerenciar Reunião</h3>
                  <Button 
                    variant="destructive" 
                    onClick={() => handleAction('cancelled')}
                    disabled={updateMut.isPending}
                    className="w-full"
                  >
                    Cancelar Reunião
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 