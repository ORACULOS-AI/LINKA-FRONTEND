"use client"

import React, { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, ArrowLeft, Edit, Users, MapPin, Mail, Phone, Globe, Calendar, FileText, Camera } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/context/AuthContext"
import { useLaboratorioApi } from "@/lib/api/laboratorio"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import type { LaboratorioResponse } from "@/lib/types/laboratorioTypes"
import { LaboratorioEditModal } from "@/app/meus-laboratorios/components/laboratorio-edit-modal"
import { ImageCropModal } from "@/components/ImageCropModal"

interface LaboratorioDetailPageProps {
  params: Promise<{ id: string }>
}

export default function LaboratorioDetailPage({ params }: LaboratorioDetailPageProps) {
  const { id } = React.use(params)
  const router = useRouter()
  const { useGetLaboratorio, useUpdateLaboratorioFotos } = useLaboratorioApi()
  const auth = useAuth()
  const { toast } = useToast()

  // States
  const [activeTab, setActiveTab] = useState<"info" | "pesquisadores">("info")
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  
  // Image Upload States
  const [isCropModalOpen, setIsCropModalOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<{
    file: File
    type: "profile" | "cover"
  } | null>(null)
  
  // Refs
  const profileInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  // API Hooks
  const { data: laboratorio, isLoading, error, refetch } = useGetLaboratorio(id)
  const updatePhotosMutation = useUpdateLaboratorioFotos()

  const isOwner = laboratorio?.uid_admin === auth.userId

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "d 'de' MMMM 'de' yyyy", {
        locale: ptBR,
      })
    } catch {
      return "Data inválida"
    }
  }
  
  // Helper to extract filename from URL
  const getFileName = (url: string) => {
    try {
      const parts = url.split('/')
      return parts[parts.length - 1]
    } catch {
      return "Documento"
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: "profile" | "cover") => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage({ file, type })
      setIsCropModalOpen(true)
    }
    // Reset input value to allow selecting the same file again
    e.target.value = ''
  }

  const handleCropComplete = async (croppedImage: File) => {
    if (!selectedImage || !laboratorio) return

    try {
      const updateData = {
        laboratorioId: laboratorio.uid,
        fotoPerfil: selectedImage.type === "profile" ? croppedImage : undefined,
        fotoCapa: selectedImage.type === "cover" ? croppedImage : undefined,
      }

      await updatePhotosMutation.mutateAsync(updateData)
      setIsCropModalOpen(false)
      setSelectedImage(null)
      await refetch()
    } catch (error) {
      console.error("Erro ao atualizar imagem:", error)
      // Toast error is handled by the mutation hook
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { className: string, text: string }> = {
      ATIVO: {
        className: "bg-green-100 text-green-800",
        text: "Ativo",
      },
      INATIVO: {
        className: "bg-red-100 text-red-800",
        text: "Inativo",
      },
      MANUTENCAO: {
        className: "bg-yellow-100 text-yellow-800",
        text: "Manutenção",
      },
    }

    const config = statusConfig[status] || statusConfig.ATIVO
    return (
      <Badge variant="outline" className={config.className}>
        {config.text}
      </Badge>
    )
  }

  const getTipoBadge = (tipo: string) => {
    const tipoConfig: Record<string, { className: string, text: string }> = {
      PESQUISA: {
        className: "bg-blue-100 text-blue-800",
        text: "Pesquisa",
      },
      ENSINO: {
        className: "bg-purple-100 text-purple-800",
        text: "Ensino",
      },
      EXTENSAO: {
        className: "bg-green-100 text-green-800",
        text: "Extensão",
      },
      DESENVOLVIMENTO: {
        className: "bg-orange-100 text-orange-800",
        text: "Desenvolvimento",
      },
      MULTIDISCIPLINAR: {
        className: "bg-indigo-100 text-indigo-800",
        text: "Multidisciplinar",
      },
    }

    const config = tipoConfig[tipo] || { className: "bg-gray-100 text-gray-800", text: tipo }
    return (
      <Badge variant="outline" className={config.className}>
        {config.text}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
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
              <Loader2 className="h-12 w-12 text-purple-600" />
            </motion.div>
            <div className="absolute inset-0 rounded-full bg-purple-600/20 animate-pulse" />
          </div>
          <motion.div
            className="text-center"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          >
            <p className="text-gray-800 text-lg font-medium">Carregando laboratório...</p>
            <p className="text-gray-500 text-sm mt-1">Preparando informações</p>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  if (error || !laboratorio) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center min-h-screen gap-4 bg-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-lg text-gray-600 mb-4">Laboratório não encontrado</p>
        <Button variant="outline" onClick={() => router.back()} className="border-purple-200 text-purple-600 hover:bg-purple-50">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <div className="relative">
        {/* Cover Image */}
        <div 
          className={`h-48 md:h-64 w-full bg-cover bg-center bg-no-repeat relative group ${isOwner ? 'cursor-pointer' : ''}`}
          style={{ 
            backgroundImage: laboratorio.foto_capa ? `url(${laboratorio.foto_capa})` : undefined,
            backgroundColor: !laboratorio.foto_capa ? '#7c3aed' : undefined 
          }}
          onClick={() => isOwner && coverInputRef.current?.click()}
        >
          {!laboratorio.foto_capa && (
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-violet-600" />
          )}
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
          
          {/* Overlay button for owner */}
          {isOwner && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="secondary" className="gap-2 bg-white/90 hover:bg-white">
                <Camera className="h-4 w-4" />
                Alterar Capa
              </Button>
            </div>
          )}

          <div className="container mx-auto px-4 py-6 relative z-10 h-full flex flex-col justify-between pointer-events-none">
             <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  router.back()
                }}
                className="text-white hover:bg-white/20 w-fit pointer-events-auto"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
          </div>
        </div>

        {/* Profile Info Overlap */}
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-6 -mt-16 relative z-20 mb-8">
            {/* Profile Image */}
            <div className="flex-shrink-0 mx-auto md:mx-0 relative group">
               <div 
                 className={`h-32 w-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white flex items-center justify-center relative ${isOwner ? 'cursor-pointer' : ''}`}
                 onClick={() => isOwner && profileInputRef.current?.click()}
               >
                  {laboratorio.foto_perfil ? (
                    <img 
                      src={laboratorio.foto_perfil} 
                      alt={laboratorio.nome} 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Users className="h-12 w-12 text-purple-300" />
                  )}
                  
                  {/* Overlay for profile image */}
                  {isOwner && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="h-8 w-8 text-white" />
                    </div>
                  )}
               </div>
            </div>

            {/* Basic Info */}
            <div className="flex-1 text-center md:text-left pt-16 md:pt-18 pb-4">
               <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                 <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{laboratorio.nome}</h1>
                    <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                      {getTipoBadge(laboratorio.tipo)}
                      {getStatusBadge(laboratorio.status)}
                    </div>
                    
                    <div className="flex flex-col md:flex-row gap-4 text-gray-600 text-sm">
                       <div className="flex items-center justify-center md:justify-start gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{laboratorio.unidade} {laboratorio.campus ? `- ${laboratorio.campus}` : ''}</span>
                       </div>
                       <div className="flex items-center justify-center md:justify-start gap-1">
                          <Users className="h-4 w-4" />
                          <span>Resp: {laboratorio.responsavel}</span>
                       </div>
                    </div>
                 </div>

                 {isOwner && (
                    <Button
                      variant="outline"
                      onClick={() => setIsEditModalOpen(true)}
                      className="shrink-0 mx-auto md:mx-0"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar Laboratório
                    </Button>
                  )}
               </div>
            </div>
          </div>
        </div>
      </div>


      {/* Navigation Tabs */}
      <div className="sticky top-16 z-40 bg-white/95 backdrop-blur-md shadow-sm md:hidden border-b border-purple-100">
        <div className="flex justify-between">
          {[
            { key: "info", label: "Informações" },
            { key: "pesquisadores", label: "Pesquisadores" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`flex-1 py-4 text-center font-medium text-sm transition-all ${
                activeTab === key
                  ? "text-purple-600 border-b-2 border-purple-600 bg-purple-50/50"
                  : "text-gray-500 hover:text-purple-600 hover:bg-purple-50/30"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence mode="wait">
              {/* Informações */}
              {(activeTab === "info" || window.innerWidth >= 1024) && (
                <motion.div
                  key="info"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Sobre o Laboratório</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {laboratorio.descricao && (
                        <div>
                          <h3 className="font-semibold mb-2">Descrição</h3>
                          <p className="text-gray-700">{laboratorio.descricao}</p>
                        </div>
                      )}

                      {laboratorio.areas_pesquisa.length > 0 && (
                        <div>
                          <h3 className="font-semibold mb-2">Áreas de Pesquisa</h3>
                          <div className="flex flex-wrap gap-2">
                            {laboratorio.areas_pesquisa.map((area, index) => (
                              <Badge key={index} variant="secondary">
                                {area}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {laboratorio.equipamentos.length > 0 && (
                        <div>
                          <h3 className="font-semibold mb-2">Equipamentos</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {laboratorio.equipamentos.map((equipamento, index) => (
                              <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                <div className="w-2 h-2 bg-purple-600 rounded-full" />
                                <span className="text-sm">{equipamento}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Documentos Section */}
                      {laboratorio.documentos && laboratorio.documentos.length > 0 && (
                        <div>
                          <h3 className="font-semibold mb-2 flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Documentos
                          </h3>
                          <div className="space-y-2">
                            {laboratorio.documentos.map((docUrl, index) => (
                              <a
                                key={index}
                                href={docUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors group"
                              >
                                <div className="p-2 bg-purple-100 text-purple-600 rounded-md group-hover:bg-purple-200">
                                  <FileText className="h-4 w-4" />
                                </div>
                                <span className="text-sm font-medium text-gray-700 break-all">
                                  {getFileName(docUrl)}
                                </span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {laboratorio.endereco && (
                        <div>
                          <h3 className="font-semibold mb-2">Endereço</h3>
                          <p className="text-gray-700">{laboratorio.endereco}</p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>Criado em {formatDate(laboratorio.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>Atualizado em {formatDate(laboratorio.updated_at)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Pesquisadores */}
              {(activeTab === "pesquisadores" || window.innerWidth >= 1024) && (
                <motion.div
                  key="pesquisadores"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Equipe de Pesquisa</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {laboratorio.pesquisadores.length > 0 ? (
                        <div className="space-y-3">
                          <p className="text-gray-600">
                            {laboratorio.pesquisadores.length} pesquisador{laboratorio.pesquisadores.length !== 1 ? 'es' : ''} associado{laboratorio.pesquisadores.length !== 1 ? 's' : ''}
                          </p>
                          {/* TODO: Implementar lista detalhada de pesquisadores */}
                          <div className="text-center py-8 text-gray-500">
                            Lista detalhada de pesquisadores em desenvolvimento
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          Nenhum pesquisador associado ainda
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contatos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="flex items-center gap-3 text-gray-700">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <span className="text-sm break-all">{laboratorio.email}</span>
                 </div>
                 <div className="flex items-center gap-3 text-gray-700">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <span className="text-sm">{laboratorio.telefone}</span>
                 </div>
                 {laboratorio.website && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <Globe className="h-5 w-5 text-gray-400" />
                      <a
                        href={laboratorio.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm hover:text-purple-600 hover:underline"
                      >
                        Website
                      </a>
                    </div>
                  )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estatísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Pesquisadores</span>
                  <span className="font-semibold">{laboratorio.pesquisadores.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Equipamentos</span>
                  <span className="font-semibold">{laboratorio.equipamentos.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Áreas de Pesquisa</span>
                  <span className="font-semibold">{laboratorio.areas_pesquisa.length}</span>
                </div>
              </CardContent>
            </Card>

            {laboratorio.redes_sociais && Object.keys(laboratorio.redes_sociais).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Redes Sociais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(laboratorio.redes_sociais).map(([platform, url]) => (
                    url && (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-purple-600 hover:text-purple-800 transition-colors"
                      >
                        <Globe className="h-4 w-4" />
                        <span className="capitalize">{platform}</span>
                      </a>
                    )
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {laboratorio && (
        <LaboratorioEditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          laboratorio={laboratorio}
          onSuccess={() => {
            refetch()
          }}
        />
      )}

      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={profileInputRef}
        className="hidden"
        accept="image/*"
        onChange={(e) => handleFileSelect(e, "profile")}
      />
      <input
        type="file"
        ref={coverInputRef}
        className="hidden"
        accept="image/*"
        onChange={(e) => handleFileSelect(e, "cover")}
      />

      {/* Image Crop Modal */}
      {selectedImage?.file && (
        <ImageCropModal
          isOpen={isCropModalOpen}
          onClose={() => setIsCropModalOpen(false)}
          imageFile={selectedImage.file}
          onCropComplete={handleCropComplete}
          aspectRatio={selectedImage.type === "profile" ? 1 : 16 / 9}
        />
      )}
    </div>
  )
}