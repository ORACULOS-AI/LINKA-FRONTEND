"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, ChevronUp, ArrowLeft } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { ImageCropModal } from "@/components/ImageCropModal"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/context/AuthContext"
import { useBusinessApi } from "@/lib/api/business"
import { useUserApi } from "@/lib/api/users"
import { type NegocioUpdate, PapelNegocio } from "@/lib/types/businessTypes"

// Components
import { BusinessHeader } from "../components/BusinessHeader"
import { BusinessInfo } from "../components/BusinessInfo"
import { MembersSection } from "../components/MembersSection"
import { InitiativesSection } from "../components/InitiativesSection"

interface BusinessDetailPageProps {
  params: Promise<{ id: string }>
}

interface UserType {
  uid: string
  nome: string
  foto_url?: string
}

export default function BusinessDetailPage({ params }: BusinessDetailPageProps) {
  const { id } = React.use(params)
  const router = useRouter()

  const { useGetBusiness, useUpdateBusinessPhotos, useUpdateBusiness, useAddBusinessMember, useRemoveBusinessMember } =
    useBusinessApi()

  const { useFetchUsers } = useUserApi()
  const auth = useAuth()

  // States
  const [isEditingFields, setIsEditingFields] = useState(false)
  const [editedBusiness, setEditedBusiness] = useState<NegocioUpdate>({})
  const [isCropModalOpen, setIsCropModalOpen] = useState(false)
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [selectedImage, setSelectedImage] = useState<{
    file: File
    type: "profile" | "cover"
  } | null>(null)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [userRoles, setUserRoles] = useState<Record<string, PapelNegocio>>({})
  const [searchTerm, setSearchTerm] = useState("")
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [activeTab, setActiveTab] = useState<"info" | "members" | "initiatives">("info")

  // API Hooks
  const { data: business, isLoading, error, refetch } = useGetBusiness(id)
  const { data: users = [] } = useFetchUsers()
  const updatePhotosMutation = useUpdateBusinessPhotos()
  const updateBusinessMutation = useUpdateBusiness()
  const { mutate: addMember } = useAddBusinessMember()
  const { mutate: removeMember } = useRemoveBusinessMember()
  const { toast } = useToast()

  // Refs
  const profileInputRef = React.useRef<HTMLInputElement>(null)
  const coverInputRef = React.useRef<HTMLInputElement>(null)

  const isOwner = business?.uid_admin === auth.userId

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleFieldChange = (field: keyof NegocioUpdate, value: string) => {
    setEditedBusiness((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSaveFields = async () => {
    try {
      await updateBusinessMutation.mutateAsync({
        businessId: id,
        updateData: editedBusiness,
      })
      setIsEditingFields(false)
      setEditedBusiness({})
      await refetch()
      toast({
        title: "Sucesso",
        description: "Informações atualizadas com sucesso",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar as informações",
        variant: "destructive",
      })
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: "profile" | "cover") => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage({ file, type })
      setIsCropModalOpen(true)
    }
  }

  const handleCropComplete = async (croppedImage: File) => {
    if (!selectedImage) return

    try {
      const updateData = {
        businessId: id,
        fotoPerfil: selectedImage.type === "profile" ? croppedImage : undefined,
        fotoCapa: selectedImage.type === "cover" ? croppedImage : undefined,
      }

      await updatePhotosMutation.mutateAsync(updateData)
      setIsCropModalOpen(false)
      setSelectedImage(null)
      await refetch()
      toast({
        title: "Sucesso",
        description: "Imagem atualizada com sucesso",
      })
    } catch (error) {
      void error
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a imagem",
        variant: "destructive",
      })
    }
  }

  const handleInviteUsers = async () => {
    try {
      if (selectedUsers.length === 0) {
        toast({
          title: "Aviso",
          description: "Selecione pelo menos um usuário para convidar",
          variant: "default",
        })
        return
      }

      for (const userId of selectedUsers) {
        const papel = userRoles[userId] || PapelNegocio.MEMBRO
        await addMember({
          businessId: id,
          userId,
          papel,
        })
      }

      setShowInviteDialog(false)
      setSelectedUsers([])
      setUserRoles({})
      await refetch()
      toast({
        title: "Sucesso",
        description: "Convites enviados com sucesso",
      })
    } catch (error) {
      void error
      toast({
        title: "Erro",
        description: "Não foi possível enviar os convites",
        variant: "destructive",
      })
    }
  }

  const handleRemoveMember = async (userId: string) => {
    try {
      await removeMember({
        businessId: id,
        userId,
      })
      await refetch()
      toast({
        title: "Sucesso",
        description: "Membro removido com sucesso",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível remover o membro",
        variant: "destructive",
      })
    }
  }

  const filteredUsers = React.useMemo(() => {
    if (!users || !business) return []
    return users.filter((user: UserType) => {
      const membros = business.membros || {}
      const isMember = Object.keys(membros).includes(user.uid)
      const isOwner = user.uid === business.uid_admin
      const matchesSearch = user.nome.toLowerCase().includes(searchTerm.toLowerCase())
      return !isMember && !isOwner && matchesSearch
    })
  }, [users, business, searchTerm])

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
            <p className="text-gray-800 text-lg font-medium">Carregando negócio...</p>
            <p className="text-gray-500 text-sm mt-1">Preparando informações</p>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  if (error || !business) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center min-h-screen gap-4 bg-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-lg text-gray-600 mb-4">Negócio não encontrado</p>
        <Button variant="outline" onClick={() => router.back()} className="border-purple-200 text-purple-600 hover:bg-purple-50">
          Voltar
        </Button>
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen bg-white">

      {/* Business Header */}
      <BusinessHeader
        business={business}
        isOwner={isOwner}
        onProfilePhotoClick={() => profileInputRef.current?.click()}
        onCoverPhotoClick={() => coverInputRef.current?.click()}
      />

      {/* Mobile Navigation */}
      <div className="sticky top-16 z-40 bg-white/95 backdrop-blur-md shadow-sm md:hidden border-b border-purple-100">
        <div className="flex justify-between">
          {[
            { key: "info", label: "Informações" },
            { key: "members", label: "Membros" },
            { key: "initiatives", label: "Iniciativas" },
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
      <div className="pb-8 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="pt-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Business Info */}
              <AnimatePresence mode="wait">
                {(activeTab === "info" || window.innerWidth >= 1024) && (
                  <motion.div
                    key="info"
                    className="lg:col-span-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <BusinessInfo
                      business={business}
                      isOwner={isOwner}
                      isEditingFields={isEditingFields}
                      editedBusiness={editedBusiness}
                      onEditToggle={() => setIsEditingFields(!isEditingFields)}
                      onSaveFields={handleSaveFields}
                      onFieldChange={handleFieldChange}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Sidebar */}
              <motion.div
                className="lg:col-span-4 space-y-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {/* Members */}
                {(activeTab === "members" || window.innerWidth >= 1024) && (
                  <motion.div
                    key="members"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <MembersSection
                      business={business}
                      isOwner={isOwner}
                      users={users}
                      showInviteDialog={showInviteDialog}
                      setShowInviteDialog={setShowInviteDialog}
                      selectedUsers={selectedUsers}
                      setSelectedUsers={setSelectedUsers}
                      userRoles={userRoles}
                      setUserRoles={setUserRoles}
                      searchTerm={searchTerm}
                      setSearchTerm={setSearchTerm}
                      filteredUsers={filteredUsers}
                      onInviteUsers={handleInviteUsers}
                      onRemoveMember={handleRemoveMember}
                    />
                  </motion.div>
                )}

                {/* Initiatives */}
                {(activeTab === "initiatives" || window.innerWidth >= 1024) && (
                  <motion.div
                    key="initiatives"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <InitiativesSection business={business} isOwner={isOwner} isAuthenticated={true} />
                  </motion.div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            className="fixed bottom-6 right-6 p-3 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-full shadow-lg z-50 hover:shadow-purple-500/25 hover:shadow-2xl transition-all duration-300 hover:scale-105"
            onClick={scrollToTop}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronUp className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Modals */}
      {selectedImage?.file && (
        <ImageCropModal
          isOpen={isCropModalOpen}
          onClose={() => setIsCropModalOpen(false)}
          onCropComplete={handleCropComplete}
          imageFile={selectedImage.file}
          aspectRatio={selectedImage.type === "profile" ? 1 : 16 / 9}
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
    </div>
  )
}
