import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts'
import {
  IniciativasByStatus,
  IniciativaBase,
} from '@/lib/types/initiativeTypes'

type InitiativesStatsProps = {
  initiativesData: IniciativasByStatus
}

export function InitiativesStats({ initiativesData }: InitiativesStatsProps) {
  const pendingCount = initiativesData.pendentes.length
  const activeCount = initiativesData.ativas.length
  const rejectedCount = initiativesData.recusadas.length

  // Extração de tipos de iniciativas para estatísticas
  const allInitiatives = [
    ...initiativesData.pendentes,
    ...initiativesData.ativas,
    ...initiativesData.recusadas,
  ]

  const initiativeTypes: Record<string, number> = {}

  allInitiatives.forEach((initiative: IniciativaBase) => {
    const tipo = initiative.tipo || 'Outros'
    initiativeTypes[tipo] = (initiativeTypes[tipo] || 0) + 1
  })

  const typeData = Object.entries(initiativeTypes).map(([name, value]) => ({
    name: formatTypeName(name),
    value: value as number,
  }))

  // Status para o gráfico de pizza
  const statusData = [
    { name: 'Pendentes', value: pendingCount, color: '#FFBB28' },
    { name: 'Ativas', value: activeCount, color: '#00C49F' },
    { name: 'Recusadas', value: rejectedCount, color: '#FF8042' },
  ].filter((item) => item.value > 0)

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

  function formatTypeName(type: string): string {
    const typeNames: Record<string, string> = {
      pesquisa: 'Pesquisa',
      inovacao: 'Inovação',
      extensao: 'Extensão',
      empreendedorismo: 'Empreendedorismo',
      outros: 'Outros',
    }

    return typeNames[type.toLowerCase()] || type
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Estatísticas de Iniciativas</CardTitle>
        <CardDescription>
          Distribuição de iniciativas por status e tipo
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium mb-2">Por Status</h3>
          <div className="h-48 md:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={50}
                  paddingAngle={1}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-2">Por Tipo</h3>
          <div className="h-48 md:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={50}
                  paddingAngle={1}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {typeData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
