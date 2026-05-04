export enum NegocioType {
  PRE_INCUBADO = 'PRE_INCUBADO',
  INCUBADO = 'INCUBADO',
  PARCEIRO = 'PARCEIRO',
}

export enum CategoriaNegocio {
  STARTUP = 'STARTUP',
  EMPRESA_JUNIOR = 'EMPRESA_JUNIOR',
  SPIN_OFF = 'SPIN_OFF',
  OUTRO = 'OUTRO',
}

export enum PapelNegocio {
  ADMIN = 'ADMIN',
  COORDENADOR = 'COORDENADOR',
  PESQUISADOR = 'PESQUISADOR',
  DESENVOLVEDOR = 'DESENVOLVEDOR',
  MEMBRO = 'MEMBRO',
}

export enum StatusVinculoNegocio {
  PENDENTE = 'PENDENTE',
  ACEITO = 'ACEITO',
  RECUSADO = 'RECUSADO',
}

export enum StatusNegocio {
  PENDENTE = 'pendente',
  APROVADO = 'aprovado',
  RECUSADO = 'recusado',
  INATIVO = 'inativo',
}

export enum AreaAtuacao {
  SAUDE = 'SAUDE',
  EDUCACAO = 'EDUCACAO',
  TECNOLOGIA = 'TECNOLOGIA',
  SUSTENTABILIDADE = 'SUSTENTABILIDADE',
  FINANCAS = 'FINANCAS',
  SERVICOS = 'SERVICOS',
  VAREJO = 'VAREJO',
  INDUSTRIA = 'INDUSTRIA',
  OUTRO = 'OUTRO',
}

export enum EstagioNegocio {
  IDEACAO = 'IDEACAO',
  VALIDACAO = 'VALIDACAO',
  MVP = 'MVP',
  OPERACAO = 'OPERACAO',
  CRESCIMENTO = 'CRESCIMENTO',
  ESCALA = 'ESCALA',
}

export interface MembroNegocio {
  uid: string
  papel: PapelNegocio
  status: StatusVinculoNegocio
  data_vinculo: string
  data_ultima_atualizacao: string
}

export interface ParticipanteNegocio {
  uid: string
  papel: PapelNegocio
  status: StatusVinculoNegocio
  data_vinculo: string
  data_ultima_atualizacao: string
}

export interface User {
  uid: string
  nome: string
  email: string
}

export interface NegocioBase {
  id?: string
  nome: string
  email: string
  telefone: string
  tipo_negocio: NegocioType
  categoria: CategoriaNegocio
  descricao: string
  area_atuacao: AreaAtuacao
  estagio: EstagioNegocio
  palavras_chave: string[]
  uid_admin: string

  // Campos opcionais - mantidos para retrocompatibilidade
  descricao_problema?: string
  solucao_proposta?: string
  website?: string
  cnpj?: string
  razao_social?: string
  cnae?: string
  modelo_negocio?: string
  diferencial?: string
  publico_alvo?: string
  midias_sociais?: Record<string, string>

  // Campos de mídia
  foto_perfil?: string
  foto_capa?: string

  // Campos de controle
  status?: StatusNegocio
  visivel?: boolean
  claimed?: boolean
  data_cadastro?: string

  // Relacionamentos
  membros?: Record<string, MembroNegocio>
  id_iniciativas?: string[]
}

export interface NegocioCreate extends Omit<NegocioBase, 'id' | 'status' | 'visivel' | 'data_cadastro' | 'membros' | 'id_iniciativas'> {
  tipo_negocio: NegocioType
}

export interface NegocioUpdate extends Partial<NegocioBase> {
  tipo_negocio?: NegocioType
}

export interface NegocioResponse extends Required<NegocioBase> {
  id: string
  status: StatusNegocio
  visivel: boolean
  data_cadastro: string
  uid_admin: string
  membros: Record<string, MembroNegocio>
  id_iniciativas: string[]
}

export type BusinessesByAdminResponse = {
  all: NegocioResponse[]
  aprovados: NegocioResponse[]
  recusados: NegocioResponse[]
  pendentes: NegocioResponse[]
}

export type BusinessStatus = StatusNegocio
