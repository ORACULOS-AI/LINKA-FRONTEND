import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useApi } from '@/lib/hooks/useApi'

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1'

// ---------------------------------------------------------------------------
// Tipagens básicas (poderão ser movidas para lib/types posteriormente)
// ---------------------------------------------------------------------------
export interface Thread {
  id: string
  participantes: string[]
  last_message?: string
  last_message_at?: string
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  thread_id: string
  remetente_id: string
  conteudo: string
  created_at: string
  updated_at: string
}

export interface ThreadCreatePayload {
  participantes: string[]
  mensagem_inicial: string
}

export interface MessageCreatePayload {
  conteudo: string
}

// Estrutura de resposta da API backend
interface PaginatedThreads {
  threads: Thread[]
  next?: string
}

interface PaginatedMessages {
  messages: Message[]
  next?: string
}

// ---------------------------------------------------------------------------
// Hook factory
// ---------------------------------------------------------------------------
export const useMessagesApi = () => {
  const { fetchWithToken } = useApi()
  const queryClient = useQueryClient()

  // --------------------------- Threads -----------------------------------
  const createThread = async (payload: ThreadCreatePayload): Promise<Thread> => {
    const response = await fetchWithToken(`${API_BASE_URL}/messages/threads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new Error(data?.detail || 'Erro ao criar thread')
    }
    return data.data as Thread
  }

  const listThreads = async (
    pageParam?: string,
    limit = 20,
  ): Promise<PaginatedThreads> => {
    let url = `${API_BASE_URL}/messages/threads?limit=${limit}`
    if (pageParam) {
      url += `&last_key=${encodeURIComponent(pageParam)}`
    }
    const response = await fetchWithToken(url, { method: 'GET' })
    const data = await response.json()
    return data.data as PaginatedThreads
  }

  // -------------------------- Mensagens ----------------------------------
  const sendMessage = async (
    threadId: string,
    payload: MessageCreatePayload,
  ): Promise<Message> => {
    const response = await fetchWithToken(
      `${API_BASE_URL}/messages/threads/${threadId}/messages`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
    )
    const data = await response.json()
    return data.data as Message
  }

  const listMessages = async (
    threadId: string,
    pageParam?: string,
    limit = 50,
  ): Promise<PaginatedMessages> => {
    let url = `${API_BASE_URL}/messages/threads/${threadId}/messages?limit=${limit}`
    if (pageParam) {
      url += `&last_key=${encodeURIComponent(pageParam)}`
    }
    const response = await fetchWithToken(url, { method: 'GET' })
    const data = await response.json()
    return data.data as PaginatedMessages
  }

  // --------------------------- React-Query hooks -------------------------
  const useCreateThread = () =>
    useMutation({
      mutationFn: createThread,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['threads'] })
      },
    })

  const useThreads = (limit = 20) =>
    useInfiniteQuery({
      queryKey: ['threads'],
      queryFn: ({ pageParam }) => listThreads(pageParam as string | undefined, limit),
      getNextPageParam: (lastPage: PaginatedThreads) => lastPage.next ?? undefined,
      initialPageParam: undefined as string | undefined,
    })

  const useSendMessage = (threadId: string) =>
    useMutation({
      mutationFn: (payload: MessageCreatePayload) => sendMessage(threadId, payload),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['messages', threadId] })
        queryClient.invalidateQueries({ queryKey: ['threads'] })
      },
    })

  const useMessages = (threadId: string, limit = 50) =>
    useInfiniteQuery({
      queryKey: ['messages', threadId],
      queryFn: ({ pageParam }) =>
        listMessages(threadId, pageParam as string | undefined, limit),
      getNextPageParam: (lastPage: PaginatedMessages) => lastPage.next ?? undefined,
      initialPageParam: undefined as string | undefined,
    })

  return {
    useCreateThread,
    useThreads,
    useSendMessage,
    useMessages,
  }
} 