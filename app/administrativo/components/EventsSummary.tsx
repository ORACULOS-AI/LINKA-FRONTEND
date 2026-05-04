import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

type Event = {
  uid: string
  titulo: string
  descricao: string
  data_evento: string
  localizacao: string
  status: string
}

type EventsData = {
  ativos: Event[]
  concluidos: Event[]
  cancelados: Event[]
  all: Event[]
}

type EventsSummaryProps = {
  eventsData: EventsData
}

export function EventsSummary({ eventsData }: EventsSummaryProps) {
  // Contar eventos por status
  const activeEvents = eventsData?.ativos?.length || 0
  const completedEvents = eventsData?.concluidos?.length || 0
  const canceledEvents = eventsData?.cancelados?.length || 0
  const totalEvents = eventsData?.all?.length || 0

  // Calcular taxa de conclusão (eventos concluídos / total de eventos não cancelados)
  const totalNonCanceled = totalEvents - canceledEvents
  const completionRate =
    totalNonCanceled > 0
      ? Math.round((completedEvents / totalNonCanceled) * 100)
      : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total de Eventos
          </CardTitle>
          <CardDescription className="text-2xl font-bold">
            {totalEvents}
          </CardDescription>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Eventos Ativos
          </CardTitle>
          <CardDescription className="text-2xl font-bold text-green-500">
            {activeEvents}
          </CardDescription>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Eventos Concluídos
          </CardTitle>
          <CardDescription className="text-2xl font-bold text-blue-500">
            {completedEvents}
          </CardDescription>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Taxa de Conclusão
          </CardTitle>
          <CardDescription className="text-2xl font-bold text-amber-500">
            {completionRate}%
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
