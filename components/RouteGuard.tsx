'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuth } from '@/lib/context/AuthContext'

function AppLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">
      {/* Header skeleton */}
      <div className="w-full h-16 bg-gradient-to-r from-purple-600 via-purple-500 to-violet-600 animate-pulse" />
      <div className="flex flex-1">
        {/* Sidebar skeleton (desktop) */}
        <div className="hidden md:block w-[280px] bg-white border-r border-purple-100 p-4 space-y-4">
          <div className="h-6 w-24 bg-purple-100 rounded animate-pulse" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-9 w-full bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
        {/* Content skeleton */}
        <div className="flex-1 p-6 space-y-4">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-white rounded-xl border border-gray-100 animate-pulse" />
            ))}
          </div>
          <div className="h-64 bg-white rounded-xl border border-gray-100 animate-pulse" />
        </div>
      </div>
    </div>
  )
}

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading && pathname) {
      if (isAuthenticated && pathname === '/login') {
        router.push('/')
      }
    }
  }, [isAuthenticated, isLoading, pathname, router])

  if (isLoading) {
    return <AppLoadingSkeleton />
  }

  return <>{children}</>
}
