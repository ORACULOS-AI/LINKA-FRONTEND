// Enums para Status de Eventos
export enum EventStatus {
  RASCUNHO = 'rascunho',
  PENDENTE_APROVACAO = 'pendente_aprovacao',
  ATIVO = 'ativo',
  CANCELADO = 'cancelado',
  CONCLUIDO = 'concluido'
}

// Enums para Categorias de Eventos
export enum EventCategoria {
  WORKSHOP = 'workshop',
  PALESTRA = 'palestra',
  CONFERENCIA = 'conferencia',
  HACKATHON = 'hackathon',
  NETWORKING = 'networking',
  CURSO = 'curso',
  SEMINARIO = 'seminario',
  MESA_REDONDA = 'mesa_redonda',
  OUTRO = 'outro'
}

// Enums para Status de Participantes
export enum ParticipanteStatus {
  INSCRITO = 'inscrito',
  CONFIRMADO = 'confirmado',
  CHECK_IN = 'check_in',
  PRESENTE = 'presente',
  AUSENTE = 'ausente',
  CANCELADO = 'cancelado'
}

// Labels traduzidos para exibição
export const EventStatusLabels: Record<EventStatus, string> = {
  [EventStatus.RASCUNHO]: 'Rascunho',
  [EventStatus.PENDENTE_APROVACAO]: 'Pendente Aprovação',
  [EventStatus.ATIVO]: 'Ativo',
  [EventStatus.CANCELADO]: 'Cancelado',
  [EventStatus.CONCLUIDO]: 'Concluído'
}

export const EventCategoriaLabels: Record<EventCategoria, string> = {
  [EventCategoria.WORKSHOP]: 'Workshop',
  [EventCategoria.PALESTRA]: 'Palestra',
  [EventCategoria.CONFERENCIA]: 'Conferência',
  [EventCategoria.HACKATHON]: 'Hackathon',
  [EventCategoria.NETWORKING]: 'Networking',
  [EventCategoria.CURSO]: 'Curso',
  [EventCategoria.SEMINARIO]: 'Seminário',
  [EventCategoria.MESA_REDONDA]: 'Mesa Redonda',
  [EventCategoria.OUTRO]: 'Outro'
}

export const ParticipanteStatusLabels: Record<ParticipanteStatus, string> = {
  [ParticipanteStatus.INSCRITO]: 'Inscrito',
  [ParticipanteStatus.CONFIRMADO]: 'Confirmado',
  [ParticipanteStatus.CHECK_IN]: 'Check-in Realizado',
  [ParticipanteStatus.PRESENTE]: 'Presente',
  [ParticipanteStatus.AUSENTE]: 'Ausente',
  [ParticipanteStatus.CANCELADO]: 'Cancelado'
}

// Cores para status badges
export const EventStatusColors: Record<EventStatus, string> = {
  [EventStatus.RASCUNHO]: 'bg-gray-100 text-gray-800 border-gray-300',
  [EventStatus.PENDENTE_APROVACAO]: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  [EventStatus.ATIVO]: 'bg-green-100 text-green-800 border-green-300',
  [EventStatus.CANCELADO]: 'bg-red-100 text-red-800 border-red-300',
  [EventStatus.CONCLUIDO]: 'bg-blue-100 text-blue-800 border-blue-300'
}

export const ParticipanteStatusColors: Record<ParticipanteStatus, string> = {
  [ParticipanteStatus.INSCRITO]: 'bg-blue-100 text-blue-800 border-blue-300',
  [ParticipanteStatus.CONFIRMADO]: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  [ParticipanteStatus.CHECK_IN]: 'bg-purple-100 text-purple-800 border-purple-300',
  [ParticipanteStatus.PRESENTE]: 'bg-green-100 text-green-800 border-green-300',
  [ParticipanteStatus.AUSENTE]: 'bg-red-100 text-red-800 border-red-300',
  [ParticipanteStatus.CANCELADO]: 'bg-gray-100 text-gray-800 border-gray-300'
}

// Interface para Participante
export interface Participante {
  uid: string
  event_id: string
  uid_usuario: string
  nome: string
  email: string
  status: ParticipanteStatus
  data_inscricao: string
  data_check_in?: string
  data_presenca_validada?: string
  certificado_url?: string
  created_at: string
  updated_at: string
}

// Interface para Evento (Response completo)
export interface Event {
  uid: string
  titulo: string
  descricao: string
  data_inicio: string
  data_fim: string
  local: string
  categoria: EventCategoria
  status: EventStatus

  // Organização
  uid_owner: string
  business_id?: string
  iniciativa_id?: string

  // Capacidade e participantes
  capacidade_maxima?: number
  total_participantes: number
  total_presentes: number
  total_certificados: number

  // Online
  is_online: boolean
  link_online?: string

  // Mídia
  logo_url?: string
  imagem_capa?: string
  fotos: string[]

  // Metadados
  tags: string[]
  requisitos?: string
  carga_horaria?: number

  // Auditoria
  created_at: string
  updated_at: string
  deleted_at?: string
}

// Interface para Evento Resumido (Listagem)
export interface EventListItem {
  uid: string
  titulo: string
  descricao: string
  data_inicio: string
  data_fim: string
  local: string
  categoria: EventCategoria
  status: EventStatus
  uid_owner: string

  total_participantes: number
  capacidade_maxima?: number

  is_online: boolean
  logo_url?: string
  imagem_capa?: string
  tags: string[]

  created_at: string
}

// Interface para Criação de Evento
export interface EventCreate {
  titulo: string
  descricao: string
  data_inicio: string  // ISO format
  data_fim: string     // ISO format
  local: string
  categoria: EventCategoria
  status?: EventStatus

  business_id?: string
  iniciativa_id?: string
  capacidade_maxima?: number

  is_online: boolean
  link_online?: string

  logo_url?: string
  imagem_capa?: string
  fotos?: string[]

  tags?: string[]
  requisitos?: string
  carga_horaria?: number
}

// Interface para Atualização de Evento
export interface EventUpdate {
  titulo?: string
  descricao?: string
  data_inicio?: string
  data_fim?: string
  local?: string
  categoria?: EventCategoria
  status?: EventStatus

  business_id?: string
  iniciativa_id?: string
  capacidade_maxima?: number

  is_online?: boolean
  link_online?: string

  logo_url?: string
  imagem_capa?: string
  fotos?: string[]

  tags?: string[]
  requisitos?: string
  carga_horaria?: number
}

// Interface para Filtros de Busca
export interface EventSearchFilters {
  q?: string  // Busca textual
  status?: EventStatus
  categoria?: EventCategoria
  business_id?: string
  iniciativa_id?: string
  uid_owner?: string

  // Filtros de data
  data_inicio_min?: string
  data_inicio_max?: string

  // Filtros booleanos
  is_online?: boolean
  apenas_com_vagas?: boolean

  // Busca por tags
  tags?: string[]

  // Paginação
  limit?: number
  offset?: number
}

// Interface para Estatísticas do Evento
export interface EventStats {
  total_inscritos: number
  total_confirmados: number
  total_check_ins: number
  total_presentes: number
  total_ausentes: number
  total_cancelados: number
  total_certificados_emitidos: number
  taxa_presenca: number  // Percentual
  taxa_conversao: number // Percentual
}

// Interface para Validação em Lote de Presenças
export interface BulkPresenceValidation {
  participantes: string[]  // Array de UIDs de usuários
  status: ParticipanteStatus
}

// Interface para Resposta da API (Padrão do backend)
export interface ApiResponse<T> {
  status: 'success' | 'error'
  message?: string
  data: T
}

// Tipos auxiliares para forms
export interface EventFormData extends Omit<EventCreate, 'data_inicio' | 'data_fim'> {
  data_inicio: Date
  data_fim: Date
}

// Tipo para resultado de operação em lote
export interface BulkOperationResult {
  success_count: number
  failed_count: number
  failed_users?: string[]
  errors?: Array<{
    participant_id: string
    error: string
  }>
}

// Tipo para certificado
export interface CertificateData {
  certificado_url: string
}

// Helper types
export type EventWithParticipants = Event & {
  participantes?: Participante[]
}

export type EventCardProps = {
  event: Event | EventListItem
  onEdit?: (event: Event | EventListItem) => void
  onDelete?: (eventId: string) => void
  onParticipate?: (eventId: string) => void
  onCancel?: (eventId: string) => void
  showActions?: boolean
  isOwner?: boolean
  isParticipating?: boolean
}

// Exportar tipos auxiliares de filtros
export interface EventFiltersState {
  searchQuery: string
  selectedStatus: EventStatus | 'all'
  selectedCategoria: EventCategoria | 'all'
  isOnlineOnly: boolean
  onlyWithVacancies: boolean
  selectedTags: string[]
  sortBy: 'data_inicio' | 'created_at' | 'titulo'
  sortOrder: 'asc' | 'desc'
}

// Estado inicial para filtros
export const initialEventFilters: EventFiltersState = {
  searchQuery: '',
  selectedStatus: 'all',
  selectedCategoria: 'all',
  isOnlineOnly: false,
  onlyWithVacancies: false,
  selectedTags: [],
  sortBy: 'data_inicio',
  sortOrder: 'asc'
}

// Helpers para validação
export const isEventActive = (event: Event | EventListItem): boolean => {
  return event.status === EventStatus.ATIVO
}

export const isEventFull = (event: Event | EventListItem): boolean => {
  if (!event.capacidade_maxima) return false
  return event.total_participantes >= event.capacidade_maxima
}

export const hasVacancies = (event: Event | EventListItem): boolean => {
  if (!event.capacidade_maxima) return true
  return event.total_participantes < event.capacidade_maxima
}

export const canParticipate = (event: Event | EventListItem): boolean => {
  return isEventActive(event) && hasVacancies(event)
}

export const canEdit = (event: Event, userId: string): boolean => {
  return event.uid_owner === userId && event.status !== EventStatus.CONCLUIDO
}

export const canDelete = (event: Event, userId: string): boolean => {
  return event.uid_owner === userId &&
         event.status !== EventStatus.CONCLUIDO &&
         event.total_participantes === 0
}

export const canPublish = (event: Event): boolean => {
  return event.status === EventStatus.RASCUNHO
}

export const canCancel = (event: Event): boolean => {
  return event.status === EventStatus.ATIVO
}

export const canConclude = (event: Event): boolean => {
  return event.status === EventStatus.ATIVO &&
         new Date(event.data_fim) < new Date()
}

// Helper para formatar data
export const formatEventDate = (dateString: string): string => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

export const formatEventDateRange = (start: string, end: string): string => {
  const startDate = new Date(start)
  const endDate = new Date(end)

  const sameDay = startDate.toDateString() === endDate.toDateString()

  if (sameDay) {
    return `${new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(startDate)} • ${new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(startDate)} - ${new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(endDate)}`
  }

  return `${formatEventDate(start)} - ${formatEventDate(end)}`
}

// Helper para calcular vagas restantes
export const getVacanciesText = (event: Event | EventListItem): string => {
  if (!event.capacidade_maxima) return 'Vagas ilimitadas'

  const remaining = event.capacidade_maxima - event.total_participantes
  if (remaining <= 0) return 'Lotado'
  if (remaining === 1) return '1 vaga restante'
  return `${remaining} vagas restantes`
}

// Manter retrocompatibilidade com nomes antigos
export type EventBase = Event
export type EventResponse = Event
