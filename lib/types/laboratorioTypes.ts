export enum StatusLaboratorio {
  ATIVO = 'ATIVO',
  INATIVO = 'INATIVO',
  MANUTENCAO = 'MANUTENCAO',
}

export enum TipoLaboratorio {
  PESQUISA = 'PESQUISA',
  ENSINO = 'ENSINO',
  EXTENSAO = 'EXTENSAO',
  DESENVOLVIMENTO = 'DESENVOLVIMENTO',
  MULTIDISCIPLINAR = 'MULTIDISCIPLINAR',
}

export interface LaboratorioBase {
  uid?: string
  nome: string
  unidade: string
  responsavel: string
  telefone: string
  email: string
  tipo: TipoLaboratorio
  status: StatusLaboratorio
  uid_admin: string

  // Campos opcionais
  subunidade?: string
  endereco?: string
  campus?: string
  sala?: string
  descricao?: string
  areas_pesquisa?: string[]
  equipamentos?: string[]
  website?: string
  redes_sociais?: Record<string, string>
  pesquisadores?: string[]
  projetos?: string[]
  laboratorios?: string[]

  // Campos de controle
  visivel?: boolean
  claimed?: boolean
  created_at?: string
  updated_at?: string
}

export interface LaboratorioCreate extends Omit<LaboratorioBase, 'uid' | 'uid_admin' | 'created_at' | 'updated_at' | 'pesquisadores' | 'projetos' | 'laboratorios'> {
  // uid, uid_admin, timestamps e arrays são gerados automaticamente
}

export interface LaboratorioUpdate extends Partial<Omit<LaboratorioBase, 'uid' | 'uid_admin' | 'created_at' | 'updated_at'>> {
  // Permite atualização parcial dos campos
}

export interface LaboratorioResponse extends LaboratorioBase {
  uid: string
  created_at: string
  updated_at: string
}

export interface LaboratorioSummary {
  uid: string
  nome: string
  unidade: string
  responsavel: string
  tipo: TipoLaboratorio
  status: StatusLaboratorio
  campus?: string
  areas_pesquisa?: string[]
  created_at: string
}

export interface LaboratorioStats {
  total_laboratorios: number
  por_tipo: Record<string, number>
  por_status: Record<string, number>
  por_unidade: Record<string, number>
  por_campus: Record<string, number>
}

export interface LaboratorioFilter {
  unidade?: string
  campus?: string
  tipo?: TipoLaboratorio
  status?: StatusLaboratorio
  area_pesquisa?: string
  responsavel?: string
  visivel?: boolean
}
