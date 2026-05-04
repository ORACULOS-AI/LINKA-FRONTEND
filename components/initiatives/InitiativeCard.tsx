import {
  IniciativaBase,
  StatusIniciativa,
  StatusVinculo,
  NivelMaturidade,
  TipoIniciativa,
} from '@/lib/types/initiativeTypes'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { 
  Users, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Heart,
  HeartIcon,
  Globe,
  DollarSign,
  Lightbulb,
  Target,
  Award,
  Building,
  Beaker,
  Briefcase,
  GraduationCap,
  Rocket,
  UserCheck,
  Calendar,
  ArrowRight,
  Zap,
  TrendingUp,
  Star,
  Clock
} from 'lucide-react'
import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { motion } from 'framer-motion'

interface InitiativeCardProps {
  initiative: IniciativaBase
  onClick?: () => void
  showActions?: boolean
  onEdit?: () => void
  onDelete?: () => void
  onFavorite?: () => void
  onUnfavorite?: () => void
  isFavorited?: boolean
  currentUserId?: string
}

const statusColors = {
  [StatusIniciativa.ATIVA]: 'bg-green-100 text-green-800 border-green-200',
  [StatusIniciativa.PAUSADA]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  [StatusIniciativa.CONCLUIDA]: 'bg-blue-100 text-blue-800 border-blue-200',
  [StatusIniciativa.CANCELADA]: 'bg-red-100 text-red-800 border-red-200',
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
    [TipoIniciativa.EMPREENDEDORISMO]: { bg: 'bg-gradient-to-r from-green-500 to-green-600', text: 'Empreendedorismo', icon: '��' },
    [TipoIniciativa.EXTENSAO]: { bg: 'bg-gradient-to-r from-blue-500 to-blue-600', text: 'Extensão', icon: '🤝' },
    [TipoIniciativa.DESENVOLVIMENTO]: { bg: 'bg-gradient-to-r from-orange-500 to-orange-600', text: 'Desenvolvimento', icon: '🏗️' },
    [TipoIniciativa.CONSULTORIA]: { bg: 'bg-gradient-to-r from-teal-500 to-teal-600', text: 'Consultoria', icon: '💼' },
    [TipoIniciativa.OUTROS]: { bg: 'bg-gradient-to-r from-gray-500 to-gray-600', text: 'Outros', icon: '📋' }
  }
  
  const typeConfig = config[tipo] || { bg: 'bg-gradient-to-r from-gray-500 to-gray-600', text: tipo, icon: '💡' }
  
  return (
    <div className={`${typeConfig.bg} text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-lg`}>
      <span>{typeConfig.icon}</span>
      {typeConfig.text}
    </div>
  )
}

export function InitiativeCard({
  initiative,
  onClick,
  showActions = false,
  onEdit,
  onDelete,
  onFavorite,
  onUnfavorite,
  isFavorited = false,
  currentUserId,
}: InitiativeCardProps) {
  const getStatusColor = (
    status: StatusIniciativa,
  ): 'default' | 'destructive' | 'outline' | 'secondary' => {
    switch (status) {
      case StatusIniciativa.ATIVA:
        return 'default'
      case StatusIniciativa.PAUSADA:
        return 'secondary'
      case StatusIniciativa.CONCLUIDA:
        return 'outline'
      case StatusIniciativa.CANCELADA:
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  // Filtrar apenas participantes ativos para exibição pública
  const activeParticipants = initiative.participantes?.filter(
    (p) => p.status_vinculo === StatusVinculo.ACEITO,
  ) || []

  const handleClick = (e: React.MouseEvent) => {
    // Se clicar nos botões de ação, não navega
    if ((e.target as HTMLElement).closest('.action-buttons')) {
      e.stopPropagation()
      return
    }
    onClick?.()
  }

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isFavorited) {
      onUnfavorite?.()
    } else {
      onFavorite?.()
    }
  }

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.005 }}
      transition={{ duration: 0.2 }}
      className="group"
    >
    <Card
        className="relative overflow-hidden bg-white border border-gray-200 hover:border-purple-300 hover:shadow-xl transition-all duration-300 cursor-pointer"
      onClick={handleClick}
    >
        {/* Purple accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-violet-500 to-purple-600" />
        
        {/* Content */}
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white shadow-lg">
                  {getTypeIcon(initiative.tipo)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-gray-900 leading-tight mb-1">
                    {initiative.titulo}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Badge className={`text-xs px-2 py-1 ${getMaturityColor(initiative.nivel_maturidade)}`}>
              {initiative.nivel_maturidade}
            </Badge>
                    <Badge variant="outline" className={`text-xs px-2 py-1 ${statusColors[initiative.status]}`}>
                      {initiative.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Type Badge */}
            <div className="flex-shrink-0 ml-4">
              {getTypeBadge(initiative.tipo)}
            </div>
          </div>

          {/* Description */}
          <div className="mb-4">
            <p className="text-gray-700 line-clamp-2 leading-relaxed">
              {initiative.descricao}
            </p>
          </div>
          
          {/* Impact & Target - Horizontal Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {initiative.impacto_esperado && (
              <div className="flex items-start gap-2">
                <Target className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-green-700 mb-1">Impacto Esperado</p>
                  <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
                    {initiative.impacto_esperado.slice(0, 100)}...
                  </p>
                </div>
              </div>
            )}
            
            {initiative.publico_alvo && (
              <div className="flex items-start gap-2">
                <Users className="h-4 w-4 text-blue-500 mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-blue-700 mb-1">Público-alvo</p>
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {initiative.publico_alvo}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Keywords & Technologies */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {initiative.palavras_chave?.slice(0, 4).map((keyword, index) => (
                <span 
                  key={index} 
                  className="px-2 py-1 bg-purple-50 text-purple-700 rounded-md text-xs font-medium"
                >
                  {keyword}
                </span>
              ))}
              {initiative.tecnologias_utilizadas?.slice(0, 3).map((tech, index) => (
                <span 
                  key={index} 
                  className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium"
                >
                  {tech}
                </span>
              ))}
              {((initiative.palavras_chave?.length || 0) + (initiative.tecnologias_utilizadas?.length || 0)) > 7 && (
                <span className="px-2 py-1 bg-gray-50 text-gray-600 rounded-md text-xs font-medium">
                  +{((initiative.palavras_chave?.length || 0) + (initiative.tecnologias_utilizadas?.length || 0)) - 7}
                </span>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center gap-4">
              {/* Collaboration Indicators */}
              <div className="flex items-center gap-2">
              {initiative.aceita_colaboradores && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <UserCheck className="h-4 w-4 text-green-500" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Aceita colaboradores</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              
              {initiative.colaboracao_internacional && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Globe className="h-4 w-4 text-blue-500" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Colaboração internacional</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              
              {initiative.tem_propriedade_intelectual && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Award className="h-4 w-4 text-yellow-500" />
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Propriedade intelectual</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>

              {/* Participants */}
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-500">
                  {activeParticipants.length} participantes
                </span>
              </div>

              {/* Date */}
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-500">
                  {format(new Date(initiative.data_inicio), 'MMM yyyy', { locale: ptBR })}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Favorites Only */}
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-500" />
                <span className="text-sm text-gray-500">{initiative.favoritos?.length || 0}</span>
              </div>

              {/* Favorite Button */}
              {currentUserId && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleFavorite}
                  className="action-buttons h-8 w-8"
                >
                  {isFavorited ? (
                    <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                  ) : (
                    <HeartIcon className="h-4 w-4 text-gray-400 hover:text-red-500" />
                  )}
                </Button>
              )}
              
              {/* Actions Menu */}
            {showActions && (
              <div className="action-buttons">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        onEdit?.()
                      }}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete?.()
                      }}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
            </div>
          </div>
        </div>

        {/* Hover Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </Card>
    </motion.div>
  )
}
