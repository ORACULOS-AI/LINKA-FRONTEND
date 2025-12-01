/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useEventApi } from '@/lib/api/event'
import { WizardModal, WizardStep } from '@/components/wizard-modal'
import { TagInput } from '@/components/tag-input'
import { TextareaWithCounter } from '@/components/textarea-with-counter'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Calendar, FileText, MapPin } from 'lucide-react'

// Schema de validação
const eventSchema = z.object({
  titulo: z
    .string()
    .min(3, 'O título deve ter pelo menos 3 caracteres')
    .max(150, 'O título deve ter no máximo 150 caracteres'),
  descricao: z
    .string()
    .min(10, 'A descrição deve ter pelo menos 10 caracteres')
    .max(2000, 'A descrição deve ter no máximo 2000 caracteres'),
  data_inicio: z.string().min(1, 'Data de início é obrigatória'),
  data_fim: z.string().min(1, 'Data de término é obrigatória'),
  local: z
    .string()
    .min(3, 'O local deve ter pelo menos 3 caracteres')
    .max(200, 'O local deve ter no máximo 200 caracteres'),
  palavras_chave: z
    .array(z.string().max(50))
    .max(10, 'Máximo de 10 palavras-chave')
    .optional(),
  link_inscricao: z.string().url('URL inválida').optional().or(z.literal('')),
  vagas_disponiveis: z.number().min(1, 'Deve haver pelo menos 1 vaga').optional(),
}).refine((data) => {
  if (data.data_fim && data.data_inicio) {
    return new Date(data.data_fim) > new Date(data.data_inicio)
  }
  return true
}, {
  message: 'Data de término deve ser posterior à data de início',
  path: ['data_fim'],
})

type EventFormData = z.infer<typeof eventSchema>

export function EventCreationModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}) {
  const [currentStep, setCurrentStep] = useState(0)
  const { createEvent } = useEventApi()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    mode: 'onChange',
    defaultValues: {
      titulo: '',
      descricao: '',
      data_inicio: '',
      data_fim: '',
      local: '',
      palavras_chave: [],
      link_inscricao: '',
      vagas_disponiveis: undefined,
    },
  })

  const handleSubmit = async () => {
    const isValid = await form.trigger()
    if (!isValid) return

    const data = form.getValues()

    try {
      setIsSubmitting(true)

      const eventData = {
        titulo: data.titulo,
        descricao: data.descricao,
        data_inicio: new Date(data.data_inicio).toISOString(),
        data_fim: new Date(data.data_fim).toISOString(),
        local: data.local,
        palavras_chave: data.palavras_chave || [],
        link_inscricao: data.link_inscricao || undefined,
        vagas_disponiveis: data.vagas_disponiveis || undefined,
      }

      await createEvent(eventData as any)

      form.reset()
      setCurrentStep(0)
      onClose()
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error('Erro ao criar evento:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getFieldsForStep = (step: number): (keyof EventFormData)[] => {
    switch (step) {
      case 0:
        return ['titulo', 'data_inicio', 'data_fim', 'local']
      case 1:
        return ['descricao', 'palavras_chave']
      case 2:
        return ['link_inscricao', 'vagas_disponiveis']
      default:
        return []
    }
  }

  const handleStepChange = async (newStep: number) => {
    if (newStep > currentStep) {
      const fields = getFieldsForStep(currentStep)
      const isValid = await form.trigger(fields as any)
      if (isValid) {
        setCurrentStep(newStep)
      }
    } else {
      setCurrentStep(newStep)
    }
  }

  // Define os 3 steps
  const steps: WizardStep[] = [
    {
      title: 'Informações Básicas',
      icon: <Calendar className="w-5 h-5" />,
      content: (
        <div className="space-y-5">
          <FormField
            control={form.control}
            name="titulo"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-semibold">Título do Evento *</FormLabel>
                <FormControl>
                  <Input
                    key="input-titulo"
                    placeholder="Ex: Semana de Inovação e Tecnologia"
                    className="border-purple-200 focus:border-purple-500 focus:ring-purple-500/20"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-xs text-gray-500">
                  {field.value.length}/150 caracteres
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="data_inicio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-semibold">Data de Início *</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      className="border-purple-200 focus:border-purple-500 focus:ring-purple-500/20"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="data_fim"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-semibold">Data de Término *</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      className="border-purple-200 focus:border-purple-500 focus:ring-purple-500/20"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="local"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-semibold">Local *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex: Auditório Central - Campus Pici"
                    className="border-purple-200 focus:border-purple-500 focus:ring-purple-500/20"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-xs text-gray-500">
                  Endereço completo ou local do evento
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      ),
    },
    {
      title: 'Descrição',
      icon: <FileText className="w-5 h-5" />,
      content: (
        <div className="space-y-5">
          <FormField
            control={form.control}
            name="descricao"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-semibold">Descrição do Evento *</FormLabel>
                <FormControl>
                  <TextareaWithCounter
                    value={field.value}
                    onChange={field.onChange}
                    maxLength={2000}
                    placeholder="Descreva o evento, seus objetivos, público-alvo, programação e o que os participantes podem esperar..."
                    className="border-purple-200 focus:border-purple-500 focus:ring-purple-500/20"
                  />
                </FormControl>
                <FormDescription className="text-xs text-gray-500">
                  Seja detalhado sobre o conteúdo e atividades do evento
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="palavras_chave"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-semibold">Palavras-chave</FormLabel>
                <FormControl>
                  <TagInput
                    value={field.value || []}
                    onChange={field.onChange}
                    placeholder="Digite uma palavra-chave e pressione Enter"
                    maxTags={10}
                    maxLength={50}
                  />
                </FormControl>
                <FormDescription className="text-xs text-gray-500">
                  Adicione até 10 palavras-chave (opcional)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      ),
    },
    {
      title: 'Inscrições',
      icon: <MapPin className="w-5 h-5" />,
      content: (
        <div className="space-y-5">
          <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
            <p className="text-sm text-purple-800">
              <strong>Opcional:</strong> Configure as informações de inscrição e vagas disponíveis.
            </p>
          </div>

          <FormField
            control={form.control}
            name="link_inscricao"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-semibold">Link de Inscrição</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://forms.google.com/..."
                    className="border-purple-200 focus:border-purple-500 focus:ring-purple-500/20"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-xs text-gray-500">
                  URL do formulário de inscrição (opcional)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="vagas_disponiveis"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-semibold">Vagas Disponíveis</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    placeholder="Ex: 100"
                    className="border-purple-200 focus:border-purple-500 focus:ring-purple-500/20"
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormDescription className="text-xs text-gray-500">
                  Número máximo de participantes (opcional)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      ),
    },
  ]

  return (
    <Form {...form}>
      <WizardModal
        isOpen={isOpen}
        onClose={onClose}
        title="Criar Novo Evento"
        description="Preencha os dados do evento em 3 etapas simples"
        steps={steps}
        currentStep={currentStep}
        onStepChange={handleStepChange}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitText="Criar Evento"
        maxWidth="sm:max-w-[700px]"
      />
    </Form>
  )
}
