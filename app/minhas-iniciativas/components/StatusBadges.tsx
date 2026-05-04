import { Badge } from '@/components/ui/badge'
import { 
  StatusIniciativa, 
  TipoIniciativa 
} from '@/lib/types/initiativeTypes'

export const getStatusBadge = (status: StatusIniciativa) => {
  const statusConfig = {
    [StatusIniciativa.PENDENTE]: {
      className: 'bg-yellow-100 text-yellow-800',
      text: 'Pendente de Aprovação',
    },
    [StatusIniciativa.ATIVA]: {
      className: 'bg-green-100 text-green-800',
      text: 'Ativa',
    },
    [StatusIniciativa.RECUSADA]: {
      className: 'bg-red-100 text-red-800',
      text: 'Recusada',
    },
    [StatusIniciativa.PAUSADA]: {
      className: 'bg-orange-100 text-orange-800',
      text: 'Pausada',
    },
    [StatusIniciativa.CONCLUIDA]: {
      className: 'bg-blue-100 text-blue-800',
      text: 'Concluída',
    },
    [StatusIniciativa.CANCELADA]: {
      className: 'bg-gray-100 text-gray-800',
      text: 'Cancelada',
    },
  }

  const config = statusConfig[status] || {
    className: 'bg-gray-100 text-gray-800',
    text: 'Desconhecido',
  }

  return (
    <Badge className={config.className} variant="outline">
      {config.text}
    </Badge>
  )
}

export const getTipoIniciativaBadge = (tipo: TipoIniciativa) => {
  const tipoConfig = {
    [TipoIniciativa.PROJETO]: {
      className: 'bg-blue-100 text-blue-800',
      text: 'Projeto',
    },
    [TipoIniciativa.STARTUP]: {
      className: 'bg-purple-100 text-purple-800',
      text: 'Startup',
    },
    [TipoIniciativa.PESQUISA]: {
      className: 'bg-cyan-100 text-cyan-800',
      text: 'Pesquisa',
    },
    [TipoIniciativa.EXTENSAO]: {
      className: 'bg-indigo-100 text-indigo-800',
      text: 'Extensão',
    },
    [TipoIniciativa.EVENTO]: {
      className: 'bg-pink-100 text-pink-800',
      text: 'Evento',
    },
  }

  const config = tipoConfig[tipo] || {
    className: 'bg-gray-100 text-gray-800',
    text: tipo,
  }

  return (
    <Badge className={config.className} variant="outline">
      {config.text}
    </Badge>
  )
} 