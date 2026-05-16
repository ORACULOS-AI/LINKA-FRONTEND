import { toast as sonner, type ExternalToast } from 'sonner'

type ToastOpts = ExternalToast & { duration?: number }

export const toast = {
  success(message: string, opts?: ToastOpts) {
    return sonner.success(message, { duration: 3000, ...opts })
  },
  error(message: string, opts?: ToastOpts) {
    return sonner.error(message, { duration: 5000, ...opts })
  },
  info(message: string, opts?: ToastOpts) {
    return sonner(message, { duration: 3000, ...opts })
  },
  loading(message: string, opts?: ToastOpts) {
    return sonner.loading(message, opts)
  },
  dismiss(id?: string | number) {
    sonner.dismiss(id)
  },
  promise: sonner.promise,
}

const ERROR_CODE_MAP: Record<string, string> = {
  INVALID_ENUM: 'Valor inválido. Atualize a página e tente novamente.',
  NOT_MUTUAL_FOLLOW: 'Vocês precisam se seguir mutuamente para conversar.',
  RATE_LIMITED: 'Muitas tentativas. Aguarde um momento.',
  UNAUTHENTICATED: 'Sua sessão expirou. Entre novamente.',
  FORBIDDEN: 'Você não tem permissão para isso.',
  NOT_FOUND: 'Não encontrado.',
  CONFLICT: 'Operação já realizada.',
}

type ApiError = {
  response?: { data?: { detail?: { code?: string; message?: string } | string } }
  message?: string
}

export function toastApiError(err: unknown, fallback = 'Algo deu errado. Tente novamente.') {
  const e = err as ApiError
  const detail = e?.response?.data?.detail
  if (detail) {
    if (typeof detail === 'string') return toast.error(detail)
    if (detail.code) {
      const mapped = ERROR_CODE_MAP[detail.code]
      if (mapped) return toast.error(mapped)
    }
    if (detail.message) return toast.error(detail.message)
  }
  return toast.error(fallback)
}
