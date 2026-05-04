'use client'

import { useState } from 'react'
import { useBusinessApi } from '@/lib/api/business'
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
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'
import { Check, Eye, MoreHorizontal, Search, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import {
  NegocioResponse,
  BusinessesByAdminResponse,
} from '@/lib/types/businessTypes'

type BusinessesTableProps = {
  businessesData: BusinessesByAdminResponse
  filter: 'all' | 'pendentes' | 'aprovados' | 'recusados' | 'recent'
  limit?: number
}

export function BusinessesTable({
  businessesData,
  filter,
  limit,
}: BusinessesTableProps) {
  const router = useRouter()
  const { useApproveBusiness, useRejectBusiness } = useBusinessApi()
  const approveBusiness = useApproveBusiness()
  const rejectBusiness = useRejectBusiness()

  // Estados para filtros e busca
  const [searchTerm, setSearchTerm] = useState('')

  // Estados para o modal de rejeição
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(
    null,
  )
  const [rejectReason, setRejectReason] = useState('')

  // Buscar dados
  let businesses: NegocioResponse[] = []

  if (filter === 'all') {
    businesses = [
      ...businessesData.pendentes,
      ...businessesData.aprovados,
      ...businessesData.recusados,
    ]
  } else if (filter === 'recent') {
    // Combinar todos e ordenar por data
    const allBusinesses = [
      ...businessesData.pendentes,
      ...businessesData.aprovados,
      ...businessesData.recusados,
    ]

    // Ordenar por data de cadastro (mais recentes primeiro)
    allBusinesses.sort((a, b) => {
      // Validar se data_cadastro existe antes de usar
      if (!a.data_cadastro) return 1
      if (!b.data_cadastro) return -1

      const dateA = new Date(a.data_cadastro).getTime()
      const dateB = new Date(b.data_cadastro).getTime()

      // Validar se as datas são válidas
      if (isNaN(dateA)) return 1
      if (isNaN(dateB)) return -1

      return dateB - dateA
    })

    businesses = allBusinesses
  } else {
    businesses = businessesData[filter]
  }

  // Filtrar pelos termos de busca
  if (searchTerm) {
    const lowercaseSearch = searchTerm.toLowerCase()
    businesses = businesses.filter(
      (business) =>
        business.nome.toLowerCase().includes(lowercaseSearch) ||
        business.tipo_negocio.toLowerCase().includes(lowercaseSearch),
    )
  }

  // Aplicar limite se especificado
  if (limit) {
    businesses = businesses.slice(0, limit)
  }

  // Handlers
  const handleApprove = async (businessId: string) => {
    try {
      await approveBusiness.mutateAsync(businessId)
      toast.success('Negócio aprovado com sucesso')
    } catch (error) {
      toast.error('Erro ao aprovar negócio')
    }
  }

  const handleOpenRejectModal = (businessId: string) => {
    setSelectedBusinessId(businessId)
    setRejectReason('')
    setRejectModalOpen(true)
  }

  const handleReject = async () => {
    if (!selectedBusinessId) return

    if (!rejectReason.trim()) {
      toast.error('É necessário informar um motivo para a rejeição')
      return
    }

    try {
      await rejectBusiness.mutateAsync({
        businessId: selectedBusinessId,
        motivo: { motivo_rejeicao: rejectReason },
      })
      toast.success('Negócio rejeitado com sucesso')
      setRejectModalOpen(false)
      setRejectReason('')
      setSelectedBusinessId(null)
    } catch (error) {
      toast.error('Erro ao rejeitar negócio')
    }
  }

  const handleViewBusiness = (business: NegocioResponse) => {
    router.push(`/inspecionar-negocio/${business.id}`)
  }

  const getStatusBadge = (business: NegocioResponse) => {
    if (business.status === 'pendente') {
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
          Pendente
        </Badge>
      )
    } else if (business.status === 'aprovado') {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700">
          Aprovado
        </Badge>
      )
    } else if (business.status === 'recusado') {
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700">
          Recusado
        </Badge>
      )
    }
    return <Badge variant="outline">Desconhecido</Badge>
  }

  return (
    <div className="space-y-4">
      {/* Barra de busca */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por nome ou tipo..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tabela de Negócios */}
      {businesses.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Nenhum negócio encontrado.
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Cadastro</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {businesses.map((business) => (
                <TableRow key={business.id}>
                  <TableCell className="font-medium">{business.nome}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-col">
                      <Badge variant="outline">{business.categoria}</Badge>
                      <Badge variant="secondary" className="w-fit">{business.tipo_negocio}</Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    {business.data_cadastro ? (
                      (() => {
                        try {
                          const date = parseISO(business.data_cadastro)
                          if (isNaN(date.getTime())) {
                            return <span className="text-muted-foreground">Data inválida</span>
                          }
                          return format(date, "d 'de' MMMM 'de' yyyy", { locale: ptBR })
                        } catch (error) {
                          return <span className="text-muted-foreground">Data inválida</span>
                        }
                      })()
                    ) : (
                      <span className="text-muted-foreground">Sem data</span>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(business)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleViewBusiness(business)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Visualizar
                        </DropdownMenuItem>

                        {business.status !== 'aprovado' && (
                          <DropdownMenuItem
                            onClick={() => handleApprove(business.id)}
                          >
                            <Check className="mr-2 h-4 w-4" />
                            Aprovar
                          </DropdownMenuItem>
                        )}

                        {business.status !== 'recusado' && (
                          <DropdownMenuItem
                            onClick={() => handleOpenRejectModal(business.id)}
                          >
                            <X className="mr-2 h-4 w-4" />
                            Rejeitar
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Modal de Rejeição */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar Negócio</DialogTitle>
            <DialogDescription>
              Informe o motivo para a rejeição deste negócio.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="motivo">Motivo da rejeição</Label>
              <Textarea
                id="motivo"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Descreva o motivo da rejeição..."
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              Confirmar Rejeição
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
