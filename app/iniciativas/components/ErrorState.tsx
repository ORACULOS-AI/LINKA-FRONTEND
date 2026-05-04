import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Info, RotateCw } from 'lucide-react'

interface ErrorStateProps {
  onRetry: () => void
}

export const ErrorState = ({ onRetry }: ErrorStateProps) => (
  <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
    <Card className="p-8 max-w-md w-full">
      <div className="text-center space-y-4">
        <Info className="w-12 h-12 text-muted-foreground mx-auto" />
        <div className="space-y-2">
          <p className="text-lg font-medium text-gray-900">
            Não foi possível carregar as iniciativas
          </p>
          <p className="text-sm text-gray-500">
            Ocorreu um erro ao tentar carregar as iniciativas. Por favor, tente
            novamente.
          </p>
        </div>
        <Button
          onClick={onRetry}
          variant="default"
          className="w-full sm:w-auto"
        >
          <RotateCw className="w-4 h-4 mr-2" />
          Tentar novamente
        </Button>
      </div>
    </Card>
  </div>
) 