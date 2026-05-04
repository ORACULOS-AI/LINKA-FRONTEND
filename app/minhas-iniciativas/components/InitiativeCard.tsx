import { motion } from 'framer-motion'
import { useState } from 'react'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Edit, Trash2, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { 
  StatusIniciativa,
  TipoIniciativa,
  IniciativaBase 
} from '@/lib/types/initiativeTypes'

interface InitiativeCardProps {
  initiative: IniciativaBase
  index: number
  getStatusBadge: (status: StatusIniciativa) => JSX.Element
  getTipoIniciativaBadge: (tipo: TipoIniciativa) => JSX.Element
  formatDate: (initiative: IniciativaBase | undefined, field: 'data_cadastro' | 'data_ultima_atualizacao') => string
  handleDeleteInitiative: (initiativeId: string) => Promise<void>
}

export const InitiativeCard = ({
  initiative,
  index,
  getStatusBadge,
  getTipoIniciativaBadge,
  formatDate,
  handleDeleteInitiative
}: InitiativeCardProps) => {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDeleting(true)
    try {
      await handleDeleteInitiative(initiative.uid)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <motion.div
      key={initiative.uid}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card
        className={`flex flex-col hover:shadow-lg transition-all duration-200 cursor-pointer group ${
          isDeleting ? 'opacity-50 pointer-events-none' : ''
        }`}
        onClick={() => {
          if (!isDeleting) {
            router.push(`/minhas-iniciativas/${initiative.uid}`)
          }
        }}
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                  {initiative.titulo}
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/iniciativas/${initiative.uid}`)
                    }}
                    disabled={isDeleting}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => e.stopPropagation()}
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Excluir Iniciativa
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir esta iniciativa?
                          Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteClick}
                          disabled={isDeleting}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          {isDeleting ? 'Excluindo...' : 'Excluir'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                {getStatusBadge(initiative.status)}
                {getTipoIniciativaBadge(initiative.tipo)}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Criado em: {formatDate(initiative, 'data_cadastro')}
              </p>
              <p className="text-sm text-gray-500">
                Última atualização: {formatDate(initiative, 'data_ultima_atualizacao')}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold">Descrição</h4>
              <p className="text-sm text-gray-600 line-clamp-3">
                {initiative.descricao}
              </p>
            </div>
            {initiative.recursos_necessarios && (
              <div>
                <h4 className="text-sm font-semibold">
                  Recursos Necessários
                </h4>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {initiative.recursos_necessarios}
                </p>
              </div>
            )}
            {initiative.resultados_esperados && (
              <div>
                <h4 className="text-sm font-semibold">
                  Resultados Esperados
                </h4>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {initiative.resultados_esperados}
                </p>
              </div>
            )}
            {initiative.laboratorios &&
              initiative.laboratorios.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold">Laboratórios</h4>
                  <div className="flex flex-wrap gap-1">
                    {initiative.laboratorios.map((lab: string) => (
                      <Badge
                        key={lab}
                        variant="secondary"
                        className="text-xs"
                      >
                        {lab}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            {initiative.palavras_chave &&
              initiative.palavras_chave.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold">Palavras-chave</h4>
                  <div className="flex flex-wrap gap-1">
                    {initiative.palavras_chave.map((tag: string) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="text-xs"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </CardContent>
        <CardFooter className="border-t pt-4">
          <div className="flex justify-between w-full text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>
                {initiative.participantes?.length || 0} participantes
              </span>
            </div>
            <div>
              <span>{initiative.seguidores?.length || 0} seguidores</span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  )
} 