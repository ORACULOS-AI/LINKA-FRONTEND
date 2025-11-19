'use client'

import { useBusinessApi } from '@/lib/api/business'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { DashboardStats } from './components/DashboardStats'
import { DashboardCharts } from './components/DashboardCharts'
import { QuickLinks } from './components/QuickLinks'
import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardPage() {
  const { useGetDashboardData } = useBusinessApi()
  const { data: dashboardData, isLoading, error } = useGetDashboardData()

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-10 w-[400px]" />
          <Skeleton className="h-4 w-[600px]" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700">Erro ao carregar dados</CardTitle>
            <CardDescription className="text-red-600">
              Não foi possível carregar os dados do dashboard. Por favor, tente novamente mais tarde.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Nenhum dado disponível</CardTitle>
            <CardDescription>
              Não há dados suficientes para exibir o dashboard no momento.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
          Ecossistema de Inovação
        </h1>
        <p className="text-gray-600 text-lg">
          Panorama geral das iniciativas, startups e empresas juniores da UFC
        </p>
      </div>

      {/* Quick Links */}
      <QuickLinks />

      {/* Statistics Cards */}
      <DashboardStats data={dashboardData} />

      {/* Charts and Visualizations */}
      <DashboardCharts data={dashboardData} />
    </div>
  )
}
