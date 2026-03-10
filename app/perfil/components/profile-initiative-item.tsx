import React from "react"
import { GraduationCap } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface ProfileInitiativeItemProps {
  initiative: any
}

const ProfileInitiativeItem: React.FC<ProfileInitiativeItemProps> = ({ initiative }) => {
  const [imageError, setImageError] = React.useState(false)

  // Usar id, uid ou created_at como fallback para o link
  const initiativeId = initiative.id || initiative.uid || initiative.created_at
  const initiativeTitle = initiative.titulo || initiative.nome || 'Iniciativa sem título'

  return (
    <Link href={`/iniciativas/${initiativeId}`} className="min-w-[220px] group">
      <Card className="flex flex-col items-center p-4 bg-white/70 border border-purple-100 rounded-xl shadow-none hover:shadow-md transition-shadow duration-200 group-hover:bg-white">
        <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center mb-2 overflow-hidden">
          {initiative.capa_url && !imageError ? (
            <img 
              src={initiative.capa_url} 
              alt={initiativeTitle} 
              className="w-14 h-14 rounded-full object-cover" 
              onError={() => setImageError(true)}
            />
          ) : (
            <GraduationCap className="h-7 w-7 text-purple-400" />
          )}
        </div>
        <div className="text-center">
          <div className="font-semibold text-gray-900 text-base truncate max-w-[180px]">{initiativeTitle}</div>
          <Badge className="mt-1 bg-purple-50 text-purple-600 px-2 py-0.5 text-xs font-medium rounded">Iniciativa</Badge>
        </div>
        <span className="mt-2 text-xs text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity">Ver detalhes →</span>
      </Card>
    </Link>
  )
}

export default ProfileInitiativeItem 