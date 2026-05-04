"use client"

import { useState, useMemo } from "react"
import { NetworkModal } from "./network-modal"
import { NetworkTabs } from "./network-tabs"
import { Users, NetworkIcon, Sparkles } from "lucide-react"
import type { UserBaseCreate } from "@/lib/types/userTypes"

export function Network() {
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [selectedUser, setSelectedUser] = useState<UserBaseCreate | null>(null)

  // Memoizar propriedades do modal para evitar re-renderizações
  const modalProps = useMemo(() => ({
    user: selectedUser,
    isOpen: !!selectedUser,
    onClose: () => setSelectedUser(null)
  }), [selectedUser])

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section Simplificado */}
      <div className="relative bg-gradient-to-br from-purple-600 to-purple-700 text-white">
        {/* Elementos decorativos simplificados - apenas CSS puro */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-12 sm:py-16">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge Simplificado */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm mb-6">
              <Sparkles className="h-4 w-4 text-white" />
              <span className="text-sm font-medium text-white">Conecte-se e Colabore</span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-white">
              Rede de Conexões
            </h1>

            {/* Stats Simplificadas */}
            <div className="flex flex-wrap justify-center gap-6 text-center">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-200" />
                <span className="text-xl font-bold">10+</span>
                <span className="text-purple-200">Membros</span>
              </div>
              <div className="flex items-center gap-2">
                <NetworkIcon className="h-5 w-5 text-purple-200" />
                <span className="text-xl font-bold">20</span>
                <span className="text-purple-200">Conexões</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <NetworkTabs
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            roleFilter={roleFilter}
            setRoleFilter={setRoleFilter}
            setSelectedUser={setSelectedUser}
          />
        </div>

        <NetworkModal {...modalProps} />
      </div>
    </div>
  )
}
