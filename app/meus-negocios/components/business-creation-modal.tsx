/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
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
import { PhoneInput } from '@/components/phone-input'
import { Building2, FileText, Briefcase } from 'lucide-react'
import {
  NegocioType,
  AreaAtuacao,
  EstagioNegocio,
  CategoriaNegocio,
} from '@/lib/types/businessTypes'

// Schema de validação (tipo_negocio removido - sempre PARCEIRA)
const businessSchema = z.object({
  nome: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  email: z.string().email('Email inválido'),
  telefone: z
    .string()
    .min(14, 'Telefone deve ter pelo menos 14 caracteres (incluindo +55)'),
  categoria: z.nativeEnum(CategoriaNegocio),
  area_atuacao: z.nativeEnum(AreaAtuacao),
  estagio: z.nativeEnum(EstagioNegocio),
  palavras_chave: z
    .array(z.string().max(50, 'Palavra-chave deve ter no máximo 50 caracteres'))
    .min(1, 'Pelo menos uma palavra-chave é obrigatória')
    .max(15, 'Máximo de 15 palavras-chave'),
  descricao: z
    .string()
    .min(10, 'A descrição do negócio deve ter pelo menos 10 caracteres')
    .max(1000, 'A descrição deve ter no máximo 1000 caracteres'),
  descricao_problema: z
    .string()
    .min(10, 'A descrição do problema deve ter pelo menos 10 caracteres')
    .max(500, 'A descrição do problema deve ter no máximo 500 caracteres'),
  solucao_proposta: z
    .string()
    .min(10, 'A solução proposta deve ter pelo menos 10 caracteres')
    .max(500, 'A solução deve ter no máximo 500 caracteres'),
  website: z.string().url('URL inválida').optional().or(z.literal('')),
  cnpj: z
    .string()
    .regex(/^\d{14}$/, 'CNPJ deve ter 14 dígitos')
    .optional()
    .or(z.literal('')),
  cnae: z
    .string()
    .regex(/^\d{7}$/, 'CNAE deve ter 7 dígitos')
    .optional()
    .or(z.literal('')),
  razao_social: z.string().optional(),
})

type BusinessFormData = z.infer<typeof businessSchema>

// Helper functions para labels
const getCategoriaLabel = (value: CategoriaNegocio): string => {
  const labels = {
    [CategoriaNegocio.STARTUP]: 'Startup',
    [CategoriaNegocio.EMPRESA_JUNIOR]: 'Empresa Júnior',
    [CategoriaNegocio.SPIN_OFF]: 'Spin-off',
    [CategoriaNegocio.OUTRO]: 'Outro',
  }
  return labels[value] || value
}

const getAreaAtuacaoLabel = (value: AreaAtuacao): string => {
  const labels = {
    [AreaAtuacao.TECNOLOGIA]: 'Tecnologia',
    [AreaAtuacao.SAUDE]: 'Saúde',
    [AreaAtuacao.EDUCACAO]: 'Educação',
    [AreaAtuacao.SUSTENTABILIDADE]: 'Sustentabilidade',
    [AreaAtuacao.INDUSTRIA]: 'Indústria',
    [AreaAtuacao.SERVICOS]: 'Serviços',
    [AreaAtuacao.VAREJO]: 'Varejo',
    [AreaAtuacao.FINANCAS]: 'Finanças',
    [AreaAtuacao.OUTRO]: 'Outro',
  }
  return labels[value] || value
}

const getEstagioLabel = (value: EstagioNegocio): string => {
  const labels = {
    [EstagioNegocio.IDEACAO]: 'Ideação',
    [EstagioNegocio.VALIDACAO]: 'Validação',
    [EstagioNegocio.MVP]: 'MVP',
    [EstagioNegocio.OPERACAO]: 'Operação',
    [EstagioNegocio.CRESCIMENTO]: 'Crescimento',
    [EstagioNegocio.ESCALA]: 'Escala',
  }
  return labels[value] || value
}

export function BusinessCreationModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}) {
  const [currentStep, setCurrentStep] = useState(0)
  const { useCreateBusiness } = useBusinessApi()
  const createBusinessMutation = useCreateBusiness()

  const form = useForm<BusinessFormData>({
    resolver: zodResolver(businessSchema),
    mode: 'onChange',
    defaultValues: {
      nome: '',
      email: '',
      telefone: '+55',
      categoria: CategoriaNegocio.STARTUP,
      area_atuacao: AreaAtuacao.TECNOLOGIA,
      estagio: EstagioNegocio.IDEACAO,
      palavras_chave: [],
      descricao: '',
      descricao_problema: '',
      solucao_proposta: '',
      website: '',
      cnpj: '',
      cnae: '',
      razao_social: '',
    },
  })

  const handleSubmit = async () => {
    const isValid = await form.trigger()
    if (!isValid) return

    const data = form.getValues()

    try {
      const businessData = {
        nome: data.nome,
        email: data.email,
        telefone: data.telefone,
        tipo_negocio: NegocioType.PARCEIRA, // Sempre PARCEIRA - admin altera manualmente
        categoria: data.categoria,
        area_atuacao: data.area_atuacao,
        estagio: data.estagio,
        descricao: data.descricao,
        descricao_problema: data.descricao_problema,
        solucao_proposta: data.solucao_proposta, // Obrigatório conforme backend
        palavras_chave: data.palavras_chave,
        website: data.website || undefined,
        cnpj: data.cnpj || undefined,
        cnae: data.cnae || undefined,
        razao_social: data.razao_social || undefined,
      }

      await createBusinessMutation.mutateAsync(businessData as any)

      // Reset form and close
      form.reset()
      setCurrentStep(0)
      onClose()
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error('Erro ao criar negócio:', error)
    }
  }

  const getFieldsForStep = (step: number): (keyof BusinessFormData)[] => {
    switch (step) {
      case 0:
        return ['nome', 'email', 'telefone', 'categoria']
      case 1:
        return ['descricao', 'descricao_problema', 'solucao_proposta', 'palavras_chave', 'area_atuacao', 'estagio']
      case 2:
        return ['cnpj', 'cnae', 'razao_social', 'website']
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

  // Define os 3 steps com UI melhorada
  const steps: WizardStep[] = [
    {
      title: 'Informações Essenciais',
      icon: <Building2 className="w-5 h-5" />,
      content: (
        <div className="space-y-5">
          <FormField
            control={form.control}
            name="nome"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-semibold">Nome do Negócio *</FormLabel>
                <FormControl>
                  <Input
                    key="input-nome"
                    placeholder="Digite o nome do seu negócio"
                    className="border-purple-200 focus:border-purple-500 focus:ring-purple-500/20"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-xs text-gray-500">
                  {field.value.length}/100 caracteres
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-semibold">Email *</FormLabel>
                <FormControl>
                  <Input
                    key="input-email"
                    type="email"
                    placeholder="contato@seunegocio.com"
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
            name="telefone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-semibold">Telefone *</FormLabel>
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

          <FormField
            control={form.control}
            name="categoria"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-semibold">Categoria *</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={(value) => field.onChange(value as CategoriaNegocio)}
                    defaultValue={field.value}
                  >
                    <SelectTrigger className="border-purple-200 focus:border-purple-500 focus:ring-purple-500/20">
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(CategoriaNegocio).map((value) => (
                        <SelectItem key={value} value={value}>
                          {getCategoriaLabel(value as CategoriaNegocio)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormDescription className="text-xs text-gray-500">
                  Classifique o tipo de empreendimento
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
                <FormLabel className="text-gray-700 font-semibold">Descrição do Negócio *</FormLabel>
                <FormControl>
                  <TextareaWithCounter
                    key="textarea-descricao"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    maxLength={1000}
                    placeholder="Descreva seu negócio, o que ele faz, qual problema resolve ou que serviços/produtos oferece..."
                    className="border-purple-200 focus:border-purple-500 focus:ring-purple-500/20"
                  />
                </FormControl>
                <FormDescription className="text-xs text-gray-500">
                  Apresente seu negócio de forma clara e objetiva
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="descricao_problema"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-semibold">Problema que Resolve *</FormLabel>
                <FormControl>
                  <TextareaWithCounter
                    key="textarea-descricao-problema"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    maxLength={500}
                    minHeight="100px"
                    placeholder="Descreva qual problema ou dor do cliente seu negócio resolve..."
                    className="border-purple-200 focus:border-purple-500 focus:ring-purple-500/20"
                  />
                </FormControl>
                <FormDescription className="text-xs text-gray-500">
                  Explique o problema que seu negócio soluciona
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="solucao_proposta"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-semibold">Solução Proposta *</FormLabel>
                <FormControl>
                  <TextareaWithCounter
                    key="textarea-solucao-proposta"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    maxLength={500}
                    minHeight="100px"
                    placeholder="Como seu negócio resolve esse problema? Qual é a sua solução?"
                    className="border-purple-200 focus:border-purple-500 focus:ring-purple-500/20"
                  />
                </FormControl>
                <FormDescription className="text-xs text-gray-500">
                  Descreva a solução que você oferece
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
                <FormLabel className="text-gray-700 font-semibold">Palavras-chave *</FormLabel>
                <FormControl>
                  <TagInput
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Digite uma palavra-chave e pressione Enter"
                    maxTags={15}
                    maxLength={50}
                  />
                </FormControl>
                <FormDescription className="text-xs text-gray-500">
                  Adicione até 15 palavras-chave que descrevam seu negócio
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="area_atuacao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-semibold">Área de Atuação *</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(value) => field.onChange(value as AreaAtuacao)}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="border-purple-200 focus:border-purple-500 focus:ring-purple-500/20">
                        <SelectValue placeholder="Selecione a área" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(AreaAtuacao).map((value) => (
                          <SelectItem key={value} value={value}>
                            {getAreaAtuacaoLabel(value as AreaAtuacao)}
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
              name="estagio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-semibold">Estágio *</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(value) => field.onChange(value as EstagioNegocio)}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="border-purple-200 focus:border-purple-500 focus:ring-purple-500/20">
                        <SelectValue placeholder="Selecione o estágio" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(EstagioNegocio).map((value) => (
                          <SelectItem key={value} value={value}>
                            {getEstagioLabel(value as EstagioNegocio)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription className="text-xs text-gray-500">
                    Estágio de desenvolvimento
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      ),
    },
    {
      title: 'Informações Adicionais',
      icon: <Briefcase className="w-5 h-5" />,
      content: (
        <div className="space-y-5">
          <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
            <p className="text-sm text-purple-800">
              <strong>Opcional:</strong> Preencha apenas se seu negócio já possui CNPJ e documentação formal.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="cnpj"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-semibold">CNPJ</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="00000000000000"
                      className="border-purple-200 focus:border-purple-500 focus:ring-purple-500/20"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs text-gray-500">
                    Apenas números
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cnae"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-semibold">CNAE</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="0000000"
                      className="border-purple-200 focus:border-purple-500 focus:ring-purple-500/20"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs text-gray-500">
                    Apenas números
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="razao_social"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-semibold">Razão Social</FormLabel>
                <FormControl>
                  <Input
                    key="input-razao-social"
                    placeholder="Razão social da empresa"
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
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-semibold">Website</FormLabel>
                <FormControl>
                  <Input
                    key="input-website"
                    placeholder="https://www.seunegocio.com"
                    className="border-purple-200 focus:border-purple-500 focus:ring-purple-500/20"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-xs text-gray-500">
                  URL do site oficial (opcional)
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
        title="Criar Novo Negócio"
        description="Preencha os dados do seu negócio em 3 etapas simples"
        steps={steps}
        currentStep={currentStep}
        onStepChange={handleStepChange}
        onSubmit={handleSubmit}
        isSubmitting={createBusinessMutation.isPending}
        submitText="Criar Negócio"
      />
    </Form>
  )
}
