"use client"

import React from "react"
import { motion } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import QRCode from "react-qr-code"
import Image from "next/image"
import { User2, Mail } from "lucide-react"

interface QrCodeModalProps {
  isOpen: boolean
  onClose: () => void
  user: {
    nome?: string
    email?: string
    tipo_usuario?: string
    profile_image_url?: string
  }
  profileLink: string
}

const QrCodeModal: React.FC<QrCodeModalProps> = ({ isOpen, onClose, user, profileLink }) => {
  const getCategory = (type: string | undefined) => {
    switch (type) {
      case "PESQUISADOR":
        return "Pesquisador"
      case "ESTUDANTE":
        return "Estudante"
      case "EXTERNO":
        return "Profissional Externo"
      default:
        return null // Não retorna 'Usuário'
    }
  }

  const category = getCategory(user.tipo_usuario)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex h-full max-h-[600px] w-full max-w-[400px] flex-col items-center justify-center rounded-lg bg-animated-gradient p-6 text-white shadow-2xl border-0">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-center text-2xl font-bold animate-fadeIn">Compartilhe seu Perfil</DialogTitle>
        </DialogHeader>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center"
        >
          <div className="relative mb-4 h-32 w-32 rounded-full border-4 border-white shadow-xl animate-glow">
            <Image
              src={user.profile_image_url || "/default-avatar.png"}
              alt="User Avatar"
              layout="fill"
              className="rounded-full"
            />
          </div>
          <h2 className="text-2xl font-bold animate-typewriter">{user.nome}</h2>
          {category && <p className="mb-2 text-sm animate-fadeIn">{category}</p>}
          <div className="flex items-center space-x-2 animate-slideIn">
            <Mail className="h-4 w-4" />
            <p className="text-sm">{user.email}</p>
          </div>
        </motion.div>
        <div className="mt-6 rounded-lg bg-white p-4 animate-fadeIn">
          <QRCode value={profileLink} size={200} />
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default QrCodeModal
