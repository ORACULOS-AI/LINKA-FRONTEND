'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  IniciativaCreate,
  TipoIniciativa,
  StatusIniciativa,
  NivelMaturidade,
} from '@/lib/types/initiativeTypes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useInitiativesApi } from '@/lib/api/initiatives'
import { useBusinessApi } from '@/lib/api/business'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  ChevronRight, 
  ChevronLeft, 
  Building2, 
  FileText, 
  Settings, 
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Target,
  Calendar,
  Hash,
  X,
  Sparkles,
  DollarSign,
  Users,
  Globe,
  Shield,
  Zap,
  Briefcase
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

type Step = 'business' | 'basic' | 'details' | 'advanced'

interface StepConfig {
  id: Step
  title: string
  description: string
  icon: React.ReactNode
}

export default function CriarIniciativa() {
  const router = useRouter()
  const { useCreateInitiative } = useInitiativesApi()
  const { useGetUserBusinesses } = useBusinessApi()
  const createInitiativeMutation = useCreateInitiative()
  const { data: businesses, isLoading: businessesLoading } = useGetUserBusinesses()

  const [currentStep, setCurrentStep] = useState<Step>('business')
  const [formData, setFormData] = useState<Partial<IniciativaCreate>>({
    nivel_maturidade: NivelMaturidade.CONCEITO,
    areas_conhecimento: [],
    tecnologias_utilizadas: [],
    ods_relacionados: [],
    metricas_sucesso: [],
    laboratorios: [],
    palavras_chave: [],
    moeda: 'BRL',
    tem_propriedade_intelectual: false,
    aceita_colaboradores: true,
    colaboracao_internacional: false,
    visivel: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [keywordInput, setKeywordInput] = useState('')
  const [areaInput, setAreaInput] = useState('')
  const [tecnologiaInput, setTecnologiaInput] = useState('')
  const [metricaInput, setMetricaInput] = useState('')
  const [odsInput, setOdsInput] = useState('')
  const [laboratorioInput, setLaboratorioInput] = useState('')

  const steps: StepConfig[] = [
    { 
      id: 'business', 
      title: 'Selecionar Negócio',
      description: 'Escolha o negócio vinculado à iniciativa',
      icon: <Building2 className="h-5 w-5" />
    },
    { 
      id: 'basic', 
      title: 'Informações Básicas',
      description: 'Defina título, descrição e tipo',
      icon: <FileText className="h-5 w-5" />
    },
    { 
      id: 'details', 
      title: 'Detalhes do Projeto',
      description: 'Recursos, resultados e características',
      icon: <Settings className="h-5 w-5" />
    },
    { 
      id: 'advanced', 
      title: 'Configurações Avançadas',
      description: 'Orçamento, colaboração e propriedade',
      icon: <Briefcase className="h-5 w-5" />
    },
  ]

  const currentStepIndex = steps.findIndex((step) => step.id === currentStep)
  const progress = ((currentStepIndex + 1) / steps.length) * 100

  useEffect(() => {
    if (!businessesLoading && businesses && businesses.length === 0) {
      toast.error('Você precisa ter pelo menos um negócio cadastrado')
      router.push('/minhas-iniciativas')
    }
  }, [businesses, businessesLoading, router])

  const validateStep = (step: Step): boolean => {
    const newErrors: Record<string, string> = {}
    
    switch (step) {
      case 'business':
        if (!formData.business_id) {
          newErrors.business_id = 'Selecione um negócio'
        }
        break
      case 'basic':
        if (!formData.titulo?.trim()) {
          newErrors.titulo = 'Título é obrigatório'
        } else if (formData.titulo.trim().length < 3) {
          newErrors.titulo = 'Título deve ter pelo menos 3 caracteres'
        } else if (formData.titulo.trim().length > 100) {
          newErrors.titulo = 'Título deve ter no máximo 100 caracteres'
        }
        
        if (!formData.descricao?.trim()) {
          newErrors.descricao = 'Descrição é obrigatória'
        } else if (formData.descricao.trim().length < 10) {
          newErrors.descricao = 'Descrição deve ter pelo menos 10 caracteres'
        } else if (formData.descricao.trim().length > 2000) {
          newErrors.descricao = 'Descrição deve ter no máximo 2000 caracteres'
        }
        
        if (!formData.tipo) {
          newErrors.tipo = 'Tipo é obrigatório'
        }
        if (!formData.data_inicio) {
          newErrors.data_inicio = 'Data de início é obrigatória'
        }
        
        // Validar data de fim se fornecida
        if (formData.data_fim && formData.data_inicio) {
          const dataInicio = new Date(formData.data_inicio)
          const dataFim = new Date(formData.data_fim)
          if (dataFim <= dataInicio) {
            newErrors.data_fim = 'Data de fim deve ser posterior à data de início'
          }
        }
        break
      case 'details':
        // Validações opcionais para detalhes
        if (formData.recursos_necessarios && formData.recursos_necessarios.length > 1000) {
          newErrors.recursos_necessarios = 'Recursos necessários deve ter no máximo 1000 caracteres'
        }
        if (formData.resultados_esperados && formData.resultados_esperados.length > 1000) {
          newErrors.resultados_esperados = 'Resultados esperados deve ter no máximo 1000 caracteres'
        }
        if (formData.impacto_esperado && formData.impacto_esperado.length > 1000) {
          newErrors.impacto_esperado = 'Impacto esperado deve ter no máximo 1000 caracteres'
        }
        if (formData.publico_alvo && formData.publico_alvo.length > 500) {
          newErrors.publico_alvo = 'Público-alvo deve ter no máximo 500 caracteres'
        }
        break
      case 'advanced':
        // Validações para campos avançados
        if (formData.orcamento_previsto && formData.orcamento_previsto < 0) {
          newErrors.orcamento_previsto = 'Orçamento deve ser um valor positivo'
        }
        if (formData.fonte_financiamento && formData.fonte_financiamento.length > 200) {
          newErrors.fonte_financiamento = 'Fonte de financiamento deve ter no máximo 200 caracteres'
        }
        if (formData.tipo_propriedade && formData.tipo_propriedade.length > 100) {
          newErrors.tipo_propriedade = 'Tipo de propriedade deve ter no máximo 100 caracteres'
        }
        
        // Validações de limites para listas
        if (formData.areas_conhecimento && formData.areas_conhecimento.length > 10) {
          newErrors.areas_conhecimento = 'Máximo de 10 áreas de conhecimento'
        }
        if (formData.tecnologias_utilizadas && formData.tecnologias_utilizadas.length > 20) {
          newErrors.tecnologias_utilizadas = 'Máximo de 20 tecnologias'
        }
        if (formData.ods_relacionados && formData.ods_relacionados.length > 17) {
          newErrors.ods_relacionados = 'Máximo de 17 ODS'
        }
        if (formData.metricas_sucesso && formData.metricas_sucesso.length > 10) {
          newErrors.metricas_sucesso = 'Máximo de 10 métricas de sucesso'
        }
        if (formData.laboratorios && formData.laboratorios.length > 10) {
          newErrors.laboratorios = 'Máximo de 10 laboratórios'
        }
        if (formData.palavras_chave && formData.palavras_chave.length > 15) {
          newErrors.palavras_chave = 'Máximo de 15 palavras-chave'
        }
        break
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateStep(currentStep)) {
      return
    }

    if (currentStep === 'advanced') {
      try {
        // Preparar dados para envio
        const dataToSend = {
          ...formData,
          // Converter data para formato ISO se necessário
          data_inicio: formData.data_inicio ? new Date(formData.data_inicio).toISOString() : undefined,
          data_fim: formData.data_fim ? new Date(formData.data_fim).toISOString() : undefined,
        }
        
        await createInitiativeMutation.mutateAsync(dataToSend as IniciativaCreate)
        toast.success('Iniciativa criada com sucesso!')
        router.push('/minhas-iniciativas')
      } catch (error: any) {
        const errorMessage = error?.response?.data?.detail || error?.message || 'Erro ao criar iniciativa'
        toast.error(errorMessage)
      }
    } else {
      setCurrentStep(steps[currentStepIndex + 1].id)
    }
  }

  const handleBack = () => {
    setCurrentStep(steps[currentStepIndex - 1].id)
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleNumberChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = e.target
    const numValue = value === '' ? undefined : parseFloat(value)
    setFormData((prev) => ({ ...prev, [name]: numValue }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const addToList = (listName: keyof IniciativaCreate, input: string, setInput: (value: string) => void) => {
    if (input.trim()) {
      const currentList = (formData[listName] as string[]) || []
      if (!currentList.includes(input.trim())) {
        setFormData((prev) => ({
          ...prev,
          [listName]: [...currentList, input.trim()]
        }))
        setInput('')
      }
    }
  }

  const removeFromList = (listName: keyof IniciativaCreate, item: string) => {
    const currentList = (formData[listName] as string[]) || []
    setFormData((prev) => ({
      ...prev,
      [listName]: currentList.filter(i => i !== item)
    }))
  }

  const handleKeyPress = (e: React.KeyboardEvent, callback: () => void) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      callback()
    }
  }

  const getTipoLabel = (tipo: TipoIniciativa) => {
    const labels = {
      [TipoIniciativa.PESQUISA]: 'Pesquisa',
      [TipoIniciativa.INOVACAO]: 'Inovação',
      [TipoIniciativa.EMPREENDEDORISMO]: 'Empreendedorismo',
      [TipoIniciativa.EXTENSAO]: 'Extensão',
      [TipoIniciativa.DESENVOLVIMENTO]: 'Desenvolvimento',
      [TipoIniciativa.CONSULTORIA]: 'Consultoria',
      [TipoIniciativa.OUTROS]: 'Outros'
    }
    return labels[tipo] || tipo
  }

  const getTipoIcon = (tipo: TipoIniciativa) => {
    switch (tipo) {
      case TipoIniciativa.PESQUISA:
        return '��'
      case TipoIniciativa.INOVACAO:
        return '💡'
      case TipoIniciativa.EMPREENDEDORISMO:
        return '🚀'
      case TipoIniciativa.EXTENSAO:
        return '🤝'
      case TipoIniciativa.DESENVOLVIMENTO:
        return '💻'
      case TipoIniciativa.CONSULTORIA:
        return '🎯'
      default:
        return '📋'
    }
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

  const getCharacterCount = (text: string | undefined, max: number) => {
    const current = text?.length || 0
    const percentage = (current / max) * 100
    let colorClass = 'text-gray-500'
    
    if (percentage > 90) colorClass = 'text-red-500'
    else if (percentage > 75) colorClass = 'text-yellow-500'
    else if (percentage > 50) colorClass = 'text-blue-500'
    
    return { current, max, percentage, colorClass }
  }

  const renderCharacterCounter = (text: string | undefined, max: number) => {
    const { current, colorClass } = getCharacterCount(text, max)
    return (
      <div className={`text-xs ${colorClass} text-right mt-1`}>
        {current}/{max} caracteres
      </div>
    )
  }

  const renderListCounter = (list: string[] | undefined, max: number, label: string) => {
    const current = list?.length || 0
    const percentage = (current / max) * 100
    let colorClass = 'text-gray-500'
    
    if (percentage > 90) colorClass = 'text-red-500'
    else if (percentage > 75) colorClass = 'text-yellow-500'
    else if (percentage > 50) colorClass = 'text-blue-500'
    
    return (
      <div className={`text-xs ${colorClass} text-right mt-1`}>
        {current}/{max} {label}
      </div>
    )
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 'business':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-violet-100 rounded-full flex items-center justify-center mx-auto">
                <Building2 className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Selecione o Negócio</h3>
                <p className="text-gray-600">Escolha o negócio ao qual esta iniciativa estará vinculada</p>
              </div>
            </div>

            {(!businesses || businesses.length === 0) ? (
              <div className="text-center space-y-4 p-8 bg-red-50 rounded-xl border border-red-200">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
                <div>
                  <p className="text-red-700 font-medium">Nenhum negócio encontrado</p>
                  <p className="text-red-600 text-sm">Você precisa ter pelo menos um negócio cadastrado para criar uma iniciativa.</p>
                </div>
                <Button
                  type="button"
                  onClick={() => router.push('/meus-negocios')}
                  className="bg-gradient-to-r from-purple-600 to-violet-600 hover:shadow-purple-500/25 hover:shadow-lg transition-all duration-300"
                >
                  Criar Negócio
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="business_id" className="text-sm font-medium text-gray-700">
                    Negócio *
                  </Label>
                  <Select
                    value={formData.business_id}
                    onValueChange={(value) => {
                      setFormData({ ...formData, business_id: value })
                      if (errors.business_id) {
                        setErrors((prev) => ({ ...prev, business_id: '' }))
                      }
                    }}
                  >
                    <SelectTrigger className={`w-full bg-white border-2 ${errors.business_id ? 'border-red-300 focus:border-red-400' : 'border-purple-200 focus:border-purple-400'} focus:ring-purple-400 rounded-xl shadow-sm transition-all duration-200 h-12`}>
                      <SelectValue placeholder="Selecione um negócio" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-purple-200 rounded-xl shadow-lg">
                      {businesses?.map((business) => (
                        <SelectItem key={business.id} value={business.id} className="hover:bg-purple-50">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-violet-100 rounded-lg flex items-center justify-center">
                              <Building2 className="h-4 w-4 text-purple-600" />
                            </div>
                            <span>{business.nome}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.business_id && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.business_id}
                    </p>
                  )}
                </div>
                
                <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-purple-900">Dica</p>
                      <p className="text-sm text-purple-700">
                        A iniciativa será vinculada ao negócio selecionado e aparecerá no perfil do negócio.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )

      case 'basic':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-violet-100 rounded-full flex items-center justify-center mx-auto">
                <FileText className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Informações Básicas</h3>
                <p className="text-gray-600">Defina as informações principais da sua iniciativa</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="titulo" className="text-sm font-medium text-gray-700">
                  Título da Iniciativa *
                </Label>
                <Input
                  id="titulo"
                  name="titulo"
                  value={formData.titulo || ''}
                  onChange={handleChange}
                  placeholder="Ex: Desenvolvimento de aplicativo mobile"
                  className={`w-full bg-white border-2 ${errors.titulo ? 'border-red-300 focus:border-red-400' : 'border-purple-200 focus:border-purple-400'} focus:ring-purple-400 rounded-xl shadow-sm transition-all duration-200 h-12`}
                />
                {renderCharacterCounter(formData.titulo, 100)}
                {errors.titulo && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.titulo}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao" className="text-sm font-medium text-gray-700">
                  Descrição *
                </Label>
                <Textarea
                  id="descricao"
                  name="descricao"
                  value={formData.descricao || ''}
                  onChange={handleChange}
                  placeholder="Descreva detalhadamente sua iniciativa, seus objetivos e como ela será executada..."
                  className={`w-full bg-white border-2 ${errors.descricao ? 'border-red-300 focus:border-red-400' : 'border-purple-200 focus:border-purple-400'} focus:ring-purple-400 rounded-xl shadow-sm transition-all duration-200 min-h-[120px] resize-none`}
                />
                {renderCharacterCounter(formData.descricao, 2000)}
                {errors.descricao && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.descricao}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo" className="text-sm font-medium text-gray-700">
                  Tipo de Iniciativa *
                </Label>
                <Select
                  value={formData.tipo}
                  onValueChange={(value) => {
                    setFormData((prev) => ({
                      ...prev,
                      tipo: value as TipoIniciativa,
                    }))
                    if (errors.tipo) {
                      setErrors((prev) => ({ ...prev, tipo: '' }))
                    }
                  }}
                >
                  <SelectTrigger className={`w-full bg-white border-2 ${errors.tipo ? 'border-red-300 focus:border-red-400' : 'border-purple-200 focus:border-purple-400'} focus:ring-purple-400 rounded-xl shadow-sm transition-all duration-200 h-12`}>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-purple-200 rounded-xl shadow-lg">
                    {Object.values(TipoIniciativa).map((tipo) => (
                      <SelectItem key={tipo} value={tipo} className="hover:bg-purple-50">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{getTipoIcon(tipo)}</span>
                          <span>{getTipoLabel(tipo)}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.tipo && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.tipo}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="data_inicio" className="text-sm font-medium text-gray-700">
                    Data de Início *
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-400" />
                    <Input
                      id="data_inicio"
                      name="data_inicio"
                      type="date"
                      value={formData.data_inicio || ''}
                      onChange={handleChange}
                      className={`w-full pl-10 bg-white border-2 ${errors.data_inicio ? 'border-red-300 focus:border-red-400' : 'border-purple-200 focus:border-purple-400'} focus:ring-purple-400 rounded-xl shadow-sm transition-all duration-200 h-12`}
                    />
                  </div>
                  {errors.data_inicio && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.data_inicio}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="data_fim" className="text-sm font-medium text-gray-700">
                    Data de Término (Opcional)
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-400" />
                    <Input
                      id="data_fim"
                      name="data_fim"
                      type="date"
                      value={formData.data_fim || ''}
                      onChange={handleChange}
                      className="w-full pl-10 bg-white border-2 border-purple-200 focus:border-purple-400 focus:ring-purple-400 rounded-xl shadow-sm transition-all duration-200 h-12"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )

      case 'details':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-violet-100 rounded-full flex items-center justify-center mx-auto">
                <Settings className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Detalhes do Projeto</h3>
                <p className="text-gray-600">Complete com informações adicionais sobre recursos e resultados</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="recursos_necessarios" className="text-sm font-medium text-gray-700">
                  Recursos Necessários
                </Label>
                <Textarea
                  id="recursos_necessarios"
                  name="recursos_necessarios"
                  value={formData.recursos_necessarios || ''}
                  onChange={handleChange}
                  placeholder="Descreva os recursos necessários: financeiros, humanos, tecnológicos, etc."
                  className="w-full bg-white border-2 border-purple-200 focus:border-purple-400 focus:ring-purple-400 rounded-xl shadow-sm transition-all duration-200 min-h-[100px] resize-none"
                />
                {renderCharacterCounter(formData.recursos_necessarios, 1000)}
                {errors.recursos_necessarios && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.recursos_necessarios}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="resultados_esperados" className="text-sm font-medium text-gray-700">
                  Resultados Esperados
                </Label>
                <Textarea
                  id="resultados_esperados"
                  name="resultados_esperados"
                  value={formData.resultados_esperados || ''}
                  onChange={handleChange}
                  placeholder="Descreva os resultados esperados e o impacto da iniciativa..."
                  className="w-full bg-white border-2 border-purple-200 focus:border-purple-400 focus:ring-purple-400 rounded-xl shadow-sm transition-all duration-200 min-h-[100px] resize-none"
                />
                {renderCharacterCounter(formData.resultados_esperados, 1000)}
                {errors.resultados_esperados && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.resultados_esperados}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="impacto_esperado" className="text-sm font-medium text-gray-700">
                  Impacto Esperado
                </Label>
                <Textarea
                  id="impacto_esperado"
                  name="impacto_esperado"
                  value={formData.impacto_esperado || ''}
                  onChange={handleChange}
                  placeholder="Descreva o impacto esperado da iniciativa no negócio e na sociedade..."
                  className="w-full bg-white border-2 border-purple-200 focus:border-purple-400 focus:ring-purple-400 rounded-xl shadow-sm transition-all duration-200 min-h-[100px] resize-none"
                />
                {renderCharacterCounter(formData.impacto_esperado, 1000)}
                {errors.impacto_esperado && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.impacto_esperado}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="publico_alvo" className="text-sm font-medium text-gray-700">
                  Público-alvo
                </Label>
                <Textarea
                  id="publico_alvo"
                  name="publico_alvo"
                  value={formData.publico_alvo || ''}
                  onChange={handleChange}
                  placeholder="Descreva o público-alvo da iniciativa (ex: empresas, startups, universidades, etc.)"
                  className="w-full bg-white border-2 border-purple-200 focus:border-purple-400 focus:ring-purple-400 rounded-xl shadow-sm transition-all duration-200 min-h-[100px] resize-none"
                />
                {renderCharacterCounter(formData.publico_alvo, 500)}
                {errors.publico_alvo && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.publico_alvo}
                  </p>
                )}
              </div>

              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-900">Quase pronto!</p>
                    <p className="text-sm text-green-700">
                      Revise as informações e clique em "Criar Iniciativa" para finalizar.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )

      case 'advanced':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-violet-100 rounded-full flex items-center justify-center mx-auto">
                <Briefcase className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Configurações Avançadas</h3>
                <p className="text-gray-600">Complete com informações adicionais sobre orçamento e propriedade</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="nivel_maturidade" className="text-sm font-medium text-gray-700">
                  Nível de Maturidade *
                </Label>
                <Select
                  value={formData.nivel_maturidade}
                  onValueChange={(value) => {
                    setFormData((prev) => ({
                      ...prev,
                      nivel_maturidade: value as NivelMaturidade,
                    }))
                    if (errors.nivel_maturidade) {
                      setErrors((prev) => ({ ...prev, nivel_maturidade: '' }))
                    }
                  }}
                >
                  <SelectTrigger className={`w-full bg-white border-2 ${errors.nivel_maturidade ? 'border-red-300 focus:border-red-400' : 'border-purple-200 focus:border-purple-400'} focus:ring-purple-400 rounded-xl shadow-sm transition-all duration-200 h-12`}>
                    <SelectValue placeholder="Selecione o nível de maturidade" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-purple-200 rounded-xl shadow-lg">
                    {Object.values(NivelMaturidade).map((nivel) => (
                      <SelectItem key={nivel} value={nivel} className="hover:bg-purple-50">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{getNivelMaturidadeLabel(nivel)}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.nivel_maturidade && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.nivel_maturidade}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="areas_conhecimento" className="text-sm font-medium text-gray-700">
                  Áreas de Conhecimento
                </Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-400" />
                    <Input
                      placeholder="Digite uma área de conhecimento e pressione Enter"
                      value={areaInput}
                      onChange={(e) => setAreaInput(e.target.value)}
                      onKeyPress={(e) => handleKeyPress(e, () => addToList('areas_conhecimento', areaInput, setAreaInput))}
                      className="w-full pl-10 bg-white border-2 border-purple-200 focus:border-purple-400 focus:ring-purple-400 rounded-xl shadow-sm transition-all duration-200 h-12"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={() => addToList('areas_conhecimento', areaInput, setAreaInput)}
                    disabled={!areaInput.trim()}
                    className="bg-gradient-to-r from-purple-600 to-violet-600 hover:shadow-purple-500/25 hover:shadow-lg transition-all duration-300 px-6"
                  >
                    Adicionar
                  </Button>
                </div>
                
                {formData.areas_conhecimento && formData.areas_conhecimento.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.areas_conhecimento.map((area, index) => (
                      <Badge
                        key={index}
                        className="bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200 transition-colors duration-200 px-3 py-1"
                      >
                        {area}
                        <button
                          type="button"
                          onClick={() => removeFromList('areas_conhecimento', area)}
                          className="ml-2 text-purple-600 hover:text-purple-800 transition-colors duration-200"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                {renderListCounter(formData.areas_conhecimento, 10, 'área de conhecimento')}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tecnologias_utilizadas" className="text-sm font-medium text-gray-700">
                  Tecnologias Utilizadas
                </Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-400" />
                    <Input
                      placeholder="Digite uma tecnologia utilizada e pressione Enter"
                      value={tecnologiaInput}
                      onChange={(e) => setTecnologiaInput(e.target.value)}
                      onKeyPress={(e) => handleKeyPress(e, () => addToList('tecnologias_utilizadas', tecnologiaInput, setTecnologiaInput))}
                      className="w-full pl-10 bg-white border-2 border-purple-200 focus:border-purple-400 focus:ring-purple-400 rounded-xl shadow-sm transition-all duration-200 h-12"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={() => addToList('tecnologias_utilizadas', tecnologiaInput, setTecnologiaInput)}
                    disabled={!tecnologiaInput.trim()}
                    className="bg-gradient-to-r from-purple-600 to-violet-600 hover:shadow-purple-500/25 hover:shadow-lg transition-all duration-300 px-6"
                  >
                    Adicionar
                  </Button>
                </div>
                
                {formData.tecnologias_utilizadas && formData.tecnologias_utilizadas.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.tecnologias_utilizadas.map((tecnologia, index) => (
                      <Badge
                        key={index}
                        className="bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200 transition-colors duration-200 px-3 py-1"
                      >
                        {tecnologia}
                        <button
                          type="button"
                          onClick={() => removeFromList('tecnologias_utilizadas', tecnologia)}
                          className="ml-2 text-purple-600 hover:text-purple-800 transition-colors duration-200"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                {renderListCounter(formData.tecnologias_utilizadas, 20, 'tecnologia')}
              </div>

              <div className="space-y-2">
                <Label htmlFor="ods_relacionados" className="text-sm font-medium text-gray-700">
                  ODS Relacionados
                </Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-400" />
                    <Input
                      placeholder="Digite um ODS relacionado e pressione Enter"
                      value={odsInput}
                      onChange={(e) => setOdsInput(e.target.value)}
                      onKeyPress={(e) => handleKeyPress(e, () => addToList('ods_relacionados', odsInput, setOdsInput))}
                      className="w-full pl-10 bg-white border-2 border-purple-200 focus:border-purple-400 focus:ring-purple-400 rounded-xl shadow-sm transition-all duration-200 h-12"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={() => addToList('ods_relacionados', odsInput, setOdsInput)}
                    disabled={!odsInput.trim()}
                    className="bg-gradient-to-r from-purple-600 to-violet-600 hover:shadow-purple-500/25 hover:shadow-lg transition-all duration-300 px-6"
                  >
                    Adicionar
                  </Button>
                </div>
                
                {formData.ods_relacionados && formData.ods_relacionados.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.ods_relacionados.map((ods, index) => (
                      <Badge
                        key={index}
                        className="bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200 transition-colors duration-200 px-3 py-1"
                      >
                        {ods}
                        <button
                          type="button"
                          onClick={() => removeFromList('ods_relacionados', ods)}
                          className="ml-2 text-purple-600 hover:text-purple-800 transition-colors duration-200"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                {renderListCounter(formData.ods_relacionados, 17, 'ODS')}
              </div>

              <div className="space-y-2">
                <Label htmlFor="metricas_sucesso" className="text-sm font-medium text-gray-700">
                  Métricas de Sucesso
                </Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-400" />
                    <Input
                      placeholder="Digite uma métrica de sucesso e pressione Enter"
                      value={metricaInput}
                      onChange={(e) => setMetricaInput(e.target.value)}
                      onKeyPress={(e) => handleKeyPress(e, () => addToList('metricas_sucesso', metricaInput, setMetricaInput))}
                      className="w-full pl-10 bg-white border-2 border-purple-200 focus:border-purple-400 focus:ring-purple-400 rounded-xl shadow-sm transition-all duration-200 h-12"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={() => addToList('metricas_sucesso', metricaInput, setMetricaInput)}
                    disabled={!metricaInput.trim()}
                    className="bg-gradient-to-r from-purple-600 to-violet-600 hover:shadow-purple-500/25 hover:shadow-lg transition-all duration-300 px-6"
                  >
                    Adicionar
                  </Button>
                </div>
                
                {formData.metricas_sucesso && formData.metricas_sucesso.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.metricas_sucesso.map((metrica, index) => (
                      <Badge
                        key={index}
                        className="bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200 transition-colors duration-200 px-3 py-1"
                      >
                        {metrica}
                        <button
                          type="button"
                          onClick={() => removeFromList('metricas_sucesso', metrica)}
                          className="ml-2 text-purple-600 hover:text-purple-800 transition-colors duration-200"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                {renderListCounter(formData.metricas_sucesso, 10, 'métrica de sucesso')}
              </div>

              <div className="space-y-2">
                <Label htmlFor="laboratorios" className="text-sm font-medium text-gray-700">
                  Laboratórios
                </Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-400" />
                    <Input
                      placeholder="Digite um laboratório e pressione Enter"
                      value={laboratorioInput}
                      onChange={(e) => setLaboratorioInput(e.target.value)}
                      onKeyPress={(e) => handleKeyPress(e, () => addToList('laboratorios', laboratorioInput, setLaboratorioInput))}
                      className="w-full pl-10 bg-white border-2 border-purple-200 focus:border-purple-400 focus:ring-purple-400 rounded-xl shadow-sm transition-all duration-200 h-12"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={() => addToList('laboratorios', laboratorioInput, setLaboratorioInput)}
                    disabled={!laboratorioInput.trim()}
                    className="bg-gradient-to-r from-purple-600 to-violet-600 hover:shadow-purple-500/25 hover:shadow-lg transition-all duration-300 px-6"
                  >
                    Adicionar
                  </Button>
                </div>
                
                {formData.laboratorios && formData.laboratorios.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.laboratorios.map((laboratorio, index) => (
                      <Badge
                        key={index}
                        className="bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200 transition-colors duration-200 px-3 py-1"
                      >
                        {laboratorio}
                        <button
                          type="button"
                          onClick={() => removeFromList('laboratorios', laboratorio)}
                          className="ml-2 text-purple-600 hover:text-purple-800 transition-colors duration-200"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                {renderListCounter(formData.laboratorios, 10, 'laboratório')}
              </div>

              <div className="space-y-2">
                <Label htmlFor="palavras_chave" className="text-sm font-medium text-gray-700">
                  Palavras-chave
                </Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-400" />
                    <Input
                      placeholder="Digite uma palavra-chave e pressione Enter"
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      onKeyPress={(e) => handleKeyPress(e, () => addToList('palavras_chave', keywordInput, setKeywordInput))}
                      className="w-full pl-10 bg-white border-2 border-purple-200 focus:border-purple-400 focus:ring-purple-400 rounded-xl shadow-sm transition-all duration-200 h-12"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={() => addToList('palavras_chave', keywordInput, setKeywordInput)}
                    disabled={!keywordInput.trim()}
                    className="bg-gradient-to-r from-purple-600 to-violet-600 hover:shadow-purple-500/25 hover:shadow-lg transition-all duration-300 px-6"
                  >
                    Adicionar
                  </Button>
                </div>
                
                {formData.palavras_chave && formData.palavras_chave.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.palavras_chave.map((palavra, index) => (
                      <Badge
                        key={index}
                        className="bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200 transition-colors duration-200 px-3 py-1"
                      >
                        {palavra}
                        <button
                          type="button"
                          onClick={() => removeFromList('palavras_chave', palavra)}
                          className="ml-2 text-purple-600 hover:text-purple-800 transition-colors duration-200"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                {renderListCounter(formData.palavras_chave, 15, 'palavra-chave')}
              </div>

              <div className="space-y-2">
                <Label htmlFor="moeda" className="text-sm font-medium text-gray-700">
                  Moeda
                </Label>
                <Select
                  value={formData.moeda}
                  onValueChange={(value) => {
                    setFormData((prev) => ({
                      ...prev,
                      moeda: value as 'BRL' | 'USD' | 'EUR',
                    }))
                    if (errors.moeda) {
                      setErrors((prev) => ({ ...prev, moeda: '' }))
                    }
                  }}
                >
                  <SelectTrigger className={`w-full bg-white border-2 ${errors.moeda ? 'border-red-300 focus:border-red-400' : 'border-purple-200 focus:border-purple-400'} focus:ring-purple-400 rounded-xl shadow-sm transition-all duration-200 h-12`}>
                    <SelectValue placeholder="Selecione a moeda" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-purple-200 rounded-xl shadow-lg">
                    <SelectItem value="BRL">Real (R$)</SelectItem>
                    <SelectItem value="USD">Dólar ($)</SelectItem>
                    <SelectItem value="EUR">Euro (€)</SelectItem>
                  </SelectContent>
                </Select>
                {errors.moeda && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.moeda}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-xl border border-purple-200">
                  <Checkbox
                    id="tem_propriedade_intelectual"
                    checked={formData.tem_propriedade_intelectual}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, tem_propriedade_intelectual: checked === true }))}
                    className="h-5 w-5 text-purple-600 focus:ring-purple-400"
                  />
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-purple-600" />
                    <Label htmlFor="tem_propriedade_intelectual" className="text-sm font-medium text-purple-900 cursor-pointer">
                      Tem Propriedade Intelectual?
                    </Label>
                  </div>
                </div>
                {errors.tem_propriedade_intelectual && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.tem_propriedade_intelectual}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-xl border border-purple-200">
                  <Checkbox
                    id="aceita_colaboradores"
                    checked={formData.aceita_colaboradores}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, aceita_colaboradores: checked === true }))}
                    className="h-5 w-5 text-purple-600 focus:ring-purple-400"
                  />
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-purple-600" />
                    <Label htmlFor="aceita_colaboradores" className="text-sm font-medium text-purple-900 cursor-pointer">
                      Aceita Colaboradores?
                    </Label>
                  </div>
                </div>
                {errors.aceita_colaboradores && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.aceita_colaboradores}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-xl border border-purple-200">
                  <Checkbox
                    id="colaboracao_internacional"
                    checked={formData.colaboracao_internacional}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, colaboracao_internacional: checked === true }))}
                    className="h-5 w-5 text-purple-600 focus:ring-purple-400"
                  />
                  <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-purple-600" />
                    <Label htmlFor="colaboracao_internacional" className="text-sm font-medium text-purple-900 cursor-pointer">
                      Colaboração Internacional?
                    </Label>
                  </div>
                </div>
                {errors.colaboracao_internacional && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.colaboracao_internacional}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="orcamento_previsto" className="text-sm font-medium text-gray-700">
                  Orçamento Previsto (Opcional)
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-400" />
                  <Input
                    id="orcamento_previsto"
                    name="orcamento_previsto"
                    type="number"
                    value={formData.orcamento_previsto || ''}
                    onChange={handleNumberChange}
                    placeholder="Ex: 100000"
                    className="w-full pl-10 bg-white border-2 border-purple-200 focus:border-purple-400 focus:ring-purple-400 rounded-xl shadow-sm transition-all duration-200 h-12"
                  />
                </div>
                {errors.orcamento_previsto && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.orcamento_previsto}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fonte_financiamento" className="text-sm font-medium text-gray-700">
                  Fonte de Financiamento (Opcional)
                </Label>
                <Textarea
                  id="fonte_financiamento"
                  name="fonte_financiamento"
                  value={formData.fonte_financiamento || ''}
                  onChange={handleChange}
                  placeholder="Descreva a fonte de financiamento da iniciativa (ex: investimento, convênio, etc.)"
                  className="w-full bg-white border-2 border-purple-200 focus:border-purple-400 focus:ring-purple-400 rounded-xl shadow-sm transition-all duration-200 min-h-[100px] resize-none"
                />
                {renderCharacterCounter(formData.fonte_financiamento, 200)}
                {errors.fonte_financiamento && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.fonte_financiamento}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo_propriedade" className="text-sm font-medium text-gray-700">
                  Tipo de Propriedade (Opcional)
                </Label>
                <Textarea
                  id="tipo_propriedade"
                  name="tipo_propriedade"
                  value={formData.tipo_propriedade || ''}
                  onChange={handleChange}
                  placeholder="Descreva o tipo de propriedade da iniciativa (ex: proprietária, compartilhada, etc.)"
                  className="w-full bg-white border-2 border-purple-200 focus:border-purple-400 focus:ring-purple-400 rounded-xl shadow-sm transition-all duration-200 min-h-[100px] resize-none"
                />
                {renderCharacterCounter(formData.tipo_propriedade, 100)}
                {errors.tipo_propriedade && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.tipo_propriedade}
                  </p>
                )}
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-green-900 mb-2">Tudo Pronto!</h4>
                    <p className="text-sm text-green-700 mb-3">
                      Sua iniciativa está completa e pronta para ser criada. Clique em "Criar Iniciativa" para finalizar.
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-xs text-green-600">
                      <div className="flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        <span>Validações completas</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        <span>Pronto para envio</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )
    }
  }

  if (businessesLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center gap-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            >
              <Sparkles className="h-12 w-12 text-purple-600" />
            </motion.div>
            <div className="absolute inset-0 rounded-full bg-purple-600/20 animate-pulse" />
          </div>
          <motion.div
            className="text-center"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          >
            <p className="text-gray-800 text-lg font-medium">Carregando...</p>
            <p className="text-gray-500 text-sm mt-1">Preparando formulário</p>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header decorativo */}
      <div className="relative bg-gradient-to-br from-purple-600 via-violet-600 to-purple-700 text-white overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative z-10 container mx-auto px-4 py-12">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm mb-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Sparkles className="h-4 w-4 text-white" />
              <span className="text-sm font-medium text-white">Nova Iniciativa</span>
            </motion.div>
            
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
              Criar Iniciativa
            </h1>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 -mt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="max-w-2xl mx-auto shadow-xl border border-purple-100 bg-white relative overflow-hidden">
            {/* Decoração de fundo */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100/30 to-violet-100/20 rounded-full -mr-16 -mt-16" />
            
            <CardHeader className="relative z-10 pb-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  {steps[currentStepIndex].title}
                </CardTitle>
                <div className="text-sm text-gray-500 font-medium">
                  {currentStepIndex + 1} de {steps.length}
                </div>
              </div>
              
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">Progresso</span>
                  <span className="text-sm font-medium text-purple-600">{Math.round(progress)}%</span>
                </div>
                <Progress 
                  value={progress} 
                  className="h-2 bg-gray-200" 
                />
                
                <div className="flex justify-between mt-4">
                  {steps.map((step, index) => (
                    <div
                      key={step.id}
                      className={`flex items-center gap-2 ${
                        index <= currentStepIndex
                          ? 'text-purple-600 font-medium'
                          : 'text-gray-400'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        index < currentStepIndex
                          ? 'bg-purple-600 text-white'
                          : index === currentStepIndex
                          ? 'bg-purple-100 text-purple-600'
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        {index < currentStepIndex ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          step.icon
                        )}
                      </div>
                      <span className="text-xs hidden sm:block">{step.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="relative z-10">
              <form onSubmit={handleSubmit} className="space-y-6">
                <AnimatePresence mode="wait">
                  {renderStepContent()}
                </AnimatePresence>

                <div className="flex justify-between pt-6 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    disabled={currentStepIndex === 0}
                    className="border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Voltar
                  </Button>
                  
                  <Button
                    type="submit"
                    disabled={createInitiativeMutation.isPending}
                    className="bg-gradient-to-r from-purple-600 to-violet-600 hover:shadow-purple-500/25 hover:shadow-lg transition-all duration-300 text-white"
                  >
                    {createInitiativeMutation.isPending ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                          className="w-4 h-4 mr-2"
                        >
                          <Sparkles className="w-4 h-4" />
                        </motion.div>
                        Criando...
                      </>
                    ) : currentStep === 'advanced' ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Criar Iniciativa
                      </>
                    ) : (
                      <>
                        Próximo
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
} 