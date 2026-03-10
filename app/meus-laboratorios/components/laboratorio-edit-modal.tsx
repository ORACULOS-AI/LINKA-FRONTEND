/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
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
import { TipoLaboratorio, type LaboratorioUpdate, type LaboratorioResponse } from '@/lib/types/laboratorioTypes'
import { Info, FileText, Settings, Image as ImageIcon, Upload, FileText as DocumentIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { formatImageSrc } from '@/lib/utils'

// Schema de validação com Zod (campos opcionais para edição)
const laboratorioSchema = z.object({
  nome: z.string().min(3).max(100).optional(),
  unidade: z.string().min(2).max(100).optional(),
  subunidade: z.string().optional(),
  tipo: z.nativeEnum(TipoLaboratorio).optional(),
  responsavel: z.string().min(3).max(100).optional(),
  telefone: z.string().min(14).optional(),
  email: z.string().email().optional(),
  descricao: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  campus: z.string().optional(),
  sala: z.string().optional(),
  endereco: z.string().optional(),
  areas_pesquisa: z.array(z.string()).optional(),
  equipamentos: z.array(z.string()).optional(),
  documentos: z.array(z.string().url('URL inválida')).optional(), // URLs de documentos
})

type LaboratorioFormData = z.infer<typeof laboratorioSchema>

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

interface LaboratorioEditModalProps {
  isOpen: boolean
  onClose: () => void
  laboratorio: LaboratorioResponse
  onSuccess?: () => void
}

export function LaboratorioEditModal({
  isOpen,
  onClose,
  laboratorio,
  onSuccess,
}: LaboratorioEditModalProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const { useUpdateLaboratorio, useUpdateLaboratorioFotos } = useLaboratorioApi()
  const updateLaboratorioMutation = useUpdateLaboratorio()
  const updateLaboratorioFotosMutation = useUpdateLaboratorioFotos()

  // Estados para imagens
  const [fotoPerfil, setFotoPerfil] = useState<File | null>(null)
  const [fotoPerfilPreview, setFotoPerfilPreview] = useState<string | null>(laboratorio.foto_perfil ? formatImageSrc(laboratorio.foto_perfil) : null)
  const [isCropPerfilOpen, setIsCropPerfilOpen] = useState(false)
  const [tempPerfilFile, setTempPerfilFile] = useState<File | null>(null)

  const [fotoCapa, setFotoCapa] = useState<File | null>(null)
  const [fotoCapaPreview, setFotoCapaPreview] = useState<string | null>(laboratorio.foto_capa ? formatImageSrc(laboratorio.foto_capa) : null)
  const [isCropCapaOpen, setIsCropCapaOpen] = useState(false)
  const [tempCapaFile, setTempCapaFile] = useState<File | null>(null)

  // Estados para documentos
  const [documents, setDocuments] = useState<File[]>([])
  const [documentUrls, setDocumentUrls] = useState<string[]>(laboratorio.documentos || [])

  const form = useForm<LaboratorioFormData>({
    resolver: zodResolver(laboratorioSchema),
    mode: 'onChange',
    defaultValues: {
      nome: laboratorio.nome,
      unidade: laboratorio.unidade,
      subunidade: laboratorio.subunidade || '',
      tipo: laboratorio.tipo,
      responsavel: laboratorio.responsavel,
      telefone: laboratorio.telefone,
      email: laboratorio.email,
      descricao: laboratorio.descricao || '',
      website: laboratorio.website || '',
      campus: laboratorio.campus || '',
      sala: laboratorio.sala || '',
      endereco: laboratorio.endereco || '',
      areas_pesquisa: laboratorio.areas_pesquisa || [],
      equipamentos: laboratorio.equipamentos || [],
      documentos: laboratorio.documentos || [], // Default para documentos
    },
  })

  // Reset form when laboratorio changes or modal opens
  useEffect(() => {
    if (isOpen && laboratorio) {
      form.reset({
        nome: laboratorio.nome,
        unidade: laboratorio.unidade,
        subunidade: laboratorio.subunidade || '',
        tipo: laboratorio.tipo,
        responsavel: laboratorio.responsavel,
        telefone: laboratorio.telefone,
        email: laboratorio.email,
        descricao: laboratorio.descricao || '',
        website: laboratorio.website || '',
        campus: laboratorio.campus || '',
        sala: laboratorio.sala || '',
        endereco: laboratorio.endereco || '',
        areas_pesquisa: laboratorio.areas_pesquisa || [],
        equipamentos: laboratorio.equipamentos || [],
      })
      setFotoPerfilPreview(laboratorio.foto_perfil ? formatImageSrc(laboratorio.foto_perfil) : null)
      setFotoCapaPreview(laboratorio.foto_capa ? formatImageSrc(laboratorio.foto_capa) : null)
      setDocumentUrls(laboratorio.documentos || [])
    }
  }, [isOpen, laboratorio, form])

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    setTempFile: (file: File | null) => void,
    setIsOpen: (open: boolean) => void
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      setTempFile(file)
      setIsOpen(true)
      e.target.value = ''
    }
  }

  const handleCropComplete = async (
    croppedFile: File,
    setFile: (file: File) => void,
    setPreview: (url: string) => void,
    setIsOpen: (open: boolean) => void
  ) => {
    setFile(croppedFile)
    setPreview(URL.createObjectURL(croppedFile))
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
      const updateData: LaboratorioUpdate = {
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

      // 1. Atualizar dados
      await updateLaboratorioMutation.mutateAsync({
        laboratorioId: laboratorio.uid,
        updateData
      })

      // 2. Atualizar imagens (se houver novas)
      if (fotoPerfil || fotoCapa) {
        await updateLaboratorioFotosMutation.mutateAsync({
          laboratorioId: laboratorio.uid,
          fotoPerfil: fotoPerfil || undefined,
          fotoCapa: fotoCapa || undefined,
        })
      }
      // 3. TODO: Upload de documentos (se houver) - Será implementado no backend ainda

      // Reset
      setFotoPerfil(null)
      setFotoCapa(null)
      setDocuments([])
      setDocumentUrls([])
      setCurrentStep(0)
      onClose()
      if (onSuccess) onSuccess()
    } catch {
      // Error handled by mutation
    }
  }

  // Same steps structure as Creation, but simplified logic for field getting
  const getFieldsForStep = (step: number): (keyof LaboratorioFormData)[] => {
    switch (step) {
      case 0: return ['nome', 'tipo', 'unidade', 'subunidade']
      case 1: return ['responsavel', 'email', 'telefone', 'descricao', 'website']
      case 2: return ['campus', 'sala', 'endereco', 'areas_pesquisa', 'equipamentos']
      default: return []
    }
  }

  const handleStepChange = async (newStep: number) => {
    if (newStep > currentStep) {
      const fields = getFieldsForStep(currentStep)
      if (fields.length > 0) {
        const isValid = await form.trigger(fields as any)
        if (isValid) setCurrentStep(newStep)
      } else {
        setCurrentStep(newStep)
      }
    } else {
      setCurrentStep(newStep)
    }
  }

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
                <FormLabel>Nome do Laboratório</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* ... (Copying fields from CreationModal essentially, but using form control) */}
          {/* To save tokens and avoid repetition, I will implement the same structure */}
           <FormField
            control={form.control}
            name="tipo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo</FormLabel>
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
                  <FormLabel>Unidade</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
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
                  <FormControl><Input {...field} /></FormControl>
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
                <FormLabel>Nome do Responsável</FormLabel>
                <FormControl><Input {...field} /></FormControl>
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
                  <FormLabel>Email</FormLabel>
                  <FormControl><Input type="email" {...field} /></FormControl>
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
                      value={field.value || ''}
                      onChange={field.onChange}
                      error={form.formState.errors.telefone?.message}
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
                <FormControl><Input {...field} /></FormControl>
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
                  <FormControl><Input {...field} /></FormControl>
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
                  <FormControl><Input {...field} /></FormControl>
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
                  <FormControl><Input {...field} /></FormControl>
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
                    placeholder="Digite e Enter"
                  />
                </FormControl>
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
                    placeholder="Digite e Enter"
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
      title: 'Imagens',
      icon: <ImageIcon className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <FormLabel>Logo ou Imagem de Perfil</FormLabel>
            <div className="flex items-center gap-6">
              <div className="relative w-32 h-32 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden">
                {fotoPerfilPreview ? (
                  <Image src={fotoPerfilPreview} alt="Preview Perfil" fill className="object-cover" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileSelect(e, setTempPerfilFile, setIsCropPerfilOpen)}
                  className="hidden"
                  id="edit-foto-perfil-upload"
                />
                <label htmlFor="edit-foto-perfil-upload">
                  <Button type="button" variant="outline" className="w-full" asChild>
                    <span><Upload className="w-4 h-4 mr-2" />Alterar Logo</span>
                  </Button>
                </label>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <FormLabel>Imagem de Capa</FormLabel>
            <div className="relative w-full h-40 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden">
              {fotoCapaPreview ? (
                <Image src={fotoCapaPreview} alt="Preview Capa" fill className="object-cover" />
              ) : (
                <ImageIcon className="w-10 h-10 text-gray-400" />
              )}
            </div>
            <div>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileSelect(e, setTempCapaFile, setIsCropCapaOpen)}
                className="hidden"
                id="edit-foto-capa-upload"
              />
              <label htmlFor="edit-foto-capa-upload">
                <Button type="button" variant="outline" className="w-full" asChild>
                  <span><Upload className="w-4 h-4 mr-2" />Alterar Capa</span>
                </Button>
              </label>
            </div>
          </div>
          {tempPerfilFile && (
            <ImageCropModal
              isOpen={isCropPerfilOpen}
              onClose={() => setIsCropPerfilOpen(false)}
              imageFile={tempPerfilFile}
              aspectRatio={1}
              onCropComplete={(file) => handleCropComplete(file, setFotoPerfil, setFotoPerfilPreview, setIsCropPerfilOpen)}
            />
          )}
          {tempCapaFile && (
            <ImageCropModal
              isOpen={isCropCapaOpen}
              onClose={() => setIsCropCapaOpen(false)}
              imageFile={tempCapaFile}
              aspectRatio={3}
              onCropComplete={(file) => handleCropComplete(file, setFotoCapa, setFotoCapaPreview, setIsCropCapaOpen)}
            />
          )}
        </div>
      )
    }
  ]

  return (
    <Form {...form}>
      <WizardModal
        isOpen={isOpen}
        onClose={onClose}
        title="Editar Laboratório"
        description="Atualize as informações do seu laboratório"
        steps={steps}
        currentStep={currentStep}
        onStepChange={handleStepChange}
        onSubmit={handleSubmit}
        isSubmitting={updateLaboratorioMutation.isPending || updateLaboratorioFotosMutation.isPending}
        submitText="Salvar Alterações"
        maxWidth="sm:max-w-[700px]"
      />
    </Form>
  )
}
