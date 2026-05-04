'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useInitiativesApi } from '@/lib/api/initiatives'
import { useBusinessApi } from '@/lib/api/business'
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
import { Checkbox } from '@/components/ui/checkbox'
import { Info, FileText, Settings, Building2 } from 'lucide-react'
import {
  TipoIniciativa,
  NivelMaturidade,
} from '@/lib/types/initiativeTypes'
import { toast } from 'sonner'

// Schema de validação com Zod
const initiativeSchema = z.object({
  business_id: z.string().min(1, 'Selecione um negócio'),
  titulo: z
    .string()
    .min(3, 'Título deve ter pelo menos 3 caracteres')
    .max(100, 'Título deve ter no máximo 100 caracteres'),
  descricao: z
    .string()
    .min(10, 'Descrição deve ter pelo menos 10 caracteres')
    .max(2000, 'Descrição deve ter no máximo 2000 caracteres'),
  tipo: z.nativeEnum(TipoIniciativa),
  data_inicio: z.string().min(1, 'Data de início é obrigatória'),
  data_fim: z.string().optional(),
  palavras_chave: z.array(z.string()).min(1, 'Adicione pelo menos uma palavra-chave').max(15),
  nivel_maturidade: z.nativeEnum(NivelMaturidade),
  recursos_necessarios: z.string().max(1000).optional(),
  resultados_esperados: z.string().max(1000).optional(),
  impacto_esperado: z.string().max(1000).optional(),
  publico_alvo: z.string().max(500).optional(),
  areas_conhecimento: z.array(z.string()).max(10).optional(),
  tecnologias_utilizadas: z.array(z.string()).max(20).optional(),
  ods_relacionados: z.array(z.string()).max(17).optional(),
  metricas_sucesso: z.array(z.string()).max(10).optional(),
  laboratorios: z.array(z.string()).max(10).optional(),
  orcamento_previsto: z.number().min(0).optional(),
  fonte_financiamento: z.string().max(200).optional(),
  tipo_propriedade: z.string().max(100).optional(),
  moeda: z.enum(['BRL', 'USD', 'EUR']).optional(),
  tem_propriedade_intelectual: z.boolean().optional(),
  aceita_colaboradores: z.boolean().optional(),
  colaboracao_internacional: z.boolean().optional(),
}).refine((data) => {
  if (data.data_fim && data.data_inicio) {
    return new Date(data.data_fim) > new Date(data.data_inicio)
  }
  return true
}, {
  message: 'Data de fim deve ser posterior à data de início',
  path: ['data_fim'],
})

type InitiativeFormData = z.infer<typeof initiativeSchema>

// Helper functions
const getTipoLabel = (tipo: TipoIniciativa) => {
  const labels = {
    [TipoIniciativa.PESQUISA]: 'Pesquisa',
    [TipoIniciativa.INOVACAO]: 'Inovação',
    [TipoIniciativa.EMPREENDEDORISMO]: 'Empreendedorismo',
    [TipoIniciativa.EXTENSAO]: 'Extensão',
    [TipoIniciativa.DESENVOLVIMENTO]: 'Desenvolvimento',
    [TipoIniciativa.CONSULTORIA]: 'Consultoria',
    [TipoIniciativa.OUTROS]: 'Outros',
  }
  return labels[tipo] || tipo
}

const getNivelMaturidadeLabel = (nivel: NivelMaturidade) => {
  const labels = {
    [NivelMaturidade.CONCEITO]: 'Conceito (TRL 1-3)',
    [NivelMaturidade.PROTOTIPO]: 'Protótipo (TRL 4-6)',
    [NivelMaturidade.DEMONSTRACAO]: 'Demonstração (TRL 7-8)',
    [NivelMaturidade.COMERCIALIZACAO]: 'Comercialização (TRL 9)',
  }
  return labels[nivel] || nivel
}

export function InitiativeCreationModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}) {
  const [currentStep, setCurrentStep] = useState(0)
  const { useCreateInitiative } = useInitiativesApi()
  const { useGetUserBusinesses } = useBusinessApi()
  const createInitiativeMutation = useCreateInitiative()
  const { data: businesses, isLoading: businessesLoading } = useGetUserBusinesses()

  const form = useForm<InitiativeFormData>({
    resolver: zodResolver(initiativeSchema),
    mode: 'onChange',
    defaultValues: {
      business_id: '',
      titulo: '',
      descricao: '',
      tipo: TipoIniciativa.PESQUISA,
      data_inicio: '',
      data_fim: '',
      palavras_chave: [],
      nivel_maturidade: NivelMaturidade.CONCEITO,
      recursos_necessarios: '',
      resultados_esperados: '',
      impacto_esperado: '',
      publico_alvo: '',
      areas_conhecimento: [],
      tecnologias_utilizadas: [],
      ods_relacionados: [],
      metricas_sucesso: [],
      laboratorios: [],
      orcamento_previsto: undefined,
      fonte_financiamento: '',
      tipo_propriedade: '',
      moeda: 'BRL',
      tem_propriedade_intelectual: false,
      aceita_colaboradores: true,
      colaboracao_internacional: false,
    },
  })

  const handleSubmit = async () => {
    const isValid = await form.trigger()
    if (!isValid) return

    const data = form.getValues()

    try {
      const initiativeData = {
        ...data,
        data_inicio: new Date(data.data_inicio).toISOString(),
        data_fim: data.data_fim ? new Date(data.data_fim).toISOString() : undefined,
        orcamento_previsto: data.orcamento_previsto || undefined,
        areas_conhecimento: data.areas_conhecimento?.length ? data.areas_conhecimento : undefined,
        tecnologias_utilizadas: data.tecnologias_utilizadas?.length ? data.tecnologias_utilizadas : undefined,
        ods_relacionados: data.ods_relacionados?.length ? data.ods_relacionados : undefined,
        metricas_sucesso: data.metricas_sucesso?.length ? data.metricas_sucesso : undefined,
        laboratorios: data.laboratorios?.length ? data.laboratorios : undefined,
      }

      await createInitiativeMutation.mutateAsync(initiativeData as any)

      toast.success('Iniciativa criada com sucesso!')
      form.reset()
      setCurrentStep(0)
      onClose()
      if (onSuccess) onSuccess()
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail || error?.message || 'Erro ao criar iniciativa'
      toast.error(errorMessage)
    }
  }

  const getFieldsForStep = (step: number): (keyof InitiativeFormData)[] => {
    switch (step) {
      case 0:
        return ['business_id', 'titulo', 'descricao', 'tipo', 'data_inicio', 'data_fim']
      case 1:
        return ['palavras_chave', 'nivel_maturidade', 'recursos_necessarios', 'resultados_esperados', 'impacto_esperado', 'publico_alvo']
      case 2:
        return ['areas_conhecimento', 'tecnologias_utilizadas', 'ods_relacionados', 'metricas_sucesso', 'laboratorios', 'orcamento_previsto', 'fonte_financiamento', 'moeda', 'tem_propriedade_intelectual', 'tipo_propriedade', 'aceita_colaboradores', 'colaboracao_internacional']
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
      title: 'Informações Essenciais',
      icon: <Info className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="business_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Negócio *</FormLabel>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={businessesLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um negócio" />
                    </SelectTrigger>
                    <SelectContent>
                      {businesses?.map((business) => (
                        <SelectItem key={business.id} value={business.id}>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            {business.nome}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="titulo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título da Iniciativa *</FormLabel>
                <FormControl>
                  <Input
                    key="input-titulo"
                    placeholder="Ex: Desenvolvimento de aplicativo mobile"
                    {...field}
                  />
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
            name="descricao"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição *</FormLabel>
                <FormControl>
                  <TextareaWithCounter
                    key="textarea-descricao"
                    value={field.value}
                    onChange={field.onChange}
                    maxLength={2000}
                    placeholder="Descreva detalhadamente sua iniciativa, seus objetivos e como ela será executada..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tipo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Iniciativa *</FormLabel>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(TipoIniciativa).map((tipo) => (
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
              name="data_inicio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Início *</FormLabel>
                  <FormControl>
                    <Input key="input-data-inicio" type="date" {...field} />
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
                  <FormLabel>Data de Término</FormLabel>
                  <FormControl>
                    <Input key="input-data-fim" type="date" {...field} />
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
      title: 'Detalhes do Projeto',
      icon: <FileText className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="palavras_chave"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Palavras-chave *</FormLabel>
                <FormControl>
                  <TagInput
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Digite uma palavra-chave e pressione Enter"
                    maxTags={15}
                    maxLength={50}
                  />
                </FormControl>
                <FormDescription>
                  Adicione até 15 palavras-chave
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="nivel_maturidade"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nível de Maturidade *</FormLabel>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o nível de maturidade" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(NivelMaturidade).map((nivel) => (
                        <SelectItem key={nivel} value={nivel}>
                          {getNivelMaturidadeLabel(nivel)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="recursos_necessarios"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Recursos Necessários</FormLabel>
                <FormControl>
                  <TextareaWithCounter
                    value={field.value || ''}
                    onChange={field.onChange}
                    maxLength={1000}
                    minHeight="100px"
                    placeholder="Descreva os recursos necessários: financeiros, humanos, tecnológicos, etc."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="resultados_esperados"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Resultados Esperados</FormLabel>
                <FormControl>
                  <TextareaWithCounter
                    value={field.value || ''}
                    onChange={field.onChange}
                    maxLength={1000}
                    minHeight="100px"
                    placeholder="Descreva os resultados esperados e o impacto da iniciativa..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="impacto_esperado"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Impacto Esperado</FormLabel>
                <FormControl>
                  <TextareaWithCounter
                    value={field.value || ''}
                    onChange={field.onChange}
                    maxLength={1000}
                    minHeight="100px"
                    placeholder="Descreva o impacto esperado da iniciativa no negócio e na sociedade..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="publico_alvo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Público-alvo</FormLabel>
                <FormControl>
                  <TextareaWithCounter
                    value={field.value || ''}
                    onChange={field.onChange}
                    maxLength={500}
                    minHeight="80px"
                    placeholder="Descreva o público-alvo da iniciativa (ex: empresas, startups, universidades, etc.)"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      ),
    },
    {
      title: 'Configurações Adicionais',
      icon: <Settings className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="areas_conhecimento"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Áreas de Conhecimento</FormLabel>
                <FormControl>
                  <TagInput
                    value={field.value || []}
                    onChange={field.onChange}
                    placeholder="Digite uma área de conhecimento e pressione Enter"
                    maxTags={10}
                    maxLength={50}
                  />
                </FormControl>
                <FormDescription>
                  Até 10 áreas de conhecimento
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tecnologias_utilizadas"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tecnologias Utilizadas</FormLabel>
                <FormControl>
                  <TagInput
                    value={field.value || []}
                    onChange={field.onChange}
                    placeholder="Digite uma tecnologia e pressione Enter"
                    maxTags={20}
                    maxLength={50}
                  />
                </FormControl>
                <FormDescription>
                  Até 20 tecnologias
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ods_relacionados"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ODS Relacionados</FormLabel>
                <FormControl>
                  <TagInput
                    value={field.value || []}
                    onChange={field.onChange}
                    placeholder="Digite um ODS e pressione Enter"
                    maxTags={17}
                    maxLength={100}
                  />
                </FormControl>
                <FormDescription>
                  Objetivos de Desenvolvimento Sustentável (até 17)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="metricas_sucesso"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Métricas de Sucesso</FormLabel>
                <FormControl>
                  <TagInput
                    value={field.value || []}
                    onChange={field.onChange}
                    placeholder="Digite uma métrica e pressione Enter"
                    maxTags={10}
                    maxLength={100}
                  />
                </FormControl>
                <FormDescription>
                  Até 10 métricas de sucesso
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="laboratorios"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Laboratórios</FormLabel>
                <FormControl>
                  <TagInput
                    value={field.value || []}
                    onChange={field.onChange}
                    placeholder="Digite um laboratório e pressione Enter"
                    maxTags={10}
                    maxLength={100}
                  />
                </FormControl>
                <FormDescription>
                  Laboratórios envolvidos (até 10)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="moeda"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Moeda</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BRL">Real (R$)</SelectItem>
                        <SelectItem value="USD">Dólar ($)</SelectItem>
                        <SelectItem value="EUR">Euro (€)</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="orcamento_previsto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Orçamento Previsto</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      placeholder="Ex: 100000"
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="fonte_financiamento"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fonte de Financiamento</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex: Investimento, convênio, etc."
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  {field.value?.length || 0}/200 caracteres
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tem_propriedade_intelectual"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Tem Propriedade Intelectual?
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />

          {form.watch('tem_propriedade_intelectual') && (
            <FormField
              control={form.control}
              name="tipo_propriedade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Propriedade</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Patente, marca registrada, etc."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {field.value?.length || 0}/100 caracteres
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="aceita_colaboradores"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Aceita Colaboradores?
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="colaboracao_internacional"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Colaboração Internacional?
                  </FormLabel>
                </div>
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
        title="Criar Nova Iniciativa"
        description="Preencha os dados da sua iniciativa em 3 etapas simples"
        steps={steps}
        currentStep={currentStep}
        onStepChange={handleStepChange}
        onSubmit={handleSubmit}
        isSubmitting={createInitiativeMutation.isPending}
        submitText="Criar Iniciativa"
        maxWidth="sm:max-w-[700px]"
      />
    </Form>
  )
}
