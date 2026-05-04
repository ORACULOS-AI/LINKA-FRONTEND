import type { NegocioResponse } from '@/lib/types/businessTypes'

export interface BusinessHeaderProps {
  business: NegocioResponse | null
  isEditing: boolean
  isOwner: boolean
  editedBusiness: NegocioResponse
  onEdit: () => void
  onSave: () => void
  onCancel: () => void
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onKeywordsChange: (keywords: string[]) => void
  onLogoChange: () => void
  onCoverChange: () => void
}

export interface EditableTextProps {
  isEditing: boolean
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  name: string
  className?: string
}

export interface ActionButtonsProps {
  isEditing: boolean
  onEdit: () => void
  onSave: () => void
  onCancel: () => void
}
