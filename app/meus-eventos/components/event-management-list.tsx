'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  EventResponse,
  EventStatus,
  ParticipanteStatus,
} from '@/lib/types/eventTypes'
import { formatDate } from '@/lib/utils'
import { useAuth } from '@/lib/context/AuthContext'
import { useEventApi } from '@/lib/api/event'
import { useState } from 'react'
import { toast } from 'react-toastify'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar'
import {
  CalendarIcon,
  MapPinIcon,
  UsersIcon,
  CheckIcon,
  XIcon,
  AwardIcon,
} from 'lucide-react'
import { motion } from 'framer-motion'

interface EventManagementListProps {
  events: EventResponse[]
  onRefresh: () => void
}

export function EventManagementList({
  events,
  onRefresh,
}: EventManagementListProps) {
  const { user } = useAuth()
  const { deleteEvent, validarPresenca, getCertificado } = useEventApi()
  const [selectedTab, setSelectedTab] = useState<EventStatus>(EventStatus.ATIVO)
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null)

  const handleDelete = async (eventId: string) => {
    try {
      await deleteEvent(eventId)
      toast.success('Evento excluído com sucesso')
      onRefresh()
    } catch (error) {
      toast.error('Erro ao excluir evento')
    }
  }

  const handleValidatePresence = async (eventId: string, userId: string) => {
    try {
      await validarPresenca(eventId, userId)
      toast.success('Presença validada com sucesso')
      onRefresh()
    } catch (error) {
      toast.error('Erro ao validar presença')
    }
  }

  const handleGetCertificate = async (eventId: string) => {
    try {
      const certificateUrl = await getCertificado(eventId)
      if (certificateUrl) {
        window.open(certificateUrl, '_blank')
      } else {
        toast.error('Certificado não disponível')
      }
    } catch (error) {
      toast.error('Erro ao obter certificado')
    }
  }

  const filteredEvents = events.filter((event) => event.status === selectedTab)
  const eventCountByStatus = {
    [EventStatus.ATIVO]: events.filter((e) => e.status === EventStatus.ATIVO)
      .length,
    [EventStatus.CONCLUIDO]: events.filter(
      (e) => e.status === EventStatus.CONCLUIDO,
    ).length,
    [EventStatus.CANCELADO]: events.filter(
      (e) => e.status === EventStatus.CANCELADO,
    ).length,
  }

  const isEventAdmin = (event: EventResponse) => event.uid_admin === user?.uid
  const isParticipant = (event: EventResponse) =>
    event.participantes.some((p) => p.uid_usuario === user?.uid)
  const getParticipantStatus = (event: EventResponse) => {
    const participante = event.participantes.find(
      (p) => p.uid_usuario === user?.uid,
    )
    return participante?.status
  }
  const canGetCertificate = (event: EventResponse) => {
    const participante = event.participantes.find(
      (p) => p.uid_usuario === user?.uid,
    )
    return (
      participante?.status === ParticipanteStatus.PRESENTE &&
      event.status === EventStatus.CONCLUIDO
    )
  }

  return (
    <div className="space-y-4">
      <Tabs
        defaultValue={EventStatus.ATIVO}
        onValueChange={(value) => setSelectedTab(value as EventStatus)}
      >
        <TabsList>
          <TabsTrigger value={EventStatus.ATIVO}>
            Ativos ({eventCountByStatus[EventStatus.ATIVO]})
          </TabsTrigger>
          <TabsTrigger value={EventStatus.CONCLUIDO}>
            Concluídos ({eventCountByStatus[EventStatus.CONCLUIDO]})
          </TabsTrigger>
          <TabsTrigger value={EventStatus.CANCELADO}>
            Cancelados ({eventCountByStatus[EventStatus.CANCELADO]})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab}>
          <ScrollArea className="h-[600px]">
            <div className="space-y-4 p-4">
              {filteredEvents.map((event, index) => (
                <motion.div
                  key={event.uid}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-white hover:shadow-lg transition-all duration-200 cursor-pointer group"
                    onClick={() => {
                      window.location.href = `/eventos/${event.uid}`;
                    }}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {event.logo_url && (
                            <Avatar>
                              <AvatarImage
                                src={event.logo_url}
                                alt={event.titulo}
                              />
                              <AvatarFallback>{event.titulo[0]}</AvatarFallback>
                            </Avatar>
                          )}
                          <div>
                            <CardTitle className="group-hover:text-blue-600 transition-colors">
                              {event.titulo}
                            </CardTitle>
                            <CardDescription>{event.descricao}</CardDescription>
                          </div>
                        </div>
                        <Badge
                          variant={
                            event.status === EventStatus.ATIVO
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {event.status}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <CalendarIcon className="h-4 w-4" />
                          <span>
                            {formatDate(event.data_inicio)}
                            {event.data_fim &&
                              event.data_fim !== event.data_inicio && (
                                <> até {formatDate(event.data_fim)}</>
                              )}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <MapPinIcon className="h-4 w-4" />
                          <span>{event.local}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <UsersIcon className="h-4 w-4" />
                          <span>
                            {event.participantes.length} participantes
                          </span>
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="flex justify-between">
                      <div className="flex space-x-2">
                        {isEventAdmin(event) ? (
                          <>
                            {event.status === EventStatus.ATIVO && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive">Excluir</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Excluir evento
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Tem certeza que deseja excluir este evento?
                                      Esta ação não pode ser desfeita.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancelar
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(event.uid)}
                                    >
                                      Excluir
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </>
                        ) : (
                          <>
                            {event.status === EventStatus.ATIVO &&
                              !isParticipant(event) && (
                                <Button
                                  onClick={() =>
                                    handleValidatePresence(event.uid, user?.uid)
                                  }
                                >
                                  Validar Presença
                                </Button>
                              )}
                          </>
                        )}
                      </div>

                      <div className="flex space-x-2">
                        {isEventAdmin(event) &&
                          event.status === EventStatus.ATIVO && (
                            <div className="flex items-center space-x-2">
                              {event.participantes.map((participante) => (
                                <div
                                  key={participante.uid_usuario}
                                  className="flex items-center space-x-1"
                                >
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      handleValidatePresence(
                                        event.uid,
                                        participante.uid_usuario,
                                      )
                                    }
                                  >
                                    <CheckIcon className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      handleValidatePresence(
                                        event.uid,
                                        participante.uid_usuario,
                                      )
                                    }
                                  >
                                    <XIcon className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}

                        {isParticipant(event) && canGetCertificate(event) && (
                          <Button
                            variant="outline"
                            onClick={() => handleGetCertificate(event.uid)}
                          >
                            <AwardIcon className="h-4 w-4 mr-2" />
                            Certificado
                          </Button>
                        )}
                      </div>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}
