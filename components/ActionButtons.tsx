import { Button } from '@/components/ui/button'
import { Save, X, Edit2 } from 'lucide-react'
import type { ActionButtonsProps } from './BusinessTypes'

export function ActionButtons({
  isEditing,
  onEdit,
  onSave,
  onCancel,
}: ActionButtonsProps) {
  return isEditing ? (
    <div className="flex justify-center md:justify-end space-x-2">
      <Button onClick={onSave} size="sm">
        <Save className="w-4 h-4 mr-2" />
        Salvar
      </Button>
      <Button onClick={onCancel} size="sm" variant="outline">
        <X className="w-4 h-4 mr-2" />
        Cancelar
      </Button>
    </div>
  ) : (
    <Button onClick={onEdit} size="sm" className="w-full md:w-auto">
      <Edit2 className="w-4 h-4 mr-2" />
      Editar
    </Button>
  )
}
