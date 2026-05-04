import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
import {
  IniciativasByStatus,
  IniciativaBase,
} from '@/lib/types/initiativeTypes'

type InitiativesChartProps = {
  initiativesData: IniciativasByStatus
}

export function InitiativesChart({ initiativesData }: InitiativesChartProps) {
  // Agrupar por meses (usando 6 meses como exemplo)
  const currentDate = new Date()
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date()
    date.setMonth(currentDate.getMonth() - i)
    return {
      month: date.toLocaleString('pt-BR', { month: 'short' }),
      timestamp: date.getTime(),
      pendentes: 0,
      ativas: 0,
      recusadas: 0,
    }
  }).reverse()

  // Preencher dados dos últimos 6 meses
  const allInitiatives = [
    ...initiativesData.pendentes,
    ...initiativesData.ativas,
    ...initiativesData.recusadas,
  ]

  // Preencher dados por mês
  allInitiatives.forEach((initiative: IniciativaBase) => {
    try {
      const initiativeDate = new Date(initiative.data_cadastro)
      const initiativeTimestamp = initiativeDate.getTime()

      // Encontrar o mês correspondente
      const monthData = last6Months.find((m) => {
        const monthStart = new Date(m.timestamp)
        monthStart.setDate(1)
        monthStart.setHours(0, 0, 0, 0)

        const monthEnd = new Date(m.timestamp)
        monthEnd.setMonth(monthEnd.getMonth() + 1)
        monthEnd.setDate(0)
        monthEnd.setHours(23, 59, 59, 999)

        return (
          initiativeTimestamp >= monthStart.getTime() &&
          initiativeTimestamp <= monthEnd.getTime()
        )
      })

      if (monthData) {
        if (initiative.status === 'PENDENTE') {
          monthData.pendentes++
        } else if (initiative.status === 'ATIVA') {
          monthData.ativas++
        } else if (initiative.status === 'RECUSADA') {
          monthData.recusadas++
        }
      }
    } catch {
      // Skip invalid initiative dates
    }
  })

  const chartData = last6Months.map((month) => ({
    month: month.month,
    Pendentes: month.pendentes,
    Ativas: month.ativas,
    Recusadas: month.recusadas,
  }))

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Tendência de Iniciativas</CardTitle>
        <CardDescription>
          Visualização de iniciativas nos últimos 6 meses
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Pendentes" stackId="a" fill="#FCD34D" />
              <Bar dataKey="Ativas" stackId="a" fill="#4ADE80" />
              <Bar dataKey="Recusadas" stackId="a" fill="#F87171" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
