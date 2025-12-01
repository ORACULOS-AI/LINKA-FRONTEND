'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Lightbulb, CheckCircle, Clock, TrendingUp, XCircle } from 'lucide-react'
import { StatCard } from '../components/StatCard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useInitiativesApi } from '@/lib/api/initiatives'

export default function IniciativasAdminPage() {
  const { useGetInitiativesByAdmin, useApproveInitiative, useRejectInitiative } = useInitiativesApi()
  const { data: iniciativasData, isLoading } = useGetInitiativesByAdmin()
  const [activeTab, setActiveTab] = useState('overview')

  const approveMutation = useApproveInitiative()
  const rejectMutation = useRejectInitiative()

  const handleApprove = async (initiativeId: string) => {
    try {
      await approveMutation.mutateAsync(initiativeId)
    } catch (error) {
      console.error('Erro ao aprovar:', error)
    }
  }

  const handleReject = async (initiativeId: string) => {
    try {
      await rejectMutation.mutateAsync({
        initiativeId,
        motivo: 'Iniciativa recusada pelo administrador'
      })
    } catch (error) {
      console.error('Erro ao recusar:', error)
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
      </div>
    )
  }

  const pendingCount = iniciativasData?.pendentes?.length || 0
  const approvedCount = iniciativasData?.ativas?.length || 0
  const rejectedCount = iniciativasData?.recusadas?.length || 0
  const totalCount = pendingCount + approvedCount + rejectedCount
  const approvalRate = totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 0

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
          Administração de Iniciativas
        </h1>
        <p className="text-muted-foreground">
          Gerencie projetos de pesquisa e inovação da UFC
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total de Iniciativas"
          value={totalCount}
          description="Cadastradas na plataforma"
          icon={Lightbulb}
          color="blue"
        />

        <StatCard
          title="Pendentes"
          value={pendingCount}
          description="Aguardando aprovação"
          icon={Clock}
          color="yellow"
        />

        <StatCard
          title="Aprovadas"
          value={approvedCount}
          description="Ativas na plataforma"
          icon={CheckCircle}
          color="green"
        />

        <StatCard
          title="Taxa de Aprovação"
          value={`${approvalRate}%`}
          description="Iniciativas aprovadas"
          icon={TrendingUp}
          color="purple"
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="pendentes">Pendentes ({pendingCount})</TabsTrigger>
          <TabsTrigger value="aprovados">Aprovadas ({approvedCount})</TabsTrigger>
          <TabsTrigger value="recusados">Recusadas ({rejectedCount})</TabsTrigger>
          <TabsTrigger value="all">Todas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resumo</CardTitle>
              <CardDescription>
                Visão geral das iniciativas cadastradas
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
                    <p className="text-sm font-medium text-green-800">Aprovadas</p>
                    <p className="text-2xl font-bold text-green-900 mt-1">{approvedCount}</p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-sm font-medium text-red-800">Recusadas</p>
                    <p className="text-2xl font-bold text-red-900 mt-1">{rejectedCount}</p>
                  </div>
                </div>

                {pendingCount > 0 && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-semibold text-blue-800 mb-2">
                      ⚠️ Ação Necessária
                    </p>
                    <p className="text-sm text-blue-700">
                      Existem <strong>{pendingCount}</strong> iniciativa(s) aguardando aprovação.
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
              <CardTitle>Iniciativas Pendentes</CardTitle>
              <CardDescription>
                Iniciativas aguardando aprovação ({pendingCount})
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingCount === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <p className="text-lg font-semibold text-gray-700">Nenhuma iniciativa pendente</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Todas as iniciativas foram revisadas
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {iniciativasData?.pendentes?.map((initiative: any) => (
                    <div key={initiative.uid || initiative.id} className="p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{initiative.titulo}</h3>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {initiative.descricao}
                          </p>
                          {initiative.tipo && (
                            <p className="text-xs text-gray-500 mt-1">📋 {initiative.tipo}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(initiative.uid || initiative.id)}
                            disabled={approveMutation.isPending}
                            className="px-4 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {approveMutation.isPending ? 'Aprovando...' : 'Aprovar'}
                          </button>
                          <button
                            onClick={() => handleReject(initiative.uid || initiative.id)}
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
              <CardTitle>Iniciativas Aprovadas</CardTitle>
              <CardDescription>
                Iniciativas ativas na plataforma ({approvedCount})
              </CardDescription>
            </CardHeader>
            <CardContent>
              {approvedCount === 0 ? (
                <div className="text-center py-12">
                  <Lightbulb className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-semibold text-gray-700">Nenhuma iniciativa aprovada</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {iniciativasData?.ativas?.map((initiative: any) => (
                    <div key={initiative.uid || initiative.id} className="p-4 border border-green-200 rounded-lg bg-green-50">
                      <h3 className="font-semibold">{initiative.titulo}</h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{initiative.descricao}</p>
                      {initiative.tipo && (
                        <p className="text-xs text-gray-500 mt-2">📋 {initiative.tipo}</p>
                      )}
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
              <CardTitle>Iniciativas Recusadas</CardTitle>
              <CardDescription>
                Iniciativas que não foram aprovadas ({rejectedCount})
              </CardDescription>
            </CardHeader>
            <CardContent>
              {rejectedCount === 0 ? (
                <div className="text-center py-12">
                  <XCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-semibold text-gray-700">Nenhuma iniciativa recusada</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {iniciativasData?.recusadas?.map((initiative: any) => (
                    <div key={initiative.uid || initiative.id} className="p-4 border border-red-200 rounded-lg bg-red-50">
                      <h3 className="font-semibold">{initiative.titulo}</h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{initiative.descricao}</p>
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
              <CardTitle>Todas as Iniciativas</CardTitle>
              <CardDescription>
                Lista completa ({totalCount} iniciativas)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  ...(iniciativasData?.pendentes || []),
                  ...(iniciativasData?.ativas || []),
                  ...(iniciativasData?.recusadas || []),
                ].map((initiative: any) => (
                  <div key={initiative.uid || initiative.id} className="p-3 border rounded-lg hover:bg-gray-50 flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{initiative.titulo}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-1">{initiative.descricao}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      initiative.status === 'ATIVA' || initiative.status === 'ativa' ? 'bg-green-100 text-green-700' :
                      initiative.status === 'PENDENTE' || initiative.status === 'pendente' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {initiative.status}
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
