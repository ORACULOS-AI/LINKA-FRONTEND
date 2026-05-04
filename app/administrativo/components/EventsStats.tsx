import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts'

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

type EventsStatsProps = {
  eventsData: EventsData
}

export function EventsStats({ eventsData }: EventsStatsProps) {
  // Contar eventos por status
  const activeEvents = eventsData?.ativos?.length || 0
  const completedEvents = eventsData?.concluidos?.length || 0
  const canceledEvents = eventsData?.cancelados?.length || 0

  const pieData = [
    { name: 'Ativos', value: activeEvents, color: '#22C55E' },
    { name: 'Concluídos', value: completedEvents, color: '#3B82F6' },
    { name: 'Cancelados', value: canceledEvents, color: '#EF4444' },
  ].filter((item) => item.value > 0)

  const COLORS = ['#22C55E', '#3B82F6', '#EF4444']

  // Se não houver dados, exibir mensagem
  if (pieData.length === 0) {
    return (
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Distribuição por Status</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48">
          <p className="text-muted-foreground">Nenhum evento encontrado</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Distribuição por Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color || COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [
                  `${value} evento${value !== 1 ? 's' : ''}`,
                  'Quantidade',
                ]}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
