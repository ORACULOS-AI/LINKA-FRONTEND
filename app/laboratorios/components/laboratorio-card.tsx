"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FlaskConical, MapPin, User, Calendar } from "lucide-react"
import type { LaboratorioResponse } from "@/lib/types/laboratorioTypes"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface LaboratorioCardProps {
  laboratorio: LaboratorioResponse
}

export function LaboratorioCard({ laboratorio }: LaboratorioCardProps) {
  const router = useRouter()

  const handleClick = () => {
    router.push(`/inspecionar-laboratorio/${laboratorio.uid}`)
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "d 'de' MMM 'de' yyyy", {
        locale: ptBR,
      })
    } catch {
      return "Data inválida"
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ATIVO: {
        className: "bg-green-100 text-green-800",
        text: "Ativo",
      },
      INATIVO: {
        className: "bg-red-100 text-red-800",
        text: "Inativo",
      },
      MANUTENCAO: {
        className: "bg-yellow-100 text-yellow-800",
        text: "Manutenção",
      },
    }

    const config = statusConfig[status] || statusConfig.ATIVO
    return (
      <Badge variant="outline" className={config.className}>
        {config.text}
      </Badge>
    )
  }

  const getTipoBadge = (tipo: string) => {
    const tipoConfig = {
      PESQUISA: {
        className: "bg-blue-100 text-blue-800",
        text: "Pesquisa",
      },
      ENSINO: {
        className: "bg-purple-100 text-purple-800",
        text: "Ensino",
      },
      EXTENSAO: {
        className: "bg-green-100 text-green-800",
        text: "Extensão",
      },
      DESENVOLVIMENTO: {
        className: "bg-orange-100 text-orange-800",
        text: "Desenvolvimento",
      },
      MULTIDISCIPLINAR: {
        className: "bg-indigo-100 text-indigo-800",
        text: "Multidisciplinar",
      },
    }

    const config = tipoConfig[tipo] || { className: "bg-gray-100 text-gray-800", text: tipo }
    return (
      <Badge variant="outline" className={config.className}>
        {config.text}
      </Badge>
    )
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className="h-full cursor-pointer group hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-purple-300 bg-white"
        onClick={handleClick}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl group-hover:text-purple-600 transition-colors line-clamp-2">
                {laboratorio.nome}
              </CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <FlaskConical className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">{laboratorio.unidade}</span>
                {laboratorio.subunidade && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span className="text-sm text-gray-600">{laboratorio.subunidade}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            {getTipoBadge(laboratorio.tipo)}
            {getStatusBadge(laboratorio.status)}
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col">
          <div className="space-y-3 flex-1">
            {/* Responsável */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="h-4 w-4" />
              <span className="font-medium">{laboratorio.responsavel}</span>
            </div>

            {/* Localização */}
            {(laboratorio.campus || laboratorio.sala) && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>
                  {laboratorio.campus && `${laboratorio.campus}`}
                  {laboratorio.campus && laboratorio.sala && ", "}
                  {laboratorio.sala && `Sala ${laboratorio.sala}`}
                </span>
              </div>
            )}

            {/* Áreas de pesquisa */}
            {laboratorio.areas_pesquisa && laboratorio.areas_pesquisa.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">ÁREAS DE PESQUISA</p>
                <div className="flex flex-wrap gap-1">
                  {laboratorio.areas_pesquisa.slice(0, 3).map((area, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="text-xs bg-purple-50 text-purple-700 hover:bg-purple-100"
                    >
                      {area}
                    </Badge>
                  ))}
                  {laboratorio.areas_pesquisa.length > 3 && (
                    <Badge variant="secondary" className="text-xs bg-gray-50 text-gray-600">
                      +{laboratorio.areas_pesquisa.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Equipamentos */}
            {laboratorio.equipamentos && laboratorio.equipamentos.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">EQUIPAMENTOS</p>
                <p className="text-sm text-gray-700 line-clamp-2">
                  {laboratorio.equipamentos.slice(0, 2).join(", ")}
                  {laboratorio.equipamentos.length > 2 && ` e mais ${laboratorio.equipamentos.length - 2}`}
                </p>
              </div>
            )}

            {/* Descrição */}
            {laboratorio.descricao && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">DESCRIÇÃO</p>
                <p className="text-sm text-gray-700 line-clamp-3">
                  {laboratorio.descricao}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>Criado em {formatDate(laboratorio.created_at)}</span>
              </div>
              {laboratorio.pesquisadores && laboratorio.pesquisadores.length > 0 && (
                <span>{laboratorio.pesquisadores.length} pesquisador{laboratorio.pesquisadores.length !== 1 ? 'es' : ''}</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
