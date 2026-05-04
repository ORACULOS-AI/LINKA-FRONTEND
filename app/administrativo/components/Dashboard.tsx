'use client'

import { useBusinessApi } from '@/lib/api/business'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BusinessSummary } from './BusinessSummary'
import { BusinessesTable } from './BusinessesTable'
import { BusinessStats } from './BusinessStats'
import { BusinessChart } from './BusinessChart'

export function Dashboard() {
  const { useGetBusinessesByAdmin } = useBusinessApi()
  const { data: businessesData, isLoading } = useGetBusinessesByAdmin()

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 space-y-4">
        <div className="h-24 w-full bg-gray-200 animate-pulse rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-32 bg-gray-200 animate-pulse rounded-lg"></div>
          <div className="h-32 bg-gray-200 animate-pulse rounded-lg"></div>
          <div className="h-32 bg-gray-200 animate-pulse rounded-lg"></div>
        </div>
        <div className="h-64 w-full bg-gray-200 animate-pulse rounded-lg"></div>
      </div>
    )
  }

  if (!businessesData) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Erro ao carregar dados</CardTitle>
            <CardDescription>
              Não foi possível carregar os dados dos negócios. Por favor, tente
              novamente.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Painel Administrativo</CardTitle>
          <CardDescription>
            Gerencie negócios, iniciativas e tenha uma visão completa da
            plataforma
          </CardDescription>
        </CardHeader>
      </Card>

      <BusinessSummary businessesData={businessesData} />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="pendentes">Pendentes</TabsTrigger>
          <TabsTrigger value="aprovados">Aprovados</TabsTrigger>
          <TabsTrigger value="recusados">Recusados</TabsTrigger>
          <TabsTrigger value="all">Todos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <BusinessStats businessesData={businessesData} />
            <BusinessChart businessesData={businessesData} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Negócios Recentes</CardTitle>
              <CardDescription>
                Últimos negócios cadastrados na plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BusinessesTable
                businessesData={businessesData}
                filter="recent"
                limit={5}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pendentes">
          <Card>
            <CardHeader>
              <CardTitle>Negócios Pendentes</CardTitle>
              <CardDescription>Negócios aguardando aprovação</CardDescription>
            </CardHeader>
            <CardContent>
              <BusinessesTable
                businessesData={businessesData}
                filter="pendentes"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="aprovados">
          <Card>
            <CardHeader>
              <CardTitle>Negócios Aprovados</CardTitle>
              <CardDescription>Negócios ativos na plataforma</CardDescription>
            </CardHeader>
            <CardContent>
              <BusinessesTable
                businessesData={businessesData}
                filter="aprovados"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recusados">
          <Card>
            <CardHeader>
              <CardTitle>Negócios Recusados</CardTitle>
              <CardDescription>Negócios que foram rejeitados</CardDescription>
            </CardHeader>
            <CardContent>
              <BusinessesTable
                businessesData={businessesData}
                filter="recusados"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Todos os Negócios</CardTitle>
              <CardDescription>
                Visão completa de todos os negócios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BusinessesTable businessesData={businessesData} filter="all" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
