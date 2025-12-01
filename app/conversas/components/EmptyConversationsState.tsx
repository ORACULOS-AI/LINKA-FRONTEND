"use client"

import { motion } from "framer-motion"
import { MessageCircle, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyConversationsStateProps {
  onStartConversation: () => void
}

export function EmptyConversationsState({ onStartConversation }: EmptyConversationsStateProps) {
  return (
    <motion.div
      className="text-center mt-12 p-8 bg-purple-50 rounded-2xl border border-purple-100"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <MessageCircle className="h-8 w-8 text-purple-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma conversa ainda</h3>
      <p className="text-gray-600 mb-4">
        Comece uma conversa com suas conexões para colaborar em projetos e trocar ideias.
      </p>
      <p className="text-sm text-gray-500 mb-6">Você pode iniciar conversas com pessoas da sua rede de conexões.</p>
      <Button
        className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white shadow-lg hover:shadow-purple-500/25 transition-all duration-200"
        onClick={onStartConversation}
      >
        <Plus className="w-4 h-4 mr-2" />
        Iniciar Nova Conversa
      </Button>
    </motion.div>
  )
}
