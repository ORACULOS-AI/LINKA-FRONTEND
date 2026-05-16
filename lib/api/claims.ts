import { api } from './client'
import type { ApiResp } from './feed'

// --- Business Claims ---

export type BusinessClaimStatus = 'pendente' | 'aprovado' | 'rejeitado'

export type BusinessClaim = {
  id: string
  negocio_id: string
  user_uid: string
  status: BusinessClaimStatus
  created_at: string
  updated_at: string
}

export type BusinessClaimStatusResponse = {
  has_claim: boolean
  status?: BusinessClaimStatus | null
  claim_id?: string | null
}

// POST /api/v1/business/{negocio_id}/claim
export async function claimBusiness(negocioId: string): Promise<BusinessClaim> {
  const { data } = await api.post<ApiResp<BusinessClaim>>(`/api/v1/business/${negocioId}/claim`)
  return data.data
}

// GET /api/v1/business/{negocio_id}/claim/status
export async function getBusinessClaimStatus(negocioId: string): Promise<BusinessClaimStatusResponse> {
  const { data } = await api.get<ApiResp<BusinessClaimStatusResponse>>(`/api/v1/business/${negocioId}/claim/status`)
  return data.data
}

// GET /api/v1/business/claims  — admin only
export async function listBusinessClaims(): Promise<BusinessClaim[]> {
  const { data } = await api.get<ApiResp<BusinessClaim[]>>('/api/v1/business/claims')
  return data.data
}

// POST /api/v1/business/claims/{claim_id}/approve  — admin only
export async function approveBusinessClaim(claimId: string): Promise<BusinessClaim> {
  const { data } = await api.post<ApiResp<BusinessClaim>>(`/api/v1/business/claims/${claimId}/approve`)
  return data.data
}

// POST /api/v1/business/claims/{claim_id}/reject  — admin only
export async function rejectBusinessClaim(claimId: string): Promise<BusinessClaim> {
  const { data } = await api.post<ApiResp<BusinessClaim>>(`/api/v1/business/claims/${claimId}/reject`)
  return data.data
}

// --- Lab Claims ---

export type LabClaimStatus = 'pendente' | 'aprovado' | 'rejeitado'

export type LabClaim = {
  id: string
  lab_uid: string
  user_uid: string
  status: LabClaimStatus
  created_at: string
  updated_at: string
}

export type LabClaimStatusResponse = {
  has_claim: boolean
  status?: LabClaimStatus | null
  claim_id?: string | null
}

// POST /api/v1/labs/{lab_uid}/claim
export async function claimLab(labUid: string): Promise<LabClaim> {
  const { data } = await api.post<ApiResp<LabClaim>>(`/api/v1/labs/${labUid}/claim`)
  return data.data
}

// GET /api/v1/labs/{lab_uid}/claim/status
export async function getLabClaimStatus(labUid: string): Promise<LabClaimStatusResponse> {
  const { data } = await api.get<ApiResp<LabClaimStatusResponse>>(`/api/v1/labs/${labUid}/claim/status`)
  return data.data
}

// GET /api/v1/labs/claims  — admin only
export async function listLabClaims(): Promise<LabClaim[]> {
  const { data } = await api.get<ApiResp<LabClaim[]>>('/api/v1/labs/claims')
  return data.data
}

// POST /api/v1/labs/claims/{claim_id}/approve  — admin only
export async function approveLabClaim(claimId: string): Promise<LabClaim> {
  const { data } = await api.post<ApiResp<LabClaim>>(`/api/v1/labs/claims/${claimId}/approve`)
  return data.data
}

// POST /api/v1/labs/claims/{claim_id}/reject  — admin only
export async function rejectLabClaim(claimId: string): Promise<LabClaim> {
  const { data } = await api.post<ApiResp<LabClaim>>(`/api/v1/labs/claims/${claimId}/reject`)
  return data.data
}
