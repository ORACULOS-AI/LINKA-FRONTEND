import { api } from './client'
import type { ApiResp } from './feed'

export type DashboardData = Record<string, unknown>

// GET /api/v1/dashboard/
export async function getDashboard(): Promise<DashboardData> {
  const { data } = await api.get<ApiResp<DashboardData>>('/api/v1/dashboard/')
  return data.data
}

// GET /api/v1/dashboard/public
export async function getPublicDashboard(): Promise<DashboardData> {
  const { data } = await api.get<ApiResp<DashboardData>>('/api/v1/dashboard/public')
  return data.data
}

// GET /api/v1/dashboard/home
export async function getHomeDashboard(): Promise<DashboardData> {
  const { data } = await api.get<ApiResp<DashboardData>>('/api/v1/dashboard/home')
  return data.data
}
