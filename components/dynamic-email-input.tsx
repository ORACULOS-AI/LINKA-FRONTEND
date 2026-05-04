'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UserType, UserTypeDomain } from '@/lib/types/userTypes'

interface DynamicEmailInputProps {
  email: string
  userType: UserType
  onEmailChange: (email: string) => void
  label?: string
  required?: boolean
  error?: string
}

export function DynamicEmailInput({
  email,
  userType,
  onEmailChange,
  label = 'Email',
  required = true,
  error,
}: DynamicEmailInputProps) {
  const [localEmail, setLocalEmail] = useState('')

  useEffect(() => {
    if (userType === UserType.EXTERNO) {
      setLocalEmail(email)
    } else {
      const [username] = email.split('@')
      setLocalEmail(username)
    }
  }, [userType, email])

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value
    setLocalEmail(newEmail)
    if (userType === UserType.EXTERNO) {
      onEmailChange(newEmail)
    } else {
      onEmailChange(newEmail + UserTypeDomain[userType])
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="email">{label}</Label>
      <div className="relative">
        <Input
          id="email"
          type={userType === UserType.EXTERNO ? 'email' : 'text'}
          value={localEmail}
          onChange={handleEmailChange}
          className={userType === UserType.EXTERNO ? '' : 'pr-24'}
          required={required}
          placeholder={
            userType === UserType.EXTERNO
              ? 'seu.email@exemplo.com'
              : 'seu.email'
          }
        />
        {userType !== UserType.EXTERNO && (
          <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500 bg-gray-100 border-l">
            {UserTypeDomain[userType]}
          </div>
        )}
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  )
}
