import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useApi } from '@/lib/hooks/useApi'
import type {
  LaboratorioCreate,
  LaboratorioUpdate,
  LaboratorioResponse,
  LaboratorioSummary,
  LaboratorioStats,
  LaboratorioFilter,
} from '../types/laboratorioTypes'
import { toast } from '@/hooks/use-toast'

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1'

// Nova função para fetching no lado do servidor (sem hooks)
export const fetchPublicLaboratoriosForServer = async (
  filters: LaboratorioFilter = {}
): Promise<LaboratorioResponse[] | null> => {
  const API_BASE_URL_LOCAL =
    process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1'

  try {
    // Construir query string com filtros
    const queryParams = new URLSearchParams()

    if (filters.unidade) queryParams.append('unidade', filters.unidade)
    if (filters.campus) queryParams.append('campus', filters.campus)
    if (filters.tipo) queryParams.append('tipo', filters.tipo)
    if (filters.status) queryParams.append('status', filters.status)
    if (filters.area_pesquisa) queryParams.append('area_pesquisa', filters.area_pesquisa)
    if (filters.responsavel) queryParams.append('responsavel', filters.responsavel)
    if (filters.visivel !== undefined) queryParams.append('visivel', filters.visivel.toString())

    const queryString = queryParams.toString()
    const url = `${API_BASE_URL_LOCAL}/laboratorios/${queryString ? `?${queryString}` : ''}`
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId);

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data.data as LaboratorioResponse[]
  } catch (error) {
    // Handle timeout/abort errors gracefully during build
    if (error instanceof Error && error.name === 'AbortError') {
      // Server-side fetch timed out, fall back to client-side loading
    } else {
      // Server fetch failed silently
    }
    return null
  }
}

export const useLaboratorioApi = () => {
  const { fetchWithToken } = useApi()
  const queryClient = useQueryClient()

  const createLaboratorio = async (
    laboratorioData: LaboratorioCreate,
  ): Promise<LaboratorioResponse> => {
    const response = await fetchWithToken(`${API_BASE_URL}/laboratorios/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(laboratorioData),
    })
    return await response.json()
  }

  const getLaboratorioById = async (
    laboratorioId: string,
  ): Promise<LaboratorioResponse> => {
    const response = await fetchWithToken(
      `${API_BASE_URL}/laboratorios/${laboratorioId}`,
      {
        requireAuth: false,
      },
    )
    const data = await response.json()
    return data.data
  }

  const listLaboratorios = async (
    filters: LaboratorioFilter = {},
  ): Promise<LaboratorioResponse[]> => {
    // Construir query string com filtros
    const queryParams = new URLSearchParams()

    if (filters.unidade) queryParams.append('unidade', filters.unidade)
    if (filters.campus) queryParams.append('campus', filters.campus)
    if (filters.tipo) queryParams.append('tipo', filters.tipo)
    if (filters.status) queryParams.append('status', filters.status)
    if (filters.area_pesquisa) queryParams.append('area_pesquisa', filters.area_pesquisa)
    if (filters.responsavel) queryParams.append('responsavel', filters.responsavel)
    if (filters.visivel !== undefined) queryParams.append('visivel', filters.visivel.toString())

    const queryString = queryParams.toString()
    const url = `${API_BASE_URL}/laboratorios/${queryString ? `?${queryString}` : ''}`

    const response = await fetchWithToken(url, {
      requireAuth: false,
    })
    const data = await response.json()
    return data.data
  }

  const updateLaboratorio = async ({
    laboratorioId,
    updateData,
  }: {
    laboratorioId: string
    updateData: LaboratorioUpdate
  }): Promise<LaboratorioResponse> => {
    const response = await fetchWithToken(
      `${API_BASE_URL}/laboratorios/${laboratorioId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      },
    )
    return await response.json()
  }

  const updateLaboratorioFotos = async ({
    laboratorioId,
    fotoPerfil,
    fotoCapa,
  }: {
    laboratorioId: string
    fotoPerfil?: File
    fotoCapa?: File
  }): Promise<LaboratorioResponse> => {
    const formData = new FormData()
    if (fotoPerfil) formData.append('foto_perfil', fotoPerfil)
    if (fotoCapa) formData.append('foto_capa', fotoCapa)

    const response = await fetchWithToken(
      `${API_BASE_URL}/laboratorios/${laboratorioId}/fotos`,
      {
        method: 'PUT',
        body: formData,
        // Não definir Content-Type, o browser define automaticamente para multipart/form-data
      },
    )
    const data = await response.json()
    return data.data
  }

  const deleteLaboratorio = async (laboratorioId: string): Promise<void> => {
    await fetchWithToken(`${API_BASE_URL}/laboratorios/${laboratorioId}`, {
      method: 'DELETE',
    })
  }

  const getUserLaboratorios = async (): Promise<LaboratorioSummary[]> => {
    const response = await fetchWithToken(`${API_BASE_URL}/laboratorios/me`, {
      requireAuth: true,
    })
    const data = await response.json()
    return data.data
  }

  const getAllLaboratoriosByAdmin = async (): Promise<{
    pendentes: LaboratorioSummary[]
    aprovados: LaboratorioSummary[]
    recusados: LaboratorioSummary[]
  }> => {
    const response = await fetchWithToken(`${API_BASE_URL}/laboratorios/admin/all`, {
      requireAuth: true,
    })
    const data = await response.json()
    return data.data
  }

  const getLaboratoriosStats = async (): Promise<LaboratorioStats> => {
    const response = await fetchWithToken(`${API_BASE_URL}/laboratorios/stats`, {
      requireAuth: false,
    })
    const data = await response.json()
    return data.data
  }

  const addPesquisadorToLaboratorio = async ({
    laboratorioId,
    pesquisadorId,
  }: {
    laboratorioId: string
    pesquisadorId: string
  }): Promise<LaboratorioResponse> => {
    const response = await fetchWithToken(
      `${API_BASE_URL}/laboratorios/${laboratorioId}/pesquisadores/${pesquisadorId}`,
      {
        method: 'POST',
      },
    )
    return await response.json()
  }

  const removePesquisadorFromLaboratorio = async ({
    laboratorioId,
    pesquisadorId,
  }: {
    laboratorioId: string
    pesquisadorId: string
  }): Promise<LaboratorioResponse> => {
    const response = await fetchWithToken(
      `${API_BASE_URL}/laboratorios/${laboratorioId}/pesquisadores/${pesquisadorId}`,
      {
        method: 'DELETE',
      },
    )
    return await response.json()
  }

  // React Query Hooks
  const useCreateLaboratorio = () => {
    return useMutation({
      mutationFn: createLaboratorio,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['laboratorios'] })
        queryClient.invalidateQueries({ queryKey: ['user-laboratorios'] })
        toast({
          title: 'Sucesso',
          description: 'Laboratório criado com sucesso',
        })
      },
      onError: (error: any) => {
        toast({
          title: 'Erro',
          description: error?.message || 'Erro ao criar laboratório',
          variant: 'destructive',
        })
      },
    })
  }

  const useGetLaboratorio = (laboratorioId: string) => {
    return useQuery({
      queryKey: ['laboratorio', laboratorioId],
      queryFn: () => getLaboratorioById(laboratorioId),
      enabled: !!laboratorioId,
    })
  }

  const useListLaboratorios = (
    filters: LaboratorioFilter = {},
    requireAuth: boolean = false,
  ) => {
    return useQuery({
      queryKey: ['laboratorios', filters],
      queryFn: () => listLaboratorios(filters),
      staleTime: 5 * 60 * 1000, // 5 minutes
    })
  }

  const useUpdateLaboratorio = () => {
    return useMutation({
      mutationFn: updateLaboratorio,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ['laboratorios'] })
        queryClient.invalidateQueries({ queryKey: ['laboratorio', data.uid] })
        queryClient.invalidateQueries({ queryKey: ['user-laboratorios'] })
        toast({
          title: 'Sucesso',
          description: 'Laboratório atualizado com sucesso',
        })
      },
      onError: (error: any) => {
        toast({
          title: 'Erro',
          description: error?.message || 'Erro ao atualizar laboratório',
          variant: 'destructive',
        })
      },
    })
  }

  const useUpdateLaboratorioFotos = () => {
    return useMutation({
      mutationFn: updateLaboratorioFotos,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ['laboratorio', data.uid] })
        toast({
          title: 'Sucesso',
          description: 'Fotos atualizadas com sucesso',
        })
      },
      onError: (error: any) => {
        toast({
          title: 'Erro',
          description: error?.message || 'Erro ao atualizar fotos',
          variant: 'destructive',
        })
      },
    })
  }

  const useDeleteLaboratorio = () => {
    return useMutation({
      mutationFn: deleteLaboratorio,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['laboratorios'] })
        queryClient.invalidateQueries({ queryKey: ['user-laboratorios'] })
        toast({
          title: 'Sucesso',
          description: 'Laboratório excluído com sucesso',
        })
      },
      onError: (error: any) => {
        toast({
          title: 'Erro',
          description: error?.message || 'Erro ao excluir laboratório',
          variant: 'destructive',
        })
      },
    })
  }

  const useGetUserLaboratorios = () => {
    return useQuery({
      queryKey: ['user-laboratorios'],
      queryFn: getUserLaboratorios,
    })
  }

  const useGetLaboratoriosByAdmin = () => {
    return useQuery({
      queryKey: ['laboratorios-admin-all'],
      queryFn: getAllLaboratoriosByAdmin,
      staleTime: 2 * 60 * 1000, // 2 minutes
    })
  }

  const useGetLaboratoriosStats = () => {
    return useQuery({
      queryKey: ['laboratorios-stats'],
      queryFn: getLaboratoriosStats,
      staleTime: 10 * 60 * 1000, // 10 minutes
    })
  }

  const useAddPesquisadorToLaboratorio = () => {
    return useMutation({
      mutationFn: addPesquisadorToLaboratorio,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ['laboratorio', data.uid] })
        toast({
          title: 'Sucesso',
          description: 'Pesquisador adicionado ao laboratório',
        })
      },
      onError: (error: any) => {
        toast({
          title: 'Erro',
          description: error?.message || 'Erro ao adicionar pesquisador',
          variant: 'destructive',
        })
      },
    })
  }

  const useRemovePesquisadorFromLaboratorio = () => {
    return useMutation({
      mutationFn: removePesquisadorFromLaboratorio,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ['laboratorio', data.uid] })
        toast({
          title: 'Sucesso',
          description: 'Pesquisador removido do laboratório',
        })
      },
      onError: (error: any) => {
        toast({
          title: 'Erro',
          description: error?.message || 'Erro ao remover pesquisador',
          variant: 'destructive',
        })
      },
    })
  }

  const useApproveLaboratorio = () => {
    return useMutation({
      mutationFn: async (laboratorioId: string) => {
        const response = await fetchWithToken(
          `${API_BASE_URL}/laboratorios/${laboratorioId}/approve`,
          {
            method: 'PUT',
          }
        )
        return await response.json()
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['laboratorios-admin-all'] })
        queryClient.invalidateQueries({ queryKey: ['laboratorios'] })
        toast({
          title: 'Sucesso',
          description: 'Laboratório aprovado com sucesso',
        })
      },
      onError: (error: any) => {
        toast({
          title: 'Erro',
          description: error?.message || 'Erro ao aprovar laboratório',
          variant: 'destructive',
        })
      },
    })
  }

  const useRejectLaboratorio = () => {
    return useMutation({
      mutationFn: async (laboratorioId: string) => {
        const response = await fetchWithToken(
          `${API_BASE_URL}/laboratorios/${laboratorioId}/reject`,
          {
            method: 'PUT',
          }
        )
        return await response.json()
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['laboratorios-admin-all'] })
        queryClient.invalidateQueries({ queryKey: ['laboratorios'] })
        toast({
          title: 'Laboratório recusado',
          description: 'O laboratório foi recusado',
        })
      },
      onError: (error: any) => {
        toast({
          title: 'Erro',
          description: error?.message || 'Erro ao recusar laboratório',
          variant: 'destructive',
        })
      },
    })
  }

  return {
    useCreateLaboratorio,
    useGetLaboratorio,
    useListLaboratorios,
    useUpdateLaboratorio,
    useUpdateLaboratorioFotos,
    useDeleteLaboratorio,
    useGetUserLaboratorios,
    useGetLaboratoriosByAdmin,
    useGetLaboratoriosStats,
    useAddPesquisadorToLaboratorio,
    useRemovePesquisadorFromLaboratorio,
    useApproveLaboratorio,
    useRejectLaboratorio,
  }
}
