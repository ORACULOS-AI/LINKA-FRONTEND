import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { format, subMonths, startOfMonth, isAfter } from 'date-fns'
import { ptBR } from 'date-fns/locale'

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

type EventsChartProps = {
  eventsData: EventsData
}

export function EventsChart({ eventsData }: EventsChartProps) {
  // Criar um array com os últimos 6 meses
  const last6Months = Array.from({ length: 6 })
    .map((_, i) => {
      const date = subMonths(new Date(), i)
      return {
        date,
        month: format(date, 'MMM', { locale: ptBR }),
        year: format(date, 'yy'),
        ativos: 0,
        concluidos: 0,
        cancelados: 0,
      }
    })
    .reverse()

  // Processar todos os eventos
  const allEvents = eventsData?.all || []

  // Agrupar eventos por mês dos últimos 6 meses
  if (allEvents.length > 0) {
    allEvents.forEach((event) => {
      try {
        const eventDate = new Date(event.data_evento)

        // Verificar se a data do evento está nos últimos 6 meses
        const sixMonthsAgo = startOfMonth(subMonths(new Date(), 6))

        if (isAfter(eventDate, sixMonthsAgo)) {
          // Encontrar o mês correspondente
          const monthKey = format(eventDate, 'MMM', { locale: ptBR })
          const yearKey = format(eventDate, 'yy')

          const monthData = last6Months.find(
            (m) => m.month === monthKey && m.year === yearKey,
          )

          if (monthData) {
            switch (event.status) {
              case 'ativo':
                monthData.ativos += 1
                break
              case 'concluido':
                monthData.concluidos += 1
                break
              case 'cancelado':
                monthData.cancelados += 1
                break
              default:
                break
            }
          }
        }
      } catch {
        // Skip invalid event dates
      }
    })
  }

  // Formatar dados para o gráfico
  const chartData = last6Months.map((month) => ({
    name: `${month.month}/${month.year}`,
    Ativos: month.ativos,
    Concluídos: month.concluidos,
    Cancelados: month.cancelados,
  }))

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Tendência de Eventos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(value) => [
                  `${value} evento${value !== 1 ? 's' : ''}`,
                  '',
                ]}
              />
              <Legend />
              <Bar dataKey="Ativos" fill="#22C55E" />
              <Bar dataKey="Concluídos" fill="#3B82F6" />
              <Bar dataKey="Cancelados" fill="#EF4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
