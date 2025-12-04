"use client"

import type React from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { UserPlus, Search, X, UserX, UserCheck, Clock, Crown, Shield, Code, Users } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { type NegocioResponse, type MembroNegocio, PapelNegocio, StatusVinculoNegocio } from "@/lib/types/businessTypes"

interface UserType {
  uid: string
  nome: string
  foto_url?: string
}

interface MembersSectionProps {
  business: NegocioResponse
  isOwner: boolean
  users: UserType[]
  showInviteDialog: boolean
  setShowInviteDialog: (show: boolean) => void
  selectedUsers: string[]
  setSelectedUsers: (users: string[]) => void
  userRoles: Record<string, PapelNegocio>
  setUserRoles: (roles: Record<string, PapelNegocio>) => void
  searchTerm: string
  setSearchTerm: (term: string) => void
  filteredUsers: UserType[]
  onInviteUsers: () => void
  onRemoveMember: (userId: string) => void
}

// Função para obter a cor do status
const getStatusInfo = (status: StatusVinculoNegocio) => {
  switch (status) {
    case StatusVinculoNegocio.ACEITO:
      return {
        color: "text-green-600",
        bgColor: "bg-green-100",
        borderColor: "border-green-200",
        icon: <UserCheck className="h-3 w-3" />,
      }
    case StatusVinculoNegocio.RECUSADO:
      return {
        color: "text-red-600",
        bgColor: "bg-red-100",
        borderColor: "border-red-200",
        icon: <UserX className="h-3 w-3" />,
      }
    case StatusVinculoNegocio.PENDENTE:
    default:
      return {
        color: "text-amber-600",
        bgColor: "bg-amber-100",
        borderColor: "border-amber-200",
        icon: <Clock className="h-3 w-3" />,
      }
  }
}

// Função para obter a cor do papel
const getRoleInfo = (papel: PapelNegocio) => {
  switch (papel) {
    case PapelNegocio.ADMIN:
      return {
        color: "text-purple-700",
        bgColor: "bg-purple-100",
        borderColor: "border-purple-200",
        icon: <Crown className="h-3 w-3" />,
      }
    case PapelNegocio.COORDENADOR:
      return {
        color: "text-blue-700",
        bgColor: "bg-blue-100",
        borderColor: "border-blue-200",
        icon: <Shield className="h-3 w-3" />,
      }
    case PapelNegocio.PESQUISADOR:
      return {
        color: "text-teal-700",
        bgColor: "bg-teal-100",
        borderColor: "border-teal-200",
        icon: <Search className="h-3 w-3" />,
      }
    case PapelNegocio.DESENVOLVEDOR:
      return {
        color: "text-indigo-700",
        bgColor: "bg-indigo-100",
        borderColor: "border-indigo-200",
        icon: <Code className="h-3 w-3" />,
      }
    case PapelNegocio.MEMBRO:
    default:
      return {
        color: "text-slate-700",
        bgColor: "bg-slate-100",
        borderColor: "border-slate-200",
        icon: <Users className="h-3 w-3" />,
      }
  }
}

export const MembersSection: React.FC<MembersSectionProps> = ({
  business,
  isOwner,
  users,
  showInviteDialog,
  setShowInviteDialog,
  selectedUsers,
  setSelectedUsers,
  userRoles,
  setUserRoles,
  searchTerm,
  setSearchTerm,
  filteredUsers,
  onInviteUsers,
  onRemoveMember,
}) => {
  // Garantir que membros seja um objeto
  const membros = business.membros || {}
  const memberCount = Object.keys(membros).length + 1 // +1 for owner

  // Encontrar o dono do negócio
  const owner = users.find((user) => user.uid === business.uid_admin)

  return (
    <>
      <Card className="overflow-hidden shadow-lg border-0 bg-white border border-purple-100">
        <div className="p-6 pb-4 border-b border-purple-50">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Membros</h2>
                <p className="text-sm text-gray-600">
                  {memberCount} {memberCount === 1 ? "membro ativo" : "membros ativos"}
                </p>
              </div>
            </div>
            {isOwner && (
              <Button
                onClick={() => setShowInviteDialog(true)}
                size="sm"
                className="gap-2 bg-gradient-to-r from-purple-600 to-violet-600 hover:shadow-purple-500/25 hover:shadow-lg"
              >
                <UserPlus className="h-4 w-4" />
                <span className="hidden sm:inline">Convidar</span>
              </Button>
            )}
          </div>
        </div>

        <div className="divide-y divide-purple-50">
          {/* Owner */}
          <motion.div
            className="p-4 bg-gradient-to-r from-purple-50 to-violet-50"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Avatar className="h-12 w-12 border-2 border-purple-200 shadow-sm">
                    <AvatarImage src={owner?.foto_url || "/placeholder.svg"} alt={owner?.nome || "Avatar"} />
                    <AvatarFallback className="bg-purple-100 text-blue-700 font-semibold">
                      {(owner?.nome?.[0] || business.uid_admin[0])?.toUpperCase() || "A"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -top-1 -right-1 p-1 bg-yellow-400 rounded-full">
                    <Crown className="h-3 w-3 text-yellow-800" />
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{owner?.nome || business.uid_admin}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-0 text-xs">
                      Proprietário
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Members */}
          {Object.entries(membros).map(([userId, membro]: [string, MembroNegocio], index) => {
            if (userId === business.uid_admin) return null

            const statusInfo = getStatusInfo(membro.status || StatusVinculoNegocio.PENDENTE)
            const roleInfo = getRoleInfo(membro.papel)
            const user = users.find((u) => u.uid === userId)

            return (
              <motion.div
                key={userId}
                className="p-4 hover:bg-purple-50/30 transition-colors"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10 border border-slate-200">
                      <AvatarImage src={user?.foto_url || "/placeholder.svg"} alt={user?.nome || "Avatar"} />
                      <AvatarFallback className="bg-purple-50/30 text-slate-700">
                        {(user?.nome?.[0] || userId[0])?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-900">{user?.nome || userId}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant="outline"
                          className={`text-xs ${roleInfo.bgColor} ${roleInfo.color} ${roleInfo.borderColor} flex items-center gap-1`}
                        >
                          {roleInfo.icon}
                          {membro.papel}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-xs ${statusInfo.bgColor} ${statusInfo.color} ${statusInfo.borderColor} flex items-center gap-1`}
                        >
                          {statusInfo.icon}
                          <span>{membro.status || StatusVinculoNegocio.PENDENTE}</span>
                        </Badge>
                      </div>
                    </div>
                  </div>
                  {isOwner && userId !== business.uid_admin && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => onRemoveMember(userId)}
                    >
                      <UserX className="h-4 w-4" />
                      <span className="sr-only">Remover</span>
                    </Button>
                  )}
                </div>
              </motion.div>
            )
          })}

          {memberCount === 1 && (
            <div className="py-12 text-center">
              <div className="mx-auto w-16 h-16 bg-purple-50/30 rounded-full flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {isOwner ? "Comece a montar sua equipe" : "Nenhum membro adicional"}
              </h3>
              <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                {isOwner
                  ? "Convide pessoas para colaborar no seu negócio e formar uma equipe incrível."
                  : "Este negócio conta apenas com o proprietário no momento."}
              </p>
              {isOwner && (
                <Button
                  onClick={() => setShowInviteDialog(true)}
                  className="gap-2 bg-gradient-to-r from-purple-600 to-violet-600 hover:shadow-purple-500/25 hover:shadow-lg"
                >
                  <UserPlus className="h-4 w-4" />
                  Convidar membros
                </Button>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Invite Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="sm:max-w-md border-purple-100">
          <DialogHeader>
            <DialogTitle>Convidar Membros</DialogTitle>
            <DialogDescription>Selecione os usuários que você deseja convidar para o negócio</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-purple-500" />
              <Input
                placeholder="Buscar usuários..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 border-purple-200 focus:border-purple-400"
              />
            </div>
            <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user: UserType) => (
                  <div key={user.uid} className="flex items-center gap-3 p-2 rounded-md hover:bg-purple-50/30">
                    <Checkbox
                      checked={selectedUsers.includes(user.uid)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedUsers([...selectedUsers, user.uid])
                        } else {
                          setSelectedUsers(selectedUsers.filter((id) => id !== user.uid))
                        }
                      }}
                      className="data-[state=checked]:bg-purple-600 data-[state=checked]:text-white"
                    />
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.foto_url || "/placeholder.svg"} alt={user.nome} />
                      <AvatarFallback className="bg-slate-100 text-slate-700 text-xs">
                        {user.nome.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{user.nome}</p>
                      <p className="text-xs text-slate-500">{user.uid}</p>
                    </div>
                    <Select
                      value={userRoles[user.uid] || PapelNegocio.MEMBRO}
                      onValueChange={(value: PapelNegocio) => {
                        setUserRoles({
                          ...userRoles,
                          [user.uid]: value,
                        })
                      }}
                    >
                      <SelectTrigger className="h-8 w-[130px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={PapelNegocio.MEMBRO}>Membro</SelectItem>
                        <SelectItem value={PapelNegocio.ADMIN}>Administrador</SelectItem>
                        <SelectItem value={PapelNegocio.COORDENADOR}>Coordenador</SelectItem>
                        <SelectItem value={PapelNegocio.PESQUISADOR}>Pesquisador</SelectItem>
                        <SelectItem value={PapelNegocio.DESENVOLVEDOR}>Desenvolvedor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-500 text-sm">
                    {searchTerm
                      ? `Nenhum usuário encontrado para "${searchTerm}"`
                      : "Nenhum usuário disponível para adicionar"}
                  </p>
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="flex justify-between items-center">
            <Button variant="ghost" onClick={() => setShowInviteDialog(false)} className="gap-1">
              <X className="h-4 w-4" />
              Cancelar
            </Button>
            <Button
              onClick={onInviteUsers}
              disabled={selectedUsers.length === 0}
              className="gap-1 bg-gradient-to-r from-purple-600 to-violet-600 hover:shadow-purple-500/25 hover:shadow-lg"
            >
              <UserPlus className="h-4 w-4" />
              Convidar {selectedUsers.length > 0 && `(${selectedUsers.length})`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
