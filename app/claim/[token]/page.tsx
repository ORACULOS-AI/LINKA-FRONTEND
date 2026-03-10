'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useVerifyClaimToken, useClaimResource } from '@/lib/api/claim'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle2, Clock, Building2, FlaskConical, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ResourceType } from '@/lib/types/claimTypes'

export default function ClaimPage() {
  const params = useParams()
  const router = useRouter()
  const token = params?.token as string

  const [accessToken, setAccessToken] = useState<string | null>(null)

  // Query para verificar o token (público)
  const { data: claimData, isLoading: isVerifying, error: verifyError } = useVerifyClaimToken(token)

  // Mutation para reivindicar o recurso
  const claimMutation = useClaimResource()

  // Verificar se usuário está logado
  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    setAccessToken(token)
  }, [])

  // Verificar se há claim pendente após login (redirecionar de volta)
  useEffect(() => {
    const pendingToken = localStorage.getItem('pending_claim_token')
    if (pendingToken && accessToken) {
      localStorage.removeItem('pending_claim_token')
      // Usuário voltou do login, executar claim automaticamente
      if (claimData && !claimData.claimed) {
        handleClaim()
      }
    }
  }, [accessToken, claimData])

  const handleClaim = async () => {
    if (!accessToken) {
      // Salvar token para usar após login
      localStorage.setItem('pending_claim_token', token)
      router.push(`/login?redirect=${encodeURIComponent(`/claim/${token}`)}`)
      return
    }

    try {
      const result = await claimMutation.mutateAsync({ token, accessToken })

      // Mostrar mensagem de sucesso
      setTimeout(() => {
        // Redirecionar para onboarding
        router.push(result.redirect_url)
      }, 2000)
    } catch {
      // Erro já tratado pela mutation
    }
  }

  const handleLoginRedirect = () => {
    localStorage.setItem('pending_claim_token', token)
    router.push(`/login?redirect=${encodeURIComponent(`/claim/${token}`)}`)
  }

  const getResourceIcon = (type?: ResourceType) => {
    if (type === ResourceType.LABORATORIO) {
      return <FlaskConical className="h-8 w-8 text-purple-600" />
    }
    if (type === ResourceType.NEGOCIO) {
      return <Building2 className="h-8 w-8 text-purple-600" />
    }
    return <Building2 className="h-8 w-8 text-purple-600" />
  }

  const getResourceTypeLabel = (type?: ResourceType) => {
    if (type === ResourceType.LABORATORIO) return 'Laboratório'
    if (type === ResourceType.NEGOCIO) return 'Negócio'
    return 'Recurso'
  }

  // Estado: Carregando verificação
  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-violet-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="flex justify-center mb-4">
            <Loader2 className="h-12 w-12 text-purple-600 animate-spin" />
          </div>
          <p className="text-gray-600">Verificando convite...</p>
        </motion.div>
      </div>
    )
  }

  // Estado: Erro na verificação
  if (verifyError || !claimData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full"
        >
          <Card className="border-red-200">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <AlertCircle className="h-12 w-12 text-red-600" />
              </div>
              <CardTitle className="text-center text-red-900">Convite Inválido</CardTitle>
              <CardDescription className="text-center">
                {verifyError instanceof Error ? verifyError.message : 'Token não encontrado ou expirado'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <p className="text-sm text-gray-600">
                  O link de convite pode ter expirado ou já foi utilizado. Entre em contato com o
                  administrador para solicitar um novo convite.
                </p>
                <Link href="/">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    Voltar ao Dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  // Estado: Recurso já reivindicado
  if (claimData.claimed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full"
        >
          <Card className="border-green-200">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>
              <CardTitle className="text-center text-green-900">Já Reivindicado</CardTitle>
              <CardDescription className="text-center">
                Este recurso já foi reivindicado por outro usuário
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <p className="text-sm text-gray-600">
                  O {getResourceTypeLabel(claimData.resource_type).toLowerCase()}{' '}
                  <strong>{claimData.resource_name}</strong> já foi reivindicado.
                </p>
                <Link href="/">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    Voltar ao Dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  // Estado: Sucesso na reivindicação
  if (claimMutation.isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full"
        >
          <Card className="border-green-200">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                >
                  <CheckCircle2 className="h-16 w-16 text-green-600" />
                </motion.div>
              </div>
              <CardTitle className="text-center text-green-900">Reivindicação Bem-Sucedida!</CardTitle>
              <CardDescription className="text-center">
                {claimMutation.data?.message}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <p className="text-sm text-gray-600">
                  Você será redirecionado para completar o cadastro...
                </p>
                <div className="flex justify-center">
                  <Loader2 className="h-6 w-6 text-purple-600 animate-spin" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  // Estado: Formulário de reivindicação (padrão)
  const expiryDate = new Date(claimData.expires_at)
  const daysUntilExpiry = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-violet-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full"
      >
        <Card className="border-purple-200 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-t-lg">
            <div className="flex justify-center mb-4">
              {getResourceIcon(claimData.resource_type)}
            </div>
            <CardTitle className="text-center text-2xl">Convite para Gerenciar Recurso</CardTitle>
            <CardDescription className="text-center text-purple-100">
              Você foi convidado para assumir a responsabilidade de um{' '}
              {getResourceTypeLabel(claimData.resource_type).toLowerCase()}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* Informações do Recurso */}
            <div className="bg-purple-50 rounded-lg p-6 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Nome do Recurso</h3>
                <p className="text-lg font-semibold text-gray-900">{claimData.resource_name}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Tipo</h3>
                <p className="text-lg font-semibold text-gray-900">
                  {getResourceTypeLabel(claimData.resource_type)}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Email Esperado</h3>
                <p className="text-lg font-semibold text-purple-700">{claimData.email}</p>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>
                  Convite expira em{' '}
                  <strong className="text-orange-600">
                    {daysUntilExpiry} {daysUntilExpiry === 1 ? 'dia' : 'dias'}
                  </strong>
                </span>
              </div>
            </div>

            {/* Warning sobre email */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-900">Atenção!</p>
                <p className="text-sm text-yellow-700 mt-1">
                  Você deve usar a conta com o email <strong>{claimData.email}</strong> para
                  reivindicar este recurso.
                </p>
              </div>
            </div>

            {/* Mensagem de erro */}
            {claimMutation.isError && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3"
              >
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-900">Erro ao Reivindicar</p>
                  <p className="text-sm text-red-700 mt-1">
                    {claimMutation.error instanceof Error
                      ? claimMutation.error.message
                      : 'Ocorreu um erro. Tente novamente.'}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Botões de Ação */}
            <div className="space-y-3">
              {accessToken ? (
                <Button
                  onClick={handleClaim}
                  disabled={claimMutation.isPending}
                  className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:shadow-lg text-white py-6 text-lg"
                >
                  {claimMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Reivindicando...
                    </div>
                  ) : (
                    'Reivindicar Recurso'
                  )}
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleLoginRedirect}
                    className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:shadow-lg text-white py-6 text-lg"
                  >
                    Fazer Login para Reivindicar
                  </Button>
                  <p className="text-center text-sm text-gray-600">
                    Não tem uma conta?{' '}
                    <Button
                      variant="link"
                      className="p-0 text-purple-600 hover:text-purple-700"
                      onClick={handleLoginRedirect}
                    >
                      Cadastre-se
                    </Button>
                  </p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
