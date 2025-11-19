"use client"

import { motion } from "framer-motion"
import { type NegocioResponse, NegocioType } from "@/lib/types/businessTypes"
import { Building2, Handshake, BarChart3 } from "lucide-react"

interface BusinessStatusProps {
  activeBusinesses: NegocioResponse[]
  pendingBusinesses: NegocioResponse[]
}

export function BusinessStatus({ activeBusinesses, pendingBusinesses }: BusinessStatusProps) {
  const incubadasCount = activeBusinesses.filter((b) => b.tipo_negocio === NegocioType.INCUBADA).length
  const parceirasCount = activeBusinesses.filter((b) => b.tipo_negocio === NegocioType.PARCEIRA).length

  const stats = [
    {
      icon: Building2,
      label: "Incubadas",
      value: incubadasCount,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      icon: Handshake,
      label: "Parceiras",
      value: parceirasCount,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      icon: BarChart3,
      label: "Total",
      value: activeBusinesses.length,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ]

  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          className="text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.3 }}
        >
          <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${stat.bgColor} mb-2`}>
            <stat.icon className={`h-5 w-5 ${stat.color}`} />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
          <div className="text-sm text-gray-600">{stat.label}</div>
        </motion.div>
      ))}
    </div>
  )
}
