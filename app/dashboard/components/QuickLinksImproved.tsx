'use client'

import Link from 'next/link'
import { Rocket, Users, Lightbulb, Beaker } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { motion } from 'framer-motion'

export function QuickLinksImproved() {
  const links = [
    {
      href: '/negocios',
      icon: Rocket,
      label: 'Negócios',
      description: 'Startups e Empresas',
    },
    {
      href: '/iniciativas',
      icon: Lightbulb,
      label: 'Iniciativas',
      description: 'Projetos em andamento',
    },
    {
      href: '/laboratorios',
      icon: Beaker,
      label: 'Laboratórios',
      description: 'Espaços de pesquisa',
    },
    {
      href: '/rede',
      icon: Users,
      label: 'Rede',
      description: 'Conecte-se',
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {links.map((link, index) => (
        <motion.div
          key={link.href}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
        >
          <Link href={link.href}>
            <Card className="group relative overflow-hidden hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-1 cursor-pointer border-2 border-gray-100 hover:border-purple-300 h-full">
              {/* Top gradient accent */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-violet-500 to-purple-600" />

              <CardContent className="p-6 pt-8">
                <div className="inline-flex p-3 rounded-lg bg-gradient-to-br from-purple-100 to-violet-100 text-purple-600 mb-3 group-hover:scale-110 transition-transform duration-300">
                  <link.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-lg mb-1 text-gray-900 group-hover:text-purple-600 transition-colors">
                  {link.label}
                </h3>
                <p className="text-sm text-gray-500">{link.description}</p>
              </CardContent>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-purple-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </Card>
          </Link>
        </motion.div>
      ))}
    </div>
  )
}
