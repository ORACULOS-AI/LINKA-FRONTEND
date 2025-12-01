'use client'

import { useAuth } from '@/lib/context/AuthContext'
import { type ReactNode, useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { publicRoutes } from '@/lib/config/publicRoutes'
import { AuthRequiredModal } from './AuthRequiredModal'

interface PrivateRouteProps {
  children: ReactNode
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const pathname = usePathname()

  const isPublicRoute = publicRoutes.some((route) => {
    if (route === '/') return pathname === route
    return pathname.startsWith(route)
  })

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isPublicRoute) {
      setIsModalOpen(true)
    } else {
      setIsModalOpen(false)
    }
  }, [isLoading, isAuthenticated, isPublicRoute, pathname])

  // Não mostrar nada durante o loading inicial - apenas renderizar o conteúdo
  // O AuthContext já verifica localStorage de forma síncrona
  if (isLoading) {
    return null // Retorna null para evitar flash de conteúdo
  }

  if (!isAuthenticated && !isPublicRoute) {
    return (
      <AuthRequiredModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    )
  }

  return <>{children}</>
}
