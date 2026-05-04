"use client"

import type React from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Lightbulb, 
  ArrowRight, 
  Plus, 
  Rocket, 
  Target, 
  Calendar,
  Users,
  GraduationCap,
  Building,
  Briefcase,
  PlayCircle,
  PauseCircle,
  CheckCircle,
  XCircle
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useInitiativesApi } from "@/lib/api/initiatives"
import { StatusIniciativa, NivelMaturidade, TipoIniciativa } from "@/lib/types/initiativeTypes"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface InitiativesSectionProps {
  business: any
  isOwner: boolean
  isAuthenticated: boolean
}

const getStatusColor = (status: StatusIniciativa) => {
  switch (status) {
    case StatusIniciativa.ATIVA:
      return "bg-green-100 text-green-700 border-green-200"
    case StatusIniciativa.PAUSADA:
      return "bg-yellow-100 text-yellow-700 border-yellow-200"
    case StatusIniciativa.CONCLUIDA:
      return "bg-blue-100 text-blue-700 border-blue-200"
    case StatusIniciativa.CANCELADA:
      return "bg-red-100 text-red-700 border-red-200"
    default:
      return "bg-slate-100 text-slate-700 border-slate-200"
  }
}

const getStatusIcon = (status: StatusIniciativa) => {
  switch (status) {
    case StatusIniciativa.ATIVA:
      return <PlayCircle className="h-3 w-3" />
    case StatusIniciativa.PAUSADA:
      return <PauseCircle className="h-3 w-3" />
    case StatusIniciativa.CONCLUIDA:
      return <CheckCircle className="h-3 w-3" />
    case StatusIniciativa.CANCELADA:
      return <XCircle className="h-3 w-3" />
    default:
      return <Lightbulb className="h-3 w-3" />
  }
}

const getTypeIcon = (tipo: TipoIniciativa) => {
  switch (tipo) {
    case TipoIniciativa.PESQUISA:
      return <GraduationCap className="h-4 w-4" />
    case TipoIniciativa.INOVACAO:
      return <Lightbulb className="h-4 w-4" />
    case TipoIniciativa.EMPREENDEDORISMO:
      return <Rocket className="h-4 w-4" />
    case TipoIniciativa.EXTENSAO:
      return <Users className="h-4 w-4" />
    case TipoIniciativa.DESENVOLVIMENTO:
      return <Building className="h-4 w-4" />
    case TipoIniciativa.CONSULTORIA:
      return <Briefcase className="h-4 w-4" />
    default:
      return <Lightbulb className="h-4 w-4" />
  }
}

const getMaturityColor = (nivel: NivelMaturidade) => {
  switch (nivel) {
    case NivelMaturidade.CONCEITO:
      return "bg-red-100 text-red-700"
    case NivelMaturidade.PROTOTIPO:
      return "bg-yellow-100 text-yellow-700"
    case NivelMaturidade.DEMONSTRACAO:
      return "bg-blue-100 text-blue-700"
    case NivelMaturidade.COMERCIALIZACAO:
      return "bg-green-100 text-green-700"
    default:
      return "bg-gray-100 text-gray-700"
  }
}

export const InitiativesSection: React.FC<InitiativesSectionProps> = ({ 
  business, 
  isOwner, 
  isAuthenticated 
}) => {
  const router = useRouter()
  const { useGetInitiativesByBusiness } = useInitiativesApi()
  
  const { data: initiatives, isLoading, error } = useGetInitiativesByBusiness(
    business?.id || '',
    !!business?.id
  )

  const navigateToInitiative = (initiativeId: string) => {
    router.push(`/iniciativas/${initiativeId}`)
  }

  const navigateToCreateInitiative = () => {
    router.push('/iniciativas/nova')
  }

  if (isLoading) {
    return (
      <Card className="overflow-hidden shadow-lg border-0 bg-white border border-purple-100">
        <div className="p-6 pb-4 border-b border-slate-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Lightbulb className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Iniciativas</h2>
                <p className="text-sm text-gray-600">Carregando iniciativas...</p>
              </div>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-20 w-full" />
          ))}
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="overflow-hidden shadow-lg border-0 bg-white border border-purple-100">
        <div className="p-6 pb-4 border-b border-slate-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Lightbulb className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Iniciativas</h2>
                <p className="text-sm text-red-600">Erro ao carregar iniciativas</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  const hasInitiatives = initiatives && initiatives.length > 0

  return (
    <Card className="overflow-hidden shadow-lg border-0 bg-white border border-purple-100">
      <div className="p-6 pb-4 border-b border-slate-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Lightbulb className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Iniciativas</h2>
              <p className="text-sm text-gray-600">
                {hasInitiatives 
                  ? `${initiatives.length} ${initiatives.length === 1 ? 'projeto' : 'projetos'} encontrado${initiatives.length === 1 ? '' : 's'}`
                  : "Nenhum projeto ainda"
                }
              </p>
            </div>
          </div>
          {isOwner && (
            <Button
              onClick={navigateToCreateInitiative}
              size="sm"
              className="gap-2 bg-gradient-to-r from-purple-600 to-violet-600 hover:shadow-purple-500/25 hover:shadow-lg"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Nova</span>
            </Button>
          )}
        </div>
      </div>

      <div className="divide-y divide-purple-50">
        {hasInitiatives ? (
          initiatives.map((initiative, index) => (
            <motion.div
              key={initiative.uid}
              className="p-4 hover:bg-purple-50/30 transition-colors cursor-pointer group"
              onClick={() => navigateToInitiative(initiative.uid)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ x: 4 }}
            >
              <div className="flex items-start justify-between">
                <div className="flex gap-3 flex-1">
                  <div className="mt-1 p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                    {getTypeIcon(initiative.tipo)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                        {initiative.titulo}
                      </h3>
                      <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-purple-600 transition-colors flex-shrink-0 ml-2" />
                    </div>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{initiative.descricao}</p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <Badge
                        variant="outline"
                        className={`text-xs ${getStatusColor(initiative.status)} flex items-center gap-1`}
                      >
                        {getStatusIcon(initiative.status)}
                        {initiative.status}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-xs ${getMaturityColor(initiative.nivel_maturidade)}`}
                      >
                        {initiative.nivel_maturidade}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(initiative.data_inicio), 'MMM yyyy', { locale: ptBR })}
                      </div>
                      {initiative.participantes && initiative.participantes.length > 0 && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Users className="h-3 w-3" />
                          {initiative.participantes.length} participante{initiative.participantes.length !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="py-12 px-4 text-center">
            <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <Lightbulb className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma iniciativa encontrada</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Iniciativas são projetos específicos dentro do seu negócio.
              {isOwner && " Crie uma iniciativa para organizar atividades e recursos."}
            </p>
            {isOwner && (
              <Button
                onClick={navigateToCreateInitiative}
                className="gap-2 bg-gradient-to-r from-purple-600 to-violet-600 hover:shadow-purple-500/25 hover:shadow-lg"
              >
                <Plus className="h-4 w-4" />
                Criar primeira iniciativa
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}
