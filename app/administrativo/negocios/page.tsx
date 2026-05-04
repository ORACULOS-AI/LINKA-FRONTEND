'use client'

import { useState } from 'react'
import { useBusinessApi } from '@/lib/api/business'
import { BusinessSummary } from '../components/BusinessSummary'
import { BusinessStats } from '../components/BusinessStats'
import { BusinessChart } from '../components/BusinessChart'
import { BusinessesTable } from '../components/BusinessesTable'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function NegociosAdminPage() {
  const { useGetBusinessesByAdmin } = useBusinessApi()
  const { data: businessesData, isLoading } = useGetBusinessesByAdmin()
  const [activeTab, setActiveTab] = useState('overview')

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Administração de Negócios</h1>
        <p className="text-muted-foreground">
          Gerencie os negócios da plataforma
        </p>
      </div>

      <BusinessSummary businessesData={businessesData} />
      
      <Tabs defaultValue="overview" className="space-y-4" onValueChange={setActiveTab}>
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
              <CardDescription>
                Negócios aguardando aprovação
              </CardDescription>
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
              <CardDescription>
                Negócios aprovados na plataforma
              </CardDescription>
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
              <CardDescription>
                Negócios recusados na plataforma
              </CardDescription>
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
                Lista completa de todos os negócios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BusinessesTable 
                businessesData={businessesData} 
                filter="all"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 