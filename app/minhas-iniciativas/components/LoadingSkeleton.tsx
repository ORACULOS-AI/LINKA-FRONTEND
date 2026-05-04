import { Skeleton } from '@/components/ui/skeleton'
import { motion } from 'framer-motion'
import { HandHeart } from 'lucide-react'

export const LoadingSkeleton = () => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <motion.div
        className="flex flex-col items-center gap-6"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          >
            <HandHeart className="h-12 w-12 text-purple-600" />
          </motion.div>
          <div className="absolute inset-0 rounded-full bg-purple-600/20 animate-pulse" />
        </div>
        
        <motion.div
          className="text-center"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        >
          <p className="text-gray-800 text-lg font-medium">Carregando suas iniciativas...</p>
          <p className="text-gray-500 text-sm mt-1">Preparando seu painel</p>
        </motion.div>
      </motion.div>
    </div>
  )
} 