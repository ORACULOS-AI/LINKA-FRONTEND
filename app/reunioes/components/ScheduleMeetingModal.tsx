"use client"

import { format } from 'date-fns'
import { Calendar, Clock, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'

interface ScheduleMeetingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  participantId: string
  onParticipantChange: (id: string) => void
  selectedDate: string
  onDateChange: (date: string) => void
  selectedTime: string
  onTimeChange: (time: string) => void
  selectedDuration: string
  onDurationChange: (duration: string) => void
  message: string
  onMessageChange: (message: string) => void
  connectedUsers: any[]
  onSchedule: () => void
  isScheduling: boolean
}

export function ScheduleMeetingModal({
  open,
  onOpenChange,
  participantId,
  onParticipantChange,
  selectedDate,
  onDateChange,
  selectedTime,
  onTimeChange,
  selectedDuration,
  onDurationChange,
  message,
  onMessageChange,
  connectedUsers,
  onSchedule,
  isScheduling,
}: ScheduleMeetingModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-600" />
            Agendar Nova Reunião
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Participante */}
          <div className="space-y-2">
            <Label htmlFor="participant" className="text-sm font-medium text-gray-700">
              Participante *
            </Label>
            <Select value={participantId} onValueChange={onParticipantChange}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Selecione um participante" />
              </SelectTrigger>
              <SelectContent>
                {connectedUsers.map((user: any) => (
                  <SelectItem key={user.uid} value={user.uid}>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-xs font-medium text-purple-600">
                        {(user.nome || user.email || 'U').charAt(0).toUpperCase()}
                      </div>
                      {user.nome || user.email}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Data */}
          <div className="space-y-2">
            <Label htmlFor="date" className="text-sm font-medium text-gray-700">
              Data *
            </Label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="h-11"
              min={format(new Date(), 'yyyy-MM-dd')}
            />
          </div>

          {/* Horário */}
          <div className="space-y-2">
            <Label htmlFor="time" className="text-sm font-medium text-gray-700">
              Horário *
            </Label>
            <Select value={selectedTime} onValueChange={onTimeChange}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Selecione o horário" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 24 }, (_, i) => {
                  const hour = i.toString().padStart(2, '0')
                  return [
                    <SelectItem key={`${hour}:00`} value={`${hour}:00`}>
                      {`${hour}:00`}
                    </SelectItem>,
                    <SelectItem key={`${hour}:30`} value={`${hour}:30`}>
                      {`${hour}:30`}
                    </SelectItem>
                  ]
                }).flat()}
              </SelectContent>
            </Select>
          </div>

          {/* Duração */}
          <div className="space-y-2">
            <Label htmlFor="duration" className="text-sm font-medium text-gray-700">
              Duração *
            </Label>
            <Select value={selectedDuration} onValueChange={onDurationChange}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Selecione a duração" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    30 minutos
                  </div>
                </SelectItem>
                <SelectItem value="60">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    1 hora
                  </div>
                </SelectItem>
                <SelectItem value="90">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    1 hora e 30 minutos
                  </div>
                </SelectItem>
                <SelectItem value="120">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    2 horas
                  </div>
                </SelectItem>
                <SelectItem value="180">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    3 horas
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Mensagem */}
          <div className="space-y-2">
            <Label htmlFor="message" className="text-sm font-medium text-gray-700">
              Mensagem (opcional)
            </Label>
            <Textarea
              placeholder="Adicione uma descrição ou agenda para a reunião..."
              value={message}
              onChange={(e) => onMessageChange(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 mt-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={onSchedule}
            disabled={isScheduling || !participantId || !selectedDate || !selectedTime}
            className="bg-purple-600 hover:bg-purple-700 text-white flex-1"
          >
            {isScheduling ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Agendando...
              </>
            ) : (
              <>
                <Calendar className="h-4 w-4 mr-2" />
                Agendar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
