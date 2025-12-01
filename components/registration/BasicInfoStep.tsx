import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { PhoneInput } from '../phone-input'
import { PublicUserType } from '@/lib/types/userTypes'
import { GraduationCap, Crown, Briefcase, Sparkles, UserCog } from 'lucide-react'
import { motion } from 'framer-motion'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

interface BasicInfoStepProps {
  nome: string
  email: string
  telefone: string
  userType: PublicUserType
  errors: { [key: string]: string }
  onInputChange: (name: string, value: string) => void
  onUserTypeChange?: (type: PublicUserType) => void
}

export function BasicInfoStep({
  nome,
  email,
  telefone,
  userType,
  errors,
  onInputChange,
  onUserTypeChange,
}: BasicInfoStepProps) {
  // Função para obter o ícone do tipo de usuário
  const getUserTypeIcon = (type: PublicUserType) => {
    switch (type) {
      case PublicUserType.ESTUDANTE:
        return <GraduationCap className="h-4 w-4" />
      case PublicUserType.PESQUISADOR:
        return <Crown className="h-4 w-4" />
      case PublicUserType.TECNICO_ADMIN:
        return <UserCog className="h-4 w-4" />
      case PublicUserType.EXTERNO:
        return <Briefcase className="h-4 w-4" />
      default:
        return null
    }
  }

  // Função para obter o label do tipo de usuário
  const getUserTypeLabel = (type: PublicUserType) => {
    switch (type) {
      case PublicUserType.ESTUDANTE:
        return 'Estudante'
      case PublicUserType.PESQUISADOR:
        return 'Pesquisador'
      case PublicUserType.TECNICO_ADMIN:
        return 'Técnico'
      case PublicUserType.EXTERNO:
        return 'Externo'
      default:
        return 'Usuário'
    }
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onInputChange('email', e.target.value)
  }

  // Detectar se o email é @ufc.br (permite escolher entre Pesquisador e Técnico Admin)
  const isUfcEmail = email.endsWith('@ufc.br') && !email.endsWith('@alu.ufc.br')

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="nome" className="text-gray-700 font-medium">
          Nome completo
        </Label>
        <Input
          id="nome"
          value={nome}
          onChange={(e) => onInputChange('nome', e.target.value)}
          className="h-11 border-purple-200 focus:border-purple-500 focus:ring-purple-500"
          placeholder="Digite seu nome completo"
          required
        />
        {errors.nome && <p className="text-red-500 text-sm">{errors.nome}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-gray-700 font-medium">
          Email
        </Label>
        <div className="relative">
          <Input
            id="email"
            type="email"
            value={email}
            onChange={handleEmailChange}
            className="h-11 border-purple-200 focus:border-purple-500 focus:ring-purple-500 pr-32"
            placeholder="Digite seu email"
            required
          />
          
          {/* Indicador de tipo de usuário detectado */}
          {email.includes('@') && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-purple-100 to-violet-100 rounded-full border border-purple-200">
                {getUserTypeIcon(userType)}
                <span className="text-xs font-medium text-purple-700">
                  {getUserTypeLabel(userType)}
                </span>
            </div>
            </motion.div>
          )}
        </div>
        
        {/* Explicação sobre detecção automática */}
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg"
        >
          <Sparkles className="h-3 w-3 text-purple-500" />
          <span>
            <strong>Detecção automática:</strong> @alu.ufc.br (Estudante) • @ufc.br (Pesquisador/Técnico Administrativo) • Outros (Externo)
          </span>
        </motion.div>

        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
      </div>

      {/* Seleção entre Pesquisador e Técnico Admin para emails @ufc.br */}
      {isUfcEmail && onUserTypeChange && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-3"
        >
          <Label className="text-gray-700 font-medium">
            Selecione seu tipo de vínculo
          </Label>
          <RadioGroup
            value={userType}
            onValueChange={(value) => onUserTypeChange(value as PublicUserType)}
            className="grid grid-cols-2 gap-3"
          >
            <div
              className={`flex items-center space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-all ${
                userType === PublicUserType.PESQUISADOR
                  ? 'bg-purple-50 border-purple-500 shadow-sm'
                  : 'border-gray-200 hover:border-purple-300'
              }`}
              onClick={() => onUserTypeChange(PublicUserType.PESQUISADOR)}
            >
              <RadioGroupItem value={PublicUserType.PESQUISADOR} id="pesquisador" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-purple-600" />
                  <Label htmlFor="pesquisador" className="cursor-pointer font-medium">
                    Pesquisador
                  </Label>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Docentes e pesquisadores
                </p>
              </div>
            </div>

            <div
              className={`flex items-center space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-all ${
                userType === PublicUserType.TECNICO_ADMIN
                  ? 'bg-purple-50 border-purple-500 shadow-sm'
                  : 'border-gray-200 hover:border-purple-300'
              }`}
              onClick={() => onUserTypeChange(PublicUserType.TECNICO_ADMIN)}
            >
              <RadioGroupItem value={PublicUserType.TECNICO_ADMIN} id="tecnico_admin" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <UserCog className="h-4 w-4 text-purple-600" />
                  <Label htmlFor="tecnico_admin" className="cursor-pointer font-medium">
                    Técnico Administrativo
                  </Label>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Servidores técnicos da UFC
                </p>
              </div>
            </div>
          </RadioGroup>
        </motion.div>
      )}

      <PhoneInput
        value={telefone}
        onChange={(value) => onInputChange('telefone', value)}
        error={errors.telefone}
        required
      />
    </div>
  )
}
