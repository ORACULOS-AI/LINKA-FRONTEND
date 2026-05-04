'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useState } from 'react'
import { useEventApi } from '@/lib/api/event'
import { toast } from 'react-toastify'

interface CertificateViewerProps {
  eventId: string
  isOpen: boolean
  onClose: () => void
}

export function CertificateViewer({
  eventId,
  isOpen,
  onClose,
}: CertificateViewerProps) {
  const { getCertificado } = useEventApi()
  const [certificateUrl, setCertificateUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleDownload = async () => {
    try {
      setIsLoading(true)
      const url = await getCertificado(eventId)
      if (url) {
        // Criar um link temporário para download
        const link = document.createElement('a')
        link.href = url
        link.download = `certificado-evento-${eventId}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch {
      toast.error('Erro ao baixar certificado')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Certificado de Participação</DialogTitle>
          <DialogDescription>
            Você pode visualizar e baixar seu certificado de participação no
            evento.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center space-y-4">
          {certificateUrl ? (
            <iframe
              src={certificateUrl}
              className="w-full h-[400px] border rounded-lg"
              title="Certificado de Participação"
            />
          ) : (
            <div className="flex flex-col items-center justify-center space-y-4 p-8">
              <p className="text-center text-muted-foreground">
                Clique no botão abaixo para baixar seu certificado.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
          <Button onClick={handleDownload} disabled={isLoading}>
            {isLoading ? 'Baixando...' : 'Baixar Certificado'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
