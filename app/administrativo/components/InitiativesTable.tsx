'use client'

import { useState } from 'react'
import { useInitiativesApi } from '@/lib/api/initiatives'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  CheckCircle,
  XCircle,
  Search,
  MoreVertical,
  FileText,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  IniciativasByStatus,
  IniciativaBase,
  StatusIniciativa,
} from '@/lib/types/initiativeTypes'

type InitiativesTableProps = {
  initiativesData: IniciativasByStatus
  filter: 'all' | 'pendentes' | 'ativas' | 'recusadas' | 'recent'
  limit?: number
}

export function InitiativesTable({
  initiativesData,
  filter,
  limit,
}: InitiativesTableProps) {
  const { useApproveInitiative, useRejectInitiative } = useInitiativesApi()
  const approveInitiative = useApproveInitiative()
  const rejectInitiative = useRejectInitiative()

  const [searchTerm, setSearchTerm] = useState('')
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [selectedInitiativeId, setSelectedInitiativeId] = useState<
    string | null
  >(null)

  const handleApproveInitiative = async (initiativeId: string) => {
    await approveInitiative.mutateAsync(initiativeId)
  }

  const handleOpenRejectDialog = (initiativeId: string) => {
    setSelectedInitiativeId(initiativeId)
    setRejectReason('')
    setIsRejectDialogOpen(true)
  }

  const handleRejectInitiative = async () => {
    if (!selectedInitiativeId) return

    await rejectInitiative.mutateAsync({
      initiativeId: selectedInitiativeId,
      motivo: rejectReason,
    })

    setIsRejectDialogOpen(false)
    setSelectedInitiativeId(null)
    setRejectReason('')
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR })
    } catch {
      return 'Data inválida'
    }
  }

  // Determinar quais iniciativas mostrar com base no filtro
  let initiatives: IniciativaBase[] = []
  if (filter === 'pendentes') {
    initiatives = initiativesData?.pendentes || []
  } else if (filter === 'ativas') {
    initiatives = initiativesData?.ativas || []
  } else if (filter === 'recusadas') {
    initiatives = initiativesData?.recusadas || []
  } else if (filter === 'recent') {
    // Combinar todas as iniciativas e pegar as mais recentes
    const allInitiatives = [
      ...(initiativesData?.pendentes || []),
      ...(initiativesData?.ativas || []),
      ...(initiativesData?.recusadas || []),
    ]

    // Ordenar por data (mais recentes primeiro)
    initiatives = allInitiatives.sort((a, b) => {
      return (
        new Date(b.data_cadastro).getTime() -
        new Date(a.data_cadastro).getTime()
      )
    })
  } else {
    // Filtro 'all' - todas as iniciativas
    initiatives = [
      ...(initiativesData?.pendentes || []),
      ...(initiativesData?.ativas || []),
      ...(initiativesData?.recusadas || []),
    ]
  }

  // Aplicar limite se especificado
  if (limit && limit > 0) {
    initiatives = initiatives.slice(0, limit)
  }

  // Aplicar filtro de pesquisa
  if (searchTerm) {
    initiatives = initiatives.filter(
      (initiative) =>
        initiative.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        initiative.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        initiative.status.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }

  const getInitiativeTypeBadge = (type: string) => {
    const typeColors: Record<string, string> = {
      pesquisa: 'bg-blue-500',
      inovacao: 'bg-purple-500',
      extensao: 'bg-green-500',
      empreendedorismo: 'bg-amber-500',
      outros: 'bg-gray-500',
    }

    const color = typeColors[type.toLowerCase()] || 'bg-gray-500'

    return (
      <Badge className={`${color} text-white`}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDENTE':
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
            Pendente
          </Badge>
        )
      case 'ATIVA':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Ativa
          </Badge>
        )
      case 'RECUSADA':
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800">
            Recusada
          </Badge>
        )
      case 'CONCLUIDA':
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            Concluída
          </Badge>
        )
      case 'CANCELADA':
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800">
            Cancelada
          </Badge>
        )
      default:
        return <Badge variant="outline">Desconhecido</Badge>
    }
  }

  // Interface vazia se não houver iniciativas
  if (!initiatives || initiatives.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <FileText className="h-16 w-16 text-muted-foreground mb-2" />
        <p className="text-xl font-medium text-center">
          Nenhuma iniciativa encontrada
        </p>
        <p className="text-sm text-muted-foreground text-center mt-1">
          {filter === 'pendentes'
            ? 'Não há iniciativas pendentes de aprovação no momento'
            : 'Não foram encontradas iniciativas que correspondam aos critérios'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Barra de pesquisa */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar iniciativas..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tabela de iniciativas */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Data de Cadastro</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initiatives.map((initiative) => (
              <TableRow key={initiative.uid}>
                <TableCell className="font-medium">
                  {initiative.titulo}
                </TableCell>
                <TableCell>{getInitiativeTypeBadge(initiative.tipo)}</TableCell>
                <TableCell>{formatDate(initiative.data_cadastro)}</TableCell>
                <TableCell>{getStatusBadge(initiative.status)}</TableCell>
                <TableCell>
                  {initiative.status === StatusIniciativa.PENDENTE ? (
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-green-50 hover:bg-green-100 text-green-600"
                        onClick={() => handleApproveInitiative(initiative.uid)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" /> Aprovar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-red-50 hover:bg-red-100 text-red-600"
                        onClick={() => handleOpenRejectDialog(initiative.uid)}
                      >
                        <XCircle className="h-4 w-4 mr-1" /> Rejeitar
                      </Button>
                    </div>
                  ) : (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Visualizar Detalhes</DropdownMenuItem>
                        {initiative.status === StatusIniciativa.PENDENTE && (
                          <>
                            <DropdownMenuItem
                              className="text-green-600"
                              onClick={() =>
                                handleApproveInitiative(initiative.uid)
                              }
                            >
                              <CheckCircle className="h-4 w-4 mr-2" /> Aprovar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() =>
                                handleOpenRejectDialog(initiative.uid)
                              }
                            >
                              <XCircle className="h-4 w-4 mr-2" /> Rejeitar
                            </DropdownMenuItem>
                          </>
                        )}
                        {initiative.status === StatusIniciativa.ATIVA && (
                          <DropdownMenuItem className="text-red-600">
                            Cancelar
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Modal de rejeição */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar Iniciativa</DialogTitle>
            <DialogDescription>
              Informe o motivo da rejeição. Esta informação será enviada ao
              criador da iniciativa.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Motivo da rejeição</Label>
              <Textarea
                id="reason"
                placeholder="Descreva por que esta iniciativa está sendo rejeitada..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRejectDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleRejectInitiative}
              variant="destructive"
              disabled={!rejectReason.trim()}
            >
              Rejeitar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
