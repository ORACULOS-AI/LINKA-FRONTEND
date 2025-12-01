'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, CheckCircle, Clock, TrendingUp, XCircle } from 'lucide-react'
import { StatCard } from '../components/StatCard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function EventosAdminPage() {
  const [activeTab, setActiveTab] = useState('overview')

  // Mock data - substituir por hook real quando backend estiver pronto
  const isLoading = false
  const eventosData = {
    pendentes: [],
    aprovados: [],
    recusados: [],
  }

  const pendingCount = eventosData?.pendentes?.length || 0
  const approvedCount = eventosData?.aprovados?.length || 0
  const rejectedCount = eventosData?.recusados?.length || 0
  const totalCount = pendingCount + approvedCount + rejectedCount
  const approvalRate = totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 0

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="h-24 w-full bg-gray-200 animate-pulse rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-32 bg-gray-200 animate-pulse rounded-lg"></div>
          <div className="h-32 bg-gray-200 animate-pulse rounded-lg"></div>
          <div className="h-32 bg-gray-200 animate-pulse rounded-lg"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
          Administração de Eventos
        </h1>
        <p className="text-muted-foreground">
          Gerencie eventos acadêmicos e corporativos da plataforma
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total de Eventos"
          value={totalCount}
          description="Cadastrados na plataforma"
          icon={Calendar}
          color="green"
        />

        <StatCard
          title="Pendentes"
          value={pendingCount}
          description="Aguardando aprovação"
          icon={Clock}
          color="yellow"
        />

        <StatCard
          title="Aprovados"
          value={approvedCount}
          description="Ativos na plataforma"
          icon={CheckCircle}
          color="green"
        />

        <StatCard
          title="Taxa de Aprovação"
          value={`${approvalRate}%`}
          description="Eventos aprovados"
          icon={TrendingUp}
          color="purple"
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="pendentes">Pendentes ({pendingCount})</TabsTrigger>
          <TabsTrigger value="aprovados">Aprovados ({approvedCount})</TabsTrigger>
          <TabsTrigger value="recusados">Recusados ({rejectedCount})</TabsTrigger>
          <TabsTrigger value="all">Todos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resumo</CardTitle>
              <CardDescription>
                Visão geral dos eventos cadastrados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm font-medium text-yellow-800">Aguardando Aprovação</p>
                    <p className="text-2xl font-bold text-yellow-900 mt-1">{pendingCount}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm font-medium text-green-800">Aprovados</p>
                    <p className="text-2xl font-bold text-green-900 mt-1">{approvedCount}</p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-sm font-medium text-red-800">Recusados</p>
                    <p className="text-2xl font-bold text-red-900 mt-1">{rejectedCount}</p>
                  </div>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-semibold text-green-800 mb-2">
                    📊 Funcionalidade em Desenvolvimento
                  </p>
                  <p className="text-sm text-green-700">
                    A gestão completa de eventos estará disponível em breve.
                    Os endpoints do backend serão criados seguindo o mesmo padrão de Negócios e Laboratórios.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pendentes">
          <Card>
            <CardHeader>
              <CardTitle>Eventos Pendentes</CardTitle>
              <CardDescription>
                Eventos aguardando aprovação ({pendingCount})
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-semibold text-gray-700">Nenhum evento pendente</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Em breve esta funcionalidade estará disponível
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="aprovados">
          <Card>
            <CardHeader>
              <CardTitle>Eventos Aprovados</CardTitle>
              <CardDescription>
                Eventos ativos na plataforma ({approvedCount})
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <p className="text-lg font-semibold text-gray-700">Nenhum evento aprovado ainda</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recusados">
          <Card>
            <CardHeader>
              <CardTitle>Eventos Recusados</CardTitle>
              <CardDescription>
                Eventos que não foram aprovados ({rejectedCount})
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <XCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-semibold text-gray-700">Nenhum evento recusado</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Todos os Eventos</CardTitle>
              <CardDescription>
                Lista completa ({totalCount} eventos)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <p className="text-lg font-semibold text-gray-700">Nenhum evento cadastrado</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Quando eventos forem criados, eles aparecerão aqui
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
