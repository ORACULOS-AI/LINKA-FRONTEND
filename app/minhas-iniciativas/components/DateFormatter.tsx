import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { IniciativaBase } from '@/lib/types/initiativeTypes'

export const formatDate = (
  initiative: IniciativaBase | undefined, 
  field: 'data_cadastro' | 'data_ultima_atualizacao'
): string => {
  if (!initiative || !initiative[field]) {
    return 'Data não disponível'
  }

  try {
    return format(new Date(initiative[field]), "dd/MM/yyyy 'às' HH:mm", {
      locale: ptBR,
    })
  } catch (error) {
    return 'Data inválida'
  }
} 