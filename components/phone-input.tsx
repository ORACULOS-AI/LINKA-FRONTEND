'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  error?: string
  required?: boolean
}

export function PhoneInput({
  value,
  onChange,
  error,
  required,
}: PhoneInputProps) {
  const [countryCode] = useState('+55')
  const [localNumber, setLocalNumber] = useState('')

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/\D/g, '')

    // Limit to max 11 digits (including area code)
    if (input.length <= 11) {
      let formatted = input

      // Format as (XX) XXXXX-XXXX or (XX) XXXX-XXXX
      if (input.length > 2) {
        formatted = `(${input.slice(0, 2)}) ${input.slice(2)}`
        if (input.length > 7) {
          const position = input.length > 7 ? 7 : 6
          formatted = `(${input.slice(0, 2)}) ${input.slice(2, position)}-${input.slice(position)}`
        }
      }

      setLocalNumber(formatted)
      // Always include +55 prefix for the form data
      onChange(`+55${input}`)
    }
  }

  return (
    <div className="space-y-2">
      <Label>
        Telefone {required && <span className="text-red-500">*</span>}
      </Label>
      <div className="flex gap-2">
        <div className="relative w-[140px]">
          <Select defaultValue="+55" disabled>
            <SelectTrigger className="w-full">
              <div className="flex items-center gap-2">
                <img
                  src="/br-flag.png"
                  alt="Brazil"
                  className="w-5 h-4 object-cover"
                />
                <SelectValue />
                <p>Brasil</p>
              </div>
            </SelectTrigger>
          </Select>
        </div>
        <Input
          type="text"
          placeholder="(11) 99999-9999"
          value={localNumber}
          onChange={handleNumberChange}
          className="flex-1"
          required={required}
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}
