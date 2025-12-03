import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { NegocioType, type NegocioResponse } from '@/lib/types/businessTypes'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { formatImageSrc } from '@/lib/utils'
import { ArrowRight, MapPin, Users } from 'lucide-react'

interface BusinessCardProps {
  business: NegocioResponse
  index?: number
}

export function BusinessCardImproved({ business, index = 0 }: BusinessCardProps) {
  const getBusinessTypeBadge = (type: NegocioType) => {
    const config = {
      [NegocioType.PRE_INCUBADO]: {
        gradient: 'from-yellow-500 to-yellow-600',
        text: 'Pré-Incubada',
        emoji: '🌱',
        glow: 'group-hover:shadow-yellow-500/20'
      },
      [NegocioType.INCUBADO]: {
        gradient: 'from-emerald-500 to-emerald-600',
        text: 'Incubada',
        emoji: '🚀',
        glow: 'group-hover:shadow-emerald-500/20'
      },
      [NegocioType.PARCEIRO]: {
        gradient: 'from-blue-500 to-blue-600',
        text: 'Parceira',
        emoji: '🤝',
        glow: 'group-hover:shadow-blue-500/20'
      }
    }

    const typeConfig = config[type] || {
      gradient: 'from-purple-500 to-purple-600',
      text: type,
      emoji: '🏢',
      glow: 'group-hover:shadow-purple-500/20'
    }

    return (
      <div className={`absolute top-4 right-4 bg-gradient-to-r ${typeConfig.gradient} text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-lg ${typeConfig.glow} transition-shadow duration-300`}>
        <span>{typeConfig.emoji}</span>
        <span>{typeConfig.text}</span>
      </div>
    )
  }

  const getCategoriaEmoji = (categoria: string) => {
    const emojis = {
      'STARTUP': '💡',
      'EMPRESA_JUNIOR': '👨‍💼',
      'SPIN_OFF': '🔬',
      'OUTRO': '🏢'
    }
    return emojis[categoria] || '🏢'
  }

  const getStageLabel = (stage: string) => {
    const labels = {
      'IDEACAO': 'Ideação',
      'VALIDACAO': 'Validação',
      'MVP': 'MVP',
      'OPERACAO': 'Operação',
      'CRESCIMENTO': 'Crescimento',
      'ESCALA': 'Escala'
    }
    return labels[stage] || stage
  }

  const getStageColor = (stage: string) => {
    const colors = {
      'IDEACAO': 'text-amber-700 bg-amber-50 border-amber-200',
      'VALIDACAO': 'text-blue-700 bg-blue-50 border-blue-200',
      'MVP': 'text-purple-700 bg-purple-50 border-purple-200',
      'OPERACAO': 'text-green-700 bg-green-50 border-green-200',
      'CRESCIMENTO': 'text-orange-700 bg-orange-50 border-orange-200',
      'ESCALA': 'text-red-700 bg-red-50 border-red-200'
    }
    return colors[stage] || 'text-gray-700 bg-gray-50 border-gray-200'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group"
    >
      <Link href={`/inspecionar-negocio/${business.id}`}>
        <Card className="relative overflow-hidden bg-white border-2 border-gray-100 hover:border-purple-300 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 h-full">
          {/* Top gradient accent */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 via-violet-500 to-purple-600" />

          {/* Type Badge */}
          {getBusinessTypeBadge(business.tipo_negocio)}

          <div className="p-6 space-y-4">
            {/* Logo + Nome */}
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-purple-100 bg-gradient-to-br from-purple-50 to-violet-50 flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                {business.foto_perfil ? (
                  <Image
                    src={formatImageSrc(business.foto_perfil)}
                    alt={`Logo de ${business.nome}`}
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                    <span className="text-white font-bold text-2xl">
                      {business.nome.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 pt-1">
                <h3 className="text-xl font-bold text-gray-900 leading-tight mb-1 line-clamp-2 group-hover:text-purple-600 transition-colors">
                  {business.nome}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-lg">{getCategoriaEmoji(business.categoria)}</span>
                  <span className="font-medium">{business.area_atuacao}</span>
                </div>
              </div>
            </div>

            {/* Descrição */}
            <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
              {business.descricao || business.descricao_problema || 'Sem descrição disponível'}
            </p>

            {/* Tags + Stage */}
            <div className="space-y-3">
              {/* Keywords */}
              {business.palavras_chave && business.palavras_chave.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {business.palavras_chave.slice(0, 3).map((keyword, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-medium border border-purple-100"
                    >
                      {keyword}
                    </span>
                  ))}
                  {business.palavras_chave.length > 3 && (
                    <span className="px-2.5 py-1 bg-gray-50 text-gray-600 rounded-lg text-xs font-medium border border-gray-200">
                      +{business.palavras_chave.length - 3}
                    </span>
                  )}
                </div>
              )}

              {/* Stage Badge */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${getStageColor(business.estagio)}`}>
                  {getStageLabel(business.estagio)}
                </span>

                {/* CTA */}
                <div className="flex items-center gap-1.5 text-purple-600 group-hover:text-purple-700 group-hover:gap-2.5 transition-all">
                  <span className="text-sm font-semibold">Ver detalhes</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-purple-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </Card>
      </Link>
    </motion.div>
  )
}
