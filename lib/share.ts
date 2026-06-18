import { toast } from 'sonner'

/** Permalink absoluto de um post (o que o botão de compartilhar copia). */
export function postPermalink(postId: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  return `${origin}/feed/post/${postId}`
}

/**
 * Compartilha o permalink de um post: usa Web Share API quando disponível,
 * senão copia o link para a área de transferência. Mostra toast de feedback.
 */
export async function sharePostLink(postId: string, title = 'Publicação no SeLinka'): Promise<void> {
  const url = postPermalink(postId)

  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({ title, url })
      return
    } catch (err) {
      // AbortError = usuário cancelou; sai silencioso. Outros erros caem no clipboard.
      if ((err as Error).name === 'AbortError') return
    }
  }

  try {
    await navigator.clipboard.writeText(url)
    toast.success('Link copiado para a área de transferência')
  } catch {
    toast.error('Não foi possível compartilhar. Copie a URL manualmente.')
  }
}
