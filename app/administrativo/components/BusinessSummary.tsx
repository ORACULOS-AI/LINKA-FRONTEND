import { Building2, CheckCircle, Clock, XCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { BusinessesByAdminResponse } from '@/lib/types/businessTypes'

type BusinessSummaryProps = {
  businessesData: BusinessesByAdminResponse
}

export function BusinessSummary({ businessesData }: BusinessSummaryProps) {
  // Contagens com valores padrão para evitar erros
  const pendingCount = businessesData.pendentes.length
  const approvedCount = businessesData.aprovados.length
  const rejectedCount = businessesData.recusados.length
  const totalCount = pendingCount + approvedCount + rejectedCount

  // Calcular percentual de aprovação
  const approvalRate =
    totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Total de Negócios
            </p>
            <h3 className="text-3xl font-bold mt-1">{totalCount}</h3>
          </div>
          <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
            <Building2 className="h-6 w-6 text-gray-600" />
          </div>
        </div>
      </Card>

      <Card className="bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Pendentes
            </p>
            <h3 className="text-3xl font-bold mt-1">{pendingCount}</h3>
          </div>
          <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
            <Clock className="h-6 w-6 text-yellow-600" />
          </div>
        </div>
      </Card>

      <Card className="bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Aprovados
            </p>
            <h3 className="text-3xl font-bold mt-1">{approvedCount}</h3>
          </div>
          <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
        </div>
      </Card>

      <Card className="bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Taxa de Aprovação
            </p>
            <h3 className="text-3xl font-bold mt-1">{approvalRate}%</h3>
          </div>
          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
            <XCircle className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </Card>
    </div>
  )
}
