'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, CheckCircle, Clock, TrendingUp, XCircle, FileText, Eye, ThumbsUp, ThumbsDown, AlertCircle } from 'lucide-react'
import { StatCard } from '../components/StatCard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useEventApi } from '@/lib/api/event'
import { EventStatus, EventStatusLabels, EventStatusColors, EventCategoriaLabels, formatEventDateRange } from '@/lib/types/eventTypes'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function EventosAdminPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('pendentes')
  const [rejectReason, setRejectReason] = useState('')
  const [selectedEventId, setSelectedEventId] = useState('')

  const { useListEvents, useApproveEvent, useRejectEvent } = useEventApi()
  const { data: allEvents, isLoading, refetch } = useListEvents()
  const approveMutation = useApproveEvent()
  const rejectMutation = useRejectEvent()

  // Filtrar eventos por status
  const eventsByStatus = useMemo(() => {
    if (!allEvents) return {
      pendentes: [],
      ativos: [],
      rascunhos: [],
      cancelados: [],
      concluidos: [],
    }

    return {
      pendentes: allEvents.filter(e => e.status === EventStatus.PENDENTE_APROVACAO),
      ativos: allEvents.filter(e => e.status === EventStatus.ATIVO),
      rascunhos: allEvents.filter(e => e.status === EventStatus.RASCUNHO),
      cancelados: allEvents.filter(e => e.status === EventStatus.CANCELADO),
      concluidos: allEvents.filter(e => e.status === EventStatus.CONCLUIDO),
    }
  }, [allEvents])

  const stats = useMemo(() => {
    const total = allEvents?.length || 0
    const pendentes = eventsByStatus.pendentes.length
    const ativos = eventsByStatus.ativos.length
    const aprovacaoRate = total > 0 ? Math.round((ativos / total) * 100) : 0

    return { total, pendentes, ativos, aprovacaoRate }
  }, [allEvents, eventsByStatus])

  const handleApprove = async (eventId: string) => {
    await approveMutation.mutateAsync(eventId)
    refetch()
  }

  const handleReject = async () => {
    if (!selectedEventId) return
    await rejectMutation.mutateAsync({
      eventId: selectedEventId,
      reason: rejectReason || undefined
    })
    setRejectReason('')
    setSelectedEventId('')
    refetch()
  }

  const renderEventCard = (event: any) => (
    <motion.div
      key={event.uid}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4"
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <CardTitle className="text-lg">{event.titulo}</CardTitle>
                <Badge className={EventStatusColors[event.status as EventStatus]}>
                  {EventStatusLabels[event.status as EventStatus]}
                </Badge>
                <Badge variant="outline">
                  {EventCategoriaLabels[event.categoria]}
                </Badge>
              </div>
              <CardDescription className="line-clamp-2">
                {event.descricao}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
            <div>
              <p className="text-muted-foreground">Data</p>
              <p className="font-medium">{formatEventDateRange(event.data_inicio, event.data_fim)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Local</p>
              <p className="font-medium">{event.is_online ? 'Online' : event.local}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Participantes</p>
              <p className="font-medium">{event.total_participantes}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Vagas</p>
              <p className="font-medium">{event.capacidade_maxima || 'Ilimitadas'}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/eventos/${event.uid}`)}
            >
              <Eye className="h-4 w-4 mr-2" />
              Ver Detalhes
            </Button>

            {event.status === EventStatus.PENDENTE_APROVACAO && (
              <>
                <Button
                  size="sm"
                  variant="default"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleApprove(event.uid)}
                  disabled={approveMutation.isPending}
                >
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  Aprovar
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setSelectedEventId(event.uid)}
                    >
                      <ThumbsDown className="h-4 w-4 mr-2" />
                      Rejeitar
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Rejeitar Evento</AlertDialogTitle>
                      <AlertDialogDescription>
                        Informe o motivo da rejeição para o organizador poder corrigir:
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                      <Label htmlFor="reason">Motivo (opcional)</Label>
                      <Textarea
                        id="reason"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Ex: O evento não atende aos requisitos de..."
                        className="mt-2"
                      />
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => {
                        setRejectReason('')
                        setSelectedEventId('')
                      }}>
                        Cancelar
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleReject}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Rejeitar Evento
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="h-24 w-full bg-gray-200 animate-pulse rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
          Administração de Eventos
        </h1>
        <p className="text-muted-foreground">
          Gerencie e aprove eventos acadêmicos e corporativos da plataforma
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total de Eventos"
          value={stats.total}
          description="Cadastrados na plataforma"
          icon={Calendar}
          color="green"
        />

        <StatCard
          title="Pendentes Aprovação"
          value={stats.pendentes}
          description="Aguardando análise"
          icon={Clock}
          color="yellow"
        />

        <StatCard
          title="Ativos"
          value={stats.ativos}
          description="Publicados e visíveis"
          icon={CheckCircle}
          color="green"
        />

        <StatCard
          title="Taxa de Aprovação"
          value={`${stats.aprovacaoRate}%`}
          description="Eventos aprovados"
          icon={TrendingUp}
          color="purple"
        />
      </div>

      <Tabs value={activeTab} className="space-y-4" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-6">
          <TabsTrigger value="pendentes" className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Pendentes ({eventsByStatus.pendentes.length})
          </TabsTrigger>
          <TabsTrigger value="ativos">
            Ativos ({eventsByStatus.ativos.length})
          </TabsTrigger>
          <TabsTrigger value="rascunhos">
            Rascunhos ({eventsByStatus.rascunhos.length})
          </TabsTrigger>
          <TabsTrigger value="concluidos">
            Concluídos ({eventsByStatus.concluidos.length})
          </TabsTrigger>
          <TabsTrigger value="cancelados">
            Cancelados ({eventsByStatus.cancelados.length})
          </TabsTrigger>
          <TabsTrigger value="todos">
            Todos ({stats.total})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pendentes" className="space-y-4">
          {eventsByStatus.pendentes.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Clock className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                <p className="text-lg font-semibold text-gray-700">Nenhum evento pendente</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Eventos enviados para aprovação aparecerão aqui
                </p>
              </CardContent>
            </Card>
          ) : (
            eventsByStatus.pendentes.map(renderEventCard)
          )}
        </TabsContent>

        <TabsContent value="ativos">
          {eventsByStatus.ativos.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <p className="text-lg font-semibold text-gray-700">Nenhum evento ativo</p>
              </CardContent>
            </Card>
          ) : (
            eventsByStatus.ativos.map(renderEventCard)
          )}
        </TabsContent>

        <TabsContent value="rascunhos">
          {eventsByStatus.rascunhos.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-semibold text-gray-700">Nenhum rascunho</p>
              </CardContent>
            </Card>
          ) : (
            eventsByStatus.rascunhos.map(renderEventCard)
          )}
        </TabsContent>

        <TabsContent value="concluidos">
          {eventsByStatus.concluidos.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                <p className="text-lg font-semibold text-gray-700">Nenhum evento concluído</p>
              </CardContent>
            </Card>
          ) : (
            eventsByStatus.concluidos.map(renderEventCard)
          )}
        </TabsContent>

        <TabsContent value="cancelados">
          {eventsByStatus.cancelados.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <p className="text-lg font-semibold text-gray-700">Nenhum evento cancelado</p>
              </CardContent>
            </Card>
          ) : (
            eventsByStatus.cancelados.map(renderEventCard)
          )}
        </TabsContent>

        <TabsContent value="todos">
          {allEvents && allEvents.length > 0 ? (
            allEvents.map(renderEventCard)
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-semibold text-gray-700">Nenhum evento cadastrado</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
