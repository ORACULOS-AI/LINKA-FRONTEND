'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertCircle, CheckCircle, Mail, KeyRound, ArrowLeft } from 'lucide-react'
import { usePasswordResetApi } from '@/lib/api/verification'
import { motion } from 'framer-motion'

interface PasswordResetModalProps {
  isOpen: boolean
  onClose: () => void
}

type Step = 'email' | 'code' | 'success'

export function PasswordResetModal({ isOpen, onClose }: PasswordResetModalProps) {
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { useSendPasswordResetCode, useVerifyPasswordResetCode } = usePasswordResetApi()
  const sendCodeMutation = useSendPasswordResetCode()
  const verifyCodeMutation = useVerifyPasswordResetCode()

  const resetForm = () => {
    setStep('email')
    setEmail('')
    setCode('')
    setNewPassword('')
    setConfirmPassword('')
    setError('')
    setSuccessMessage('')
    setIsLoading(false)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)
    setError('')
    setSuccessMessage('')

    try {
      await sendCodeMutation.mutateAsync(email)
      setSuccessMessage('Código enviado! Verifique seu email.')
      setStep('code')
    } catch (error: any) {
      setError(error.message || 'Erro ao enviar código')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code || !newPassword || !confirmPassword) return

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem')
      return
    }

    if (newPassword.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres')
      return
    }

    setIsLoading(true)
    setError('')
    setSuccessMessage('')

    try {
      await verifyCodeMutation.mutateAsync({
        email,
        code,
        newPassword
      })
      setStep('success')
    } catch (error: any) {
      setError(error.message || 'Erro ao redefinir senha')
    } finally {
      setIsLoading(false)
    }
  }

  const renderEmailStep = () => (
    <motion.form
      onSubmit={handleSendCode}
      className="space-y-6"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div className="text-center">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="h-8 w-8 text-purple-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Recuperação de Senha
        </h3>
        <p className="text-gray-600 text-sm">
          Digite seu email para receber um código de recuperação
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reset-email" className="text-gray-700 font-medium">
          Email
        </Label>
        <Input
          id="reset-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-white border-purple-200 focus:border-purple-500 focus:ring-purple-500 focus:ring-2 transition-colors text-gray-900 placeholder:text-gray-500"
          placeholder="Digite seu email"
          required
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:shadow-purple-500/25 hover:shadow-lg"
        disabled={isLoading || !email}
      >
        {isLoading ? 'Enviando...' : 'Enviar Código'}
      </Button>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
          <CheckCircle className="h-4 w-4 flex-shrink-0" />
          <p className="text-sm">{successMessage}</p>
        </div>
      )}
    </motion.form>
  )

  const renderCodeStep = () => (
    <motion.form
      onSubmit={handleVerifyCode}
      className="space-y-6"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div className="text-center">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <KeyRound className="h-8 w-8 text-purple-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Verificar Código
        </h3>
        <p className="text-gray-600 text-sm">
          Digite o código enviado para <strong>{email}</strong>
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reset-code" className="text-gray-700 font-medium">
          Código de 6 dígitos
        </Label>
        <Input
          id="reset-code"
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          className="bg-white border-purple-200 focus:border-purple-500 focus:ring-purple-500 focus:ring-2 transition-colors text-center text-2xl font-mono tracking-widest text-gray-900 placeholder:text-gray-400"
          placeholder="000000"
          maxLength={6}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="new-password" className="text-gray-700 font-medium">
          Nova Senha
        </Label>
        <Input
          id="new-password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="bg-white border-purple-200 focus:border-purple-500 focus:ring-purple-500 focus:ring-2 transition-colors text-gray-900 placeholder:text-gray-500"
          placeholder="Digite sua nova senha"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm-password" className="text-gray-700 font-medium">
          Confirmar Senha
        </Label>
        <Input
          id="confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="bg-white border-purple-200 focus:border-purple-500 focus:ring-purple-500 focus:ring-2 transition-colors text-gray-900 placeholder:text-gray-500"
          placeholder="Confirme sua nova senha"
          required
        />
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => setStep('email')}
          className="flex-1"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <Button
          type="submit"
          className="flex-1 bg-gradient-to-r from-purple-600 to-violet-600 hover:shadow-purple-500/25 hover:shadow-lg"
          disabled={isLoading || !code || !newPassword || !confirmPassword}
        >
          {isLoading ? 'Redefinindo...' : 'Redefinir Senha'}
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}
    </motion.form>
  )

  const renderSuccessStep = () => (
    <motion.div
      className="text-center space-y-6"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="h-8 w-8 text-green-600" />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Senha Redefinida!
        </h3>
        <p className="text-gray-600 text-sm">
          Sua senha foi alterada com sucesso. Você pode fazer login agora.
        </p>
      </div>

      <Button
        onClick={handleClose}
        className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:shadow-purple-500/25 hover:shadow-lg"
      >
        Fazer Login
      </Button>
    </motion.div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="sr-only">
            {step === 'email' && 'Recuperação de Senha'}
            {step === 'code' && 'Verificar Código'}
            {step === 'success' && 'Senha Redefinida'}
          </DialogTitle>
        </DialogHeader>

        {step === 'email' && renderEmailStep()}
        {step === 'code' && renderCodeStep()}
        {step === 'success' && renderSuccessStep()}
      </DialogContent>
    </Dialog>
  )
}
