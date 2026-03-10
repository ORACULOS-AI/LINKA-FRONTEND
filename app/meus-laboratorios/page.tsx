'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLaboratorioApi } from '@/lib/api/laboratorio'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, Edit, Mail, Phone, MapPin, Beaker, CheckCircle, Clock, XCircle, Sparkles } from 'lucide-react'
import PrivateRoute from '@/components/private_route'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { motion } from 'framer-motion'
import { LaboratorioCreationModal } from './components/laboratorio-creation-modal'

export default function MeusLaboratoriosPage() {
  const router = useRouter()
  const { useGetUserLaboratorios, useDeleteLaboratorio } = useLaboratorioApi()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  // Verificar permissões de acesso
  useEffect(() => {
    const userType = localStorage.getItem('userType')
    const isAdmin = localStorage.getItem('userIsAdmin') === 'true'

    if (!isAdmin && userType !== 'pesquisador') {
      router.push('/')
    }
  }, [router])

  const {
    data: laboratorios,
    isLoading,
    error,
    refetch,
  } = useGetUserLaboratorios()

  const deleteLaboratorioMutation = useDeleteLaboratorio()

  const handleDeleteLaboratorio = async (laboratorioId: string) => {
    try {
      await deleteLaboratorioMutation.mutateAsync(laboratorioId)
      await refetch()
    } catch {
      // Error handled by mutation
    }
  }

  const { approvedCount, pendingCount, inactiveCount, totalCount } = useMemo(
    () => ({
      totalCount: laboratorios?.length || 0,
      approvedCount: laboratorios?.filter((l) => l.status === 'ATIVO').length || 0,
      pendingCount: laboratorios?.filter((l) => l.status === 'MANUTENCAO').length || 0,
      inactiveCount: laboratorios?.filter((l) => l.status === 'INATIVO').length || 0,
    }),
    [laboratorios],
  )

  // Ordenação automática por mais recentes
  const sortedLaboratorios = useMemo(() => {
    if (!laboratorios) return []
    return [...laboratorios].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
  }, [laboratorios])

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'ATIVO': {
        className: 'bg-green-100 text-green-800 border-green-200',
        text: 'Aprovado',
      },
      'MANUTENCAO': {
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        text: 'Pendente',
      },
      'INATIVO': {
        className: 'bg-red-100 text-red-800 border-red-200',
        text: 'Inativo',
      },
    }

    const config = statusConfig[status] || statusConfig['ATIVO']

    return (
      <span
        className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${config.className}`}
      >
        {config.text}
      </span>
    )
  }

  const getTipoBadge = (tipo: string) => {
    const tipoConfig = {
      'PESQUISA': {
        className: 'bg-blue-100 text-blue-800 border-blue-200',
        text: 'Pesquisa',
      },
      'ENSINO': {
        className: 'bg-purple-100 text-purple-800 border-purple-200',
        text: 'Ensino',
      },
      'EXTENSAO': {
        className: 'bg-green-100 text-green-800 border-green-200',
        text: 'Extensão',
      },
      'DESENVOLVIMENTO': {
        className: 'bg-orange-100 text-orange-800 border-orange-200',
        text: 'Desenvolvimento',
      },
      'MULTIDISCIPLINAR': {
        className: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        text: 'Multidisciplinar',
      },
    }

    const config = tipoConfig[tipo] || { className: 'bg-gray-100 text-gray-800 border-gray-200', text: tipo }

    return (
      <Badge variant="outline" className={config.className}>
        {config.text}
      </Badge>
    )
  }

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'Data não disponível'
    try {
      return format(new Date(dateString), "d 'de' MMMM 'às' HH:mm", {
        locale: ptBR,
      })
    } catch (e) {
      return 'Data inválida'
    }
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Skeleton className="h-[350px] rounded-2xl" />
            </motion.div>
          ))}
        </div>
      )
    }

    if (!laboratorios || laboratorios.length === 0) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center space-y-6 py-16"
        >
          <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center">
            <Beaker className="h-10 w-10 text-purple-400" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Nenhum laboratório cadastrado ainda
            </h2>
            <p className="text-gray-600 max-w-md">
              Cadastre seu primeiro laboratório para começar a gerenciar suas atividades de pesquisa
            </p>
          </div>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-gradient-to-r from-purple-600 to-violet-600 hover:shadow-lg hover:shadow-purple-500/25 text-lg px-8 py-6"
          >
            <Plus className="mr-2 h-5 w-5" />
            Criar Primeiro Laboratório
          </Button>
        </motion.div>
      )
    }

    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sortedLaboratorios.map((laboratorio, index) => (
          <motion.div
            key={laboratorio.uid}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card
              className="group relative overflow-hidden bg-white border-2 border-gray-100 hover:border-purple-300 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 cursor-pointer h-full flex flex-col"
              onClick={() => router.push(`/inspecionar-laboratorio/${laboratorio.uid}`)}
            >
              {/* Top gradient accent */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 via-violet-500 to-purple-600" />

              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors flex-1 line-clamp-2">
                    {laboratorio.nome}
                  </CardTitle>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-purple-50 hover:text-purple-600"
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/inspecionar-laboratorio/${laboratorio.uid}`)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir Laboratório</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir "{laboratorio.nome}"?
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={async (e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              await handleDeleteLaboratorio(laboratorio.uid)
                            }}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {getTipoBadge(laboratorio.tipo)}
                  {getStatusBadge(laboratorio.status)}
                </div>
              </CardHeader>

              <CardContent className="flex-1 space-y-4">
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Responsável</h4>
                  <div className="space-y-1.5">
                    <div className="text-sm text-gray-700 font-medium">
                      {laboratorio.responsavel}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Mail className="h-3.5 w-3.5 text-purple-600 flex-shrink-0" />
                      <span className="truncate">{laboratorio.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Phone className="h-3.5 w-3.5 text-purple-600 flex-shrink-0" />
                      <span>{laboratorio.telefone}</span>
                    </div>
                  </div>
                </div>
                {(laboratorio.campus || laboratorio.sala) && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Localização</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <MapPin className="h-3.5 w-3.5 text-purple-600 flex-shrink-0" />
                      <span>
                        {laboratorio.campus && `${laboratorio.campus}`}
                        {laboratorio.campus && laboratorio.sala && ", "}
                        {laboratorio.sala && `Sala ${laboratorio.sala}`}
                      </span>
                    </div>
                  </div>
                )}
                {laboratorio.descricao && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Descrição</h4>
                    <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                      {laboratorio.descricao}
                    </p>
                  </div>
                )}
              </CardContent>

              <CardFooter className="border-t border-gray-100 pt-4 flex-col items-start gap-2">
                <div className="text-xs text-gray-500">
                  Criado em {formatDate(laboratorio.created_at)}
                </div>
                <div className="text-xs text-gray-500">
                  Unidade: {laboratorio.unidade}
                  {laboratorio.subunidade && ` • ${laboratorio.subunidade}`}
                </div>
              </CardFooter>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-purple-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </Card>
          </motion.div>
        ))}
      </div>
    )
  }

  return (
    <PrivateRoute>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
        {/* HEADER ROXO */}
        <div className="relative bg-gradient-to-br from-purple-600 via-purple-500 to-violet-600 text-white overflow-hidden">
          {/* Decorative blur orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-violet-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white/5 rounded-full blur-2xl" />
          </div>

          <div className="relative z-10 container mx-auto px-4 py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-5xl mx-auto"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 mb-6"
              >
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-semibold">Gestão de Laboratórios</span>
              </motion.div>

              {/* Título */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl md:text-5xl font-black mb-4"
              >
                Meus Laboratórios
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl"
              >
                Gerencie seus laboratórios, acompanhe o status e mantenha suas informações atualizadas
              </motion.p>

              {/* Stats Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
              >
                {[
                  { icon: Beaker, label: 'Total', value: totalCount, color: 'yellow' },
                  { icon: CheckCircle, label: 'Aprovados', value: approvedCount, color: 'green' },
                  { icon: Clock, label: 'Pendentes', value: pendingCount, color: 'amber' },
                  { icon: XCircle, label: 'Inativos', value: inactiveCount, color: 'red' },
                ].map((stat, idx) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + idx * 0.1 }}
                    className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20 hover:bg-white/15 transition-all"
                  >
                    <stat.icon className={`h-7 w-7 mb-2 text-${stat.color}-300`} />
                    <div className="text-3xl md:text-4xl font-black mb-1">{stat.value}</div>
                    <div className="text-sm text-white/80 font-medium">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Botão Criar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="mt-8"
              >
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  size="lg"
                  className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-6 rounded-xl font-bold shadow-2xl"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Novo Laboratório
                </Button>
              </motion.div>
            </motion.div>
          </div>

          {/* Wave divider */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
              <path d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z" fill="white" fillOpacity="0.1"/>
              <path d="M0 40L60 46.7C120 53 240 67 360 73.3C480 80 600 80 720 73.3C840 67 960 53 1080 46.7C1200 40 1320 40 1380 40H1440V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V40Z" fill="rgb(249, 250, 251)"/>
            </svg>
          </div>
        </div>

        {/* CONTEÚDO */}
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {error ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-2xl border-2 border-red-200 bg-red-50 p-6 text-red-600 text-center"
              >
                <p className="font-semibold mb-2">Erro ao carregar laboratórios</p>
                <p className="text-sm">{error.message}</p>
              </motion.div>
            ) : (
              renderContent()
            )}
          </motion.div>
        </div>
      </div>

      <LaboratorioCreationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          refetch()
        }}
      />
    </PrivateRoute>
  )
}
