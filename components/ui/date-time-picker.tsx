import * as React from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar as CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface DateTimePickerProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  disabled?: boolean
}

export function DateTimePicker({
  value,
  onChange,
  disabled,
}: DateTimePickerProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    value,
  )
  const [selectedHour, setSelectedHour] = React.useState<string>(
    value ? format(value, 'HH') : '00',
  )
  const [selectedMinute, setSelectedMinute] = React.useState<string>(
    value ? format(value, 'mm') : '00',
  )

  // Atualiza o estado local quando o valor da prop muda
  React.useEffect(() => {
    if (value) {
      setSelectedDate(value)
      setSelectedHour(format(value, 'HH'))
      setSelectedMinute(format(value, 'mm'))
    }
  }, [value])

  // Atualiza o valor quando qualquer parte da data/hora muda
  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date)
    if (date) {
      const newDate = new Date(date)
      newDate.setHours(parseInt(selectedHour), parseInt(selectedMinute))
      onChange?.(newDate)
    } else {
      onChange?.(undefined)
    }
  }

  const handleTimeChange = (type: 'hour' | 'minute', value: string) => {
    if (type === 'hour') {
      setSelectedHour(value)
    } else {
      setSelectedMinute(value)
    }

    if (selectedDate) {
      const newDate = new Date(selectedDate)
      newDate.setHours(
        type === 'hour' ? parseInt(value) : parseInt(selectedHour),
        type === 'minute' ? parseInt(value) : parseInt(selectedMinute),
      )
      onChange?.(newDate)
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !value && 'text-muted-foreground',
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? (
            format(value, 'PPp', { locale: ptBR })
          ) : (
            <span>Selecione a data e hora</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateChange}
          initialFocus
          disabled={disabled}
          locale={ptBR}
        />
        <div className="border-t p-3 flex gap-2">
          <Select
            value={selectedHour}
            onValueChange={(value) => handleTimeChange('hour', value)}
            disabled={disabled}
          >
            <SelectTrigger className="w-[70px]">
              <SelectValue placeholder="Hora" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 24 }).map((_, i) => (
                <SelectItem key={i} value={i.toString().padStart(2, '0')}>
                  {i.toString().padStart(2, '0')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-2xl">:</span>
          <Select
            value={selectedMinute}
            onValueChange={(value) => handleTimeChange('minute', value)}
            disabled={disabled}
          >
            <SelectTrigger className="w-[70px]">
              <SelectValue placeholder="Min" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 60 }).map((_, i) => (
                <SelectItem key={i} value={i.toString().padStart(2, '0')}>
                  {i.toString().padStart(2, '0')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </PopoverContent>
    </Popover>
  )
}
