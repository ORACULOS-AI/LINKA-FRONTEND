'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useEventApi } from '@/lib/api/event'
import { EventCategoria, EventCategoriaLabels, EventStatus } from '@/lib/types/eventTypes'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Calendar, FileText, MapPin, Settings } from 'lucide-react'

// Schema de validação
const eventSchema = z.object({
  titulo: z
    .string()
    .min(3, 'O título deve ter pelo menos 3 caracteres')
    .max(200, 'O título deve ter no máximo 200 caracteres'),
  descricao: z
    .string()
    .min(10, 'A descrição deve ter pelo menos 10 caracteres')
    .max(5000, 'A descrição deve ter no máximo 5000 caracteres'),
  data_inicio: z.string().min(1, 'Data de início é obrigatória'),
  data_fim: z.string().min(1, 'Data de término é obrigatória'),
  local: z
    .string()
    .min(3, 'O local deve ter pelo menos 3 caracteres')
    .max(500, 'O local deve ter no máximo 500 caracteres'),
  categoria: z.nativeEnum(EventCategoria),
  status: z.nativeEnum(EventStatus).optional(),
  is_online: z.boolean(),
  link_online: z.string().url('URL inválida').optional().or(z.literal('')),
  capacidade_maxima: z.number().min(1, 'Deve haver pelo menos 1 vaga').optional(),
  tags: z
    .array(z.string().max(50))
    .max(10, 'Máximo de 10 tags')
    .optional(),
  requisitos: z.string().max(2000, 'Requisitos deve ter no máximo 2000 caracteres').optional().or(z.literal('')),
  carga_horaria: z.number().min(0, 'Carga horária deve ser positiva').optional(),
  imagem_capa: z.string().url('URL inválida').optional().or(z.literal('')),
}).refine((data) => {
  if (data.data_fim && data.data_inicio) {
    return new Date(data.data_fim) > new Date(data.data_inicio)
  }
  return true
}, {
  message: 'Data de término deve ser posterior à data de início',
  path: ['data_fim'],
}).refine((data) => {
  if (data.is_online && !data.link_online) {
    return false
  }
  return true
}, {
  message: 'Link online é obrigatório para eventos online',
  path: ['link_online'],
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
  const { useCreateEvent } = useEventApi()
  const createMutation = useCreateEvent()

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    mode: 'onChange',
    defaultValues: {
      titulo: '',
      descricao: '',
      data_inicio: '',
      data_fim: '',
      local: '',
      categoria: EventCategoria.OUTRO,
      status: EventStatus.RASCUNHO,
      is_online: false,
      link_online: '',
      capacidade_maxima: undefined,
      tags: [],
      requisitos: '',
      carga_horaria: undefined,
      imagem_capa: '',
    },
  })

  const handleSubmit = async () => {
    const isValid = await form.trigger()
    if (!isValid) return

    const data = form.getValues()

    const eventData = {
      titulo: data.titulo,
      descricao: data.descricao,
      data_inicio: new Date(data.data_inicio).toISOString(),
      data_fim: new Date(data.data_fim).toISOString(),
      local: data.local,
      categoria: data.categoria,
      status: data.status,
      is_online: data.is_online,
      link_online: data.link_online || undefined,
      capacidade_maxima: data.capacidade_maxima || undefined,
      tags: data.tags || [],
      requisitos: data.requisitos || undefined,
      carga_horaria: data.carga_horaria || undefined,
      imagem_capa: data.imagem_capa || undefined,
    }

    createMutation.mutate(eventData, {
      onSuccess: () => {
        form.reset()
        setCurrentStep(0)
        onClose()
        if (onSuccess) onSuccess()
      },
    })
  }

  const getFieldsForStep = (step: number): (keyof EventFormData)[] => {
    switch (step) {
      case 0:
        return ['titulo', 'categoria', 'data_inicio', 'data_fim']
      case 1:
        return ['descricao', 'local', 'is_online', 'link_online']
      case 2:
        return ['capacidade_maxima', 'carga_horaria', 'requisitos', 'tags']
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
                    placeholder="Ex: Semana de Inovação e Tecnologia"
                    className="border-purple-200 focus:border-purple-500 focus:ring-purple-500/20"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-xs text-gray-500">
                  {field.value.length}/200 caracteres
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="categoria"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-semibold">Categoria *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(EventCategoria).map((categoria) => (
                      <SelectItem key={categoria} value={categoria}>
                        {EventCategoriaLabels[categoria]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
        </div>
      ),
    },
    {
      title: 'Local e Descrição',
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
                    maxLength={5000}
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

          <FormField
            control={form.control}
            name="is_online"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Evento Online</FormLabel>
                  <FormDescription>
                    Este evento será realizado online?
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {form.watch('is_online') && (
            <FormField
              control={form.control}
              name="link_online"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-semibold">Link Online *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://meet.google.com/..."
                      className="border-purple-200 focus:border-purple-500 focus:ring-purple-500/20"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs text-gray-500">
                    Link para acessar o evento online
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
      ),
    },
    {
      title: 'Configurações Adicionais',
      icon: <Settings className="w-5 h-5" />,
      content: (
        <div className="space-y-5">
          <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
            <p className="text-sm text-purple-800">
              <strong>Opcional:</strong> Configure informações adicionais do evento.
            </p>
          </div>

          <FormField
            control={form.control}
            name="capacidade_maxima"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-semibold">Capacidade Máxima</FormLabel>
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

          <FormField
            control={form.control}
            name="carga_horaria"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-semibold">Carga Horária (horas)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder="Ex: 8"
                    className="border-purple-200 focus:border-purple-500 focus:ring-purple-500/20"
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormDescription className="text-xs text-gray-500">
                  Duração total do evento em horas (opcional)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="requisitos"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-semibold">Requisitos</FormLabel>
                <FormControl>
                  <TextareaWithCounter
                    value={field.value || ''}
                    onChange={field.onChange}
                    maxLength={2000}
                    placeholder="Descreva requisitos, pré-requisitos ou o que os participantes precisam trazer..."
                    className="border-purple-200 focus:border-purple-500 focus:ring-purple-500/20"
                  />
                </FormControl>
                <FormDescription className="text-xs text-gray-500">
                  Requisitos para participação (opcional)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-semibold">Tags</FormLabel>
                <FormControl>
                  <TagInput
                    value={field.value || []}
                    onChange={field.onChange}
                    placeholder="Digite uma tag e pressione Enter"
                    maxTags={10}
                    maxLength={50}
                  />
                </FormControl>
                <FormDescription className="text-xs text-gray-500">
                  Adicione até 10 tags (opcional)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="imagem_capa"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-semibold">URL da Imagem de Capa</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://exemplo.com/imagem.jpg"
                    className="border-purple-200 focus:border-purple-500 focus:ring-purple-500/20"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-xs text-gray-500">
                  URL da imagem de capa do evento (opcional)
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
        isSubmitting={createMutation.isPending}
        submitText="Criar Evento"
        maxWidth="sm:max-w-[700px]"
      />
    </Form>
  )
}
