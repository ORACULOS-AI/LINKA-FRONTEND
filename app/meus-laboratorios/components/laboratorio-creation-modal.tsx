import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useLaboratorioApi } from '@/lib/api/laboratorio'
import { WizardModal, WizardStep } from '@/components/wizard-modal'
import { TagInput } from '@/components/tag-input'
import { TextareaWithCounter } from '@/components/textarea-with-counter'
import { ImageCropModal } from '@/components/ImageCropModal'
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
import { Info, FileText, Settings, Image as ImageIcon, Upload, FileText as DocumentIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

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
    .optional(),
  website: z.string().url('URL inválida').optional().or(z.literal('')),
  campus: z.string().optional(),
  sala: z.string().optional(),
  endereco: z.string().optional(),
  areas_pesquisa: z
    .array(z.string())
    .optional(),
  equipamentos: z
    .array(z.string())
    .optional(),
  documentos: z.array(z.string().url('URL inválida')).optional(), // URLs de documentos
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
  const { useCreateLaboratorio, useUpdateLaboratorioFotos } = useLaboratorioApi()
  const createLaboratorioMutation = useCreateLaboratorio()
  const updateLaboratorioFotosMutation = useUpdateLaboratorioFotos()

  // Estados para imagens
  const [fotoPerfil, setFotoPerfil] = useState<File | null>(null)
  const [fotoPerfilPreview, setFotoPerfilPreview] = useState<string | null>(null)
  const [isCropPerfilOpen, setIsCropPerfilOpen] = useState(false)
  const [tempPerfilImage, setTempPerfilImage] = useState<string | null>(null)

  const [fotoCapa, setFotoCapa] = useState<File | null>(null)
  const [fotoCapaPreview, setFotoCapaPreview] = useState<string | null>(null)
  const [isCropCapaOpen, setIsCropCapaOpen] = useState(false)
  const [tempCapaImage, setTempCapaImage] = useState<string | null>(null)

  // Estados para documentos
  const [documents, setDocuments] = useState<File[]>([])
  const [documentUrls, setDocumentUrls] = useState<string[]>([])

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
      documentos: [], // Default para documentos
    },
  })

  // Handlers de imagem
  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    setTempImage: (url: string) => void,
    setIsOpen: (open: boolean) => void
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      const url = URL.createObjectURL(file)
      setTempImage(url)
      setIsOpen(true)
      // Reset input value to allow selecting same file again
      e.target.value = ''
    }
  }

  const handleCropComplete = async (
    croppedBlob: Blob,
    setFile: (file: File) => void,
    setPreview: (url: string) => void,
    setIsOpen: (open: boolean) => void
  ) => {
    const file = new File([croppedBlob], fileName, { type: 'image/jpeg' })
    setFile(file)
    setPreview(URL.createObjectURL(croppedBlob))
    setIsOpen(false)
  }



  // Handlers de documento
  const handleDocumentSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setDocuments((prev) => [...prev, ...newFiles])
      setDocumentUrls((prev) => [
        ...prev,
        ...newFiles.map((file) => URL.createObjectURL(file)),
      ])
      e.target.value = '' // Clear input
    }
  }

  const handleRemoveDocument = (indexToRemove: number) => {
    setDocuments((prev) => prev.filter((_, i) => i !== indexToRemove))
    setDocumentUrls((prev) => prev.filter((_, i) => i !== indexToRemove))
  }

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
        documentos: data.documentos || [], // Incluir URLs de documentos no envio inicial
      }

      // 1. Criar laboratório
      const newLab = await createLaboratorioMutation.mutateAsync(laboratorioData)

      // 2. Upload de imagens (se houver)
      if (fotoPerfil || fotoCapa) {
        await updateLaboratorioFotosMutation.mutateAsync({
          laboratorioId: newLab.uid,
          fotoPerfil: fotoPerfil || undefined,
          fotoCapa: fotoCapa || undefined,
        })
      }
      // 3. TODO: Upload de documentos (se houver) - Será implementado no backend ainda

      // Reset
      form.reset()
      setFotoPerfil(null)
      setFotoPerfilPreview(null)
      setFotoCapa(null)
      setFotoCapaPreview(null)
      setDocuments([])
      setDocumentUrls([])
      setCurrentStep(0)
      onClose()
      if (onSuccess) onSuccess()
    } catch {
      // Error handled by mutation
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
      case 3:
        return [] // Passo de imagens não tem validação de schema Zod obrigatória
      case 4:
        return ['documentos'] // Valida o campo documentos (se existirem)
      default:
        return []
    }
  }

  const handleStepChange = async (newStep: number) => {
    if (newStep > currentStep) {
      const fields = getFieldsForStep(currentStep)
      // Apenas validar se houver campos no step atual
      if (fields.length > 0) {
        const isValid = await form.trigger(fields as any)
        if (isValid) {
          setCurrentStep(newStep)
        }
      } else {
        setCurrentStep(newStep)
      }
    } else {
      setCurrentStep(newStep)
    }
  }

  // Define os steps
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
        {
          title: 'Imagens',
          icon: <ImageIcon className="w-5 h-5" />,
          content: (
            <div className="space-y-6">
              {/* Logo / Perfil */}
              <div className="space-y-4">
                <FormLabel>Logo ou Imagem de Perfil</FormLabel>
                <div className="flex items-center gap-6">
                  <div className="relative w-32 h-32 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden">
                    {fotoPerfilPreview ? (
                      <Image
                        src={fotoPerfilPreview}
                        alt="Preview Perfil"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileSelect(e, setTempPerfilImage, setIsCropPerfilOpen)}
                      className="hidden"
                      id="foto-perfil-upload"
                    />
                    <label htmlFor="foto-perfil-upload">
                      <Button type="button" variant="outline" className="w-full" asChild>
                        <span>
                          <Upload className="w-4 h-4 mr-2" />
                          Selecionar Logo
                        </span>
                      </Button>
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      Recomendado: 400x400px (JPG, PNG). Máx 5MB.
                    </p>
                  </div>
                </div>
              </div>
    
              {/* Capa */}
              <div className="space-y-4">
                <FormLabel>Imagem de Capa</FormLabel>
                <div className="relative w-full h-40 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden">
                  {fotoCapaPreview ? (
                    <Image
                      src={fotoCapaPreview}
                      alt="Preview Capa"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-10 h-10 text-gray-400" />
                  )}
                </div>
                <div>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e, setTempCapaImage, setIsCropCapaOpen)}
                    className="hidden"
                    id="foto-capa-upload"
                  />
                  <label htmlFor="foto-capa-upload">
                    <Button type="button" variant="outline" className="w-full" asChild>
                      <span>
                        <Upload className="w-4 h-4 mr-2" />
                        Selecionar Capa
                      </span>
                    </Button>
                  </label>
                  <p className="text-xs text-gray-500 mt-2">
                      Recomendado: 1200x400px (JPG, PNG). Máx 5MB.
                    </p>
                </div>
              </div>
    
              {/* Modais de Recorte */}
              <ImageCropModal
                isOpen={isCropPerfilOpen}
                onClose={() => setIsCropPerfilOpen(false)}
                imageSrc={tempPerfilImage}
                aspectRatio={1}
                onCropComplete={(blob) => handleCropComplete(blob, setFotoPerfil, setFotoPerfilPreview, setIsCropPerfilOpen, 'perfil.jpg')}
              />
    
              <ImageCropModal
                isOpen={isCropCapaOpen}
                onClose={() => setIsCropCapaOpen(false)}
                imageSrc={tempCapaImage}
                aspectRatio={3} // 1200x400 approx
                onCropComplete={(blob) => handleCropComplete(blob, setFotoCapa, setFotoCapaPreview, setIsCropCapaOpen, 'capa.jpg')}
              />
            </div>
          )
        },
        {
          title: 'Documentos',
          icon: <DocumentIcon className="w-5 h-5" />,
          content: (
            <div className="space-y-4">
              <FormLabel>Anexar Documentos (PDFs, Relatórios, etc.)</FormLabel>
              <Input
                type="file"
                accept=".pdf, .doc, .docx, .txt"
                multiple
                onChange={handleDocumentSelect}
                className="border-purple-200 focus:border-purple-500 focus:ring-purple-500/20"
              />
              <p className="text-xs text-gray-500 mt-2">
                Máximo de 5 documentos, até 10MB cada. Formatos: PDF, DOCX, TXT.
              </p>
              {documents.length > 0 && (
                <div className="space-y-2 mt-4">
                  <h4 className="font-semibold text-gray-700">Documentos Selecionados:</h4>
                  {documents.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <span className="text-sm text-gray-700 truncate">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveDocument(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remover
                      </Button>
                    </div>
                  ))}
                </div>
              )}
               <FormField
                control={form.control}
                name="documentos"
                render={({ field }) => (
                  <FormItem className="hidden"> {/* Campo oculto para validação do Zod */}
                    <FormControl>
                      <Input {...field} value={field.value?.join(',') || ''} />
                    </FormControl>
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
            description="Preencha os dados do laboratório em 5 etapas simples"
            steps={steps}
            currentStep={currentStep}
            onStepChange={handleStepChange}
            onSubmit={handleSubmit}
            isSubmitting={createLaboratorioMutation.isPending || updateLaboratorioFotosMutation.isPending}
            submitText="Criar Laboratório"
            maxWidth="sm:max-w-[700px]"
          />
        </Form>
      )
    }
