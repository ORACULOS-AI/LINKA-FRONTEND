'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, 
  Share2, 
  Heart, 
  HeartOff, 
  Users, 
  Calendar, 
  Target, 
  Award, 
  Globe, 
  UserCheck,
  DollarSign,
  Building,
  GraduationCap,
  Lightbulb,
  Rocket,
  Briefcase,
  ChevronUp,
  Loader2,
  MapPin,
  Clock,
  TrendingUp,
  Zap,
  CheckCircle,
  XCircle,
  PauseCircle,
  PlayCircle,
  ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/lib/context/AuthContext'
import { useInitiativesApi } from '@/lib/api/initiatives'
import { useUserApi } from '@/lib/api/users'
import { useBusinessApi } from '@/lib/api/business'
import {
  IniciativaBase,
  StatusIniciativa,
  NivelMaturidade, 
  TipoIniciativa, 
  StatusVinculo 
} from '@/lib/types/initiativeTypes'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import PrivateRoute from '@/components/private_route'

interface InitiativeDetailPageProps {
  params: Promise<{ id: string }>
}

export default function InitiativeDetailPage({ params }: InitiativeDetailPageProps) {
  const { id } = React.use(params)
  const router = useRouter()
  const { toast } = useToast()
  const auth = useAuth()
  
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'participants' | 'resources'>('overview')
  
  const {
    useGetInitiativeById,
    useFavoriteInitiative, 
    useUnfavoriteInitiative,
    useFollowInitiative,
    useUnfollowInitiative
  } = useInitiativesApi()
  const { useFetchUsers } = useUserApi()
  const { useGetBusinessById } = useBusinessApi()
  
  const { data: initiative, isLoading, error, refetch } = useGetInitiativeById(id)
  const { data: users = [] } = useFetchUsers()
  const { data: business } = useGetBusinessById(initiative?.business_id || '')
  
  const favoriteMutation = useFavoriteInitiative()
  const unfavoriteMutation = useUnfavoriteInitiative()
  const followMutation = useFollowInitiative()
  const unfollowMutation = useUnfollowInitiative()

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: initiative?.titulo,
          text: initiative?.descricao,
          url: window.location.href,
        })
      } catch {
        // Share cancelled or failed
      }
    } else {
      await navigator.clipboard.writeText(window.location.href)
      toast({
        title: 'Link copiado!',
        description: 'O link foi copiado para a área de transferência.',
      })
    }
  }

  const handleFavorite = () => {
    if (isFavorited) {
      unfavoriteMutation.mutate(id)
    } else {
      favoriteMutation.mutate(id)
    }
  }

  const handleFollow = () => {
    if (isFollowing) {
      unfollowMutation.mutate(id)
    } else {
      followMutation.mutate(id)
    }
  }

  if (isLoading) {
    return (
      <PrivateRoute>
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-8 max-w-6xl">
            <Skeleton className="h-8 w-[200px] mb-6" />
            <div className="space-y-6">
              <Skeleton className="h-[300px] w-full rounded-xl" />
              <Skeleton className="h-[200px] w-full rounded-xl" />
              <Skeleton className="h-[150px] w-full rounded-xl" />
            </div>
          </div>
        </div>
      </PrivateRoute>
    )
  }

  if (error || !initiative) {
    return (
      <PrivateRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Iniciativa não encontrada
            </h1>
            <p className="text-gray-600 mb-6">
              A iniciativa que você está procurando não existe ou foi removida.
            </p>
            <Button onClick={() => router.push('/iniciativas')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Iniciativas
          </Button>
          </div>
        </div>
      </PrivateRoute>
    )
  }

  const owner = users?.find((u: any) => u.uid === initiative.uid_owner)
  const activeParticipants = initiative.participantes?.filter(
    (p) => p.status_vinculo === StatusVinculo.ACEITO
    ) || []

  const isFavorited = initiative.favoritos?.includes(auth.userId || '') || false
  const isFollowing = initiative.seguidores?.includes(auth.userId || '') || false
  const isOwner = auth.userId === initiative.uid_owner

  const getStatusIcon = (status: StatusIniciativa) => {
    switch (status) {
      case StatusIniciativa.ATIVA:
        return <PlayCircle className="h-5 w-5 text-green-500" />
      case StatusIniciativa.PAUSADA:
        return <PauseCircle className="h-5 w-5 text-yellow-500" />
      case StatusIniciativa.CONCLUIDA:
        return <CheckCircle className="h-5 w-5 text-blue-500" />
      case StatusIniciativa.CANCELADA:
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: StatusIniciativa) => {
    switch (status) {
      case StatusIniciativa.ATIVA:
        return 'bg-green-100 text-green-800 border-green-200'
      case StatusIniciativa.PAUSADA:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case StatusIniciativa.CONCLUIDA:
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case StatusIniciativa.CANCELADA:
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getMaturityColor = (nivel: NivelMaturidade) => {
    switch (nivel) {
      case NivelMaturidade.CONCEITO:
        return 'bg-gradient-to-r from-red-500 to-red-600 text-white'
      case NivelMaturidade.PROTOTIPO:
        return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white'
      case NivelMaturidade.DEMONSTRACAO:
        return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
      case NivelMaturidade.COMERCIALIZACAO:
        return 'bg-gradient-to-r from-green-500 to-green-600 text-white'
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
    }
  }

  const getTypeIcon = (tipo: TipoIniciativa) => {
    switch (tipo) {
      case TipoIniciativa.PESQUISA:
        return <GraduationCap className="h-5 w-5" />
      case TipoIniciativa.INOVACAO:
        return <Lightbulb className="h-5 w-5" />
      case TipoIniciativa.EMPREENDEDORISMO:
        return <Rocket className="h-5 w-5" />
      case TipoIniciativa.EXTENSAO:
        return <Users className="h-5 w-5" />
      case TipoIniciativa.DESENVOLVIMENTO:
        return <Building className="h-5 w-5" />
      case TipoIniciativa.CONSULTORIA:
        return <Briefcase className="h-5 w-5" />
      default:
        return <Lightbulb className="h-5 w-5" />
    }
  }

  const getTypeBadge = (tipo: TipoIniciativa) => {
    const config = {
      [TipoIniciativa.PESQUISA]: { bg: 'bg-gradient-to-r from-indigo-500 to-indigo-600', text: 'Pesquisa', icon: '🎓' },
      [TipoIniciativa.INOVACAO]: { bg: 'bg-gradient-to-r from-purple-500 to-purple-600', text: 'Inovação', icon: '💡' },
      [TipoIniciativa.EMPREENDEDORISMO]: { bg: 'bg-gradient-to-r from-green-500 to-green-600', text: 'Empreendedorismo', icon: '🚀' },
      [TipoIniciativa.EXTENSAO]: { bg: 'bg-gradient-to-r from-blue-500 to-blue-600', text: 'Extensão', icon: '🤝' },
      [TipoIniciativa.DESENVOLVIMENTO]: { bg: 'bg-gradient-to-r from-orange-500 to-orange-600', text: 'Desenvolvimento', icon: '🏗️' },
      [TipoIniciativa.CONSULTORIA]: { bg: 'bg-gradient-to-r from-teal-500 to-teal-600', text: 'Consultoria', icon: '💼' },
      [TipoIniciativa.OUTROS]: { bg: 'bg-gradient-to-r from-gray-500 to-gray-600', text: 'Outros', icon: '📋' }
    }
    
    const typeConfig = config[tipo] || { bg: 'bg-gradient-to-r from-gray-500 to-gray-600', text: tipo, icon: '💡' }
    
    return (
      <div className={`${typeConfig.bg} text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 shadow-lg`}>
        <span>{typeConfig.icon}</span>
        {typeConfig.text}
      </div>
    )
  }

  return (
    <PrivateRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-purple-600 via-violet-600 to-purple-700 text-white">
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>

          <div className="relative z-10 container mx-auto px-4 py-12">
            <div className="flex items-center justify-between mb-8">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/iniciativas')}
                className="text-white hover:bg-white/10"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
              
              <div className="flex items-center gap-3">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleShare}
                        className="text-white hover:bg-white/10"
                      >
                        <Share2 className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Compartilhar</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                {auth.userId && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleFavorite}
                          className="text-white hover:bg-white/10"
                        >
                          {isFavorited ? (
                            <Heart className="h-5 w-5 fill-current" />
                          ) : (
                            <HeartOff className="h-5 w-5" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{isFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </div>

            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                    <h1 className="text-4xl font-bold mb-4">{initiative.titulo}</h1>
                    <p className="text-xl text-purple-100 mb-6 leading-relaxed">
                      {initiative.descricao}
                    </p>
                  </div>
                  <div className="ml-6">
                    {getTypeBadge(initiative.tipo)}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(initiative.status)}
                      <span className="font-medium">Status</span>
                    </div>
                    <p className="text-sm text-purple-100">{initiative.status}</p>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="flex items-center gap-3 mb-2">
                      <Target className="h-5 w-5 text-green-400" />
                      <span className="font-medium">Maturidade</span>
                    </div>
                    <p className="text-sm text-purple-100">{initiative.nivel_maturidade}</p>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="flex items-center gap-3 mb-2">
                      <Users className="h-5 w-5 text-blue-400" />
                      <span className="font-medium">Participantes</span>
                    </div>
                    <p className="text-sm text-purple-100">{activeParticipants.length}</p>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="flex items-center gap-3 mb-2">
                      <Calendar className="h-5 w-5 text-yellow-400" />
                      <span className="font-medium">Início</span>
                    </div>
                    <p className="text-sm text-purple-100">
                      {format(new Date(initiative.data_inicio), 'PPP', { locale: ptBR })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-400" />
                    <span className="text-sm">{initiative.favoritos?.length || 0} favoritos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-400" />
                    <span className="text-sm">{initiative.seguidores?.length || 0} seguidores</span>
                  </div>
                  {business && (
                    <div className="flex items-center gap-2">
                      <Building className="h-5 w-5 text-purple-400" />
                        <button
                        onClick={() => router.push(`/inspecionar-negocio/${business.id}`)}
                        className="text-sm text-purple-100 hover:text-white transition-colors underline"
                        >
                          {business.nome}
                        </button>
                    </div>
                  )}
                  {initiative.aceita_colaboradores && (
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-5 w-5 text-green-400" />
                      <span className="text-sm">Aceita colaboradores</span>
                    </div>
                  )}
                  {initiative.colaboracao_internacional && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-blue-400" />
                      <span className="text-sm">Colaboração internacional</span>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
            </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="participants">Participantes</TabsTrigger>
              <TabsTrigger value="resources">Recursos</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Impact & Target */}
                  {(initiative.impacto_esperado || initiative.publico_alvo) && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="h-5 w-5 text-green-500" />
                          Impacto e Público-alvo
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {initiative.impacto_esperado && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Impacto Esperado</h4>
                            <p className="text-gray-700 leading-relaxed">{initiative.impacto_esperado}</p>
                          </div>
                        )}
                        {initiative.publico_alvo && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Público-alvo</h4>
                            <p className="text-gray-700 leading-relaxed">{initiative.publico_alvo}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Keywords & Technologies */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-purple-500" />
                        Palavras-chave e Tecnologias
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {initiative.palavras_chave && initiative.palavras_chave.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Palavras-chave</h4>
                          <div className="flex flex-wrap gap-2">
                            {initiative.palavras_chave.map((keyword, index) => (
                              <Badge key={index} variant="secondary" className="bg-purple-50 text-purple-700">
                                {keyword}
              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {initiative.tecnologias_utilizadas && initiative.tecnologias_utilizadas.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Tecnologias Utilizadas</h4>
                          <div className="flex flex-wrap gap-2">
                            {initiative.tecnologias_utilizadas.map((tech, index) => (
                              <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700">
                                {tech}
                </Badge>
              ))}
            </div>
                        </div>
                      )}
                      
                      {initiative.areas_conhecimento && initiative.areas_conhecimento.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Áreas de Conhecimento</h4>
                          <div className="flex flex-wrap gap-2">
                            {initiative.areas_conhecimento.map((area, index) => (
                              <Badge key={index} variant="outline" className="border-green-200 text-green-700">
                                {area}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Financial Information */}
                  {initiative.orcamento_previsto && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <DollarSign className="h-5 w-5 text-green-500" />
                          Informações Financeiras
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Orçamento Previsto</span>
                            <span className="font-semibold">
                              {new Intl.NumberFormat('pt-BR', {
                                style: 'currency',
                                currency: initiative.moeda || 'BRL'
                              }).format(initiative.orcamento_previsto)}
                </span>
              </div>
                          {initiative.fonte_financiamento && (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Fonte de Financiamento</span>
                              <span className="font-medium">{initiative.fonte_financiamento}</span>
                            </div>
                          )}
            </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Status Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Status da Iniciativa</CardTitle>
                    </CardHeader>
                    <CardContent>
                <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Status</span>
                          <Badge className={getStatusColor(initiative.status)}>
                            {initiative.status}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Maturidade</span>
                          <Badge className={getMaturityColor(initiative.nivel_maturidade)}>
                            {initiative.nivel_maturidade}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Tipo</span>
                          <div className="flex items-center gap-2">
                            {getTypeIcon(initiative.tipo)}
                            <span className="font-medium">{initiative.tipo}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Collaboration Features */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Colaboração</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <UserCheck className={`h-5 w-5 ${initiative.aceita_colaboradores ? 'text-green-500' : 'text-gray-400'}`} />
                          <span className={initiative.aceita_colaboradores ? 'text-green-700' : 'text-gray-500'}>
                            {initiative.aceita_colaboradores ? 'Aceita colaboradores' : 'Não aceita colaboradores'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Globe className={`h-5 w-5 ${initiative.colaboracao_internacional ? 'text-blue-500' : 'text-gray-400'}`} />
                          <span className={initiative.colaboracao_internacional ? 'text-blue-700' : 'text-gray-500'}>
                            {initiative.colaboracao_internacional ? 'Colaboração internacional' : 'Apenas nacional'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Award className={`h-5 w-5 ${initiative.tem_propriedade_intelectual ? 'text-yellow-500' : 'text-gray-400'}`} />
                          <span className={initiative.tem_propriedade_intelectual ? 'text-yellow-700' : 'text-gray-500'}>
                            {initiative.tem_propriedade_intelectual ? 'Tem propriedade intelectual' : 'Sem propriedade intelectual'}
                          </span>
                      </div>
                    </div>
                    </CardContent>
                  </Card>

                  {/* Timeline */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Cronograma</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-5 w-5 text-green-500" />
                          <div>
                            <p className="font-medium">Início</p>
                            <p className="text-sm text-gray-600">
                              {format(new Date(initiative.data_inicio), 'PPP', { locale: ptBR })}
                            </p>
                          </div>
                        </div>
                        {initiative.data_fim && (
                          <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-red-500" />
                            <div>
                              <p className="font-medium">Fim</p>
                              <p className="text-sm text-gray-600">
                                {format(new Date(initiative.data_fim), 'PPP', { locale: ptBR })}
                              </p>
                </div>
              </div>
                        )}
                </div>
                    </CardContent>
                  </Card>

                  {/* Owner Information */}
                  {owner && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Responsável</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={owner.foto_url} alt={owner.nome} />
                            <AvatarFallback>{owner.nome.charAt(0)}</AvatarFallback>
                      </Avatar>
                          <div>
                            <p className="font-medium">{owner.nome}</p>
                            <p className="text-sm text-gray-600">{owner.email}</p>
                </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Business Information */}
                  {business && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Negócio</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                              <Building className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{business.nome}</p>
                              <p className="text-sm text-gray-600">{business.area_atuacao}</p>
              </div>
            </div>
                          <div className="pt-3 border-t border-gray-100">
                            <button
                              onClick={() => router.push(`/inspecionar-negocio/${business.id}`)}
                              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                            >
                              <ArrowRight className="h-4 w-4" />
                              Ver Negócio
                            </button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="participants" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Participantes da Iniciativa</CardTitle>
                </CardHeader>
                <CardContent>
                  {activeParticipants.length > 0 ? (
                    <div className="space-y-4">
                      {activeParticipants.map((participant) => {
                        const user = users.find((u: any) => u.uid === participant.uid)
                        return (
                          <div key={participant.uid} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={user?.foto_url} alt={user?.nome} />
                                <AvatarFallback>{user?.nome?.charAt(0) || 'U'}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{user?.nome || 'Usuário'}</p>
                                <p className="text-sm text-gray-600">{user?.email}</p>
                              </div>
                                </div>
                            <div className="text-right">
                              <Badge variant="outline">{participant.papel}</Badge>
                              {participant.dedicacao_horas && (
                                <p className="text-sm text-gray-600 mt-1">
                                  {participant.dedicacao_horas}h/semana
                                </p>
                              )}
                            </div>
                              </div>
                            )
                          })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Nenhum participante ativo encontrado</p>
                              </div>
                            )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="resources" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Resources Needed */}
                {initiative.recursos_necessarios && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Recursos Necessários</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 leading-relaxed">{initiative.recursos_necessarios}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Expected Results */}
                {initiative.resultados_esperados && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Resultados Esperados</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 leading-relaxed">{initiative.resultados_esperados}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Success Metrics */}
                {initiative.metricas_sucesso && initiative.metricas_sucesso.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Métricas de Sucesso</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {initiative.metricas_sucesso.map((metric, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-gray-700">{metric}</span>
                          </div>
                        ))}
                        </div>
                    </CardContent>
                  </Card>
                )}

                {/* ODS Related */}
                {initiative.ods_relacionados && initiative.ods_relacionados.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>ODS Relacionados</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {initiative.ods_relacionados.map((ods, index) => (
                          <Badge key={index} variant="outline" className="border-blue-200 text-blue-700">
                            {ods}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
              </div>

        {/* Scroll to Top Button */}
        <AnimatePresence>
          {showScrollTop && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed bottom-8 right-8 z-50"
            >
                        <Button
                size="icon"
                onClick={scrollToTop}
                className="rounded-full shadow-lg bg-purple-600 hover:bg-purple-700"
              >
                <ChevronUp className="h-5 w-5" />
                        </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PrivateRoute>
  )
}
