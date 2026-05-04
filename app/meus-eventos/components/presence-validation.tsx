'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useState } from 'react'
import { useEventApi } from '@/lib/api/event'
import { EventResponse, ParticipanteStatus } from '@/lib/types/eventTypes'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar'
import { Badge } from '@/components/ui/badge'
import { CheckIcon, XIcon } from 'lucide-react'
import { toast } from 'react-toastify'

interface PresenceValidationProps {
  event: EventResponse
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function PresenceValidation({
  event,
  isOpen,
  onClose,
  onSuccess,
}: PresenceValidationProps) {
  const { validarPresenca } = useEventApi()
  const [isLoading, setIsLoading] = useState(false)

  const handleValidatePresence = async (
    uid_usuario: string,
    status: ParticipanteStatus,
  ) => {
    try {
      setIsLoading(true)
      await validarPresenca(event.uid, uid_usuario, status)
      onSuccess()
      toast.success('Presença validada com sucesso')
    } catch {
      toast.error('Erro ao validar presença')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: ParticipanteStatus) => {
    switch (status) {
      case ParticipanteStatus.PRESENTE:
        return 'bg-green-500/10 text-green-700'
      case ParticipanteStatus.AUSENTE:
        return 'bg-red-500/10 text-red-700'
      default:
        return 'bg-yellow-500/10 text-yellow-700'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Validar Presenças</DialogTitle>
          <DialogDescription>
            Valide a presença dos participantes no evento {event.titulo}.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[400px] w-full">
          <div className="space-y-4">
            {event.participantes.map((participante) => (
              <div
                key={participante.uid_usuario}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={`/avatars/${participante.uid_usuario}`} />
                    <AvatarFallback>
                      {participante.uid_usuario.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{participante.uid_usuario}</p>
                    <p className="text-sm text-muted-foreground">
                      Inscrito em:{' '}
                      {new Date(
                        participante.data_inscricao,
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <Badge
                    className={getStatusColor(
                      participante.status as ParticipanteStatus,
                    )}
                  >
                    {participante.status}
                  </Badge>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      onClick={() =>
                        handleValidatePresence(
                          participante.uid_usuario,
                          ParticipanteStatus.PRESENTE,
                        )
                      }
                      disabled={isLoading}
                    >
                      <CheckIcon className="h-4 w-4" />
                      <span className="sr-only">Marcar como presente</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() =>
                        handleValidatePresence(
                          participante.uid_usuario,
                          ParticipanteStatus.AUSENTE,
                        )
                      }
                      disabled={isLoading}
                    >
                      <XIcon className="h-4 w-4" />
                      <span className="sr-only">Marcar como ausente</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
