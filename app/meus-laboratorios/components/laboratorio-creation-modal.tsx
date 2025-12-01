/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useLaboratorioApi } from '@/lib/api/laboratorio'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PhoneInput } from '@/components/phone-input'
import { TipoLaboratorio, type LaboratorioCreate } from '@/lib/types/laboratorioTypes'
import { Info, FileText, Settings } from 'lucide-react'

// Schema de validação com Zod
const laboratorioSchema = z.object({
  nome: z
    .string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  unidade: z
    .string()
    .min(2, 'Unidade deve ter pelo menos 2 caracteres')
    .max(100, 'Unidade deve ter no máximo 100 caracteres'),
  subunidade: z.string().optional(),
  tipo: z.nativeEnum(TipoLaboratorio),
  responsavel: z
    .string()
    .min(3, 'Nome do responsável deve ter pelo menos 3 caracteres')
    .max(100, 'Nome do responsável deve ter no máximo 100 caracteres'),
  telefone: z
    .string()
    .min(14, 'Telefone deve ter pelo menos 14 caracteres (incluindo +55)'),
  email: z.string().email('Email inválido'),
  descricao: z
    .string()
    .max(1000, 'Descrição deve ter no máximo 1000 caracteres')
    .optional(),
  website: z.string().url('URL inválida').optional().or(z.literal('')),
  campus: z.string().optional(),
  sala: z.string().optional(),
  endereco: z.string().optional(),
  areas_pesquisa: z
    .array(z.string().max(50))
    .max(10, 'Máximo de 10 áreas de pesquisa')
    .optional(),
  equipamentos: z
    .array(z.string().max(100))
    .max(20, 'Máximo de 20 equipamentos')
    .optional(),
})

type LaboratorioFormData = z.infer<typeof laboratorioSchema>

// Helper functions
const getTipoLabel = (tipo: TipoLaboratorio): string => {
  const labels = {
    [TipoLaboratorio.PESQUISA]: 'Pesquisa',
    [TipoLaboratorio.ENSINO]: 'Ensino',
    [TipoLaboratorio.EXTENSAO]: 'Extensão',
    [TipoLaboratorio.DESENVOLVIMENTO]: 'Desenvolvimento',
    [TipoLaboratorio.MULTIDISCIPLINAR]: 'Multidisciplinar',
  }
  return labels[tipo] || tipo
}

export function LaboratorioCreationModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}) {
  const [currentStep, setCurrentStep] = useState(0)
  const { useCreateLaboratorio } = useLaboratorioApi()
  const createLaboratorioMutation = useCreateLaboratorio()

  const form = useForm<LaboratorioFormData>({
    resolver: zodResolver(laboratorioSchema),
    mode: 'onChange',
    defaultValues: {
      nome: '',
      unidade: '',
      subunidade: '',
      tipo: TipoLaboratorio.PESQUISA,
      responsavel: '',
      telefone: '+55',
      email: '',
      descricao: '',
      website: '',
      campus: '',
      sala: '',
      endereco: '',
      areas_pesquisa: [],
      equipamentos: [],
    },
  })

  const handleSubmit = async () => {
    const isValid = await form.trigger()
    if (!isValid) return

    const data = form.getValues()

    try {
      const laboratorioData: LaboratorioCreate = {
        nome: data.nome,
        unidade: data.unidade,
        subunidade: data.subunidade || undefined,
        tipo: data.tipo,
        responsavel: data.responsavel,
        telefone: data.telefone,
        email: data.email,
        descricao: data.descricao || undefined,
        website: data.website || undefined,
        campus: data.campus || undefined,
        sala: data.sala || undefined,
        endereco: data.endereco || undefined,
        areas_pesquisa: data.areas_pesquisa || [],
        equipamentos: data.equipamentos || [],
      }

      await createLaboratorioMutation.mutateAsync(laboratorioData)

      form.reset()
      setCurrentStep(0)
      onClose()
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error('Erro ao criar laboratório:', error)
    }
  }

  const getFieldsForStep = (step: number): (keyof LaboratorioFormData)[] => {
    switch (step) {
      case 0:
        return ['nome', 'tipo', 'unidade', 'subunidade']
      case 1:
        return ['responsavel', 'email', 'telefone', 'descricao', 'website']
      case 2:
        return ['campus', 'sala', 'endereco', 'areas_pesquisa', 'equipamentos']
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
      icon: <Info className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="nome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Laboratório *</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Laboratório de Inovação Tecnológica" {...field} />
                </FormControl>
                <FormDescription>
                  {field.value.length}/100 caracteres
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tipo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo *</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(TipoLaboratorio).map((tipo) => (
                        <SelectItem key={tipo} value={tipo}>
                          {getTipoLabel(tipo)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="unidade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unidade *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: UFC, IFCE, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subunidade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subunidade</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Departamento de Computação" {...field} />
                  </FormControl>
                  <FormDescription>Opcional</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      ),
    },
    {
      title: 'Responsável e Descrição',
      icon: <FileText className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="responsavel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Responsável *</FormLabel>
                <FormControl>
                  <Input placeholder="Nome completo do responsável" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="email@ufc.br" {...field} />
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
                  <FormControl>
                    <PhoneInput
                      value={field.value}
                      onChange={field.onChange}
                      error={form.formState.errors.telefone?.message}
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="descricao"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição das Atividades</FormLabel>
                <FormControl>
                  <TextareaWithCounter
                    value={field.value || ''}
                    onChange={field.onChange}
                    maxLength={1000}
                    minHeight="120px"
                    placeholder="Descreva as atividades, objetivos e missão do laboratório..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website</FormLabel>
                <FormControl>
                  <Input placeholder="https://laboratorio.ufc.br" {...field} />
                </FormControl>
                <FormDescription>Opcional</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      ),
    },
    {
      title: 'Detalhes e Recursos',
      icon: <Settings className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="campus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Campus</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Pici, Russas" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sala"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sala</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: 123, L102" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endereco"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço</FormLabel>
                  <FormControl>
                    <Input placeholder="Endereço completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="areas_pesquisa"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Áreas de Pesquisa</FormLabel>
                <FormControl>
                  <TagInput
                    value={field.value || []}
                    onChange={field.onChange}
                    placeholder="Digite uma área de pesquisa e pressione Enter"
                    maxTags={10}
                    maxLength={50}
                  />
                </FormControl>
                <FormDescription>
                  Adicione até 10 áreas de pesquisa (opcional)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="equipamentos"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Equipamentos</FormLabel>
                <FormControl>
                  <TagInput
                    value={field.value || []}
                    onChange={field.onChange}
                    placeholder="Digite um equipamento e pressione Enter"
                    maxTags={20}
                    maxLength={100}
                  />
                </FormControl>
                <FormDescription>
                  Adicione até 20 equipamentos (opcional)
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
        title="Criar Novo Laboratório"
        description="Preencha os dados do laboratório em 3 etapas simples"
        steps={steps}
        currentStep={currentStep}
        onStepChange={handleStepChange}
        onSubmit={handleSubmit}
        isSubmitting={createLaboratorioMutation.isPending}
        submitText="Criar Laboratório"
        maxWidth="sm:max-w-[700px]"
      />
    </Form>
  )
}
