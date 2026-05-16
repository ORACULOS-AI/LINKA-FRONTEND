import { api } from './client'
import type { ApiResp } from './feed'

export type ResourceType = 'laboratorio' | 'negocio'

export type ClaimTokenResponse = {
  token: string
  resource_type: ResourceType
  resource_id: string
  expires_at: string
}

export type ClaimVerifyResponse = {
  success: boolean
  resource_type: ResourceType
  resource_id: string
}

export type ClaimInitiateResponse = {
  message: string
  email_sent_to?: string | null
}

export type ClaimConfirmResponse = {
  success: boolean
  resource_type: ResourceType
  resource_id: string
}

// GET /api/v1/claim/verify/{token}
export async function verifyClaimToken(token: string): Promise<ClaimTokenResponse> {
  const { data } = await api.get<ApiResp<ClaimTokenResponse>>(`/api/v1/claim/verify/${token}`)
  return data.data
}

// POST /api/v1/claim/claim/{token}
export async function claimByToken(token: string): Promise<ClaimVerifyResponse> {
  const { data } = await api.post<ApiResp<ClaimVerifyResponse>>(`/api/v1/claim/claim/${token}`)
  return data.data
}

// POST /api/v1/claim/initiate
export async function initiateClaim(resourceId: string, resourceType: ResourceType): Promise<ClaimInitiateResponse> {
  const { data } = await api.post<ApiResp<ClaimInitiateResponse>>('/api/v1/claim/initiate', {
    resource_id: resourceId,
    resource_type: resourceType,
  })
  return data.data
}

// POST /api/v1/claim/confirm
export async function confirmClaim(resourceId: string, resourceType: ResourceType, code: string): Promise<ClaimConfirmResponse> {
  const { data } = await api.post<ApiResp<ClaimConfirmResponse>>('/api/v1/claim/confirm', {
    resource_id: resourceId,
    resource_type: resourceType,
    code,
  })
  return data.data
}

// POST /api/v1/claim/claim-direct  — admin only
export async function claimDirect(resourceId: string, resourceType: ResourceType): Promise<ClaimVerifyResponse> {
  const { data } = await api.post<ApiResp<ClaimVerifyResponse>>('/api/v1/claim/claim-direct', {
    resource_id: resourceId,
    resource_type: resourceType,
  })
  return data.data
}
