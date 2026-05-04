export enum ConnectionStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

export enum RequestType {
  SENT = 'sent',
  RECEIVED = 'received',
  ALL = 'all',
}

export interface ConnectionRequest {
  id: string
  requester_id: string
  target_id: string
  status: ConnectionStatus
  created_at: string
}
