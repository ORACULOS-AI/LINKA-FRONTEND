export enum ResourceType {
  LABORATORIO = 'LABORATORIO',
  NEGOCIO = 'NEGOCIO',
}

export interface ClaimTokenVerifyResponse {
  token: string
  email: string
  resource_type: ResourceType
  resource_name: string
  expires_at: string
  claimed: boolean
}

export interface ClaimSuccessResponse {
  success: boolean
  message: string
  resource_type: ResourceType
  resource_id: string
  redirect_url: string
}

export interface ClaimErrorResponse {
  status: 'error'
  message: string
}
