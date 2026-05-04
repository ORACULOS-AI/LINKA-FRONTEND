'use client'

import { useState } from 'react'
import { useLaboratorioApi } from '@/lib/api/laboratorio'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Microscope, CheckCircle, Clock, XCircle, TrendingUp } from 'lucide-react'
import { StatCard } from '../components/StatCard'

export default function LaboratoriosAdminPage() {
  const { useGetLaboratoriosByAdmin, useApproveLaboratorio, useRejectLaboratorio } = useLaboratorioApi()
  const { data: laboratoriosData, isLoading } = useGetLaboratoriosByAdmin()
  const [activeTab, setActiveTab] = useState('overview')

  const approveMutation = useApproveLaboratorio()
  const rejectMutation = useRejectLaboratorio()

  const handleApprove = async (labId: string) => {
    try {
      await approveMutation.mutateAsync(labId)
    } catch {
      // Error handled by mutation
    }
  }

  const handleReject = async (labId: string) => {
    try {
      await rejectMutation.mutateAsync(labId)
    } catch {
      // Error handled by mutation
    }
  }

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

  // Calcular métricas
  const pendingCount = laboratoriosData?.pendentes?.length || 0
  const approvedCount = laboratoriosData?.aprovados?.length || 0
  const rejectedCount = laboratoriosData?.recusados?.length || 0
  const totalCount = pendingCount + approvedCount + rejectedCount
  const approvalRate = totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 0

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
          Administração de Laboratórios
        </h1>
        <p className="text-muted-foreground">
          Gerencie os laboratórios de pesquisa da UFC
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total de Laboratórios"
          value={totalCount}
          description="Cadastrados na plataforma"
          icon={Microscope}
          color="orange"
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
          description="Laboratórios aprovados"
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
                Visão geral dos laboratórios cadastrados
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

                {pendingCount > 0 && (
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-sm font-semibold text-orange-800 mb-2">
                      ⚠️ Ação Necessária
                    </p>
                    <p className="text-sm text-orange-700">
                      Existem <strong>{pendingCount}</strong> laboratório(s) aguardando aprovação.
                      Acesse a aba "Pendentes" para revisar.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pendentes">
          <Card>
            <CardHeader>
              <CardTitle>Laboratórios Pendentes</CardTitle>
              <CardDescription>
                Laboratórios aguardando aprovação ({pendingCount})
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingCount === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <p className="text-lg font-semibold text-gray-700">Nenhum laboratório pendente</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Todos os laboratórios foram revisados
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {laboratoriosData?.pendentes?.map((lab: any) => (
                    <div key={lab.uid} className="p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{lab.nome}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {lab.unidade} - {lab.campus}
                          </p>
                          {lab.email && (
                            <p className="text-xs text-gray-500 mt-1">📧 {lab.email}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(lab.uid)}
                            disabled={approveMutation.isPending}
                            className="px-4 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {approveMutation.isPending ? 'Aprovando...' : 'Aprovar'}
                          </button>
                          <button
                            onClick={() => handleReject(lab.uid)}
                            disabled={rejectMutation.isPending}
                            className="px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {rejectMutation.isPending ? 'Recusando...' : 'Recusar'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="aprovados">
          <Card>
            <CardHeader>
              <CardTitle>Laboratórios Aprovados</CardTitle>
              <CardDescription>
                Laboratórios ativos na plataforma ({approvedCount})
              </CardDescription>
            </CardHeader>
            <CardContent>
              {approvedCount === 0 ? (
                <div className="text-center py-12">
                  <Microscope className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-semibold text-gray-700">Nenhum laboratório aprovado</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {laboratoriosData?.aprovados?.map((lab: any) => (
                    <div key={lab.uid} className="p-4 border border-green-200 rounded-lg bg-green-50">
                      <h3 className="font-semibold">{lab.nome}</h3>
                      <p className="text-sm text-gray-600 mt-1">{lab.unidade} - {lab.campus}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recusados">
          <Card>
            <CardHeader>
              <CardTitle>Laboratórios Recusados</CardTitle>
              <CardDescription>
                Laboratórios que não foram aprovados ({rejectedCount})
              </CardDescription>
            </CardHeader>
            <CardContent>
              {rejectedCount === 0 ? (
                <div className="text-center py-12">
                  <XCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-semibold text-gray-700">Nenhum laboratório recusado</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {laboratoriosData?.recusados?.map((lab: any) => (
                    <div key={lab.uid} className="p-4 border border-red-200 rounded-lg bg-red-50">
                      <h3 className="font-semibold">{lab.nome}</h3>
                      <p className="text-sm text-gray-600 mt-1">{lab.unidade} - {lab.campus}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Todos os Laboratórios</CardTitle>
              <CardDescription>
                Lista completa ({totalCount} laboratórios)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  ...(laboratoriosData?.pendentes || []),
                  ...(laboratoriosData?.aprovados || []),
                  ...(laboratoriosData?.recusados || []),
                ].map((lab: any) => (
                  <div key={lab.uid} className="p-3 border rounded-lg hover:bg-gray-50 flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{lab.nome}</h4>
                      <p className="text-xs text-muted-foreground">{lab.unidade} - {lab.campus}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      lab.status === 'APROVADO' ? 'bg-green-100 text-green-700' :
                      lab.status === 'PENDENTE' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {lab.status}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
