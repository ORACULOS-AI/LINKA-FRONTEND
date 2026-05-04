import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Camera, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { BusinessHeaderProps } from './BusinessTypes'
import { EditableText } from './EditableText'
import { ActionButtons } from './ActionButtons'

export function BusinessHeader({
  business,
  isEditing,
  isOwner,
  editedBusiness,
  onEdit,
  onSave,
  onCancel,
  onChange,
  onLogoChange,
  onCoverChange,
}: BusinessHeaderProps) {
  const router = useRouter()

  if (!business) return null

  return (
    <header className="relative">
      <div className="h-48 md:h-64 bg-gradient-to-r from-blue-500 to-purple-600">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="absolute top-4 left-4 text-white hover:text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
      </div>
      <div className="container mx-auto px-4">
        <div className="relative -mt-16 md:-mt-24 mb-8">
          <div className="flex flex-col md:flex-row items-start gap-4 md:gap-8">
            <div className="w-32 h-32 md:w-48 md:h-48 rounded-lg bg-white shadow-lg overflow-hidden mx-auto md:mx-0">
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                Logo
              </div>
            </div>
            <div className="flex-grow flex flex-col md:flex-row items-center md:items-start md:justify-between w-full gap-4">
              <div className="text-center md:text-left max-w-2xl">
                <EditableText
                  isEditing={isEditing}
                  value={isEditing ? editedBusiness.nome : business.nome}
                  onChange={onChange}
                  className="text-2xl md:text-4xl font-bold mb-2"
                />
                <div className="flex items-center justify-center md:justify-start space-x-2 text-sm">
                  <Badge
                    variant={
                      business.status === 'aprovado' ? 'default' : 'secondary'
                    }
                  >
                    {business.status}
                  </Badge>
                  <Badge variant="outline">{business.tipo_negocio}</Badge>
                </div>
              </div>
              {isOwner && (
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={onCoverChange}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Alterar Capa
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={onLogoChange}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Alterar Logo
                    </Button>
                  </div>
                  <ActionButtons
                    isEditing={isEditing}
                    onEdit={onEdit}
                    onSave={onSave}
                    onCancel={onCancel}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
