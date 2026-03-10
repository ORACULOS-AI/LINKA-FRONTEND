"use client"

import type React from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Camera, Share2, MapPin, Calendar } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface BusinessHeaderProps {
  business: any
  isOwner: boolean
  onProfilePhotoClick: () => void
  onCoverPhotoClick: () => void
}

export const BusinessHeader: React.FC<BusinessHeaderProps> = ({
  business,
  isOwner,
  onProfilePhotoClick,
  onCoverPhotoClick,
}) => {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: business.nome,
          text: `Confira o negócio ${business.nome}`,
          url: window.location.href,
        })
      } catch {
        // Share cancelled or failed
      }
    } else {
      await navigator.clipboard.writeText(window.location.href)
    }
  }

  return (
    <div className="relative">
      {/* Cover Photo */}
      <div className="relative h-[300px] sm:h-[400px] lg:h-[500px] w-full overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        />

        {business.foto_capa ? (
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            <Image
              src={business.foto_capa || "/placeholder.svg"}
              alt="Capa do negócio"
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
          </motion.div>
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-purple-600 via-violet-600 to-purple-700">
            <motion.div
              className="text-center text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h1 className="text-4xl font-bold mb-2">{business.nome}</h1>
              <p className="text-xl opacity-90">{business.area_atuacao}</p>
            </motion.div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="absolute top-6 right-6 z-20 flex gap-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="secondary"
                  className="rounded-full bg-white/90 hover:bg-white shadow-lg backdrop-blur-sm border border-purple-100"
                  onClick={handleShare}
                >
                  <Share2 className="h-5 w-5 text-purple-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Compartilhar</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Edit Cover Button */}
        {isOwner && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity z-10"
            whileHover={{ opacity: 1 }}
          >
            <motion.button
              className="p-4 bg-white/90 rounded-full shadow-lg backdrop-blur-sm border border-purple-100"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onCoverPhotoClick}
            >
              <Camera className="h-6 w-6 text-purple-600" />
            </motion.button>
          </motion.div>
        )}

        {/* Business Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 z-20 p-6 text-white">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <div className="flex flex-col sm:flex-row sm:items-end gap-6">
                {/* Profile Photo */}
                <div className="relative">
                  <motion.div
                    className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-lg p-1 shadow-2xl group border border-purple-800"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    <div className="w-full h-full rounded-xl bg-gradient-to-br from-purple-50 to-purple-700 flex items-center justify-center overflow-hidden">
                      {business.foto_perfil ? (
                        <Image
                          src={business.foto_perfil || "/placeholder.svg"}
                          alt="Logo do negócio"
                          fill
                          sizes="128px"
                          className="object-cover rounded-xl"
                          priority
                        />
                      ) : (
                        <div className="text-purple-600 font-bold text-2xl">{business.nome?.charAt(0) || "N"}</div>
                      )}
                    </div>

                    {isOwner && (
                      <motion.div
                        className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"
                        whileHover={{ opacity: 1 }}
                      >
                        <motion.button
                          className="p-2 bg-white rounded-full shadow-lg border border-purple-100"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={onProfilePhotoClick}
                        >
                          <Camera className="h-4 w-4 text-purple-600" />
                        </motion.button>
                      </motion.div>
                    )}
                  </motion.div>
                </div>

                {/* Business Details */}
                <div className="flex-1 min-w-0">
                  <h1 className="text-3xl sm:text-4xl font-bold mb-3 text-white drop-shadow-lg">{business.nome}</h1>
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <Badge className="bg-gradient-to-r from-purple-600 to-violet-600 text-white border-0 px-3 py-1 text-sm font-medium shadow-lg">
                      {business.area_atuacao}
                    </Badge>
                    <Badge className="bg-white/20 text-white border-white/30 px-3 py-1 text-sm backdrop-blur-sm">
                      {business.estagio}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-white/90 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>São Paulo, SP</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Fundado em 2023</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
