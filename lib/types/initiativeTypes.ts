export enum TipoIniciativa {
  PESQUISA = 'PESQUISA',
  INOVACAO = 'INOVACAO',
  EMPREENDEDORISMO = 'EMPREENDEDORISMO',
  EXTENSAO = 'EXTENSAO',
  DESENVOLVIMENTO = 'DESENVOLVIMENTO',
  CONSULTORIA = 'CONSULTORIA',
  OUTROS = 'OUTROS',
}

export enum NivelMaturidade {
  CONCEITO = 'CONCEITO',
  PROTOTIPO = 'PROTOTIPO',
  DEMONSTRACAO = 'DEMONSTRACAO',
  COMERCIALIZACAO = 'COMERCIALIZACAO',
}

export enum StatusIniciativa {
  PENDENTE = 'PENDENTE',
  ATIVA = 'ATIVA',
  PAUSADA = 'PAUSADA',
  CONCLUIDA = 'CONCLUIDA',
  CANCELADA = 'CANCELADA',
  RECUSADA = 'RECUSADA',
}

export enum PublicStatusIniciativa {
  ATIVA = 'ATIVA',
  PAUSADA = 'PAUSADA',
  CONCLUIDA = 'CONCLUIDA',
}

export enum StatusVinculo {
  PENDENTE = 'PENDENTE',
  ACEITO = 'ACEITO',
  RECUSADO = 'RECUSADO',
}

export enum PapelIniciativa {
  COORDENADOR = 'COORDENADOR',
  MEMBRO = 'MEMBRO',
  COLABORADOR = 'COLABORADOR',
  CONSULTOR = 'CONSULTOR',
}

export enum TipoNotificacao {
  CONVITE_INICIATIVA = 'CONVITE_INICIATIVA',
  APROVACAO_INICIATIVA = 'APROVACAO_INICIATIVA',
  REJEICAO_INICIATIVA = 'REJEICAO_INICIATIVA',
  NOVA_INICIATIVA = 'NOVA_INICIATIVA',
  ATUALIZACAO_INICIATIVA = 'ATUALIZACAO_INICIATIVA',
}

export interface MembroIniciativa {
  user_id: string
  papel: PapelIniciativa
  status: StatusVinculo
  data_vinculo: string
}

export interface Participante {
  uid: string
  papel: PapelIniciativa
  status_vinculo: StatusVinculo
  data_inicio: string
  data_fim?: string
  dedicacao_horas?: number
  data_ultima_atualizacao: string
}

export interface IniciativaBase {
  id: any
  created_at: number
  uid: string
  titulo: string
  descricao: string
  tipo: TipoIniciativa
  status: StatusIniciativa
  data_inicio: string
  data_fim?: string
  visivel: boolean
  business_id?: string
  
  // Campos para vitrine tecnológica
  nivel_maturidade: NivelMaturidade
  areas_conhecimento: string[]
  tecnologias_utilizadas: string[]
  ods_relacionados: string[]
  
  // Campos de impacto e métricas
  impacto_esperado?: string
  metricas_sucesso: string[]
  publico_alvo?: string
  
  // Campos financeiros
  orcamento_previsto?: number
  moeda: string
  fonte_financiamento?: string
  
  // Campos de propriedade intelectual
  tem_propriedade_intelectual: boolean
  tipo_propriedade?: string
  
  // Campos de colaboração
  aceita_colaboradores: boolean
  colaboracao_internacional: boolean
  
  // Campos existentes
  participantes: Participante[]
  seguidores: string[]
  favoritos: string[]
  recursos_necessarios?: string
  resultados_esperados?: string
  laboratorios?: string[]
  palavras_chave?: string[]
  data_cadastro: string
  data_ultima_atualizacao: string
  uid_owner: string
}

export interface IniciativaCreate {
  titulo: string
  descricao: string
  tipo: TipoIniciativa
  data_inicio: string
  data_fim?: string
  business_id: string
  
  // Campos obrigatórios
  nivel_maturidade?: NivelMaturidade
  areas_conhecimento?: string[]
  tecnologias_utilizadas?: string[]
  ods_relacionados?: string[]
  
  // Campos opcionais
  impacto_esperado?: string
  metricas_sucesso?: string[]
  publico_alvo?: string
  orcamento_previsto?: number
  moeda?: string
  fonte_financiamento?: string
  tem_propriedade_intelectual?: boolean
  tipo_propriedade?: string
  aceita_colaboradores?: boolean
  colaboracao_internacional?: boolean
  
  // Campos existentes
  visivel?: boolean
  laboratorios?: string[]
  palavras_chave?: string[]
  recursos_necessarios?: string
  resultados_esperados?: string
}

export interface IniciativaUpdate {
  titulo?: string
  descricao?: string
  status?: StatusIniciativa
  tipo?: TipoIniciativa
  visivel?: boolean
  data_inicio?: string
  data_fim?: string
  business_id?: string
  
  // Campos para atualização
  nivel_maturidade?: NivelMaturidade
  areas_conhecimento?: string[]
  tecnologias_utilizadas?: string[]
  ods_relacionados?: string[]
  impacto_esperado?: string
  metricas_sucesso?: string[]
  publico_alvo?: string
  orcamento_previsto?: number
  moeda?: string
  fonte_financiamento?: string
  tem_propriedade_intelectual?: boolean
  tipo_propriedade?: string
  aceita_colaboradores?: boolean
  colaboracao_internacional?: boolean
  
  // Campos existentes
  laboratorios?: string[]
  palavras_chave?: string[]
  recursos_necessarios?: string
  resultados_esperados?: string
}

export interface IniciativaResponse {
  data: IniciativaBase
  message: string
}

export interface IniciativasResponse {
  data: IniciativaBase[]
  message: string
}

export interface IniciativasByStatus {
  pendentes: IniciativaBase[]
  ativas: IniciativaBase[]
  recusadas: IniciativaBase[]
}
