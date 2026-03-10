// components/business-edit-modal.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useBusinessApi } from '@/lib/api/business'
import { NegocioResponse } from '@/lib/types/businessTypes'
import { useEffect } from 'react'
import { toast } from '@/hooks/use-toast'

const businessEditSchema = z.object({
  nome: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  telefone: z.string().min(10, 'Telefone inválido'),
  palavras_chave: z.string(),
})

type BusinessEditFormData = z.infer<typeof businessEditSchema>

interface BusinessEditModalProps {
  business: NegocioResponse | null
  onClose: () => void
  onSuccess: () => void
}

export function BusinessEditModal({
  business,
  onClose,
  onSuccess,
}: BusinessEditModalProps) {
  const { useUpdateBusiness } = useBusinessApi()
  const updateBusinessMutation = useUpdateBusiness()

  const form = useForm<BusinessEditFormData>({
    resolver: zodResolver(businessEditSchema),
    defaultValues: {
      nome: '',
      email: '',
      telefone: '',
      palavras_chave: '',
    },
  })

  useEffect(() => {
    if (business) {
      form.reset({
        nome: business.nome,
        email: business.email,
        telefone: business.telefone,
        palavras_chave: business.palavras_chave,
      })
    }
  }, [business, form])

  const onSubmit = async (data: BusinessEditFormData) => {
    if (!business) return

    try {
      await updateBusinessMutation.mutateAsync({
        businessId: business.id,
        updateData: data,
      })
      toast({
        title: 'Negócio atualizado',
        description: 'As informações do negócio foram atualizadas com sucesso.',
      })
      onSuccess()
      onClose()
    } catch {
      toast({
        title: 'Erro ao atualizar',
        description: 'Não foi possível atualizar o negócio. Tente novamente.',
        variant: 'destructive',
      })
    }
  }

  return (
    <Dialog open={!!business} onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Negócio</DialogTitle>
          <DialogDescription>
            Atualize as informações do seu negócio. Clique em salvar quando terminar.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Negócio</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="telefone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="palavras_chave"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Palavras-chave</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Separe as palavras-chave por vírgula" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={updateBusinessMutation.isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={updateBusinessMutation.isPending}>
                {updateBusinessMutation.isPending ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
