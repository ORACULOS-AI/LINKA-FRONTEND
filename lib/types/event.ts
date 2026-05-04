export type EventStatus = 'ATIVO' | 'PAUSADO' | 'CONCLUIDO' | 'CANCELADO'

export interface Event {
  uid: string
  nome: string
  titulo: string
  descricao: string
  data: string
  data_evento: string
  local: string
  localizacao: string
  status: EventStatus
  iniciativa_id: string
  uid_admin: string
  created_at: string
  updated_at: string
}

export interface EventsData {
  ativos: Event[]
  concluidos: Event[]
  cancelados: Event[]
  all: Event[]
} 