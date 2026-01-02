'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useEventApi } from '@/lib/api/event'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, Edit, Calendar, MapPin, Users, CheckCircle, Clock, XCircle, Sparkles, FileText } from 'lucide-react'
import PrivateRoute from '@/components/private_route'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { motion } from 'framer-motion'
import { EventStatus, EventStatusLabels } from '@/lib/types/eventTypes'
import { EventCreationModal } from './components/event-creation-modal'

export default function EventManagementPage() {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { useGetUserEvents, useDeleteEvent } = useEventApi()

  const {
    data: events,
    isLoading,
    error,
    refetch,
  } = useGetUserEvents()

  const deleteEventMutation = useDeleteEvent()

  useEffect(() => {
    refetch()
  }, [refetch])

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await deleteEventMutation.mutateAsync({ eventId })
      await refetch()
    } catch (error) {
      console.error('Erro ao excluir evento:', error)
    }
  }

  const { approvedCount, draftCount, canceledCount, totalCount } = useMemo(
    () => ({
      totalCount: events?.length || 0,
      approvedCount: events?.filter((e) => e.status === EventStatus.ATIVO).length || 0,
      draftCount: events?.filter((e) => e.status === EventStatus.RASCUNHO).length || 0,
      canceledCount: events?.filter((e) => e.status === EventStatus.CANCELADO).length || 0,
    }),
    [events],
  )

  // Ordenação automática por mais recentes
  const sortedEvents = useMemo(() => {
    if (!events) return []
    return [...events].sort(
      (a, b) =>
        new Date(b.data_inicio).getTime() - new Date(a.data_inicio).getTime(),
    )
  }, [events])

  const getStatusBadge = (status: EventStatus) => {
    const statusConfig = {
      [EventStatus.ATIVO]: {
        className: 'bg-green-100 text-green-800 border-green-200',
      },
      [EventStatus.RASCUNHO]: {
        className: 'bg-gray-100 text-gray-800 border-gray-300',
      },
      [EventStatus.CANCELADO]: {
        className: 'bg-red-100 text-red-800 border-red-200',
      },
      [EventStatus.CONCLUIDO]: {
        className: 'bg-blue-100 text-blue-800 border-blue-200',
      },
    }

    const config = statusConfig[status] || statusConfig[EventStatus.ATIVO]

    return (
      <span
        className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${config.className}`}
      >
        {EventStatusLabels[status]}
      </span>
    )
  }

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'Data não disponível'
    try {
      return format(new Date(dateString), "d 'de' MMMM 'às' HH:mm", {
        locale: ptBR,
      })
    } catch (e) {
      return 'Data inválida'
    }
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Skeleton className="h-[350px] rounded-2xl" />
            </motion.div>
          ))}
        </div>
      )
    }

    if (!events || events.length === 0) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center space-y-6 py-16"
        >
          <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center">
            <Calendar className="h-10 w-10 text-purple-400" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Nenhum evento cadastrado ainda
            </h2>
            <p className="text-gray-600 max-w-md">
              Cadastre seu primeiro evento para começar a gerenciar suas atividades
            </p>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-purple-600 to-violet-600 hover:shadow-lg hover:shadow-purple-500/25 text-lg px-8 py-6"
          >
            <Plus className="mr-2 h-5 w-5" />
            Criar Primeiro Evento
          </Button>
        </motion.div>
      )
    }

    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sortedEvents.map((event, index) => (
          <motion.div
            key={event.uid}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card
              className="group relative overflow-hidden bg-white border-2 border-gray-100 hover:border-purple-300 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 cursor-pointer h-full flex flex-col"
              onClick={() => router.push(`/eventos/${event.uid}`)}
            >
              {/* Top gradient accent */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 via-violet-500 to-purple-600" />

              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors flex-1 line-clamp-2">
                    {event.titulo}
                  </CardTitle>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-purple-50 hover:text-purple-600"
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/eventos/${event.uid}`)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir Evento</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir "{event.titulo}"?
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={async (e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              await handleDeleteEvent(event.uid)
                            }}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {getStatusBadge(event.status)}
                </div>
              </CardHeader>

              <CardContent className="flex-1 space-y-4">
                {event.descricao && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Descrição</h4>
                    <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                      {event.descricao}
                    </p>
                  </div>
                )}
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Local</h4>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <MapPin className="h-3.5 w-3.5 text-purple-600 flex-shrink-0" />
                    <span className="truncate">{event.local}</span>
                  </div>
                </div>
                {event.total_participantes > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Participantes</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Users className="h-3.5 w-3.5 text-purple-600 flex-shrink-0" />
                      <span>{event.total_participantes} participante(s)</span>
                    </div>
                  </div>
                )}
              </CardContent>

              <CardFooter className="border-t border-gray-100 pt-4 flex-col items-start gap-2">
                <div className="text-xs text-gray-500">
                  Início em {formatDate(event.data_inicio)}
                </div>
                {event.data_fim && event.data_fim !== event.data_inicio && (
                  <div className="text-xs text-gray-500">
                    Término em {formatDate(event.data_fim)}
                  </div>
                )}
              </CardFooter>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-purple-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </Card>
          </motion.div>
        ))}
      </div>
    )
  }

  return (
    <PrivateRoute>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
        {/* HEADER ROXO */}
        <div className="relative bg-gradient-to-br from-purple-600 via-purple-500 to-violet-600 text-white overflow-hidden">
          {/* Decorative blur orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-violet-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white/5 rounded-full blur-2xl" />
          </div>

          <div className="relative z-10 container mx-auto px-4 py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-5xl mx-auto"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 mb-6"
              >
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-semibold">Gestão de Eventos</span>
              </motion.div>

              {/* Título */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl md:text-5xl font-black mb-4"
              >
                Meus Eventos
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl"
              >
                Gerencie seus eventos, acompanhe as inscrições e mantenha suas informações atualizadas
              </motion.p>

              {/* Stats Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
              >
                {[
                  { icon: Calendar, label: 'Total', value: totalCount, color: 'yellow' },
                  { icon: CheckCircle, label: 'Ativos', value: approvedCount, color: 'green' },
                  { icon: FileText, label: 'Rascunhos', value: draftCount, color: 'amber' },
                  { icon: XCircle, label: 'Cancelados', value: canceledCount, color: 'red' },
                ].map((stat, idx) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + idx * 0.1 }}
                    className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20 hover:bg-white/15 transition-all"
                  >
                    <stat.icon className={`h-7 w-7 mb-2 text-${stat.color}-300`} />
                    <div className="text-3xl md:text-4xl font-black mb-1">{stat.value}</div>
                    <div className="text-sm text-white/80 font-medium">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Botão Criar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="mt-8"
              >
                <Button
                  onClick={() => setIsModalOpen(true)}
                  size="lg"
                  className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-6 rounded-xl font-bold shadow-2xl"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Novo Evento
                </Button>
              </motion.div>
            </motion.div>
          </div>

          {/* Wave divider */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
              <path d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z" fill="white" fillOpacity="0.1"/>
              <path d="M0 40L60 46.7C120 53 240 67 360 73.3C480 80 600 80 720 73.3C840 67 960 53 1080 46.7C1200 40 1320 40 1380 40H1440V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V40Z" fill="rgb(249, 250, 251)"/>
            </svg>
          </div>
        </div>

        {/* CONTEÚDO */}
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {error ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-2xl border-2 border-red-200 bg-red-50 p-6 text-red-600 text-center"
              >
                <p className="font-semibold mb-2">Erro ao carregar eventos</p>
                <p className="text-sm">{error.message}</p>
              </motion.div>
            ) : (
              renderContent()
            )}
          </motion.div>
        </div>
      </div>

      {/* Modal de Criação */}
      <EventCreationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          refetch()
          setIsModalOpen(false)
        }}
      />
    </PrivateRoute>
  )
}
