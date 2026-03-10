'use client'

import { useAuth } from '@/lib/context/AuthContext'
import dynamic from 'next/dynamic'

const DashboardHome = dynamic(
  () => import('@/app/dashboard/components/DashboardHome'),
  { ssr: false }
)
const PublicHome = dynamic(
  () => import('@/app/dashboard/components/PublicHome'),
  { ssr: false }
)

export default function HomePage() {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <DashboardHome /> : <PublicHome />
}
