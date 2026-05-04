export enum NotificationType {
  CONVITE_INICIATIVA = 'CONVITE_INICIATIVA',
  CONVITE_NEGOCIO = 'CONVITE_NEGOCIO',
  CONVITE_ACEITO = 'CONVITE_ACEITO',
  CONVITE_RECUSADO = 'CONVITE_RECUSADO',
  NOVO_SEGUIDOR = 'NOVO_SEGUIDOR',
  REMOCAO_INICIATIVA = 'REMOCAO_INICIATIVA',
  REMOCAO_NEGOCIO = 'REMOCAO_NEGOCIO',
  NOVO_MEMBRO = 'NOVO_MEMBRO',
  INICIATIVA_APROVADA = 'INICIATIVA_APROVADA',
  INICIATIVA_RECUSADA = 'INICIATIVA_RECUSADA',
  NEGOCIO_APROVADO = 'NEGOCIO_APROVADO',
  NEGOCIO_RECUSADO = 'NEGOCIO_RECUSADO',
  CONVITE_CONEXAO = 'CONVITE_CONEXAO',
  CONEXAO_ACEITA = 'CONEXAO_ACEITA',
  CONEXAO_RECUSADA = 'CONEXAO_RECUSADA',
}

export enum NotificationStatus {
  UNREAD = 'unread',
  READ = 'read',
}

export interface Notification {
  id: string
  user_id: string
  tipo: NotificationType
  titulo: string
  mensagem: string
  data?: Record<string, unknown>
  lida: boolean
  data_leitura?: string
  created_at: string
  updated_at: string
  tipo_resposta?: string
}

export interface NotificationCreate {
  user_id: string
  tipo: NotificationType
  titulo: string
  mensagem: string
  data?: Record<string, unknown>
}

export interface NotificationUpdate {
  titulo?: string
  mensagem?: string
  tipo?: NotificationType
  data?: Record<string, unknown>
  lida?: boolean
  data_leitura?: string
} 