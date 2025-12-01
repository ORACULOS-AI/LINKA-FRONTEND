'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Building2, Lightbulb, Calendar, Microscope, Users, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react'
import { useBusinessApi } from '@/lib/api/business'
import { useLaboratorioApi } from '@/lib/api/laboratorio'
import { useInitiativesApi } from '@/lib/api/initiatives'
import { StatCard } from './components/StatCard'

export default function AdminPage() {
  const router = useRouter()

  // Fetch estatísticas de todas as entidades
  const { useGetBusinessesByAdmin } = useBusinessApi()
  const { useGetLaboratoriosByAdmin } = useLaboratorioApi()
  const { useGetInitiativesByAdmin } = useInitiativesApi()

  const { data: businessData, isLoading: businessLoading } = useGetBusinessesByAdmin()
  const { data: laboratoriosData, isLoading: labsLoading } = useGetLaboratoriosByAdmin()
  const { data: iniciativasData, isLoading: initiativesLoading } = useGetInitiativesByAdmin()

  const isLoading = businessLoading || labsLoading || initiativesLoading

  // Calcular métricas de negócios
  const businessPending = (businessData?.pendentes?.length || 0)
  const businessApproved = (businessData?.aprovados?.length || 0)
  const businessRejected = (businessData?.recusados?.length || 0)
  const totalBusinesses = businessPending + businessApproved + businessRejected

  // Calcular métricas de laboratórios
  const labsPending = (laboratoriosData?.pendentes?.length || 0)
  const labsApproved = (laboratoriosData?.aprovados?.length || 0)
  const labsRejected = (laboratoriosData?.recusados?.length || 0)
  const totalLabs = labsPending + labsApproved + labsRejected

  // Calcular métricas de iniciativas
  const initiativesPending = (iniciativasData?.pendentes?.length || 0)
  const initiativesApproved = (iniciativasData?.ativas?.length || 0)
  const initiativesRejected = (iniciativasData?.recusadas?.length || 0)
  const totalInitiatives = initiativesPending + initiativesApproved + initiativesRejected

  // Métricas globais
  const totalPending = businessPending + labsPending + initiativesPending
  const totalApproved = businessApproved + labsApproved + initiativesApproved
  const totalRejected = businessRejected + labsRejected + initiativesRejected
  const grandTotal = totalPending + totalApproved + totalRejected

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-24 w-full bg-gray-200 animate-pulse rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="h-32 bg-gray-200 animate-pulse rounded-lg"></div>
          <div className="h-32 bg-gray-200 animate-pulse rounded-lg"></div>
          <div className="h-32 bg-gray-200 animate-pulse rounded-lg"></div>
          <div className="h-32 bg-gray-200 animate-pulse rounded-lg"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Painel Administrativo
        </h1>
        <p className="text-muted-foreground">
          Gerencie todos os recursos da plataforma LINKA
        </p>
      </div>

      {/* Métricas Globais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Pendentes"
          value={totalPending}
          description="Aguardando aprovação"
          icon={AlertCircle}
          color="yellow"
        />

        <StatCard
          title="Aprovados"
          value={totalApproved}
          description="Recursos ativos"
          icon={CheckCircle}
          color="green"
        />

        <StatCard
          title="Total de Recursos"
          value={grandTotal}
          description="Cadastrados na plataforma"
          icon={Users}
          color="blue"
        />

        <StatCard
          title="Taxa de Aprovação"
          value={grandTotal > 0 ? `${Math.round((totalApproved / grandTotal) * 100)}%` : '0%'}
          description="Recursos aprovados"
          icon={TrendingUp}
          color="purple"
        />
      </div>

      {/* Cards de Gestão */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => router.push('/administrativo/negocios')}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                <Building2 className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Negócios</CardTitle>
                <CardDescription>
                  {businessPending} pendentes
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Gerencie startups, empresas juniores e spin-offs
            </p>
            <Button variant="outline" className="w-full group-hover:bg-purple-50 group-hover:text-purple-600 group-hover:border-purple-200">
              Acessar
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => router.push('/administrativo/iniciativas')}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <Lightbulb className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Iniciativas</CardTitle>
                <CardDescription>{initiativesPending} pendentes</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Gerencie projetos de pesquisa e inovação
            </p>
            <Button variant="outline" className="w-full group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-200">
              Acessar
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => router.push('/administrativo/eventos')}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Eventos</CardTitle>
                <CardDescription>Em breve</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Gerencie eventos acadêmicos e corporativos
            </p>
            <Button variant="outline" className="w-full group-hover:bg-green-50 group-hover:text-green-600 group-hover:border-green-200">
              Acessar
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => router.push('/administrativo/laboratorios')}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                <Microscope className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Laboratórios</CardTitle>
                <CardDescription>{labsPending} pendentes</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Gerencie laboratórios de pesquisa da UFC
            </p>
            <Button variant="outline" className="w-full group-hover:bg-orange-50 group-hover:text-orange-600 group-hover:border-orange-200">
              Acessar
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Info Card */}
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            Informações do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
            <div>
              <p className="font-semibold text-purple-600">Negócios</p>
              <p className="text-2xl font-bold text-purple-700">{totalBusinesses}</p>
              <p className="text-xs text-muted-foreground mt-1">{businessPending} pendentes</p>
            </div>
            <div>
              <p className="font-semibold text-orange-600">Laboratórios</p>
              <p className="text-2xl font-bold text-orange-700">{totalLabs}</p>
              <p className="text-xs text-muted-foreground mt-1">{labsPending} pendentes</p>
            </div>
            <div>
              <p className="font-semibold text-blue-600">Iniciativas</p>
              <p className="text-2xl font-bold text-blue-700">{totalInitiatives}</p>
              <p className="text-xs text-muted-foreground mt-1">{initiativesPending} pendentes</p>
            </div>
            <div>
              <p className="font-semibold text-green-600">Aprovados</p>
              <p className="text-2xl font-bold text-green-700">{totalApproved}</p>
              <p className="text-xs text-muted-foreground mt-1">Total</p>
            </div>
            <div>
              <p className="font-semibold text-yellow-600">Pendentes</p>
              <p className="text-2xl font-bold text-yellow-700">{totalPending}</p>
              <p className="text-xs text-muted-foreground mt-1">Aguardando</p>
            </div>
            <div>
              <p className="font-semibold text-red-600">Recusados</p>
              <p className="text-2xl font-bold text-red-700">{totalRejected}</p>
              <p className="text-xs text-muted-foreground mt-1">Total</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
