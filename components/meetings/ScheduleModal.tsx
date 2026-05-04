'use client'

import React, { useState } from 'react'
import dynamic from 'next/dynamic'
import { formatISO, addHours, addMinutes } from 'date-fns'

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useMeetingApi } from '@/lib/api/meetings'

// react-datepicker precisa de import dinâmico para evitar SSR
// @ts-ignore – problemas de tipos do react-datepicker não afetam runtime
const DatePicker = dynamic(() => import('react-datepicker'), {
  ssr: false,
}) as any
import 'react-datepicker/dist/react-datepicker.css'

interface ScheduleModalProps {
  trigger?: React.ReactNode
  participantId: string
}

export function ScheduleModal({ trigger, participantId }: ScheduleModalProps) {
  const [startDate, setStartDate] = useState<Date | null>(addHours(new Date(), 1))
  const [duration, setDuration] = useState<number>(30)
  const [message, setMessage] = useState('')

  // slots gerados 08:00 – 20:00 em intervalos de 15 min
  const buildSlots = () => {
    if (!startDate) return []
    const base = new Date(startDate)
    base.setHours(8, 0, 0, 0)
    const endDay = new Date(startDate)
    endDay.setHours(20, 0, 0, 0)
    const slots: Date[] = []
    while (base <= endDay) {
      slots.push(new Date(base))
      base.setMinutes(base.getMinutes() + 15)
    }
    return slots
  }

  const { useCreateMeeting } = useMeetingApi()
  const createMeetingMut = useCreateMeeting()

  const scheduleAt = (slot: Date) => {
    const endDate = addMinutes(slot, duration)
    createMeetingMut.mutate({
      participant_id: participantId,
      scheduled_start: formatISO(slot),
      scheduled_end: formatISO(endDate),
      message: message || undefined,
    })
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger ?? <Button variant="secondary">Agendar reunião</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agendar Reunião</DialogTitle>
          <DialogDescription>
            Selecione data/hora e adicione informações opcionais.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Início</label>
            <DatePicker
              selected={startDate}
              onChange={(date: Date) => setStartDate(date)}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="Pp"
              className="w-full border px-3 py-2 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Duração</label>
            <Select value={String(duration)} onValueChange={(v) => setDuration(Number(v))}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[15, 30, 60, 90].map((d) => (
                  <SelectItem key={d} value={String(d)}>{d} min</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Textarea
            placeholder="Mensagem opcional"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          {/* Lista de horários */}
          {startDate && (
            <div className="max-h-64 overflow-y-auto border rounded-md p-2">
              {buildSlots().map((slot) => (
                <Button
                  key={slot.toISOString()}
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => scheduleAt(slot)}
                  disabled={createMeetingMut.isPending}
                >
                  {slot.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Button>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button variant="outline">Fechar</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 