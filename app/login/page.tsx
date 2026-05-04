/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Sparkles, Users, Target, Zap, Award, Network, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/AuthContext'
import type { SelectableUserType } from '@/lib/types/userTypes'
import { StepByStepRegister } from '@/components/StepByStepRegister'
import { LoginForm } from './components/LoginForm'
import { PasswordResetModal } from './components/PasswordResetModal'
import { motion } from 'framer-motion'

export default function LoginScreen() {
  const [isRegistering, setIsRegistering] = useState(false)
  const [isPasswordResetOpen, setIsPasswordResetOpen] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const router = useRouter()
  const { login, isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, router])

  const handleLogin = async (
    email: string,
    password: string,
    userType: SelectableUserType,
  ) => {
    setError('')
    setSuccessMessage('')

    try {
      await login(email, password, userType)
      router.push('/')
    } catch (error: any) {
      if (error.response && error.response.data) {
        setError(error.response.data.detail || 'Erro ao fazer login')
      }
    }
  }

  const handleRegisterSuccess = () => {
    setIsRegistering(false)
    setSuccessMessage('Cadastro realizado com sucesso. Por favor, faça login.')
  }

  const handleForgotPassword = () => {
    setIsPasswordResetOpen(true)
    setError('')
    setSuccessMessage('')
  }

  const platformFeatures = [
    {
      icon: Users,
      title: "Rede de Inovação",
      description: "Conecte-se com estudantes, pesquisadores e empreendedores da UFC"
    },
    {
      icon: Target,
      title: "Iniciativas Estratégicas",
      description: "Participe de projetos que transformam ideias em realidade"
    },
    {
      icon: Network,
      title: "Ecossistema Integrado",
      description: "Acesse recursos, mentorias e oportunidades de colaboração"
    },
    {
      icon: TrendingUp,
      title: "Crescimento Conjunto",
      description: "Desenvolva suas habilidades e expanda sua rede profissional"
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Desktop Layout - Two Columns */}
      <div className="hidden lg:flex min-h-screen">
        {/* Left Column - Login Form (White Background) */}
        <div className="w-1/2 bg-white flex items-center justify-center p-12 relative">
          {/* Back Button */}
          <motion.div
            className="absolute top-8 left-8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Link href="/" className="flex items-center group">
              <ArrowLeft className="h-5 w-5 text-gray-600 group-hover:text-gray-900 transition-colors" />
              <p className="text-sm text-gray-600 group-hover:text-gray-900 ml-2 transition-colors">
                Voltar ao Início
              </p>
            </Link>
          </motion.div>

          {/* Login Form */}
          <div className="w-full max-w-md mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              {/* Logo UFC Inova */}
              <div className="flex justify-center mb-6">
                <img src="/logo-ufc-inova.png" alt="UFC Inova" className="h-14 w-auto" />
              </div>

              {/* Title */}
              <motion.h1
                className="text-3xl font-bold mb-2 text-gray-900"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                {isRegistering ? 'Criar Conta' : 'Fazer Login'}
              </motion.h1>

              <motion.p
                className="text-gray-600 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                {isRegistering 
                  ? 'Crie sua conta e faça parte da inovação'
                  : 'Acesse sua conta e continue sua jornada'
                }
              </motion.p>

              {/* Form Card */}
              <Card className="shadow-2xl border border-purple-100 bg-white relative overflow-hidden">
                {/* Decorative background */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100/50 to-violet-100/30 rounded-full -mr-16 -mt-16" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-100/30 to-violet-100/20 rounded-full -ml-12 -mb-12" />
                
                <CardContent className="relative z-10 pt-6">
                  {isRegistering ? (
                    <StepByStepRegister onRegisterSuccess={handleRegisterSuccess} />
                  ) : (
                    <LoginForm
                      onSubmit={handleLogin}
                      error={error}
                      successMessage={successMessage}
                      onForgotPassword={handleForgotPassword}
                    />
                  )}
                </CardContent>
                
                <CardFooter className="flex flex-col space-y-4 relative z-10">
                  <div className="text-sm text-gray-600 text-center">
                    {isRegistering ? (
                      <>
                        Já tem uma conta?{' '}
                        <Button
                          variant="link"
                          className="p-0 text-purple-600 hover:text-purple-700 font-medium"
                          onClick={() => {
                            setIsRegistering(false)
                            setError('')
                            setSuccessMessage('')
                          }}
                        >
                          Faça login
                        </Button>
                      </>
                    ) : (
                      <>
                        Não tem uma conta?{' '}
                        <Button
                          variant="link"
                          className="p-0 text-purple-600 hover:text-purple-700 font-medium"
                          onClick={() => {
                            setIsRegistering(true)
                            setError('')
                            setSuccessMessage('')
                          }}
                        >
                          Cadastre-se
                        </Button>
                      </>
                    )}
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Right Column - Platform Information (Purple Background) */}
        <div className="w-1/2 bg-gradient-to-br from-purple-600 via-violet-600 to-purple-700 text-white relative overflow-hidden flex items-center justify-center p-12">
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/3 rounded-full blur-2xl"></div>
          </div>

          <motion.div
            className="relative z-10 max-w-lg"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            {/* Badge */}
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm mb-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <Sparkles className="h-4 w-4 text-white" />
              <span className="text-sm font-medium text-white">Ambiente Digital de Conexões</span>
            </motion.div>

            <div className="mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent mb-4">
                Ambiente Digital de Conexões
              </h2>
              <p className="text-white/90 text-lg leading-relaxed">
                O ecossistema de inovação da UFC que conecta estudantes, pesquisadores, técnicos administrativos e empreendedores
                em uma rede colaborativa para transformar ideias em realidade.
              </p>
            </div>

            <div className="space-y-6">
              {platformFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className="flex items-start gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + index * 0.1, duration: 0.6 }}
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-white/10 border border-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                    <p className="text-white/80 text-sm">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              className="mt-8 p-6 bg-white/10 border border-white/20 backdrop-blur-sm rounded-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4, duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <Award className="h-6 w-6 text-white" />
                <h3 className="font-semibold text-white">Reconhecimento</h3>
              </div>
              <p className="text-white/80 text-sm">
                Parte do ecossistema oficial de inovação da Universidade Federal do Ceará, 
                promovendo a cultura empreendedora e a transferência de tecnologia.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Mobile Layout - Centered */}
      <div className="lg:hidden min-h-screen bg-gradient-to-br from-purple-600 via-violet-600 to-purple-700 text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/3 rounded-full blur-2xl"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-8">
          {/* Back Button */}
          <motion.div
            className="flex justify-start mb-8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Link href="/" className="flex items-center group">
              <ArrowLeft className="h-5 w-5 text-white/80 group-hover:text-white transition-colors" />
              <p className="text-sm text-white/80 group-hover:text-white ml-2 transition-colors">
                Voltar ao Início
              </p>
            </Link>
          </motion.div>

          {/* Mobile Header */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Logo UFC Inova */}
            <div className="flex justify-center mb-6">
              <img src="/logo-ufc-inova-branco.png" alt="UFC Inova" className="h-14 w-auto" />
            </div>

            {/* Badge */}
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm mb-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <Sparkles className="h-4 w-4 text-white" />
              <span className="text-sm font-medium text-white">Ambiente Digital de Conexões</span>
            </motion.div>

            {/* Title */}
            <motion.h1
              className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              {isRegistering ? 'Junte-se a Nós!' : 'Bem-vindo de Volta!'}
            </motion.h1>

            <motion.p
              className="text-white/80 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              {isRegistering 
                ? 'Crie sua conta e faça parte da inovação'
                : 'Acesse sua conta e continue sua jornada'
              }
            </motion.p>
          </motion.div>

          {/* Mobile Form */}
          <div className="flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="w-full max-w-md"
            >
              <Card className="bg-white shadow-2xl border border-purple-100 relative overflow-hidden">
                {/* Decorative background */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100/50 to-violet-100/30 rounded-full -mr-16 -mt-16" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-100/30 to-violet-100/20 rounded-full -ml-12 -mb-12" />
                
                <CardHeader className="relative z-10">
                  <CardTitle className="text-xl font-bold text-center text-gray-900">
                    {isRegistering ? 'Criar Conta' : 'Fazer Login'}
                  </CardTitle>
        </CardHeader>
                
                <CardContent className="relative z-10">
          {isRegistering ? (
            <StepByStepRegister onRegisterSuccess={handleRegisterSuccess} />
          ) : (
            <LoginForm
              onSubmit={handleLogin}
              error={error}
              successMessage={successMessage}
            />
          )}
        </CardContent>
                
                <CardFooter className="flex flex-col space-y-4 relative z-10">
                  <div className="text-sm text-gray-600 text-center">
            {isRegistering ? (
              <>
                Já tem uma conta?{' '}
                <Button
                  variant="link"
                          className="p-0 text-purple-600 hover:text-purple-700 font-medium"
                  onClick={() => {
                    setIsRegistering(false)
                    setError('')
                    setSuccessMessage('')
                  }}
                >
                  Faça login
                </Button>
              </>
            ) : (
              <>
                Não tem uma conta?{' '}
                <Button
                  variant="link"
                          className="p-0 text-purple-600 hover:text-purple-700 font-medium"
                  onClick={() => {
                    setIsRegistering(true)
                    setError('')
                    setSuccessMessage('')
                  }}
                >
                  Cadastre-se
                </Button>
              </>
            )}
          </div>
        </CardFooter>
      </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Password Reset Modal */}
      <PasswordResetModal
        isOpen={isPasswordResetOpen}
        onClose={() => setIsPasswordResetOpen(false)}
      />
    </div>
  )
}
