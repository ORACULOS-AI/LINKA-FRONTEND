"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

interface ConversationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedUser: any | null
  initialMessage: string
  onMessageChange: (message: string) => void
  onSend: () => void
  isSending: boolean
}

export function ConversationModal({
  open,
  onOpenChange,
  selectedUser,
  initialMessage,
  onMessageChange,
  onSend,
  isSending,
}: ConversationModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md mx-4">
        <DialogHeader>
          <DialogTitle>Iniciar conversa</DialogTitle>
          <DialogDescription>
            Envie a primeira mensagem para <strong>{selectedUser?.nome}</strong>
          </DialogDescription>
        </DialogHeader>
        <textarea
          className="w-full border rounded p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base resize-none"
          rows={4}
          placeholder="Digite sua mensagem..."
          value={initialMessage}
          onChange={(e) => onMessageChange(e.target.value)}
        />
        <DialogFooter className="mt-4 flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={onSend}
            disabled={isSending || !initialMessage.trim()}
            className="bg-purple-600 hover:bg-purple-700 text-white w-full sm:w-auto order-1 sm:order-2"
          >
            {isSending ? "Enviando..." : "Enviar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
