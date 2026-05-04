'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useRouter } from 'next/navigation'

interface AuthRequiredModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AuthRequiredModal({
  isOpen,
  onClose,
}: AuthRequiredModalProps) {
  const router = useRouter()

  const handleLoginRedirect = () => {
    router.push('/login')
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className='bg-white rounded-xl'>
        <AlertDialogHeader>
          <AlertDialogTitle>Acesso Restrito</AlertDialogTitle>
          <AlertDialogDescription>
            Você precisa estar autenticado para acessar esta página. Por favor,
            faça login para continuar.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancelar</AlertDialogCancel>
          <AlertDialogAction className='bg-purple-600 text-white' onClick={handleLoginRedirect}>
            Fazer Login
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
} 