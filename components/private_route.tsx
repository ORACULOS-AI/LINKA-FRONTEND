'use client'

import { useAuth } from '@/lib/context/AuthContext'
import { type ReactNode, useState } from 'react'
import { usePathname } from 'next/navigation'
import { publicRoutes } from '@/lib/config/publicRoutes'
import { AuthRequiredModal } from './AuthRequiredModal'

interface PrivateRouteProps {
  children: ReactNode
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const [isModalDismissed, setIsModalDismissed] = useState(false)
  const pathname = usePathname()

  const isPublicRoute = publicRoutes.some((route) => {
    if (route === '/') return pathname === route
    return pathname.startsWith(route)
  })

  if (isLoading) {
    return null
  }

  const needsAuth = !isAuthenticated && !isPublicRoute

  if (needsAuth) {
    return (
      <AuthRequiredModal
        isOpen={!isModalDismissed}
        onClose={() => setIsModalDismissed(true)}
      />
    )
  }

  return <>{children}</>
}
