"use client"

import { MessageCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface ErrorStateProps {
  onRetry: () => void
  errorDetails?: string
}

export function ErrorState({ onRetry, errorDetails }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <Card className="p-8 max-w-md w-full">
        <div className="text-center space-y-4">
          <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto" />
          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-900">Não foi possível carregar as mensagens</p>
            <p className="text-sm text-gray-500">
              Ocorreu um erro ao tentar carregar suas conversas. Por favor, tente novamente.
            </p>
            {errorDetails && (
              <details className="text-xs text-red-500 mt-2">
                <summary className="cursor-pointer">Detalhes técnicos</summary>
                <p className="mt-1 text-left">{errorDetails}</p>
              </details>
            )}
          </div>
          <Button onClick={onRetry} variant="default" className="w-full sm:w-auto">
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar novamente
          </Button>
        </div>
      </Card>
    </div>
  )
}
