import React from "react"
import { Building2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface ProfileBusinessItemProps {
  business: any
}

const ProfileBusinessItem: React.FC<ProfileBusinessItemProps> = ({ business }) => {
  const [imageError, setImageError] = React.useState(false)

  // Usar id, uid ou created_at como fallback para o link
  const businessId = business.id || business.uid || business.created_at
  const businessName = business.nome || 'Negócio sem nome'

  return (
    <Link href={`/inspecionar-negocio/${businessId}`} className="min-w-[220px] group">
      <Card className="flex flex-col items-center p-4 bg-white/70 border border-purple-100 rounded-xl shadow-none hover:shadow-md transition-shadow duration-200 group-hover:bg-white">
        <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center mb-2 overflow-hidden">
          {business.logo_url && !imageError ? (
            <img 
              src={business.logo_url} 
              alt={businessName} 
              className="w-14 h-14 rounded-full object-cover" 
              onError={() => setImageError(true)}
            />
          ) : (
            <Building2 className="h-7 w-7 text-purple-400" />
          )}
        </div>
        <div className="text-center">
          <div className="font-semibold text-gray-900 text-base truncate max-w-[180px]">{businessName}</div>
          <Badge className="mt-1 bg-purple-50 text-purple-600 px-2 py-0.5 text-xs font-medium rounded">Negócio</Badge>
        </div>
        <span className="mt-2 text-xs text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity">Ver detalhes →</span>
      </Card>
    </Link>
  )
}

export default ProfileBusinessItem 