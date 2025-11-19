import { useState } from 'react'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Facebook, Instagram, Linkedin, LinkIcon, Mail, MapPin, Lightbulb, Target, ArrowRight, ExternalLink } from 'lucide-react'
import { NegocioResponse } from '@/lib/types/businessTypes'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { formatImageSrc } from '@/lib/utils'

// Define a new interface for the component's props
interface BusinessCardProps {
  business: NegocioResponse
}

export function BusinessCard({ business }: BusinessCardProps) {
  const [isOpen, setIsOpen] = useState(false)

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'facebook':
        return <Facebook className="h-4 w-4" />
      case 'instagram':
        return <Instagram className="h-4 w-4" />
      case 'linkedin':
        return <Linkedin className="h-4 w-4" />
      default:
        return <LinkIcon className="h-4 w-4" />
    }
  }

  const getBusinessTypeBadge = (type: NegocioResponse['tipo_negocio']) => {
    const config = {
      'incubada': { bg: 'bg-gradient-to-r from-emerald-500 to-emerald-600', text: 'Incubada', icon: '🚀' },
      'parceira': { bg: 'bg-gradient-to-r from-blue-500 to-blue-600', text: 'Parceira', icon: '🤝' }
    }
    
    const typeConfig = config[type] || { bg: 'bg-gradient-to-r from-purple-500 to-purple-600', text: type, icon: '🏢' }
    
    return (
      <div className={`${typeConfig.bg} text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-lg`}>
        <span>{typeConfig.icon}</span>
        {typeConfig.text}
      </div>
    )
  }

  const getStageColor = (stage: string) => {
    const stageColors = {
      'IDEACAO': 'text-amber-600 bg-amber-50',
      'VALIDACAO': 'text-blue-600 bg-blue-50',
      'MVP': 'text-purple-600 bg-purple-50',
      'OPERACAO': 'text-green-600 bg-green-50',
      'CRESCIMENTO': 'text-orange-600 bg-orange-50',
      'ESCALA': 'text-red-600 bg-red-50'
    }
    return stageColors[stage] || 'text-gray-600 bg-gray-50'
  }

  return (
    <>
      <motion.div
        whileHover={{ y: -2, scale: 1.01 }}
        transition={{ duration: 0.2 }}
        className="group"
      >
        <Card className="relative overflow-hidden bg-white border border-gray-200 hover:border-purple-300 hover:shadow-xl transition-all duration-300 h-64">
          <Link
            href={`/inspecionar-negocio/${business.id}`}
            className="block h-full"
          >
            {/* Purple accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-violet-500 to-purple-600" />
            
            {/* Content */}
            <div className="p-5 h-full flex flex-col">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Logo */}
                  <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-purple-100 bg-gradient-to-br from-purple-50 to-violet-50 flex items-center justify-center flex-shrink-0">
                    {business.foto_perfil ? (
                      <Image
                        src={formatImageSrc(business.foto_perfil)}
                        alt={`Logo de ${business.nome}`}
                        width={48}
                        height={48}
                        className="object-cover rounded-xl"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {business.nome.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Company Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 leading-tight truncate">
                      {business.nome}
                    </h3>
                    <p className="text-sm text-gray-600 truncate">
                      {business.area_atuacao}
                    </p>
                  </div>
                </div>

                {/* Type Badge */}
                <div className="flex-shrink-0 ml-2">
                  {getBusinessTypeBadge(business.tipo_negocio)}
                </div>
              </div>

              {/* Problem & Solution */}
              <div className="flex-1 mb-4 space-y-3">
                {/* Problem */}
                <div className="flex items-start gap-2">
                  <Target className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-red-700 mb-1">Problema</p>
                    <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
                      {business.descricao_problema.slice(0, 60)}
                    </p>
                  </div>
                </div>

                {/* Solution */}
                <div className="flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-green-700 mb-1">Solução</p>
                    <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
                      {business.solucao_proposta.slice(0, 60)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Keywords & Stage */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex flex-wrap gap-1">
                    {business.palavras_chave.slice(0, 2).map((keyword, index) => (
                      <span 
                        key={index} 
                        className="px-2 py-1 bg-purple-50 text-purple-700 rounded-md text-xs font-medium"
                      >
                        {keyword}
                      </span>
                    ))}
                    {business.palavras_chave.length > 2 && (
                      <span className="px-2 py-1 bg-gray-50 text-gray-600 rounded-md text-xs font-medium">
                        +{business.palavras_chave.length - 2}
                      </span>
                    )}
                  </div>
                  <div className="ml-auto">
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${getStageColor(business.estagio)}`}>
                      {business.estagio}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Hover Effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Link>
        </Card>
      </motion.div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              {business.nome}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[80vh]">
            {getBusinessTypeBadge(business.tipo_negocio)}
            <div className="space-y-6 py-4">
              <div className="flex flex-wrap gap-2">
                {business.palavras_chave.map((keyword, index) => (
                  <Badge key={index} variant="secondary">
                    {keyword}
                  </Badge>
                ))}
              </div>

              <div className="grid gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Informações de Contato</h3>
                  <div className="grid gap-2 text-sm">
                    <p>
                      <strong>Email:</strong> {business.email}
                    </p>
                  </div>
                </div>

                {business.midias_sociais && (
                  <div>
                    <h3 className="font-semibold mb-2">Redes Sociais</h3>
                    <div className="flex gap-2">
                      {Object.entries(business.midias_sociais).map(
                        ([platform, url]) => (
                          <a
                            key={platform}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                          >
                            {getSocialIcon(platform)}
                          </a>
                        ),
                      )}
                    </div>
                  </div>
                )}

                <div className="grid gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">Descrição do Problema</h3>
                    <p className="text-sm">{business.descricao_problema}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Solução Proposta</h3>
                    <p className="text-sm">{business.solucao_proposta}</p>
                  </div>
                  <div className="grid gap-2 text-sm">
                    <p>
                      <strong>Área de Atuação:</strong> {business.area_atuacao}
                    </p>
                    <p>
                      <strong>Estágio:</strong> {business.estagio}
                    </p>
                  </div>
                </div>

                {business.id_iniciativas &&
                  business.id_iniciativas.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Iniciativas</h3>
                      <div className="grid gap-2">
                        {business.id_iniciativas.map((id) => (
                          <Badge key={id} variant="outline">
                            Iniciativa {id}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  )
}
