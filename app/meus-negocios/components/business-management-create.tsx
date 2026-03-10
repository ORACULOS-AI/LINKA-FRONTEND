import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useBusinessApi } from '@/lib/api/business'
import type { NegocioCreate } from '@/lib/types/businessTypes'

export function BusinessManagementCreate() {
  const [isOpen, setIsOpen] = useState(false)
  const { useCreateBusiness } = useBusinessApi()
  const createBusinessMutation = useCreateBusiness()

  const handleCreateBusiness = async (businessData: NegocioCreate) => {
    try {
      await createBusinessMutation.mutateAsync(businessData)
      setIsOpen(false)
    } catch {
      // Error handled by mutation
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Adicionar Negócio</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Novo Negócio</DialogTitle>
        </DialogHeader>
        {/* Add a form here to collect business data */}
        <Button
          onClick={() =>
            handleCreateBusiness({
              /* business data */
            } as NegocioCreate)
          }
        >
          Criar Negócio
        </Button>
      </DialogContent>
    </Dialog>
  )
}
