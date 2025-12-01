import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts'
import { ptBR } from 'date-fns/locale'
import { format, subMonths, isWithinInterval, parseISO } from 'date-fns'

type BusinessChartProps = {
  businessesData: any
}

export function BusinessChart({ businessesData }: BusinessChartProps) {
  // Preparar dados para o gráfico
  const allBusinesses = [
    ...(businessesData?.pendentes || []),
    ...(businessesData?.aprovados || []),
    ...(businessesData?.recusados || []),
  ]

  // Criar um array com os últimos 6 meses
  const monthsData = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(new Date(), i)
    return {
      month: format(date, 'MMM/yyyy', { locale: ptBR }),
      startDate: new Date(date.getFullYear(), date.getMonth(), 1),
      endDate: new Date(date.getFullYear(), date.getMonth() + 1, 0),
      approval: 0,
      rejection: 0,
      total: 0,
    }
  }).reverse()

  // Preencher os dados mês a mês
  allBusinesses.forEach((business) => {
    try {
      // Validar se data_cadastro existe e não é vazia
      if (!business.data_cadastro) {
        console.warn(`Negócio ${business.uid || business.id} sem data_cadastro - ignorando`)
        return
      }

      const businessDate = parseISO(business.data_cadastro)

      // Validar se parseISO retornou uma data válida
      if (isNaN(businessDate.getTime())) {
        console.warn(
          `Data inválida para negócio ${business.uid || business.id}: ${business.data_cadastro} - ignorando`
        )
        return
      }

      const monthData = monthsData.find((m) =>
        isWithinInterval(businessDate, {
          start: m.startDate,
          end: m.endDate,
        }),
      )

      if (monthData) {
        monthData.total += 1

        if (business.status === 'aprovado') {
          monthData.approval += 1
        } else if (business.status === 'recusado') {
          monthData.rejection += 1
        }
      }
    } catch (error) {
      console.error(
        `Erro ao processar data do negócio ${business.uid || business.id}:`,
        error,
        `data_cadastro: ${business.data_cadastro}`
      )
      // Continuar processamento dos demais negócios
    }
  })

  // Preparar dados para o gráfico
  const chartData = monthsData.map((month) => ({
    name: month.month,
    Cadastrados: month.total,
    Aprovados: month.approval,
    Recusados: month.rejection,
  }))

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Evolução de Negócios</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="Cadastrados"
                stroke="#8884d8"
                activeDot={{ r: 8 }}
              />
              <Line type="monotone" dataKey="Aprovados" stroke="#82ca9d" />
              <Line type="monotone" dataKey="Recusados" stroke="#ff7300" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
