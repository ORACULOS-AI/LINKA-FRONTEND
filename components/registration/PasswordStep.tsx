import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff } from 'lucide-react'

interface PasswordStepProps {
  password: string
  error?: string
  onChange: (value: string) => void
}

export function PasswordStep({ password, error, onChange }: PasswordStepProps) {
  const [passwordStrength, setPasswordStrength] = useState<string>('')
  const [showPassword, setShowPassword] = useState(false)

  const validatePassword = (value: string) => {
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value)
    const hasNumber = /\d/.test(value)
    const hasUpperCase = /[A-Z]/.test(value)
    const hasLowerCase = /[a-z]/.test(value)
    const isLongEnough = value.length >= 8

    let strength = ''
    const errors = []

    if (!hasSpecialChar) errors.push('um caractere especial')
    if (!hasNumber) errors.push('um número')
    if (!hasUpperCase) errors.push('uma letra maiúscula')
    if (!hasLowerCase) errors.push('uma letra minúscula')
    if (!isLongEnough) errors.push('pelo menos 8 caracteres')

    if (errors.length === 0) {
      strength = 'Forte'
    } else if (errors.length <= 2) {
      strength = 'Média'
    } else {
      strength = 'Fraca'
    }

    setPasswordStrength(strength)
    onChange(value)
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="senha">Senha</Label>
      <div className="relative">
        <Input
          id="senha"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => validatePassword(e.target.value)}
          className="h-11 pr-10"
          required
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={togglePasswordVisibility}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-gray-500" />
          ) : (
            <Eye className="h-4 w-4 text-gray-500" />
          )}
        </Button>
      </div>
      {passwordStrength && (
        <p
          className={`text-sm ${
            passwordStrength === 'Forte'
              ? 'text-green-500'
              : passwordStrength === 'Média'
                ? 'text-yellow-500'
                : 'text-red-500'
          }`}
        >
          Força da senha: {passwordStrength}
        </p>
      )}
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <p className="text-sm text-gray-500">
        A senha deve conter pelo menos 8 caracteres, incluindo uma letra
        maiúscula, uma letra minúscula, um número e um caractere especial.
      </p>
    </div>
  )
}
