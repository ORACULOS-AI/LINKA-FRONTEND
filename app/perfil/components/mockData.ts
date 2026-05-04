export enum UserType {
  ESTUDANTE = 'estudante',
  ADMIN = 'admin',
  PESQUISADOR = 'pesquisador',
  EXTERNO = 'externo',
}

export interface UserBase {
  uid: string
  nome: string
  email: string
  tipo_usuario: UserType
  data_cadastro: string
  telefone?: string
}

export interface Pesquisador extends UserBase {
  lattes: string
  redes_sociais?: Record<string, string>
  palavras_chave: string[]
  campus: string
}

export interface Estudante extends UserBase {
  curso: string
  campus: string
}

export interface Externo extends UserBase {
  empresa?: string
  cargo?: string
}

export interface Admin extends UserBase {}

export type User = Pesquisador | Estudante | Externo | Admin

export const mockUsers: Record<UserType, User> = {
  [UserType.PESQUISADOR]: {
    uid: '123123',
    nome: 'João Ícaro Moreira Loiola',
    email: 'joaoicaro@ufc.br',
    tipo_usuario: UserType.PESQUISADOR,
    data_cadastro: '2024-01-10T00:00:00',
    telefone: '(85) 98765-4321',
    lattes: 'http://lattes.cnpq.br/1234567890',
    redes_sociais: {
      linkedin: 'https://www.linkedin.com/in/joaoicaro',
    },
    palavras_chave: ['Computação', 'Inteligência Artificial', 'Educação'],
    campus: 'Campus do Pici (Fortaleza)',
  },
  [UserType.ESTUDANTE]: {
    uid: '789012',
    nome: 'Maria Silva',
    email: 'maria.silva@estudante.ufc.br',
    tipo_usuario: UserType.ESTUDANTE,
    data_cadastro: '2024-01-15T14:45:00',
    telefone: '(85) 91234-5678',
    curso: 'Ciência da Computação',
    campus: 'Campus do Pici (Fortaleza)',
  },
  [UserType.EXTERNO]: {
    uid: '345678',
    nome: 'Carlos Santos',
    email: 'carlos.santos@empresa.com',
    tipo_usuario: UserType.EXTERNO,
    data_cadastro: '2024-01-12T09:15:00',
    telefone: '(85) 97654-3210',
    empresa: 'Tech Solutions Ltda.',
    cargo: 'Gerente de Inovação',
  },
  [UserType.ADMIN]: {
    uid: '901234',
    nome: 'Ana Costa',
    email: 'ana.costa@admin.ufc.br',
    tipo_usuario: UserType.ADMIN,
    data_cadastro: '2024-01-01T00:00:00',
    telefone: '(85) 98888-7777',
  },
}
