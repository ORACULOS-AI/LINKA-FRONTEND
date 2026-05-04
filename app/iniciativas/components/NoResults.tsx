import { Button } from '@/components/ui/button'
import { HandHeart, Plus, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { TipoIniciativa, PublicStatusIniciativa } from '@/lib/types/initiativeTypes'

interface NoResultsProps {
  searchTerm: string
  selectedType?: TipoIniciativa
  selectedStatus: PublicStatusIniciativa
  isAuthenticated: boolean
}

export const NoResults = ({
  searchTerm,
  selectedType,
  selectedStatus,
  isAuthenticated
}: NoResultsProps) => {
  const router = useRouter()
  
  return (
    <motion.div
      className="text-center mt-12 p-8 bg-purple-50 rounded-2xl border border-purple-100"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
        {searchTerm ? (
          <Search className="h-8 w-8 text-purple-600" />
        ) : (
          <HandHeart className="h-8 w-8 text-purple-600" />
        )}
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {searchTerm
          ? 'Nenhuma iniciativa encontrada'
          : 'Nenhuma iniciativa disponível'}
      </h3>
      
      <p className="text-gray-600 mb-4">
        {searchTerm
          ? `Não encontramos iniciativas para "${searchTerm}"`
          : `Nenhuma iniciativa ${selectedType ? `do tipo ${selectedType}` : ''} com status ${selectedStatus.toLowerCase()}`}
      </p>
      
      <p className="text-sm text-gray-500 mb-6">
        {searchTerm
          ? 'Tente usar termos diferentes na sua busca ou ajustar os filtros.'
          : selectedStatus === PublicStatusIniciativa.ATIVA
            ? 'As iniciativas precisam ser aprovadas por um administrador antes de aparecerem aqui.'
            : 'Tente mudar os filtros para encontrar mais iniciativas.'}
      </p>
      
      {isAuthenticated && (
        <Button
          className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white shadow-lg hover:shadow-purple-500/25 transition-all duration-200"
          onClick={() => router.push('/minhas-iniciativas')}
        >
          <Plus className="w-4 h-4 mr-2" />
          Gerenciar Minhas Iniciativas
        </Button>
      )}
    </motion.div>
  )
} 