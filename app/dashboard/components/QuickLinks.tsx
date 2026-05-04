'use client'

import Link from 'next/link'
import { Rocket, Users, Lightbulb, Beaker } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export function QuickLinks() {
  const links = [
    {
      href: '/negocios',
      icon: Rocket,
      label: 'Negócios',
      description: 'Startups e Empresas',
      gradient: 'from-purple-500 to-violet-600',
    },
    {
      href: '/iniciativas',
      icon: Lightbulb,
      label: 'Iniciativas',
      description: 'Projetos em andamento',
      gradient: 'from-blue-500 to-cyan-600',
    },
    {
      href: '/laboratorios',
      icon: Beaker,
      label: 'Laboratórios',
      description: 'Espaços de pesquisa',
      gradient: 'from-green-500 to-emerald-600',
    },
    {
      href: '/rede',
      icon: Users,
      label: 'Rede',
      description: 'Conecte-se',
      gradient: 'from-orange-500 to-red-600',
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {links.map((link) => (
        <Link key={link.href} href={link.href}>
          <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border-2 hover:border-purple-200">
            <CardContent className="p-6">
              <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${link.gradient} text-white mb-3`}>
                <link.icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-lg mb-1 group-hover:text-purple-600 transition-colors">
                {link.label}
              </h3>
              <p className="text-sm text-gray-500">{link.description}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
