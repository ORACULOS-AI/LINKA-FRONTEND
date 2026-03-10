/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { UserType, UserCreateData, UserWithType } from '../types/userTypes'
import { useApi } from '../hooks/useApi'

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1'

export const useUserApi = () => {
  const { fetchWithToken } = useApi()
  const queryClient = useQueryClient()

  const getCurrentUser = async () => {
    const response = await fetchWithToken(`${API_BASE_URL}/users/me`)
    const data = await response.json()
    return data.data.user
  }

  const fetchUsers = async () => {
    const response = await fetchWithToken(`${API_BASE_URL}/users/all`, {
      requireAuth: false,
    })
    const data = await response.json()
    return data.data.map((item: { user: any }) => item.user)
  }

  const getUsers = async (userType: UserType) => {
    const response = await fetchWithToken(`${API_BASE_URL}/users/${userType}`, {
      requireAuth: false,
    })
    return await response.json()
  }

  const getUserById = async (
    userType: string,
    userId: string,
  ): Promise<UserWithType> => {
    const response = await fetchWithToken(
      `${API_BASE_URL}/users/${userType}/${userId}`,
    )
    const data = await response.json()
    return data.data
  }

  const createUser = async (userData: UserCreateData) => {
    const response = await fetchWithToken(`${API_BASE_URL}/users/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user: userData }),
      requireAuth: false,
    })
    return await response.json()
  }

  const updateUser = async ({
    userData,
  }: {
    userData: Partial<UserCreateData>
  }) => {
    const response = await fetchWithToken(`${API_BASE_URL}/users/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user: userData }),
    })

    const result = await response.json()
    return result
  }

  const deleteUser = async ({
    userType,
    userId,
  }: {
    userType: UserType
    userId: string
  }) => {
    const response = await fetchWithToken(
      `${API_BASE_URL}/users/${userType}/${userId}`,
      {
        method: 'DELETE',
      },
    )
    return await response.json()
  }

  const uploadProfileImage = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetchWithToken(
      `${API_BASE_URL}/users/profile-image`,
      {
        method: 'POST',
        body: formData,
      },
    )
    return await response.json()
  }

  const deleteProfileImage = async () => {
    const response = await fetchWithToken(
      `${API_BASE_URL}/users/profile-image`,
      {
        method: 'DELETE',
      },
    )
    return await response.json()
  }

  interface ChangePasswordParams {
    oldPassword: string
    newPassword: string
  }

  const changePassword = async ({
    oldPassword,
    newPassword,
  }: ChangePasswordParams) => {
    // Verificar se os parâmetros são válidos
    if (!oldPassword || !newPassword) {
      throw new Error('Senha atual e nova senha são obrigatórias')
    }

    const response = await fetchWithToken(
      `${API_BASE_URL}/users/change-password`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword,
        }),
      },
    )

    const result = await response.json()
    return result
  }

  // React Query hooks
  const useGetCurrentUser = () =>
    useQuery({
      queryKey: ['currentUser'],
      queryFn: getCurrentUser,
    })

  const useFetchUsers = () =>
    useQuery({
      queryKey: ['users'],
      queryFn: fetchUsers,
    })

  const useGetUsers = (userType: UserType) =>
    useQuery({
      queryKey: ['users', userType],
      queryFn: () => getUsers(userType),
    })

  const useGetUserById = (userType: string, userId: string, options = {}) =>
    useQuery({
      queryKey: ['user', userType, userId],
      queryFn: () => getUserById(userType, userId),
      enabled: !!userId && !!userType,
      ...options,
    })

  const useCreateUser = () =>
    useMutation({
      mutationFn: createUser,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['users'] })
      },
    })

  const useUpdateUser = () =>
    useMutation({
      mutationFn: updateUser,
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['user'],
        })
        queryClient.invalidateQueries({ queryKey: ['users'] })
      },
    })

  const useDeleteUser = () =>
    useMutation({
      mutationFn: deleteUser,
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['users'] })
        queryClient.removeQueries({
          queryKey: ['user', variables.userType, variables.userId],
        })
      },
    })

  const useUploadProfileImage = () =>
    useMutation({
      mutationFn: uploadProfileImage,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['currentUser'] })
      },
    })

  const useDeleteProfileImage = () =>
    useMutation({
      mutationFn: deleteProfileImage,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['currentUser'] })
      },
    })

  const useChangePassword = () =>
    useMutation({
      mutationFn: changePassword,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['currentUser'] })
      },
    })

  return {
    useGetCurrentUser,
    useFetchUsers,
    useGetUsers,
    useGetUserById,
    useCreateUser,
    useUpdateUser,
    useDeleteUser,
    useUploadProfileImage,
    useDeleteProfileImage,
    useChangePassword,
  }
}
