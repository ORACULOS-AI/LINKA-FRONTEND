'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useInitiativesApi } from '@/lib/api/initiatives'
import { useUserApi } from '@/lib/api/users'
import { useAuth } from '@/lib/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Iniciativa,
  StatusIniciativa,
  Participante,
  StatusVinculo,
  PapelIniciativa,
} from '@/lib/types/initiativeTypes'
import { UserWithType } from '@/lib/types/userTypes'
import { toast } from '@/hooks/use-toast'
import {
  Calendar,
  Users,
  Plus,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  Edit,
  AlertCircle,
  Save,
  Eye,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'

export default function InitiativePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { user } = useAuth()
  const {
    useGetInitiativeById,
    useUpdateInitiative,
    useDeleteInitiative,
    useInviteMember,
    useCancelInvite,
    useRemoveParticipant,
  } = useInitiativesApi()
  const { useFetchUsers } = useUserApi()
  const [isEditing, setIsEditing] = useState(false)
  const [editedInitiative, setEditedInitiative] = useState<Partial<Iniciativa>>(
    {},
  )
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUsers, setSelectedUsers] = useState<Array<{
    id: string
    papel: PapelIniciativa
  }>>([])

  const { data: initiative, isLoading: isLoadingInitiative } =
    useGetInitiativeById(resolvedParams.id)
  const { data: users } = useFetchUsers()
  const updateInitiative = useUpdateInitiative()
  const deleteInitiative = useDeleteInitiative()
  const inviteMember = useInviteMember()
  const cancelInvite = useCancelInvite()
  const removeParticipant = useRemoveParticipant()

  const isOwner = user?.user_uid === initiative?.uid_owner
  const isAdmin = user?.user_type === 'ADMIN'
  const canManage = isOwner || isAdmin

  useEffect(() => {
    if (initiative) {
      setEditedInitiative(initiative)
    }
  }, [initiative])

  const handleSave = async () => {
    try {
      await updateInitiative.mutateAsync({
        initiativeId: resolvedParams.id,
        updateData: {
          ...editedInitiative,
          recursos_necessarios: editedInitiative.recursos_necessarios || '',
          resultados_esperados: editedInitiative.resultados_esperados || '',
          laboratorios: editedInitiative.laboratorios || [],
          palavras_chave: editedInitiative.palavras_chave || [],
          data_ultima_atualizacao: new Date().toISOString(),
        },
      })
      setIsEditing(false)
      toast({
        title: 'Sucesso!',
        description: 'Iniciativa atualizada com sucesso',
      })
      // Refetch das iniciativas após a atualização
      // queryClient.invalidateQueries({ queryKey: ['initiatives'] })
      router.push('/minhas-iniciativas')
    } catch (error) {
      void error
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar iniciativa',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async () => {
    if (window.confirm('Tem certeza que deseja excluir esta iniciativa?')) {
      try {
        await deleteInitiative.mutateAsync(resolvedParams.id)
        router.push('/minhas-iniciativas')
        toast({
          title: 'Sucesso!',
          description: 'Iniciativa excluída com sucesso',
        })
      } catch (error) {
        toast({
          title: 'Erro',
          description: 'Erro ao excluir iniciativa',
          variant: 'destructive',
        })
      }
    }
  }

  const handleInviteUsers = async () => {
    try {
      await Promise.all(
        selectedUsers.map((user) =>
          inviteMember.mutateAsync({
            initiativeId: resolvedParams.id,
            userId: user.id,
            papel: user.papel,
          }),
        ),
      )
      setShowInviteDialog(false)
      setSelectedUsers([])
    } catch (error) {
      // O erro já é tratado no useInviteMember
    }
  }

  const handleUserSelect = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers((prev) => [
        ...prev,
        { id: userId, papel: PapelIniciativa.MEMBRO },
      ])
    } else {
      setSelectedUsers((prev) => prev.filter((user) => user.id !== userId))
    }
  }

  const handleRoleChange = (userId: string, papel: PapelIniciativa) => {
    setSelectedUsers((prev) =>
      prev.map((user) => (user.id === userId ? { ...user, papel } : user)),
    )
  }

  const handleRemoveParticipant = async (participantId: string) => {
    const participant = initiative?.participantes?.find(
      (p) => p.uid === participantId,
    )

    if (!participant) {
      toast({
        title: 'Erro',
        description: 'Participante não encontrado',
        variant: 'destructive',
      })
      return
    }

    if (!canManage) return

    if (window.confirm('Tem certeza que deseja remover este participante?')) {
      try {
        // Agora usamos removeParticipant para todos os casos
        await removeParticipant.mutateAsync({
          initiativeId: resolvedParams.id,
          userId: participantId,
        })
        toast({
          title: 'Sucesso!',
          description: participant.status_vinculo === StatusVinculo.PENDENTE
            ? 'Convite cancelado com sucesso'
            : 'Participante removido com sucesso',
        })
      } catch (error) {
        toast({
          title: 'Erro',
          description: 'Erro ao remover participante',
          variant: 'destructive',
        })
      }
    }
  }

  const handleReinvite = async (participantId: string) => {
    try {
      await inviteMember.mutateAsync({
        initiativeId: resolvedParams.id,
        userId: participantId,
      })
      toast({
        title: 'Sucesso!',
        description: 'Convite reenviado com sucesso',
      })
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao reenviar convite',
        variant: 'destructive',
      })
    }
  }

  const filteredUsers =
    users?.filter((user: UserWithType) => {
      if (!searchTerm) return true
      const searchLower = searchTerm.toLowerCase()
      return (
        user.nome?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower)
      )
    }) || []

  // Remove usuários que já são participantes e o proprietário
  const availableUsers = filteredUsers.filter(
    (user: UserWithType) =>
      user?.uid &&
      initiative?.participantes?.every(
        (p: Participante) => p.uid !== user.uid,
      ) &&
      user.uid !== initiative?.uid_owner,
  )

  const getStatusBadge = (status: StatusIniciativa) => {
    type StatusConfig = {
      [key in StatusIniciativa]: {
        className: string
        text: string
        icon: JSX.Element
      }
    }

    const statusConfig: StatusConfig = {
      [StatusIniciativa.PENDENTE]: {
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        text: 'Pendente de Aprovação',
        icon: <Clock className="w-4 h-4" />,
      },
      [StatusIniciativa.ATIVA]: {
        className: 'bg-green-100 text-green-800 border-green-200',
        text: 'Ativa',
        icon: <CheckCircle className="w-4 h-4" />,
      },
      [StatusIniciativa.PAUSADA]: {
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        text: 'Pausada',
        icon: <Clock className="w-4 h-4" />,
      },
      [StatusIniciativa.CONCLUIDA]: {
        className: 'bg-blue-100 text-blue-800 border-blue-200',
        text: 'Concluída',
        icon: <CheckCircle className="w-4 h-4" />,
      },
      [StatusIniciativa.CANCELADA]: {
        className: 'bg-red-100 text-red-800 border-red-200',
        text: 'Cancelada',
        icon: <XCircle className="w-4 h-4" />,
      },
    }

    const config = statusConfig[status] || statusConfig[StatusIniciativa.PENDENTE]

    return (
      <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${config.className}`}>
        {config.icon}
        <span className="font-medium">{config.text}</span>
      </div>
    )
  }

  // Função auxiliar para formatar datas com segurança
  const formatDate = (initiative: Iniciativa | undefined, field: 'data_cadastro' | 'data_ultima_atualizacao' | 'data_inicio' | 'data_fim'): string => {
    if (!initiative || !initiative[field]) return 'Data não disponível'
    try {
      return format(new Date(initiative[field]), "d 'de' MMMM 'às' HH:mm", {
        locale: ptBR,
      })
    } catch (e) {
      return 'Data inválida'
    }
  }

  // Se estiver carregando, mostra skeleton
  if (isLoadingInitiative) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto py-8"
      >
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-4 w-[300px] mt-4" />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 space-y-4"
        >
          <Skeleton className="h-[200px]" />
        </motion.div>
      </motion.div>
    )
  }

  // Se não encontrou a iniciativa
  if (!initiative) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-semibold">Iniciativa não encontrada</h1>
        <Button
          onClick={() => router.push('/minhas-iniciativas')}
          className="mt-4"
        >
          Voltar para Minhas Iniciativas
        </Button>
      </div>
    )
  }

  // Se não é o dono nem admin, redireciona para a visualização pública
  if (!canManage) {
    router.push(`/iniciativas/${resolvedParams.id}`)
    return null
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Editar Iniciativa</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push('/minhas-iniciativas')}
          >
            Cancelar
          </Button>
          <Button
            onClick={() =>
              router.push(`/iniciativas/${resolvedParams.id}`)
            }
          >
            <Eye className="mr-2 h-4 w-4" />
            Visualizar
          </Button>
        </div>
      </div>
      <div className="space-y-6">
        <AnimatePresence mode="wait">
          {isLoadingInitiative ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-24" />
              <Skeleton className="h-48" />
            </motion.div>
          ) : !initiative ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erro</AlertTitle>
                <AlertDescription>Iniciativa não encontrada</AlertDescription>
              </Alert>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-between items-start"
              >
                <div>
                  <h1 className="text-3xl font-bold">
                    {isEditing ? (
                      <Input
                        value={editedInitiative.titulo || ''}
                        onChange={(e) =>
                          setEditedInitiative((prev) => ({
                            ...prev,
                            titulo: e.target.value,
                          }))
                        }
                        className="text-3xl font-bold h-auto py-1"
                      />
                    ) : (
                      initiative.titulo
                    )}
                  </h1>
                  <div className="mt-2 flex items-center gap-4">
                    {getStatusBadge(initiative.status)}
                    <span className="text-sm text-gray-500">
                      Criado em: {formatDate(initiative, 'data_cadastro')}
                    </span>
                    <span className="text-sm text-gray-500">
                      Última atualização: {formatDate(initiative, 'data_ultima_atualizacao')}
                    </span>
                  </div>
                </div>
                {canManage && (
                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => setIsEditing(false)}
                        >
                          Cancelar
                        </Button>
                        <Button onClick={handleSave}>
                          <Save className="mr-2 h-4 w-4" />
                          Salvar
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => setIsEditing(true)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={handleDelete}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid gap-8 md:grid-cols-2 mt-8"
              >
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Descrição</h2>
                  {isEditing ? (
                    <Textarea
                      value={editedInitiative.descricao || ''}
                      onChange={(e) =>
                        setEditedInitiative((prev) => ({
                          ...prev,
                          descricao: e.target.value,
                        }))
                      }
                      className="min-h-[150px]"
                    />
                  ) : (
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {initiative.descricao}
                    </p>
                  )}
                </Card>

                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Recursos Necessários</h2>
                  {isEditing ? (
                    <Textarea
                      value={editedInitiative.recursos_necessarios || ''}
                      onChange={(e) =>
                        setEditedInitiative((prev) => ({
                          ...prev,
                          recursos_necessarios: e.target.value,
                        }))
                      }
                      className="min-h-[150px]"
                      placeholder="Descreva os recursos necessários para a iniciativa..."
                    />
                  ) : (
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {initiative.recursos_necessarios || 'Nenhum recurso especificado'}
                    </p>
                  )}
                </Card>

                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Resultados Esperados</h2>
                  {isEditing ? (
                    <Textarea
                      value={editedInitiative.resultados_esperados || ''}
                      onChange={(e) =>
                        setEditedInitiative((prev) => ({
                          ...prev,
                          resultados_esperados: e.target.value,
                        }))
                      }
                      className="min-h-[150px]"
                      placeholder="Descreva os resultados esperados da iniciativa..."
                    />
                  ) : (
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {initiative.resultados_esperados || 'Nenhum resultado especificado'}
                    </p>
                  )}
                </Card>

                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Laboratórios</h2>
                  {isEditing ? (
                    <div className="space-y-2">
                      <Input
                        placeholder="Digite os laboratórios separados por vírgula"
                        value={editedInitiative.laboratorios?.join(', ') || ''}
                        onChange={(e) =>
                          setEditedInitiative((prev) => ({
                            ...prev,
                            laboratorios: e.target.value
                              .split(',')
                              .map((lab) => lab.trim())
                              .filter(Boolean),
                          }))
                        }
                      />
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {initiative.laboratorios && initiative.laboratorios.length > 0 ? (
                        initiative.laboratorios.map((lab) => (
                          <Badge key={lab} variant="secondary">
                            {lab}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-gray-500">Nenhum laboratório associado</p>
                      )}
                    </div>
                  )}
                </Card>

                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Palavras-chave</h2>
                  {isEditing ? (
                    <div className="space-y-2">
                      <Input
                        placeholder="Digite as palavras-chave separadas por vírgula"
                        value={editedInitiative.palavras_chave?.join(', ') || ''}
                        onChange={(e) =>
                          setEditedInitiative((prev) => ({
                            ...prev,
                            palavras_chave: e.target.value
                              .split(',')
                              .map((tag) => tag.trim())
                              .filter(Boolean),
                          }))
                        }
                      />
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {initiative.palavras_chave && initiative.palavras_chave.length > 0 ? (
                        initiative.palavras_chave.map((tag) => (
                          <Badge key={tag} variant="outline">
                            {tag}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-gray-500">Nenhuma palavra-chave definida</p>
                      )}
                    </div>
                  )}
                </Card>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12"
              >
                <Card className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Informações Gerais</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Título</label>
                      <p>{initiative.titulo}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Descrição</label>
                      <p>{initiative.descricao}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Tipo</label>
                      <p>{initiative.tipo}</p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="text-sm font-medium">Período</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {initiative.data_inicio && !isNaN(new Date(initiative.data_inicio).getTime()) 
                          ? new Date(initiative.data_inicio).toLocaleDateString() 
                          : 'Data não disponível'} -{' '}
                        {initiative.data_fim && !isNaN(new Date(initiative.data_fim).getTime())
                          ? new Date(initiative.data_fim).toLocaleDateString()
                          : 'Data não disponível'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="text-sm font-medium">Progresso</label>
                    <Progress value={calculateProgress(initiative)} className="mt-2" />
                    <span className="text-sm text-muted-foreground mt-1">
                      {calculateProgress(initiative)}% concluído
                    </span>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Participantes</h2>
                    {canManage && (
                      <Dialog
                        open={showInviteDialog}
                        onOpenChange={setShowInviteDialog}
                      >
                        <DialogTrigger asChild>
                          <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Convidar
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Convidar Membros</DialogTitle>
                            <DialogDescription>
                              Selecione os usuários que você deseja convidar para a iniciativa.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Input
                              placeholder="Buscar usuários..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="mb-4"
                            />
                            <ScrollArea className="h-[300px]">
                              <div className="space-y-4">
                                {availableUsers.map((user: UserWithType) => (
                                  <div
                                    key={user.uid}
                                    className="flex items-center justify-between p-2 rounded-lg border"
                                  >
                                    <div className="flex items-center space-x-4">
                                      <Checkbox
                                        id={user.uid}
                                        checked={selectedUsers.some((u) => u.id === user.uid)}
                                        onCheckedChange={(checked) =>
                                          handleUserSelect(user.uid, checked as boolean)
                                        }
                                      />
                                      <div>
                                        <label
                                          htmlFor={user.uid}
                                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                          {user.nome}
                                        </label>
                                        <p className="text-sm text-muted-foreground">{user.email}</p>
                                      </div>
                                    </div>
                                    {selectedUsers.some((u) => u.id === user.uid) && (
                                      <Select
                                        value={
                                          selectedUsers.find((u) => u.id === user.uid)?.papel ||
                                          PapelIniciativa.MEMBRO
                                        }
                                        onValueChange={(value) =>
                                          handleRoleChange(user.uid, value as PapelIniciativa)
                                        }
                                      >
                                        <SelectTrigger className="w-[140px]">
                                          <SelectValue placeholder="Selecione o papel" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {Object.values(PapelIniciativa).map((papel) => (
                                            <SelectItem key={papel} value={papel}>
                                              {papel}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </ScrollArea>
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setShowInviteDialog(false)
                                setSelectedUsers([])
                              }}
                            >
                              Cancelar
                            </Button>
                            <Button
                              onClick={handleInviteUsers}
                              disabled={selectedUsers.length === 0}
                            >
                              Convidar
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex flex-col space-y-2">
                      <h3 className="text-sm font-medium">Membros Ativos</h3>
                      {initiative.participantes
                        ?.filter(
                          (p: Participante) =>
                            p.status_vinculo === StatusVinculo.ACEITO,
                        )
                        .map((participante: Participante) => {
                          const user = users?.find(
                            (u: UserWithType) => u.uid === participante.uid,
                          )
                          return (
                            <div
                              key={participante.uid}
                              className="flex items-center justify-between p-3 bg-muted rounded-lg border"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                  <Users className="h-4 w-4 text-primary" />
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-medium">
                                    {user?.nome || 'Usuário não encontrado'}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {participante.papel} •{' '}
                                    {participante.dedicacao_horas}h/semana
                                  </span>
                                </div>
                              </div>
                              {canManage && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleRemoveParticipant(participante.uid)
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          )
                        })}
                    </div>

                    {canManage && (
                      <>
                        <div className="flex flex-col space-y-2">
                          <h3 className="text-sm font-medium">Convites Pendentes</h3>
                          {initiative.participantes
                            ?.filter(
                              (p: Participante) =>
                                p.status_vinculo === StatusVinculo.PENDENTE,
                            )
                            .map((participante: Participante) => {
                              const user = users?.find(
                                (u: UserWithType) => u.uid === participante.uid,
                              )
                              return (
                                <div
                                  key={participante.uid}
                                  className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200"
                                >
                                  <div className="flex items-center space-x-3">
                                    <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                                      <Users className="h-4 w-4 text-yellow-600" />
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="font-medium">
                                        {user?.nome || 'Usuário não encontrado'}
                                      </span>
                                      <span className="text-xs text-yellow-600">
                                        Convite enviado em {formatDate(initiative, 'data_ultima_atualizacao')}
                                      </span>
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleRemoveParticipant(participante.uid)
                                    }
                                    className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-100"
                                  >
                                    Cancelar Convite
                                  </Button>
                                </div>
                              )
                            })}
                        </div>

                        <div className="flex flex-col space-y-2">
                          <h3 className="text-sm font-medium">Membros Inativos</h3>
                          {initiative.participantes
                            ?.filter(
                              (p: Participante) =>
                                p.status_vinculo === StatusVinculo.RECUSADO,
                            )
                            .map((participante: Participante) => {
                              const user = users?.find(
                                (u: UserWithType) => u.uid === participante.uid,
                              )
                              return (
                                <div
                                  key={participante.uid}
                                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                                >
                                  <div className="flex items-center space-x-3">
                                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                                      <Users className="h-4 w-4 text-gray-600" />
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="font-medium text-gray-600">
                                        {user?.nome || 'Usuário não encontrado'}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        {participante.data_fim
                                          ? `Saiu em ${formatDate(initiative, 'data_fim')}`
                                          : `Última atualização em ${formatDate(initiative, 'data_ultima_atualizacao')}`}
                                      </span>
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleReinvite(participante.uid)}
                                    className="text-gray-600 hover:text-gray-700 hover:bg-gray-100"
                                  >
                                    Reconvidar
                                  </Button>
                                </div>
                              )
                            })}
                        </div>
                      </>
                    )}
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

function calculateProgress(initiative: Iniciativa): number {
  if (!initiative.data_fim || !initiative.data_inicio) return 0

  try {
    const start = new Date(initiative.data_inicio)
    const end = new Date(initiative.data_fim)
    const today = new Date()

    // Verificar se as datas são válidas
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0

    const totalDays = Math.max(
      1,
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    )
    const daysElapsed = Math.max(
      0,
      (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    )

    const progress = (daysElapsed / totalDays) * 100
    return Math.min(Math.max(progress, 0), 100)
  } catch {
    return 0
  }
}
