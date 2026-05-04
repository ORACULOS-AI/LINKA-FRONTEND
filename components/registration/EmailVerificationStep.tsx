import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'

interface EmailVerificationStepProps {
  email: string
  verificationCode: string
  isVerifying: boolean
  isEmailVerified: boolean
  isSendingCode: boolean
  showCodeInput: boolean // New prop to control when to show the code input
  emailError: string
  onSendCode: () => void
  onVerifyCode: () => void
  onCodeChange: (code: string) => void
}

export function EmailVerificationStep({
  email,
  verificationCode,
  isVerifying,
  isEmailVerified,
  isSendingCode,
  showCodeInput,
  emailError,
  onSendCode,
  onVerifyCode,
  onCodeChange,
}: EmailVerificationStepProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email para verificação</Label>
        <div className="flex space-x-2">
          <Input
            id="email"
            type="email"
            value={email}
            className="h-11"
            disabled
            required
          />
          {!isEmailVerified && !showCodeInput && (
            <Button
              type="button"
              onClick={onSendCode}
              disabled={isSendingCode}
              className="w-[140px]"
              style={{ backgroundColor: '#000000', color: '#FFFFFF' }}
            >
              {isSendingCode ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar Código'
              )}
            </Button>
          )}
        </div>
      </div>

      {showCodeInput && !isEmailVerified && (
        <div className="space-y-2">
          <Label htmlFor="verificationCode">Código de verificação</Label>
          <div className="flex space-x-2">
            <Input
              id="verificationCode"
              type="text"
              value={verificationCode}
              onChange={(e) => onCodeChange(e.target.value)}
              className="h-11"
              placeholder="Digite o código"
              disabled={isEmailVerified}
            />
            <Button
              onClick={onVerifyCode}
              disabled={isEmailVerified || !verificationCode || isVerifying}
              className="w-[140px]"
              style={{ backgroundColor: '#000000', color: '#FFFFFF' }}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                'Verificar'
              )}
            </Button>
          </div>
        </div>
      )}

      {emailError && <p className="text-red-500 text-sm">{emailError}</p>}
      {isEmailVerified && (
        <p className="text-green-500 text-sm">Email verificado com sucesso!</p>
      )}
    </div>
  )
}
