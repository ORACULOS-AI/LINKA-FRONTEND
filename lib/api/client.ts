import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'

// Todas as chamadas vão pelo BFF Next (route handlers em app/api/*) — cookie httpOnly
// fica no domínio do frontend. baseURL vazio = mesma origem.
export const api = axios.create({
  baseURL: '',
  withCredentials: true,
  timeout: 15_000,
  headers: {
    'X-Linka-Client': 'web',
  },
})

let refreshPromise: Promise<void> | null = null

async function refreshSession(): Promise<void> {
  if (!refreshPromise) {
    refreshPromise = api
      .post('/api/auth/refresh', null, { _skipAuthRefresh: true } as never)
      .then(() => undefined)
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const original = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean; _skipAuthRefresh?: boolean })
      | undefined

    if (!original || original._skipAuthRefresh || original._retry) {
      return Promise.reject(error)
    }

    if (error.response?.status === 401) {
      original._retry = true
      try {
        await refreshSession()
        return api(original)
      } catch {
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/entrar')) {
          window.location.href = '/entrar'
        }
      }
    }

    return Promise.reject(error)
  },
)

export type Me = {
  id: string
  nome: string
  email: string
  tipo: 'pesquisador' | 'estudante' | 'tecnico_admin' | 'externo'
  avatar_url?: string | null
  verificado: boolean
  onboarding_complete: boolean
  is_admin: boolean
}

export async function fetchMe(): Promise<Me> {
  const { data } = await api.get<Me>('/api/auth/me')
  return data
}

export async function logout(): Promise<void> {
  await api.post('/api/auth/logout')
}
