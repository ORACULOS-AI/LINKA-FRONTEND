"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Sparkles } from "lucide-react"

interface BusinessCreationProps {
  onRequestCreate: () => void
}

export function BusinessCreation({ onRequestCreate }: BusinessCreationProps) {
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <Card className="w-full border border-purple-200 shadow-lg hover:shadow-purple-500/10 transition-all duration-300 bg-gradient-to-br from-white to-purple-50/30">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-12 h-12 bg-gradient-to-br from-purple-600 to-violet-600 rounded-xl flex items-center justify-center mb-4">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-xl font-bold text-gray-900">Adicionar Negócio</CardTitle>
          <p className="text-sm text-gray-600 mt-2">Cadastre seu negócio e faça parte do ecossistema de inovação</p>
        </CardHeader>
        <CardContent>
          <Button
            onClick={onRequestCreate}
            className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:shadow-purple-500/25 hover:shadow-lg transition-all duration-300 text-white font-medium py-3"
          >
            <Plus className="mr-2 h-5 w-5" />
            Cadastrar Agora
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}
