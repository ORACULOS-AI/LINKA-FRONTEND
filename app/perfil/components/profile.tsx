"use client"

import type React from "react"

import {
  Building2,
  Mail,
  MapPin,
  User2,
  Calendar,
  Camera,
  Trash2,
  Loader2,
  PencilIcon,
  KeyIcon,
  UserX,
  UserPlus,
  UserMinus,
  UserCheck,
  Users,
  Heart,
  ArrowLeft,
  Crown,
  Shield,
  Briefcase,
  GraduationCap,
  QrCode,
} from "lucide-react"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { UserType } from "@/lib/types/userTypes"
import { useRouter } from "next/navigation"
import { useUserApi } from "@/lib/api/users"
import { useBusinessApi } from "@/lib/api/business"
import { useInitiativesApi } from "@/lib/api/initiatives"
import { useRef, useState, useEffect } from "react"
import { toast } from "sonner"
import { ImageCropModal } from "@/components/ImageCropModal"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useConnectionRequests } from "@/lib/api/connections"
import { ConnectionStatus } from "@/lib/types/connectionTypes"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import QrCodeModal from "./qr-code-modal"
import { BusinessCard } from "@/components/business-card"
import { InitiativeCard } from "@/components/initiatives/InitiativeCard"
import ProfileBusinessItem from "./profile-business-item"
import ProfileInitiativeItem from "./profile-initiative-item"

interface ProfilePageProps {
  userId?: string | null
  userType?: string | null
}

export default function ProfilePage({ userId, userType }: ProfilePageProps) {
  const router = useRouter()
  const {
    useGetCurrentUser,
    useDeleteUser,
    useUploadProfileImage,
    useDeleteProfileImage,
    useUpdateUser,
    useChangePassword,
    useGetUserById,
  } = useUserApi()

  const {
    useCreateRequest,
    useUpdateRequest,
    useCancelRequest,
    useRemoveConnection,
    useGetConnectionStatus,
    useGetUserConnections,
  } = useConnectionRequests()

  const { useGetUserBusinessesById } = useBusinessApi()
  const { useGetUserInitiativesById } = useInitiativesApi()

  // Obter conexões atualizadas
  const { data: connectionIds = [] } = useGetUserConnections()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isCropModalOpen, setIsCropModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleteImageDialogOpen, setIsDeleteImageDialogOpen] = useState(false)
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)
  const [isQrCodeModalOpen, setIsQrCodeModalOpen] = useState(false)
  const [editProfileData, setEditProfileData] = useState({
    nome: "",
    email: "",
    empresa: "",
    campus: "",
  })
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const isViewingOwnProfile = !userId
  const viewingUserType = (userType as UserType) || UserType.ESTUDANTE

  // Fetch current user data
  const { data: currentUser, isLoading: isCurrentUserLoading } = useGetCurrentUser()
  // Fetch other user data if viewing someone else's profile
  const { data: otherUser, isLoading: isOtherUserLoading } = useGetUserById(viewingUserType, userId || "", {
    enabled: !!userId && !!userType,
  })

  // Get connection status if viewing someone else's profile
  const { data: connectionStatus, isLoading: isConnectionStatusLoading } = useGetConnectionStatus(userId || "", {
    enabled: !!userId && !!currentUser,
  })

  // Fetch user businesses and initiatives
  const getCurrentUserId = () => {
    return currentUser?.user?.uid || localStorage.getItem('userId')
  }
  
  const targetUserId = isViewingOwnProfile ? getCurrentUserId() : userId
  
  console.log('Debug ProfilePage:', {
    isViewingOwnProfile,
    currentUserUid: currentUser?.user?.uid,
    localStorageUserId: localStorage.getItem('userId'),
    paramUserId: userId,
    targetUserId,
    isCurrentUserLoading,
  })
  
  const { data: userBusinesses = [], isLoading: isBusinessesLoading } = useGetUserBusinessesById(
    targetUserId || ""
  )
  const { data: userInitiatives = [], isLoading: isInitiativesLoading } = useGetUserInitiativesById(
    targetUserId || ""
  )

  // Debug logs para verificar os dados
  console.log('=== DEBUG INITIATIVES ===')
  console.log('targetUserId:', targetUserId)
  console.log('isInitiativesLoading:', isInitiativesLoading)
  console.log('userBusinesses:', userBusinesses)
  console.log('userInitiatives:', userInitiatives)
  console.log('userInitiatives.length:', userInitiatives?.length)
  console.log('typeof userInitiatives:', typeof userInitiatives)
  console.log('Array.isArray(userInitiatives):', Array.isArray(userInitiatives))

  // Garantir que os arrays sejam válidos antes da filtragem
  const safeUserBusinesses = Array.isArray(userBusinesses) ? userBusinesses : []
  const safeUserInitiatives = Array.isArray(userInitiatives) ? userInitiatives : []
  
  console.log('safeUserBusinesses:', safeUserBusinesses)
  console.log('safeUserInitiatives:', safeUserInitiatives)

  // Garantir que os arrays tenham IDs únicos - versão menos restritiva
  const uniqueBusinesses = safeUserBusinesses.filter((business: any, index: number, self: any[]) => {
    if (!business) {
      console.log('Business filtrado (null/undefined):', business)
      return false
    }
    if (!business.id) {
      console.log('Business sem ID:', business)
      // Permitir negócios sem ID, usando o index como fallback
      return true
    }
    const isDuplicate = self.findIndex((b: any) => b && b.id === business.id) !== index
    if (isDuplicate) {
      console.log('Business duplicado filtrado:', business)
    }
    return !isDuplicate
  })
  
  const uniqueInitiatives = safeUserInitiatives.filter((initiative: any, index: number, self: any[]) => {
    if (!initiative) {
      console.log('Initiative filtrada (null/undefined):', initiative)
      return false
    }
    if (!initiative.id) {
      console.log('Initiative sem ID:', initiative)
      // Permitir iniciativas sem ID, usando o index como fallback
      return true
    }
    const isDuplicate = self.findIndex((i: any) => i && i.id === initiative.id) !== index
    if (isDuplicate) {
      console.log('Initiative duplicada filtrada:', initiative)
    }
    return !isDuplicate
  })

  console.log('uniqueBusinesses após filtro:', uniqueBusinesses)
  console.log('uniqueInitiatives após filtro:', uniqueInitiatives)

  // Connection mutations
  const sendConnectionMutation = useCreateRequest()
  const acceptConnectionMutation = useUpdateRequest()
  const rejectConnectionMutation = useUpdateRequest()
  const cancelConnectionMutation = useCancelRequest()
  const removeConnectionMutation = useRemoveConnection()

  // User data mutations
  const deleteUserMutation = useDeleteUser()
  const uploadProfileImageMutation = useUploadProfileImage()
  const deleteProfileImageMutation = useDeleteProfileImage()
  const updateUserMutation = useUpdateUser()
  const changePasswordMutation = useChangePassword()

  // Determine which user data to display
  const user = isViewingOwnProfile ? currentUser : otherUser?.user
  const isLoading = isViewingOwnProfile ? isCurrentUserLoading : isOtherUserLoading

  const profileLink =
    typeof window !== "undefined" && isViewingOwnProfile
      ? `${window.location.origin}/perfil?id=${currentUser?.user?.uid}&type=${currentUser?.user?.tipo_usuario}`
      : ""

  useEffect(() => {
    if (user) {
      setEditProfileData({
        nome: user.nome || "",
        email: user.email || "",
        empresa: user.empresa || "",
        campus: user.campus || "",
      })
    }
  }, [user])

  const handleDeleteAccount = () => {
    localStorage.clear()
    router.push("/linka/login")
  }

  const getUserTitle = (type: UserType) => {
    switch (type) {
      case UserType.PESQUISADOR:
        return "Pesquisador"
      case UserType.ESTUDANTE:
        return "Estudante"
      case UserType.EXTERNO:
        return "Profissional Externo"
      default:
        return "Usuário"
    }
  }

  const getUserIcon = (type: UserType) => {
    switch (type) {
      case UserType.PESQUISADOR:
        return <Crown className="h-4 w-4" />
      case UserType.ESTUDANTE:
        return <GraduationCap className="h-4 w-4" />
      case UserType.EXTERNO:
        return <Briefcase className="h-4 w-4" />
      default:
        return <Shield className="h-4 w-4" />
    }
  }

  const getUserBadgeColor = (type: UserType) => {
    switch (type) {
      case UserType.PESQUISADOR:
        return "bg-gradient-to-r from-yellow-500 to-orange-500"
      case UserType.ESTUDANTE:
        return "bg-gradient-to-r from-blue-500 to-indigo-500"
      case UserType.EXTERNO:
        return "bg-gradient-to-r from-green-500 to-emerald-500"
      default:
        return "bg-gradient-to-r from-purple-500 to-violet-500"
    }
  }

  const handleEditProfile = () => {
    setIsEditProfileOpen(true)
  }

  const handleDeleteProfile = async () => {
    if (window.confirm("Tem certeza que deseja deletar seu perfil?")) {
      try {
        await deleteUserMutation.mutateAsync({
          userType: currentUser?.user?.tipo_usuario,
          userId: currentUser?.user?.uid,
        })
        handleDeleteAccount()
      } catch (error) {
        console.error("Error deleting profile:", error)
        toast.error("Erro ao deletar perfil")
      }
    }
  }

  const handleChangePassword = () => {
    setIsChangePasswordOpen(true)
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    console.log("Arquivo selecionado:", file.name, file.type, file.size)

    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione apenas arquivos de imagem")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB")
      return
    }

    setSelectedFile(file)
    setIsCropModalOpen(true)
  }

  const handleCropComplete = async (croppedImage: File) => {
    setIsCropModalOpen(false)
    setIsUploading(true)

    try {
      const result = await uploadProfileImageMutation.mutateAsync(croppedImage)
      toast.success("Foto de perfil atualizada com sucesso")
    } catch (error) {
      console.error("Error uploading profile image:", error)
      toast.error("Erro ao atualizar foto de perfil")
    } finally {
      setIsUploading(false)
      setSelectedFile(null)
    }
  }

  const handleDeleteProfileImage = async () => {
    setIsDeleteImageDialogOpen(false)
    setIsUploading(true)

    try {
      await deleteProfileImageMutation.mutateAsync()
      toast.success("Foto de perfil removida com sucesso")
    } catch (error) {
      console.error("Error deleting profile image:", error)
      toast.error("Erro ao remover foto de perfil")
    } finally {
      setIsUploading(false)
    }
  }

  const handleUpdateProfile = async () => {
    try {
      await updateUserMutation.mutateAsync({
        userData: editProfileData,
      })
      setIsEditProfileOpen(false)
      toast.success("Perfil atualizado com sucesso")
      localStorage.removeItem("user")
      // Redirecionar para a página de login
      router.push("/login")
    } catch (error) {
      console.error("Erro ao atualizar o usuário:", error)
      toast.error("Erro ao atualizar perfil")
    }
  }

  const handleUpdatePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("As senhas não coincidem")
      return
    }

    try {
      await changePasswordMutation.mutateAsync({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      })
      setIsChangePasswordOpen(false)
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
      toast.success("Senha alterada com sucesso")
    } catch (error) {
      console.error("Error changing password:", error)
      toast.error("Erro ao alterar senha")
    }
  }

  // Connection handling functions
  const handleSendConnectionRequest = async () => {
    if (!userId) return

    try {
      await sendConnectionMutation.mutateAsync(userId)
      toast.success("Solicitação de conexão enviada")
    } catch (error) {
      console.error("Error sending connection request:", error)
      toast.error("Erro ao enviar solicitação de conexão")
    }
  }

  const handleAcceptConnectionRequest = async () => {
    if (!userId) return

    try {
      await acceptConnectionMutation.mutateAsync({
        userId,
        status: ConnectionStatus.ACCEPTED,
      })
      toast.success("Solicitação de conexão aceita com sucesso")
    } catch (error) {
      toast.error("Erro ao aceitar solicitação de conexão")
    }
  }

  const handleRejectConnectionRequest = async () => {
    if (!userId) return

    try {
      await rejectConnectionMutation.mutateAsync({
        userId,
        status: ConnectionStatus.REJECTED,
      })
      toast.success("Solicitação de conexão rejeitada")
    } catch (error) {
      toast.error("Erro ao rejeitar solicitação de conexão")
    }
  }

  const handleCancelConnectionRequest = async () => {
    if (!userId) return

    try {
      await cancelConnectionMutation.mutateAsync(userId)
      toast.success("Solicitação de conexão cancelada")
    } catch (error) {
      toast.error("Erro ao cancelar solicitação de conexão")
    }
  }

  const handleRemoveConnection = async () => {
    if (!userId) return

    try {
      await removeConnectionMutation.mutateAsync({
        userId,
        userType: viewingUserType,
      })
      toast.success("Conexão removida com sucesso")
    } catch (error) {
      toast.error("Erro ao remover conexão")
    }
  }

  // Verificar se o usuário atual está conectado com o perfil visualizado
  const isConnected = () => {
    if (!userId) return false
    
    // Usar connectionIds como fonte principal (mesmo que página de conversas)
    return connectionIds.includes(userId)
  }

  // Render connection action button based on connection status
  const renderConnectionActionButton = () => {
    if (isConnectionStatusLoading) {
      return (
        <Button disabled className="w-full bg-purple-600 hover:bg-purple-700">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Carregando...
        </Button>
      )
    }

    // Usar a mesma lógica da função isConnected()
    if (isConnected()) {
      return (
        <Button
          variant="outline"
          className="w-full border-red-200 text-red-600 hover:bg-red-50 bg-transparent"
          onClick={handleRemoveConnection}
          disabled={removeConnectionMutation.isPending}
        >
          {removeConnectionMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <UserMinus className="h-4 w-4 mr-2" />
          )}
          Remover Conexão
        </Button>
      )
    }

    switch (connectionStatus?.status) {
      case ConnectionStatus.ACCEPTED:
        return (
          <Button
            variant="outline"
            className="w-full border-red-200 text-red-600 hover:bg-red-50 bg-transparent"
            onClick={handleRemoveConnection}
            disabled={removeConnectionMutation.isPending}
          >
            {removeConnectionMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <UserMinus className="h-4 w-4 mr-2" />
            )}
            Remover Conexão
          </Button>
        )
      case ConnectionStatus.PENDING: {
        // Usar a informação de direção retornada pela API
        const isSentByMe = connectionStatus?.isSentByMe

        if (isSentByMe) {
          return (
            <Button
              variant="outline"
              className="w-full border-orange-200 text-orange-600 hover:bg-orange-50 bg-transparent"
              onClick={handleCancelConnectionRequest}
              disabled={cancelConnectionMutation.isPending}
            >
              {cancelConnectionMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <UserMinus className="h-4 w-4 mr-2" />
              )}
              Cancelar Solicitação
            </Button>
          )
        } else {
          return (
            <div className="flex gap-2 w-full">
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={handleAcceptConnectionRequest}
                disabled={acceptConnectionMutation.isPending}
              >
                {acceptConnectionMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <UserCheck className="h-4 w-4 mr-2" />
                )}
                Aceitar
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700"
                onClick={handleRejectConnectionRequest}
                disabled={rejectConnectionMutation.isPending}
              >
                {rejectConnectionMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <UserX className="h-4 w-4 mr-2" />
                )}
                Rejeitar
              </Button>
            </div>
          )
        }
      }
      default:
        return (
          <Button
            className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:shadow-purple-500/25 hover:shadow-lg"
            onClick={handleSendConnectionRequest}
            disabled={sendConnectionMutation.isPending}
          >
            {sendConnectionMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <UserPlus className="h-4 w-4 mr-2" />
            )}
            Conectar
          </Button>
        )
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
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
              <Loader2 className="h-12 w-12 text-white" />
            </motion.div>
            <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse" />
          </div>
          <motion.div
            className="text-center"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          >
            <p className="text-white text-lg font-medium">Carregando perfil...</p>
            <p className="text-white/70 text-sm mt-1">Preparando informações</p>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  if (!user) {
    return (
      <motion.div
        className="min-h-screen bg-transparent flex flex-col items-center justify-center gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
          <User2 className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-white">Perfil não encontrado</h3>
        <p className="text-white/70 mb-6">Os dados do usuário não estão disponíveis</p>
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="border-white/30 text-white hover:bg-white/10 bg-transparent"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen bg-transparent">
      {/* Header with back button */}
      {!isViewingOwnProfile && (
        <div className="sticky top-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/20">
          <div className="max-w-4xl mx-auto px-6">
            <div className="flex items-center justify-between h-16">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="gap-2 text-white hover:text-white hover:bg-white/10"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
            </div>
          </div>
        </div>
      )}

      <motion.div
        className="p-6 pb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Profile Header */}
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
            <Card className="overflow-hidden shadow-lg border border-purple-100 bg-white relative">
              {/* Decorative background */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-100/50 to-violet-100/30 rounded-full -mr-32 -mt-32" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-100/30 to-violet-100/20 rounded-full -ml-24 -mb-24" />

              <div className="relative p-8">
                <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
                  {/* Profile Picture */}
                  <div className="relative group">
                    <motion.div
                      className="relative w-32 h-32 lg:w-40 lg:h-40 rounded-2xl bg-gradient-to-br from-purple-100 to-violet-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-2xl"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300, damping: 10 }}
                    >
                      {isUploading ? (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                          <Loader2 className="h-8 w-8 animate-spin text-white" />
                        </div>
                      ) : (
                        <>
                          {user?.foto_url ? (
                            <Image
                              src={user.foto_url || "/placeholder.svg"}
                              alt="Foto de perfil"
                              fill
                              sizes="(max-width: 160px) 100vw, 160px"
                              className="object-cover rounded-xl"
                              priority
                            />
                          ) : (
                            <User2 className="h-16 w-16 text-purple-400" />
                          )}
                        </>
                      )}
                    </motion.div>

                    {/* Edit buttons for own profile */}
                    {isViewingOwnProfile && (
                      <motion.div
                        className="absolute -bottom-2 -right-2 flex gap-2"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                      >
                        <motion.button
                          className="w-10 h-10 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-purple-500/25 border-2 border-white"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            console.log("Botão de câmera clicado")
                            fileInputRef.current?.click()
                          }}
                          disabled={isUploading}
                          title="Alterar foto de perfil"
                        >
                          <Camera className="h-5 w-5" />
                        </motion.button>
                        {user?.foto_url && (
                          <motion.button
                            className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-red-500/25 border-2 border-white"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              console.log("Botão de deletar clicado")
                              setIsDeleteImageDialogOpen(true)
                            }}
                            title="Remover foto de perfil"
                          >
                            <Trash2 className="h-5 w-5" />
                          </motion.button>
                        )}
                      </motion.div>
                    )}

                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileSelect}
                      onClick={() => console.log("Input de arquivo clicado")}
                    />
                  </div>

                  {/* Profile Info */}
                  <div className="flex-1 space-y-6">
                    <div>
                      <motion.h1
                        className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        {user?.nome}
                      </motion.h1>

                      <motion.div
                        className="flex items-center gap-3 mb-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <Badge
                          className={`${getUserBadgeColor(user?.tipo_usuario as UserType)} text-white border-0 px-3 py-1 text-sm font-medium shadow-lg flex items-center gap-2`}
                        >
                          {getUserIcon(user?.tipo_usuario as UserType)}
                          {getUserTitle(user?.tipo_usuario as UserType)}
                        </Badge>
                      </motion.div>
                    </div>

                    {/* Contact Info */}
                    <motion.div
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50/50 border border-purple-100">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-violet-600 rounded-lg flex items-center justify-center">
                          <Mail className="h-5 w-5 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-purple-700">Email</p>
                          <p className="text-gray-800 truncate">{user?.email}</p>
                        </div>
                      </div>

                      {user?.campus && (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50/50 border border-purple-100">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-violet-600 rounded-lg flex items-center justify-center">
                            <MapPin className="h-5 w-5 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-purple-700">Campus</p>
                            <p className="text-gray-800 truncate">{user.campus}</p>
                          </div>
                        </div>
                      )}

                      {user?.empresa && (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50/50 border border-purple-100">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-violet-600 rounded-lg flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-purple-700">Empresa</p>
                            <p className="text-gray-800 truncate">{user.empresa}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50/50 border border-purple-100">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-violet-600 rounded-lg flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-purple-700">Membro desde</p>
                          <p className="text-gray-800">{new Date(user?.data_cadastro).toLocaleDateString("pt-BR")}</p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Action Buttons */}
                    <motion.div
                      className="flex flex-col sm:flex-row gap-3"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      {isViewingOwnProfile ? (
                        <>
                          <Button
                            variant="outline"
                            className="flex-1 border-purple-200 text-purple-600 hover:bg-purple-50 bg-transparent"
                            onClick={() => setIsQrCodeModalOpen(true)}
                            title="Compartilhar perfil via QR Code"
                          >
                            <QrCode className="h-4 w-4 mr-2" />
                            QR Code
                          </Button>
                          <Button
                            variant="outline"
                            className="flex-1 border-purple-200 text-purple-600 hover:bg-purple-50 bg-transparent"
                            onClick={handleEditProfile}
                          >
                            <PencilIcon className="h-4 w-4 mr-2" />
                            Editar Perfil
                          </Button>
                          <Button
                            variant="outline"
                            className="flex-1 border-purple-200 text-purple-600 hover:bg-purple-50 bg-transparent"
                            onClick={handleChangePassword}
                          >
                            <KeyIcon className="h-4 w-4 mr-2" />
                            Alterar Senha
                          </Button>
                        </>
                      ) : (
                        <>
                          {/* Botão de Enviar Mensagem Melhorado */}
                          {isConnected() ? (
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white mt-2 shadow-lg hover:shadow-purple-500/25 transition-all duration-200 w-full group"
                              onClick={() => router.push(`/conversas?uid=${user.uid}`)}
                            >
                              <Mail className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                              Enviar mensagem
                            </Button>
                          ) : (
                            <div className="mt-2">
                              <div className="relative">
                                <Button
                                  size="sm"
                                  disabled
                                  className="bg-gray-200 text-gray-400 cursor-not-allowed w-full border border-gray-300 hover:bg-gray-200"
                                  title="Você precisa estar conectado para enviar mensagens"
                                >
                                  <Mail className="h-4 w-4 mr-2 opacity-50" />
                                  Enviar mensagem
                                  <Shield className="h-3 w-3 ml-auto opacity-50" />
                                </Button>
                              </div>
                              <p className="text-xs text-gray-500 mt-1 text-center italic">
                                🔒 Conecte-se primeiro para enviar mensagens
                              </p>
                            </div>
                          )}
                          <div className="w-full">{renderConnectionActionButton()}</div>
                        </>
                      )}
                    </motion.div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="p-6 shadow-lg border border-purple-100 bg-white">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-purple-600 to-violet-600 rounded-xl">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Conexões</h3>
                  <p className="text-3xl font-bold text-purple-600">{user?.conexoes?.length || 0}</p>
                  <p className="text-sm text-gray-500">pessoas conectadas</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 shadow-lg border border-purple-100 bg-white">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Favoritos</h3>
                  <p className="text-3xl font-bold text-pink-600">0</p>
                  <p className="text-sm text-gray-500">negócios favoritos</p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* User Businesses Section */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <Card className="p-6 shadow-lg border border-purple-100 bg-white">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Building2 className="h-5 w-5 text-purple-600" />
                  </div>
                  {isViewingOwnProfile ? 'Meus Negócios' : 'Negócios'}
                </h2>
                <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                  {uniqueBusinesses.length} {uniqueBusinesses.length === 1 ? 'negócio' : 'negócios'}
                </Badge>
              </div>
              
              {isBusinessesLoading ? (
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={`business-skeleton-${i}`} className="min-w-[220px] h-32 bg-purple-50 rounded-lg p-4 animate-pulse"></div>
                  ))}
                </div>
              ) : uniqueBusinesses.length > 0 ? (
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {uniqueBusinesses.slice(0, 8).map((business: any, index: number) => {
                    const businessKey = business.id || business.uid || business.created_at || `business-${index}-${business.nome || 'unnamed'}`
                    return (
                      <ProfileBusinessItem key={businessKey} business={business} />
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-purple-400" />
                  </div>
                  <p className="text-gray-500 mb-2">
                    {isViewingOwnProfile ? 'Você ainda não possui negócios' : 'Este usuário não possui negócios'}
                  </p>
                  <p className="text-sm text-gray-400">
                    {isViewingOwnProfile ? 'Crie seu primeiro negócio para aparecer aqui' : 'Negócios aparecerão aqui quando disponíveis'}
                  </p>
                </div>
              )}
            </Card>
          </motion.div>

          {/* User Initiatives Section */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="p-6 shadow-lg border border-purple-100 bg-white">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <GraduationCap className="h-5 w-5 text-purple-600" />
                  </div>
                  {isViewingOwnProfile ? 'Minhas Iniciativas' : 'Iniciativas'}
                </h2>
                <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                  {uniqueInitiatives.length} {uniqueInitiatives.length === 1 ? 'iniciativa' : 'iniciativas'}
                </Badge>
              </div>
              
              {isInitiativesLoading ? (
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={`initiative-skeleton-${i}`} className="min-w-[220px] h-32 bg-purple-50 rounded-lg p-4 animate-pulse"></div>
                  ))}
                </div>
              ) : uniqueInitiatives.length > 0 ? (
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {uniqueInitiatives.slice(0, 8).map((initiative: any, index: number) => {
                    const initiativeKey = initiative.id || initiative.uid || initiative.created_at || `initiative-${index}-${initiative.titulo || initiative.nome || 'unnamed'}`
                    return (
                      <ProfileInitiativeItem key={initiativeKey} initiative={initiative} />
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                    <GraduationCap className="h-6 w-6 text-purple-400" />
                  </div>
                  <p className="text-gray-500 mb-2">
                    {isViewingOwnProfile ? 'Você ainda não possui iniciativas' : 'Este usuário não possui iniciativas'}
                  </p>
                  <p className="text-sm text-gray-400">
                    {isViewingOwnProfile ? 'Crie sua primeira iniciativa para aparecer aqui' : 'Iniciativas aparecerão aqui quando disponíveis'}
                  </p>
                </div>
              )}
            </Card>
          </motion.div>

          {/* Actions - Only show for own profile */}
          {isViewingOwnProfile && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="p-6 shadow-lg border border-purple-100 bg-white">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <User2 className="h-5 w-5 text-purple-600" />
                  </div>
                  Configurações da Conta
                </h2>
                <div className="space-y-3">
                  <motion.div whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 p-4 h-auto text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-xl"
                      onClick={handleEditProfile}
                    >
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <PencilIcon className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">Editar Perfil</p>
                        <p className="text-sm text-gray-500">Atualize suas informações pessoais</p>
                      </div>
                    </Button>
                  </motion.div>

                  <Separator className="bg-purple-100" />

                  <motion.div whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 p-4 h-auto text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-xl"
                      onClick={handleChangePassword}
                    >
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <KeyIcon className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">Alterar Senha</p>
                        <p className="text-sm text-gray-500">Mantenha sua conta segura</p>
                      </div>
                    </Button>
                  </motion.div>

                  <Separator className="bg-purple-100" />

                  <motion.div whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 p-4 h-auto text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl"
                      onClick={() => setIsDeleteDialogOpen(true)}
                    >
                      <div className="p-2 bg-red-100 rounded-lg">
                        <UserX className="h-4 w-4 text-red-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">Deletar Perfil</p>
                        <p className="text-sm text-gray-500">Remover permanentemente sua conta</p>
                      </div>
                    </Button>
                  </motion.div>
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Dialogs - Only show for own profile */}
      {isViewingOwnProfile && (
        <>
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent className="border-purple-100">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-gray-900">Você tem certeza?</AlertDialogTitle>
                <AlertDialogDescription className="text-gray-600">
                  Esta ação não pode ser desfeita. Isso excluirá permanentemente sua conta e removerá seus dados de
                  nossos servidores.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-purple-200 text-purple-600 hover:bg-purple-50">
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteProfile} className="bg-red-600 text-white hover:bg-red-700">
                  {deleteUserMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Deletar Conta"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog open={isDeleteImageDialogOpen} onOpenChange={setIsDeleteImageDialogOpen}>
            <AlertDialogContent className="border-purple-100">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-gray-900">Remover foto de perfil</AlertDialogTitle>
                <AlertDialogDescription className="text-gray-600">
                  Você tem certeza que deseja remover sua foto de perfil?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-purple-200 text-purple-600 hover:bg-purple-50">
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteProfileImage}
                  className="bg-red-600 text-white hover:bg-red-700"
                >
                  {deleteProfileImageMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Remover Foto"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
            <DialogContent className="border-purple-100">
              <DialogHeader>
                <DialogTitle className="text-gray-900">Editar Perfil</DialogTitle>
                <DialogDescription className="text-gray-600">
                  Faça as alterações necessárias no seu perfil.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="text-purple-700 font-medium">
                    Nome
                  </Label>
                  <Input
                    id="name"
                    value={editProfileData.nome}
                    onChange={(e) =>
                      setEditProfileData((prev) => ({
                        ...prev,
                        nome: e.target.value,
                      }))
                    }
                    className="border-purple-200 focus:border-purple-400"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-purple-700 font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={editProfileData.email}
                    onChange={(e) =>
                      setEditProfileData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="border-purple-200 focus:border-purple-400"
                  />
                </div>
                {user?.tipo_usuario === UserType.EXTERNO && (
                  <div className="grid gap-2">
                    <Label htmlFor="empresa" className="text-purple-700 font-medium">
                      Empresa
                    </Label>
                    <Input
                      id="empresa"
                      value={editProfileData.empresa}
                      onChange={(e) =>
                        setEditProfileData((prev) => ({
                          ...prev,
                          empresa: e.target.value,
                        }))
                      }
                      className="border-purple-200 focus:border-purple-400"
                    />
                  </div>
                )}
                {(user?.tipo_usuario === UserType.PESQUISADOR || user?.tipo_usuario === UserType.ESTUDANTE) && (
                  <div className="grid gap-2">
                    <Label htmlFor="campus" className="text-purple-700 font-medium">
                      Campus
                    </Label>
                    <Input
                      id="campus"
                      value={editProfileData.campus}
                      onChange={(e) =>
                        setEditProfileData((prev) => ({
                          ...prev,
                          campus: e.target.value,
                        }))
                      }
                      className="border-purple-200 focus:border-purple-400"
                    />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="border-purple-200 text-purple-600 hover:bg-purple-50"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleUpdateProfile}
                  disabled={updateUserMutation.isPending}
                  className="bg-gradient-to-r from-purple-600 to-violet-600 hover:shadow-purple-500/25 hover:shadow-lg"
                >
                  {updateUserMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar Alterações"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
            <DialogContent className="border-purple-100">
              <DialogHeader>
                <DialogTitle className="text-gray-900">Alterar Senha</DialogTitle>
                <DialogDescription className="text-gray-600">Digite sua senha atual e a nova senha.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="currentPassword" className="text-purple-700 font-medium">
                    Senha Atual
                  </Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordData.oldPassword}
                    onChange={(e) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        oldPassword: e.target.value,
                      }))
                    }
                    className="border-purple-200 focus:border-purple-400"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="newPassword" className="text-purple-700 font-medium">
                    Nova Senha
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                    className="border-purple-200 focus:border-purple-400"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword" className="text-purple-700 font-medium">
                    Confirmar Nova Senha
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    className="border-purple-200 focus:border-purple-400"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsChangePasswordOpen(false)}
                  className="border-purple-200 text-purple-600 hover:bg-purple-50"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleUpdatePassword}
                  disabled={changePasswordMutation.isPending}
                  className="bg-gradient-to-r from-purple-600 to-violet-600 hover:shadow-purple-500/25 hover:shadow-lg"
                >
                  {changePasswordMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Alterar Senha"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {selectedFile && (
            <ImageCropModal
              isOpen={isCropModalOpen}
              onClose={() => {
                setIsCropModalOpen(false)
                setSelectedFile(null)
              }}
              imageFile={selectedFile}
              onCropComplete={handleCropComplete}
            />
          )}

          {/* QR Code Modal para compartilhar perfil */}
          {isViewingOwnProfile && user && (
            <QrCodeModal
              isOpen={isQrCodeModalOpen}
              onClose={() => setIsQrCodeModalOpen(false)}
              user={{
                nome: user.nome,
                email: user.email,
                tipo_usuario: user.tipo_usuario,
                profile_image_url: user.foto_url || user.profile_image_url || undefined,
              }}
              profileLink={profileLink}
            />
          )}
        </>
      )}
    </div>
  )
}
