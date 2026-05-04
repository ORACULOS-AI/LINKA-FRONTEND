"use client"

import type React from "react"
import type { LucideIcon } from "lucide-react"
import { Sparkles } from "lucide-react"

export interface HeroStat {
  icon: LucideIcon
  value: string | number
  label: string
}

export interface CommunityHeroProps {
  icon: LucideIcon
  badge: string
  title: string
  description?: string
  stats?: HeroStat[]
  gradientFrom?: string
  gradientTo?: string
  children?: React.ReactNode
}

export function CommunityHero({
  icon: Icon,
  badge,
  title,
  description,
  stats = [],
  gradientFrom = "purple-600",
  gradientTo = "purple-700",
  children,
}: CommunityHeroProps) {
  return (
    <div className={`relative bg-gradient-to-br from-${gradientFrom} to-${gradientTo} text-white`}>
      {/* Decorative blur circles */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-white rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12 sm:py-16">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm mb-6">
            <Sparkles className="h-4 w-4 text-white" />
            <span className="text-sm font-medium text-white">{badge}</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-white">
            {title}
          </h1>

          {/* Description (optional) */}
          {description && (
            <p className="text-lg text-purple-100 mb-6 max-w-2xl mx-auto">
              {description}
            </p>
          )}

          {/* Stats */}
          {stats.length > 0 && (
            <div className="flex flex-wrap justify-center gap-6 text-center mt-8">
              {stats.map((stat, index) => {
                const StatIcon = stat.icon
                return (
                  <div key={index} className="flex items-center gap-2">
                    <StatIcon className="h-5 w-5 text-purple-200" />
                    <span className="text-xl font-bold">{stat.value}</span>
                    <span className="text-purple-200">{stat.label}</span>
                  </div>
                )
              })}
            </div>
          )}

          {/* Custom children (for additional content) */}
          {children && <div className="mt-6">{children}</div>}
        </div>
      </div>
    </div>
  )
}
