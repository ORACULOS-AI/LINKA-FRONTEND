import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts'
import {
  BusinessesByAdminResponse,
  NegocioResponse,
} from '@/lib/types/businessTypes'

type BusinessStatsProps = {
  businessesData: BusinessesByAdminResponse
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

export function BusinessStats({ businessesData }: BusinessStatsProps) {
  // Contagem de negócios por status
  const pendingCount = businessesData.pendentes.length
  const approvedCount = businessesData.aprovados.length
  const rejectedCount = businessesData.recusados.length

  // Dados para o gráfico de pizza
  const pieData = [
    { name: 'Pendentes', value: pendingCount, color: '#FFBB28' },
    { name: 'Aprovados', value: approvedCount, color: '#00C49F' },
    { name: 'Recusados', value: rejectedCount, color: '#FF8042' },
  ]

  // Dados para o gráfico de barras (tipos de negócio)
  const businessTypes: Record<string, number> = {}

  // Conta os tipos de negócios para todos os status
  const allBusinesses = [
    ...businessesData.pendentes,
    ...businessesData.aprovados,
    ...businessesData.recusados,
  ]

  allBusinesses.forEach((business: NegocioResponse) => {
    const tipo = business.tipo_negocio || 'Outros'
    businessTypes[tipo] = (businessTypes[tipo] || 0) + 1
  })

  const barData = Object.entries(businessTypes).map(([name, value]) => ({
    name,
    value,
  }))

  // Ordena por quantidade (decrescente)
  barData.sort((a, b) => Number(b.value) - Number(a.value))

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Estatísticas de Negócios</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="font-medium mb-4">Distribuição por Status</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  nameKey="name"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-4">Top Tipos de Negócios</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData.slice(0, 5)} layout="vertical">
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8">
                  {barData.slice(0, 5).map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
