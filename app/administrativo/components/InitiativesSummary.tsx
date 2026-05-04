import { Building2, CheckCircle, Clock } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { IniciativasByStatus } from '@/lib/types/initiativeTypes'

type InitiativesSummaryProps = {
  initiativesData: IniciativasByStatus
}

export function InitiativesSummary({
  initiativesData,
}: InitiativesSummaryProps) {
  // Contagens com valores padrão para evitar erros
  const pendingCount = initiativesData.pendentes.length
  const activeCount = initiativesData.ativas.length
  const rejectedCount = initiativesData.recusadas.length
  const totalCount = pendingCount + activeCount + rejectedCount

  // Calcular percentual de aprovação
  const approvalRate =
    totalCount > 0 ? Math.round((activeCount / totalCount) * 100) : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Total de Iniciativas
            </p>
            <p className="text-2xl font-bold">{totalCount}</p>
          </div>
          <Building2 className="h-8 w-8 text-blue-500" />
        </div>
      </Card>

      <Card className="bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Pendentes
            </p>
            <p className="text-2xl font-bold text-yellow-500">{pendingCount}</p>
          </div>
          <Clock className="h-8 w-8 text-yellow-500" />
        </div>
      </Card>

      <Card className="bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Ativas</p>
            <p className="text-2xl font-bold text-green-500">{activeCount}</p>
          </div>
          <CheckCircle className="h-8 w-8 text-green-500" />
        </div>
      </Card>

      <Card className="bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Taxa de Aprovação
            </p>
            <p className="text-2xl font-bold text-blue-500">{approvalRate}%</p>
          </div>
          <div className="h-8 w-8 flex items-center justify-center rounded-full bg-blue-100 text-blue-500">
            <span className="text-xs font-bold">{approvalRate}%</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
