import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  CheckCircle,
  XCircle,
  Search,
  AlertCircle,
  CalendarIcon,
  MapPin,
  MoreVertical,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useEventsApi } from '@/lib/api/events'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { EventStatus } from '@/lib/types/event'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type Event = {
  uid: string
  titulo: string
  descricao: string
  data_evento: string
  localizacao: string
  status: string
}

type EventsData = {
  ativos: Event[]
  concluidos: Event[]
  cancelados: Event[]
  all: Event[]
}

type EventsTableProps = {
  eventsData: EventsData
  filter: 'ativos' | 'concluidos' | 'cancelados' | 'recent' | 'all'
  limit?: number
}

export function EventsTable({ eventsData, filter, limit }: EventsTableProps) {
  const { useUpdateEventStatus } = useEventsApi()
  const updateEventStatus = useUpdateEventStatus()

  const [searchTerm, setSearchTerm] = useState('')
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [selectedAction, setSelectedAction] = useState<{
    eventId: string
    action: 'concluir' | 'cancelar'
  } | null>(null)

  // Formatar data
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", {
        locale: ptBR,
      })
    } catch {
      return 'Data inválida'
    }
  }

  // Obter os eventos de acordo com o filtro selecionado
  const getEventsBasedOnFilter = () => {
    if (filter === 'ativos') return eventsData?.ativos || []
    if (filter === 'concluidos') return eventsData?.concluidos || []
    if (filter === 'cancelados') return eventsData?.cancelados || []
    if (filter === 'recent') {
      // Ordenar eventos por data mais recente
      return [...(eventsData?.all || [])]
        .sort(
          (a, b) =>
            new Date(b.data_evento).getTime() -
            new Date(a.data_evento).getTime(),
        )
        .slice(0, limit || 5)
    }
    return eventsData?.all || []
  }

  // Filtrar eventos com base no termo de pesquisa
  const getFilteredEvents = () => {
    let events = getEventsBasedOnFilter()

    // Aplicar pesquisa
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      events = events.filter(
        (event) =>
          event.titulo.toLowerCase().includes(term) ||
          event.descricao?.toLowerCase().includes(term) ||
          event.localizacao?.toLowerCase().includes(term),
      )
    }

    return events
  }

  // Renderizar badge de status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ativo':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Ativo
          </Badge>
        )
      case 'concluido':
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            Concluído
          </Badge>
        )
      case 'cancelado':
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800">
            Cancelado
          </Badge>
        )
      default:
        return <Badge variant="outline">Desconhecido</Badge>
    }
  }

  // Handler para atualizar status
  const handleOpenConfirmDialog = (
    eventId: string,
    action: 'concluir' | 'cancelar',
  ) => {
    setSelectedAction({ eventId, action })
    setIsConfirmDialogOpen(true)
  }

  const handleUpdateStatus = async () => {
    if (!selectedAction) return

    // Mapear para o formato correto de EventStatus
    const statusMap: Record<string, EventStatus> = {
      concluir: 'CONCLUIDO',
      cancelar: 'CANCELADO',
    }

    const newStatus = statusMap[selectedAction.action]

    await updateEventStatus.mutateAsync({
      eventId: selectedAction.eventId,
      status: newStatus,
    })

    setIsConfirmDialogOpen(false)
    setSelectedAction(null)
  }

  // Renderizar tabela
  const filteredEvents = getFilteredEvents()

  if (filteredEvents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <AlertCircle className="h-10 w-10 text-muted-foreground mb-2" />
        <p className="text-lg font-medium">Nenhum evento encontrado</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Barra de pesquisa */}
      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Pesquisar eventos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-9"
        />
      </div>

      {/* Tabela */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Local</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredEvents.map((event) => (
            <TableRow key={event.uid}>
              <TableCell className="font-medium">{event.titulo}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  {formatDate(event.data_evento)}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  {event.localizacao}
                </div>
              </TableCell>
              <TableCell>{getStatusBadge(event.status)}</TableCell>
              <TableCell className="text-right">
                {filter === 'ativos' ? (
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-blue-50 hover:bg-blue-100 text-blue-600"
                      onClick={() =>
                        handleOpenConfirmDialog(event.uid, 'concluir')
                      }
                    >
                      <CheckCircle className="h-4 w-4 mr-1" /> Concluir
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-red-50 hover:bg-red-100 text-red-600"
                      onClick={() =>
                        handleOpenConfirmDialog(event.uid, 'cancelar')
                      }
                    >
                      <XCircle className="h-4 w-4 mr-1" /> Cancelar
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
                      {event.status === 'ativo' && (
                        <>
                          <DropdownMenuItem
                            className="text-blue-600"
                            onClick={() =>
                              handleOpenConfirmDialog(event.uid, 'concluir')
                            }
                          >
                            <CheckCircle className="h-4 w-4 mr-2" /> Concluir
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() =>
                              handleOpenConfirmDialog(event.uid, 'cancelar')
                            }
                          >
                            <XCircle className="h-4 w-4 mr-2" /> Cancelar
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Diálogo de confirmação */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedAction?.action === 'concluir'
                ? 'Concluir Evento'
                : 'Cancelar Evento'}
            </DialogTitle>
            <DialogDescription>
              {selectedAction?.action === 'concluir'
                ? 'Tem certeza que deseja marcar este evento como concluído? Esta ação não pode ser desfeita.'
                : 'Tem certeza que deseja cancelar este evento? Esta ação não pode ser desfeita.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsConfirmDialogOpen(false)}
            >
              Voltar
            </Button>
            <Button
              onClick={handleUpdateStatus}
              variant={
                selectedAction?.action === 'concluir'
                  ? 'default'
                  : 'destructive'
              }
            >
              {selectedAction?.action === 'concluir'
                ? 'Confirmar Conclusão'
                : 'Confirmar Cancelamento'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
