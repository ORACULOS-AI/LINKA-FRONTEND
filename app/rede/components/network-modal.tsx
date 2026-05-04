"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AvatarFallback, Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { UserBaseCreate } from "@/lib/types/userTypes"
import { Mail, MapPin, Briefcase, GraduationCap, Calendar, UserCircle, Crown, Building2, X } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

interface NetworkModalProps {
  user: UserBaseCreate | null
  isOpen: boolean
  onClose: () => void
}

export function NetworkModal({ user, isOpen, onClose }: NetworkModalProps) {
  const router = useRouter()

  if (!user) return null

  const getUserIcon = () => {
    switch (user.tipo_usuario) {
      case "estudante":
        return <GraduationCap className="h-4 w-4" />
      case "pesquisador":
        return <Crown className="h-4 w-4" />
      case "externo":
        return <Briefcase className="h-4 w-4" />
      default:
        return <UserCircle className="h-4 w-4" />
    }
  }

  const getUserBadgeColor = () => {
    switch (user.tipo_usuario) {
      case "estudante":
        return "bg-gradient-to-r from-blue-500 to-indigo-500"
      case "pesquisador":
        return "bg-gradient-to-r from-yellow-500 to-orange-500"
      case "externo":
        return "bg-gradient-to-r from-green-500 to-emerald-500"
      default:
        return "bg-gradient-to-r from-purple-500 to-violet-500"
    }
  }

  const getUserDetails = (user: UserBaseCreate) => {
    const details = [
      { icon: Mail, label: "Email", value: user.email },
      {
        icon: user.tipo_usuario === "externo" ? Building2 : MapPin,
        label: user.tipo_usuario === "externo" ? "Empresa" : "Campus",
        value: (user as any).campus || (user as any).empresa || "Não informado",
      },
    ]

    if (user.tipo_usuario === "estudante") {
      details.push({
        icon: GraduationCap,
        label: "Curso",
        value: (user as any).curso || "Não informado",
      })
    } else if (user.tipo_usuario === "externo") {
      details.push({
        icon: Briefcase,
        label: "Cargo",
        value: (user as any).cargo || "Não informado",
      })
    }

    if ((user as any).data_cadastro) {
      details.push({
        icon: Calendar,
        label: "Membro desde",
        value: new Date((user as any).data_cadastro).toLocaleDateString("pt-BR"),
      })
    }

    return details
  }

  const handleViewProfile = () => {
    router.push(`/perfil?id=${user.uid}&type=${user.tipo_usuario}`)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] border-purple-100 bg-white">
        <DialogHeader className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute -top-2 -right-2 h-8 w-8 p-0 hover:bg-purple-50"
          >
            <X className="h-4 w-4" />
          </Button>
          <DialogTitle className="text-xl font-bold text-gray-900 pr-8">Perfil do Usuário</DialogTitle>
        </DialogHeader>

        <motion.div
          className="space-y-6 py-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* User Header */}
          <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl border border-purple-100">
            <div className="relative h-20 w-20 rounded-2xl overflow-hidden bg-gradient-to-br from-purple-100 to-violet-100 border-2 border-white shadow-lg">
              {user.foto_url ? (
                <Image
                  src={user.foto_url || "/placeholder.svg"}
                  alt={`Foto de ${user.nome}`}
                  fill
                  sizes="(max-width: 80px) 100vw, 80px"
                  className="object-cover"
                />
              ) : (
                <Avatar className="h-full w-full">
                  <AvatarFallback className="bg-purple-100 text-purple-600 font-bold text-xl">
                    {user.nome.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{user.nome}</h3>
              <Badge
                className={`${getUserBadgeColor()} text-white border-0 text-sm font-medium flex items-center gap-2 w-fit`}
              >
                {getUserIcon()}
                {user.tipo_usuario.charAt(0).toUpperCase() + user.tipo_usuario.slice(1)}
              </Badge>
            </div>
          </div>

          {/* User Details */}
          <div className="space-y-4">
            {getUserDetails(user).map(({ icon: Icon, label, value }, index) => (
              <motion.div
                key={index}
                className="flex items-center gap-4 p-3 rounded-xl bg-purple-50/50 border border-purple-100"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-violet-600 rounded-lg flex items-center justify-center">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-purple-700">{label}</p>
                  <p className="text-gray-800 font-medium">{value}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-purple-100">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 border-purple-200 text-purple-600 hover:bg-purple-50 bg-transparent"
          >
            Fechar
          </Button>
          <Button
            onClick={handleViewProfile}
            className="flex-1 bg-gradient-to-r from-purple-600 to-violet-600 hover:shadow-purple-500/25 hover:shadow-lg transition-all duration-300 text-white"
          >
            <UserCircle className="w-4 h-4 mr-2" />
            Ver Perfil Completo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
