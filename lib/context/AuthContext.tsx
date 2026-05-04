'use client'
import type React from 'react'
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from 'react'
import { useAuthApi, getAccessToken } from '../api/auth'
import type {
  UserType,
  UserWithType,
  SelectableUserType,
} from '../types/userTypes'
import { useQueryClient } from '@tanstack/react-query'

interface AuthContextType {
  isAuthenticated: boolean
  userType: UserType | null
  userId: string | null
  user: UserWithType | null
  isAdmin: boolean
  isLoading: boolean
  login: (
    username: string,
    password: string,
    userType: SelectableUserType,
  ) => Promise<void>
  logout: () => Promise<void>
  getAccessToken: () => string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Inicialização síncrona do localStorage — evita flash de "Carregando..."
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return !!(getAccessToken() && localStorage.getItem('userType'))
  })
  const [userType, setUserType] = useState<UserType | null>(() => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('userType') as UserType | null
  })
  const [userId, setUserId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('userId')
  })
  const [user, setUser] = useState<UserWithType | null>(() => {
    if (typeof window === 'undefined') return null
    try {
      const stored = localStorage.getItem('user')
      return stored ? JSON.parse(stored) : null
    } catch { return null }
  })
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('userIsAdmin') === 'true'
  })
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const { useLogin, useLogout } = useAuthApi()
  const loginMutation = useLogin()
  const logoutMutation = useLogout()
  const queryClient = useQueryClient()

  const login = useCallback(async (
    username: string,
    password: string,
    userType: SelectableUserType,
  ) => {
    try {
      const response = await loginMutation.mutateAsync({
        username,
        password,
        userType,
      })

      // Mapear a resposta para o formato UserWithType
      const userWithType: UserWithType = {
        tipo_usuario: response.user_type,
        ...response,
      }

      setIsAuthenticated(true)
      setUserType(userType as UserType)
      setUserId(response.user_uid)
      setUser(userWithType)
      setIsAdmin(response.is_admin)
      localStorage.setItem('accessToken', response.access_token)
      localStorage.setItem('refreshToken', response.refresh_token)
      localStorage.setItem('userType', response.user_type)
      localStorage.setItem('userId', response.user_uid)
      localStorage.setItem('userIsAdmin', String(response.is_admin))
      localStorage.setItem('user', JSON.stringify(response))
      queryClient.invalidateQueries({ queryKey: ['currentUser'] })
    } catch (error) {
      throw error
    }
  }, [loginMutation, queryClient])

  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync()
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('userType')
      localStorage.removeItem('userId')
      localStorage.removeItem('userIsAdmin')
      localStorage.removeItem('user')
      localStorage.removeItem('token') // legacy key cleanup
      setIsAuthenticated(false)
      setUserType(null)
      setUserId(null)
      setUser(null)
      setIsAdmin(false)
      queryClient.clear()
    } catch (error) {
      throw error
    }
  }, [logoutMutation, queryClient])

  // Memoizar o valor do contexto para evitar re-renderizações desnecessárias
  const value = useMemo(() => ({
    isAuthenticated,
    userType,
    userId,
    user,
    isAdmin,
    isLoading,
    login,
    logout,
    getAccessToken,
  }), [isAuthenticated, userType, userId, user, isAdmin, isLoading, login, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
