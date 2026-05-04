/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useApi } from '@/lib/hooks/useApi'
import {
  IniciativaCreate,
  IniciativaUpdate,
  IniciativaResponse,
  PapelIniciativa,
  TipoNotificacao,
  IniciativaBase as Initiative,
  TipoIniciativa as InitiativeType,
  StatusIniciativa as InitiativeStatus,
  PublicStatusIniciativa,
} from '../types/initiativeTypes'
import { toast } from '@/hooks/use-toast'

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1'

export const useInitiativesApi = () => {
  const { fetchWithToken } = useApi()
  const queryClient = useQueryClient()

  const createInitiative = async (
    initiativeData: IniciativaCreate,
  ): Promise<Initiative> => {
    const response = await fetchWithToken(`${API_BASE_URL}/initiatives/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(initiativeData),
    })
    const data = await response.json()
    return data.data
  }

  const getInitiativeById = async (
    initiativeId: string,
  ): Promise<Initiative> => {
    const response = await fetchWithToken(
      `${API_BASE_URL}/initiatives/${initiativeId}`,
      {
        requireAuth: false,
      },
    )
    const data = await response.json()
    return data.data
  }

  const listInitiatives = async (
    businessId?: string,
    type?: InitiativeType,
    status?: InitiativeStatus | PublicStatusIniciativa,
  ): Promise<Initiative[]> => {
    const params = new URLSearchParams()
    if (businessId) params.append('business_id', businessId)
    if (type) params.append('tipo', type)
    if (status) params.append('status', status)

    const response = await fetchWithToken(
      `${API_BASE_URL}/initiatives/?${params.toString()}`,
      {
        requireAuth: false,
      },
    )
    const data = await response.json()
    return data.data
  }

  const getUserInitiatives = async (): Promise<Initiative[]> => {
    const response = await fetchWithToken(`${API_BASE_URL}/initiatives/me`, {
      requireAuth: true,
    })
    const data = await response.json()
    return data.data
  }

  const getUserInitiativesById = async (userId: string): Promise<Initiative[]> => {
    const response = await fetchWithToken(`${API_BASE_URL}/initiatives/user/${userId}`, {
      requireAuth: false,
    })
    const data = await response.json()
    return data.data
  }

  const updateInitiative = async ({
    initiativeId,
    updateData,
  }: {
    initiativeId: string
    updateData: IniciativaUpdate
  }): Promise<Initiative> => {
    const response = await fetchWithToken(
      `${API_BASE_URL}/initiatives/${initiativeId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      },
    )
    const data = await response.json()
    return data.data
  }

  const inviteMember = async (
    initiativeId: string,
    userId: string,
    papel: PapelIniciativa = PapelIniciativa.MEMBRO,
  ): Promise<void> => {
    await fetchWithToken(
      `${API_BASE_URL}/initiatives/${initiativeId}/invite/${userId}/${papel}`,
      {
        method: 'POST',
      },
    )
  }

  const rejectInvite = async (
    initiativeId: string,
    userId: string,
  ): Promise<void> => {
    await fetchWithToken(
      `${API_BASE_URL}/initiatives/${initiativeId}/reject-invite`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId }),
      },
    )
  }

  const acceptInvite = async (initiativeId: string): Promise<void> => {
    await fetchWithToken(
      `${API_BASE_URL}/initiatives/${initiativeId}/accept-invite`,
      {
        method: 'POST',
      },
    )
  }

  const removeParticipant = async (
    initiativeId: string,
    userId: string,
  ): Promise<void> => {
    await fetchWithToken(
      `${API_BASE_URL}/initiatives/${initiativeId}/remove-participant/${userId}`,
      {
        method: 'DELETE',
      },
    )
  }

  const cancelInvite = async (
    initiativeId: string,
    userId: string,
  ): Promise<void> => {
    await fetchWithToken(
      `${API_BASE_URL}/initiatives/${initiativeId}/cancel-invite/${userId}`,
      {
        method: 'POST',
      },
    )
  }

  const followInitiative = async (initiativeId: string): Promise<void> => {
    await fetchWithToken(`${API_BASE_URL}/initiatives/${initiativeId}/follow`, {
      method: 'POST',
    })
  }

  const unfollowInitiative = async (initiativeId: string): Promise<void> => {
    await fetchWithToken(`${API_BASE_URL}/initiatives/${initiativeId}/follow`, {
      method: 'DELETE',
    })
  }

  const getInitiativesByBusiness = async (
    businessId: string,
  ): Promise<Initiative[]> => {
    const response = await fetchWithToken(
      `${API_BASE_URL}/initiatives/business/${businessId}`,
      {
        requireAuth: false,
      },
    )
    const data = await response.json()
    return data.data
  }

  const addInitiativeMember = async ({
    initiativeId,
    userId,
    papel,
  }: {
    initiativeId: string
    userId: string
    papel: PapelIniciativa
  }): Promise<IniciativaResponse> => {
    const response = await fetchWithToken(
      `${API_BASE_URL}/initiatives/${initiativeId}/members/${userId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ papel }),
      },
    )
    const data = await response.json()
    return data
  }

  const acceptInitiativeInvite = async ({
    initiativeId,
    userId,
  }: {
    initiativeId: string
    userId: string
  }): Promise<IniciativaResponse> => {
    const response = await fetchWithToken(
      `${API_BASE_URL}/initiatives/${initiativeId}/members/${userId}/accept`,
      {
        method: 'PUT',
      },
    )
    const data = await response.json()
    return data
  }

  const rejectInitiativeInvite = async ({
    initiativeId,
    userId,
  }: {
    initiativeId: string
    userId: string
  }): Promise<IniciativaResponse> => {
    const response = await fetchWithToken(
      `${API_BASE_URL}/initiatives/${initiativeId}/members/${userId}/reject`,
      {
        method: 'PUT',
      },
    )
    const data = await response.json()
    return data
  }

  const removeInitiativeMember = async ({
    initiativeId,
    userId,
  }: {
    initiativeId: string
    userId: string
  }): Promise<IniciativaResponse> => {
    const response = await fetchWithToken(
      `${API_BASE_URL}/initiatives/${initiativeId}/members/${userId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tipo: TipoNotificacao.REJEICAO_INICIATIVA }),
      },
    )
    const data = await response.json()
    return data
  }

  // Métodos administrativos
  const getInitiativesByAdmin = async (): Promise<any> => {
    const response = await fetchWithToken(
      `${API_BASE_URL}/initiatives/admin/`,
      {
        requireAuth: true,
      },
    )
    const data = await response.json()
    return data.data
  }

  const approveInitiative = async (initiativeId: string): Promise<any> => {
    const response = await fetchWithToken(
      `${API_BASE_URL}/initiatives/admin/${initiativeId}/approve`,
      {
        method: 'PUT',
        requireAuth: true,
      },
    )
    const data = await response.json()
    return data.data
  }

  const rejectInitiative = async (payload: {
    initiativeId: string
    motivo: string
  }): Promise<any> => {
    const response = await fetchWithToken(
      `${API_BASE_URL}/initiatives/admin/${payload.initiativeId}/reject`,
      {
        method: 'PUT',
        requireAuth: true,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ motivo_rejeicao: payload.motivo }),
      },
    )
    const data = await response.json()
    return data.data
  }

  const deleteInitiative = async (initiativeId: string): Promise<void> => {
    await fetchWithToken(`${API_BASE_URL}/initiatives/${initiativeId}`, {
      method: 'DELETE',
    })
  }

  const favoriteInitiative = async (initiativeId: string): Promise<void> => {
    await fetchWithToken(`${API_BASE_URL}/initiatives/${initiativeId}/favorite`, {
      method: 'POST',
    })
  }

  const unfavoriteInitiative = async (initiativeId: string): Promise<void> => {
    await fetchWithToken(`${API_BASE_URL}/initiatives/${initiativeId}/favorite`, {
      method: 'DELETE',
    })
  }

  const getUserFavoriteInitiatives = async (): Promise<Initiative[]> => {
    const response = await fetchWithToken(`${API_BASE_URL}/initiatives/favorites`, {
      requireAuth: true,
    })
    const data = await response.json()
    return data.data
  }

  const getInitiativesByMaturity = async (nivel: string): Promise<Initiative[]> => {
    const response = await fetchWithToken(`${API_BASE_URL}/initiatives/by-maturity/${nivel}`, {
      requireAuth: false,
    })
    const data = await response.json()
    return data.data
  }

  const getInitiativesAcceptingCollaborators = async (): Promise<Initiative[]> => {
    const response = await fetchWithToken(`${API_BASE_URL}/initiatives/accepting-collaborators`, {
      requireAuth: false,
    })
    const data = await response.json()
    return data.data
  }

  const useCreateInitiative = () =>
    useMutation({
      mutationFn: createInitiative,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['initiatives'] })
        toast({
          title: 'Sucesso!',
          description: 'Iniciativa criada com sucesso',
        })
      },
      onError: (error: Error) => {
        toast({
          title: 'Erro ao criar iniciativa',
          description: error.message || 'Tente novamente mais tarde',
          variant: 'destructive',
        })
      },
    })

  const useGetInitiativeById = (initiativeId: string) =>
    useQuery({
      queryKey: ['initiative', initiativeId],
      queryFn: () => getInitiativeById(initiativeId),
      retry: false,
    })

  const useListInitiatives = (
    businessId?: string,
    type?: InitiativeType,
    status?: InitiativeStatus | PublicStatusIniciativa,
    enabled: boolean = true,
  ) =>
    useQuery({
      queryKey: ['initiatives', businessId, type, status],
      queryFn: () => listInitiatives(businessId, type, status),
      enabled,
      retry: false,
    })

  const useGetUserInitiatives = (enabled: boolean = true) =>
    useQuery({
      queryKey: ['userInitiatives'],
      queryFn: getUserInitiatives,
      enabled,
      retry: false,
    })

  const useUpdateInitiative = () =>
    useMutation({
      mutationFn: updateInitiative,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ['initiative', data.id] })
        queryClient.invalidateQueries({ queryKey: ['initiatives'] })
        queryClient.invalidateQueries({ queryKey: ['userInitiatives'] })
        toast({
          title: 'Iniciativa atualizada com sucesso',
          duration: 5000,
        })
      },
      onError: (error: Error) => {
        toast({
          title: 'Erro ao atualizar iniciativa',
          description: error.message || 'Tente novamente mais tarde',
          variant: 'destructive',
        })
      },
    })

  const useDeleteInitiative = () =>
    useMutation({
      mutationFn: deleteInitiative,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['initiatives'] })
        queryClient.invalidateQueries({ queryKey: ['userInitiatives'] })
        toast({
          title: 'Sucesso',
          description: 'Iniciativa excluída com sucesso.',
        })
      },
      onError: (error: any) => {
        toast({
          title: 'Erro',
          description: error.message || 'Erro ao excluir iniciativa.',
          variant: 'destructive',
        })
      },
    })

  const useFavoriteInitiative = () =>
    useMutation({
      mutationFn: favoriteInitiative,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['initiatives'] })
        queryClient.invalidateQueries({ queryKey: ['favoriteInitiatives'] })
        toast({
          title: 'Sucesso',
          description: 'Iniciativa favoritada com sucesso.',
        })
      },
      onError: (error: any) => {
        toast({
          title: 'Erro',
          description: error.message || 'Erro ao favoritar iniciativa.',
          variant: 'destructive',
        })
      },
    })

  const useUnfavoriteInitiative = () =>
    useMutation({
      mutationFn: unfavoriteInitiative,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['initiatives'] })
        queryClient.invalidateQueries({ queryKey: ['favoriteInitiatives'] })
        toast({
          title: 'Sucesso',
          description: 'Favorito removido com sucesso.',
        })
      },
      onError: (error: any) => {
        toast({
          title: 'Erro',
          description: error.message || 'Erro ao remover favorito.',
          variant: 'destructive',
        })
      },
    })

  const useGetUserFavoriteInitiatives = (enabled: boolean = true) =>
    useQuery({
      queryKey: ['favoriteInitiatives'],
      queryFn: getUserFavoriteInitiatives,
      enabled,
    })

  const useInviteMember = () =>
    useMutation({
      mutationFn: ({
        initiativeId,
        userId,
        papel = PapelIniciativa.MEMBRO,
      }: {
        initiativeId: string
        userId: string
        papel?: PapelIniciativa
      }) => inviteMember(initiativeId, userId, papel),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['initiative'] })
        toast({
          title: 'Convite enviado com sucesso',
          duration: 5000,
        })
      },
      onError: (error: Error | { message?: string }) => {
        toast({
          title: 'Erro ao enviar convite',
          description: error?.message || 'Tente novamente mais tarde',
          variant: 'destructive',
          duration: 5000,
        })
      },
    })

  const useRejectInvite = () =>
    useMutation({
      mutationFn: ({
        initiativeId,
        userId,
      }: {
        initiativeId: string
        userId: string
      }) => rejectInvite(initiativeId, userId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['initiative'] })
        toast({
          title: 'Sucesso!',
          description: 'Participante removido com sucesso',
        })
      },
      onError: (error: Error) => {
        toast({
          title: 'Erro ao remover participante',
          description: error.message || 'Tente novamente mais tarde',
          variant: 'destructive',
        })
      },
    })

  const useCancelInvite = () =>
    useMutation({
      mutationFn: ({
        initiativeId,
        userId,
      }: {
        initiativeId: string
        userId: string
      }) => cancelInvite(initiativeId, userId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['initiative'] })
        toast({
          title: 'Sucesso!',
          description: 'Convite cancelado com sucesso',
        })
      },
      onError: (error: Error) => {
        toast({
          title: 'Erro ao cancelar convite',
          description: error.message || 'Tente novamente mais tarde',
          variant: 'destructive',
        })
      },
    })

  const useAcceptInvite = () =>
    useMutation({
      mutationFn: (initiativeId: string) => acceptInvite(initiativeId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['initiative'] })
        toast({
          title: 'Sucesso!',
          description: 'Convite aceito com sucesso',
        })
      },
      onError: (error: Error) => {
        toast({
          title: 'Erro ao aceitar convite',
          description: error.message || 'Tente novamente mais tarde',
          variant: 'destructive',
        })
      },
    })

  const useRemoveParticipant = () =>
    useMutation({
      mutationFn: ({
        initiativeId,
        userId,
      }: {
        initiativeId: string
        userId: string
      }) => removeParticipant(initiativeId, userId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['initiative'] })
        toast({
          title: 'Sucesso!',
          description: 'Participante removido com sucesso',
        })
      },
      onError: (error: Error) => {
        toast({
          title: 'Erro ao remover participante',
          description: error.message || 'Tente novamente mais tarde',
          variant: 'destructive',
        })
      },
    })

  const useFollowInitiative = () =>
    useMutation({
      mutationFn: (initiativeId: string) => followInitiative(initiativeId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['initiative'] })
        toast({
          title: 'Sucesso!',
          description: 'Agora você está seguindo esta iniciativa',
        })
      },
      onError: (error: Error) => {
        toast({
          title: 'Erro ao seguir iniciativa',
          description: error.message || 'Tente novamente mais tarde',
          variant: 'destructive',
        })
      },
    })

  const useUnfollowInitiative = () =>
    useMutation({
      mutationFn: (initiativeId: string) => unfollowInitiative(initiativeId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['initiative'] })
        toast({
          title: 'Sucesso!',
          description: 'Você deixou de seguir esta iniciativa',
        })
      },
      onError: (error: Error) => {
        toast({
          title: 'Erro ao deixar de seguir iniciativa',
          description: error.message || 'Tente novamente mais tarde',
          variant: 'destructive',
        })
      },
    })

  const useGetInitiativesByBusiness = (
    businessId: string,
    enabled: boolean = true,
  ) =>
    useQuery({
      queryKey: ['initiatives', 'business', businessId],
      queryFn: () => getInitiativesByBusiness(businessId),
      enabled,
      retry: false,
    })

  const useAddInitiativeMember = () =>
    useMutation({
      mutationFn: addInitiativeMember,
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: ['initiative', data.data.id],
        })

        toast({
          title: 'Convite enviado',
          description: 'O convite foi enviado com sucesso.',
        })
      },
      onError: (error: Error) => {
        toast({
          title: 'Erro ao enviar convite',
          description:
            error.message ||
            'Não foi possível enviar o convite. Tente novamente.',
          variant: 'destructive',
        })
      },
    })

  const useAcceptInitiativeInvite = () =>
    useMutation({
      mutationFn: acceptInitiativeInvite,
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: ['initiative', data.data.id],
        })
        queryClient.invalidateQueries({ queryKey: ['user-initiatives'] })

        toast({
          title: 'Convite aceito',
          description: 'Você agora é membro desta iniciativa.',
        })
      },
      onError: (error: Error) => {
        toast({
          title: 'Erro ao aceitar convite',
          description:
            error.message ||
            'Não foi possível aceitar o convite. Tente novamente.',
          variant: 'destructive',
        })
      },
    })

  const useRejectInitiativeInvite = () =>
    useMutation({
      mutationFn: rejectInitiativeInvite,
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: ['initiative', data.data.id],
        })

        toast({
          title: 'Convite recusado',
          description: 'O convite foi recusado com sucesso.',
        })
      },
      onError: (error: Error) => {
        toast({
          title: 'Erro ao recusar convite',
          description:
            error.message ||
            'Não foi possível recusar o convite. Tente novamente.',
          variant: 'destructive',
        })
      },
    })

  const useRemoveInitiativeMember = () =>
    useMutation({
      mutationFn: removeInitiativeMember,
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: ['initiative', data.data.id],
        })
        queryClient.invalidateQueries({ queryKey: ['user-initiatives'] })

        toast({
          title: 'Membro removido',
          description: 'O membro foi removido com sucesso da iniciativa.',
        })
      },
      onError: (error: Error) => {
        toast({
          title: 'Erro ao remover membro',
          description:
            error.message ||
            'Não foi possível remover o membro. Tente novamente.',
          variant: 'destructive',
        })
      },
    })

  // Hooks administrativos
  const useGetInitiativesByAdmin = () =>
    useQuery({
      queryKey: ['initiatives-admin'],
      queryFn: getInitiativesByAdmin,
      retry: false,
    })

  const useApproveInitiative = () =>
    useMutation({
      mutationFn: approveInitiative,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['initiatives-admin'] })
        toast({
          title: 'Iniciativa aprovada com sucesso',
          variant: 'success',
        })
      },
      onError: () => {
        toast({
          title: 'Erro ao aprovar iniciativa',
          description: 'Tente novamente mais tarde',
          variant: 'destructive',
        })
      },
    })

  const useRejectInitiative = () =>
    useMutation({
      mutationFn: rejectInitiative,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['initiatives-admin'] })
        toast({
          title: 'Iniciativa rejeitada com sucesso',
          variant: 'success',
        })
      },
      onError: () => {
        toast({
          title: 'Erro ao rejeitar iniciativa',
          description: 'Tente novamente mais tarde',
          variant: 'destructive',
        })
      },
    })

  const useGetInitiativesByMaturity = (nivel: string, enabled: boolean = true) =>
    useQuery({
      queryKey: ['initiatives', 'maturity', nivel],
      queryFn: () => getInitiativesByMaturity(nivel),
      enabled: enabled && !!nivel,
    })

  const useGetInitiativesAcceptingCollaborators = (enabled: boolean = true) =>
    useQuery({
      queryKey: ['initiatives', 'accepting-collaborators'],
      queryFn: getInitiativesAcceptingCollaborators,
      enabled,
    })

  const useGetUserInitiativesById = (userId: string) => {
    // useGetUserInitiativesById
    return useQuery({
      queryKey: ['userInitiativesById', userId],
      queryFn: () => getUserInitiativesById(userId),
      enabled: !!userId && userId.trim() !== '', // Melhor validação
      retry: false,
    })
  }

  return {
    useCreateInitiative,
    useGetInitiativeById,
    useListInitiatives,
    useGetUserInitiatives,
    useUpdateInitiative,
    useDeleteInitiative,
    useFavoriteInitiative,
    useUnfavoriteInitiative,
    useGetUserFavoriteInitiatives,
    useInviteMember,
    useRejectInvite,
    useCancelInvite,
    useAcceptInvite,
    useRemoveParticipant,
    useFollowInitiative,
    useUnfollowInitiative,
    useGetInitiativesByBusiness,
    useAddInitiativeMember,
    useAcceptInitiativeInvite,
    useRejectInitiativeInvite,
    useRemoveInitiativeMember,
    useGetInitiativesByAdmin,
    useApproveInitiative,
    useRejectInitiative,
    useGetInitiativesByMaturity,
    useGetInitiativesAcceptingCollaborators,
    useGetUserInitiativesById,
  }
}
