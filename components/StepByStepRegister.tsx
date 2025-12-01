/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import type React from 'react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  PublicUserType,
  type UserCreateData,
  CampusType,
} from '@/lib/types/userTypes'
import { useUserApi } from '@/lib/api/users'
import { useVerificationApi } from '@/lib/api/verification'
import { BasicInfoStep } from './registration/BasicInfoStep'
import { EmailVerificationStep } from './registration/EmailVerificationStep'
import { PasswordStep } from './registration/PasswordStep'
import { AdditionalInfoStep } from './registration/AdditionalInfoStep'
import { TermsStep } from './registration/TermsStep'

const steps = [
  {
    title: 'Informações Básicas',
    subtitle: 'Preencha suas informações pessoais.',
    fields: ['nome', 'email', 'telefone'],
  },
  {
    title: 'Verificação de Email',
    subtitle: 'Verifique seu endereço de email.',
    fields: ['email_verification'],
  },
  {
    title: 'Senha',
    subtitle: 'Crie uma senha segura para sua conta.',
    fields: ['senha'],
  },
  {
    title: 'Informações Adicionais',
    subtitle: 'Forneça informações específicas para o seu tipo de usuário.',
    fields: ['additional_info'],
  },
  {
    title: 'Termos e Condições',
    subtitle: 'Aceite os termos e condições para finalizar o cadastro.',
    fields: ['terms'],
  },
]

export function StepByStepRegister({
  onRegisterSuccess,
}: {
  onRegisterSuccess: () => void
}) {
  const { useCreateUser } = useUserApi()
  const { useSendVerificationCode, useVerifyCode } = useVerificationApi()
  const createUserMutation = useCreateUser()
  const sendCodeMutation = useSendVerificationCode()
  const verifyCodeMutation = useVerifyCode()

  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<UserCreateData>({
    tipo_usuario: PublicUserType.EXTERNO, // Default, will be auto-detected
    nome: '',
    email: '',
    senha: '',
    telefone: '',
    conexoes: [],
    negocios: [],
    curso: '',
    campus: CampusType.PICI,
    matricula: '',
  } as UserCreateData)

  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')
  const [isEmailVerified, setIsEmailVerified] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [showCodeInput, setShowCodeInput] = useState(false)
  const [generalError, setGeneralError] = useState<string>('')

  // Função para detectar o tipo de usuário baseado no email
  const detectUserType = (email: string): PublicUserType => {
    if (email.endsWith('@alu.ufc.br')) {
      return PublicUserType.ESTUDANTE
    } else if (email.endsWith('@ufc.br')) {
      // Para @ufc.br, manter o tipo atual se for PESQUISADOR ou TECNICO_ADMIN
      // Caso contrário, defaultar para PESQUISADOR
      if (formData.tipo_usuario === PublicUserType.TECNICO_ADMIN) {
        return PublicUserType.TECNICO_ADMIN
      }
      return PublicUserType.PESQUISADOR
    } else {
      return PublicUserType.EXTERNO
    }
  }

  // Auto-detectar tipo de usuário quando email muda
  useEffect(() => {
    if (formData.email.includes('@')) {
      const detectedType = detectUserType(formData.email)
      if (detectedType !== formData.tipo_usuario) {
        handleUserTypeChange(detectedType)
      }
    }
  }, [formData.email])

  useEffect(() => {
    if (currentStep === 1) {
      setIsEmailVerified(false)
      setShowCodeInput(false)
      setVerificationCode('')
      setErrors((prev) => ({ ...prev, email_verification: '' }))
    }
  }, [currentStep])

  const handleInputChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    validateField(name, value)
  }

  const handleUserTypeChange = (value: PublicUserType) => {
    let newFormData = {
      ...formData,
      tipo_usuario: value,
    }

    if (value === PublicUserType.ESTUDANTE) {
      newFormData = {
        ...newFormData,
        curso: '',
        campus: CampusType.PICI,
        matricula: '',
        lattes: undefined,
        siape: undefined,
        palavras_chave: undefined,
        empresa: undefined,
        cargo: undefined,
        setor: undefined,
        telefone_ramal: undefined,
      }
    } else if (value === PublicUserType.PESQUISADOR) {
      newFormData = {
        ...newFormData,
        lattes: '',
        siape: '',
        palavras_chave: [],
        campus: CampusType.PICI,
        curso: undefined,
        matricula: undefined,
        empresa: undefined,
        cargo: undefined,
        setor: undefined,
        telefone_ramal: undefined,
      }
    } else if (value === PublicUserType.TECNICO_ADMIN) {
      newFormData = {
        ...newFormData,
        setor: '',
        cargo: '',
        campus: CampusType.PICI,
        siape: '',
        telefone_ramal: '',
        curso: undefined,
        matricula: undefined,
        lattes: undefined,
        palavras_chave: undefined,
        empresa: undefined,
      }
    } else if (value === PublicUserType.EXTERNO) {
      newFormData = {
        ...newFormData,
        empresa: '',
        cargo: '',
        curso: undefined,
        campus: undefined,
        matricula: undefined,
        lattes: undefined,
        siape: undefined,
        palavras_chave: undefined,
        setor: undefined,
        telefone_ramal: undefined,
      }
    }

    setFormData(newFormData as UserCreateData)
  }

  const handleSocialMediaChange = (network: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      redes_sociais: {
        ...prev.redes_sociais,
        [network]: value,
      },
    }))
  }

  const validateField = (name: string, value: string) => {
    let error = ''
    switch (name) {
      case 'nome':
        if (value.length < 3) error = 'Nome deve ter pelo menos 3 caracteres'
        break
      case 'email':
        if (!/\S+@\S+\.\S+/.test(value)) error = 'Email inválido'
        break
      case 'senha':
        error = utilValidatePassword(value) || ''
        break
      case 'telefone':
        if (value.replace(/\D/g, '').length !== 13)
          error = 'Telefone deve ter 13 dígitos'
        break
    }
    setErrors((prev) => ({ ...prev, [name]: error }))
    return !error
  }

  const handleSendVerificationCode = async () => {
    try {
      await sendCodeMutation.mutateAsync(formData.email)
      setShowCodeInput(true)
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        email_verification:
          'Erro ao enviar código de verificação. Tente novamente.',
      }))
      setGeneralError('Algo deu errado... Verifique os passos anteriores!')
    }
  }

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      setErrors((prev) => ({
        ...prev,
        email_verification: 'Por favor, digite o código de verificação.',
      }))
      return
    }

    try {
      await verifyCodeMutation.mutateAsync({
        email: formData.email,
        code: verificationCode,
      })
      setIsEmailVerified(true)
      setErrors((prev) => ({ ...prev, email_verification: '' }))
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        email_verification: 'Código de verificação inválido.',
      }))
    }
  }

  const handleSubmit = async () => {
    try {
      // Limpar campos undefined antes de enviar
      const cleanedFormData = cleanUserData(formData)
      await createUserMutation.mutateAsync(cleanedFormData)
      onRegisterSuccess()
    } catch (error: any) {
      if (error.response?.status === 400) {
        if (error.response.data.detail === 'Email already registered') {
          setErrors((prev) => ({
            ...prev,
            email: 'Este email já está registrado.',
          }))
          setGeneralError(
            'Email já cadastrado. Por favor, use outro email ou faça login.',
          )
          setCurrentStep(0)
        } else if (
          error.response.data.detail.includes('Password validation failed')
        ) {
          setErrors((prev) => ({
            ...prev,
            senha: 'A senha não atende aos requisitos de segurança.',
          }))
        } else {
          setGeneralError(
            error.response.data.detail ||
              'Erro ao criar usuário. Tente novamente.',
          )
        }
      } else {
        setGeneralError(
          'Email já cadastrado. Por favor, use outro email ou faça login.',
        )
      }
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <BasicInfoStep
            nome={formData.nome}
            email={formData.email}
            telefone={formData.telefone}
            userType={formData.tipo_usuario}
            errors={errors}
            onInputChange={handleInputChange}
            onUserTypeChange={handleUserTypeChange}
          />
        )
      case 1:
        return (
          <EmailVerificationStep
            email={formData.email}
            verificationCode={verificationCode}
            isVerifying={verifyCodeMutation.isPending}
            isEmailVerified={isEmailVerified}
            isSendingCode={sendCodeMutation.isPending}
            showCodeInput={showCodeInput}
            emailError={errors.email_verification}
            onSendCode={handleSendVerificationCode}
            onVerifyCode={handleVerifyCode}
            onCodeChange={setVerificationCode}
          />
        )
      case 2:
        return (
          <PasswordStep
            password={formData.senha}
            error={errors.senha}
            onChange={(value) => handleInputChange('senha', value)}
          />
        )
      case 3:
        return (
          <AdditionalInfoStep
            userType={formData.tipo_usuario}
            formData={formData}
            onInputChange={handleInputChange}
            onSocialMediaChange={handleSocialMediaChange}
          />
        )
      case 4:
        return (
          <TermsStep
            acceptedTerms={acceptedTerms}
            onTermsChange={setAcceptedTerms}
          />
        )
      default:
        return null
    }
  }

  const canProceed = () => {
    const currentFields = steps[currentStep].fields
    const allFieldsValid = currentFields.every((field) => !errors[field])

    switch (currentStep) {
      case 0:
        return (
          allFieldsValid && formData.nome && formData.email && formData.telefone
        )
      case 1:
        return allFieldsValid && isEmailVerified
      case 2:
        return allFieldsValid && utilValidatePassword(formData.senha) === null
      case 3:
        return allFieldsValid
      case 4:
        return allFieldsValid && acceptedTerms
      default:
        return false
    }
  }

  const handleNext = async () => {
    if (currentStep === steps.length - 1) {
      await handleSubmit()
    } else {
      setCurrentStep((prev) => prev + 1)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">{steps[currentStep].title}</h2>
        <p className="text-[#6B7280]">{steps[currentStep].subtitle}</p>
      </div>

      <div className="w-full bg-gray-200 h-4 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-600 to-violet-600 transition-all duration-300 ease-in-out"
          style={{
            width: `${((currentStep + 1) / steps.length) * 100}%`,
          }}
        />
      </div>

      <div className="pb-4">
        <p className="text-sm text-[#6B7280]">
          Etapa {currentStep + 1} de {steps.length}
        </p>
      </div>

      {generalError && (
        <p className="text-red-500 text-sm text-center">{generalError}</p>
      )}

      {renderStep()}

      <div className="flex justify-between pt-6">
        {currentStep > 0 && (
          <Button
            variant="outline"
            onClick={() => setCurrentStep((prev) => prev - 1)}
            className="border-purple-600 text-purple-600 hover:bg-purple-50"
          >
            Voltar
          </Button>
        )}
        <Button
          className={`${currentStep === 0 ? 'w-full' : 'ml-auto'} bg-gradient-to-r from-purple-600 to-violet-600 hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 text-white`}
          onClick={handleNext}
          disabled={!canProceed()}
        >
          {currentStep === steps.length - 1 ? 'Concluir' : 'Continuar'}
        </Button>
      </div>
    </div>
  )
}

function utilValidatePassword(password: string): string | null {
  if (password.length < 8) {
    return 'A senha deve ter pelo menos 8 caracteres'
  }

  if (!/[A-Z]/.test(password)) {
    return 'A senha deve conter pelo menos uma letra maiúscula'
  }

  if (!/[a-z]/.test(password)) {
    return 'A senha deve conter pelo menos uma letra minúscula'
  }

  if (!/[0-9]/.test(password)) {
    return 'A senha deve conter pelo menos um número'
  }

  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    return 'A senha deve conter pelo menos um caractere especial'
  }

  return null // Password is valid
}

function validatePassword(password: string): boolean {
  return utilValidatePassword(password) === null
}

// Função para limpar dados undefined antes de enviar
function cleanUserData(data: UserCreateData): UserCreateData {
  const cleaned: any = {}

  // Campos base obrigatórios para todos os tipos
  cleaned.nome = data.nome
  cleaned.email = data.email
  cleaned.senha = data.senha
  cleaned.telefone = data.telefone
  cleaned.tipo_usuario = data.tipo_usuario
  cleaned.conexoes = data.conexoes || []
  cleaned.negocios = data.negocios || []

  // Campos opcionais comuns
  if (data.foto_url) cleaned.foto_url = data.foto_url
  if (data.redes_sociais) cleaned.redes_sociais = data.redes_sociais

  if (data.tipo_usuario === PublicUserType.EXTERNO) {
    const externoData = data as any
    // Para usuários externos, apenas adicionar empresa e cargo se não estiverem vazios
    if (externoData.empresa && externoData.empresa.trim() !== '') {
      cleaned.empresa = externoData.empresa.trim()
    }
    if (externoData.cargo && externoData.cargo.trim() !== '') {
      cleaned.cargo = externoData.cargo.trim()
    }
  } else if (data.tipo_usuario === PublicUserType.ESTUDANTE) {
    const estudanteData = data as any
    // Campos obrigatórios para estudantes
    cleaned.curso = estudanteData.curso
    cleaned.campus = estudanteData.campus
    cleaned.matricula = estudanteData.matricula
  } else if (data.tipo_usuario === PublicUserType.PESQUISADOR) {
    const pesquisadorData = data as any
    // Campos obrigatórios para pesquisadores
    cleaned.lattes = pesquisadorData.lattes
    cleaned.siape = pesquisadorData.siape
    cleaned.palavras_chave = pesquisadorData.palavras_chave || []
    cleaned.campus = pesquisadorData.campus
  } else if (data.tipo_usuario === PublicUserType.TECNICO_ADMIN) {
    const tecnicoData = data as any
    // Campos obrigatórios para técnicos administrativos
    cleaned.setor = tecnicoData.setor
    cleaned.cargo = tecnicoData.cargo
    cleaned.campus = tecnicoData.campus
    // Campos opcionais
    if (tecnicoData.siape && tecnicoData.siape.trim() !== '') {
      cleaned.siape = tecnicoData.siape.trim()
    }
    if (tecnicoData.telefone_ramal && tecnicoData.telefone_ramal.trim() !== '') {
      cleaned.telefone_ramal = tecnicoData.telefone_ramal.trim()
    }
  }

  return cleaned as UserCreateData
}
