import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(
  date: string | Date,
  formatStr: string = 'PPp',
): string {
  if (!date) return ''

  const dateObj = typeof date === 'string' ? new Date(date) : date

  if (isNaN(dateObj.getTime())) return ''

  return format(dateObj, formatStr, { locale: ptBR })
}

export function formatImageSrc(src: string): string {
  if (!src) return ''

  // Handle Google Drive URLs - use thumbnail endpoint (uc?export=view foi descontinuado)
  if (src.includes('drive.google.com')) {
    // Pattern for /file/d/ID/view
    const fileIdMatch = src.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
    if (fileIdMatch && fileIdMatch[1]) {
      return `https://drive.google.com/thumbnail?id=${fileIdMatch[1]}&sz=w800`
    }

    // Pattern for open?id=ID or uc?id=ID
    const openIdMatch = src.match(/id=([a-zA-Z0-9_-]+)/)
    if (openIdMatch && openIdMatch[1]) {
      return `https://drive.google.com/thumbnail?id=${openIdMatch[1]}&sz=w800`
    }
  }

  return src
}

export function isValidImageUrl(url: string | undefined | null): boolean {
  if (!url) return false
  if (url.includes('drive.google.com')) {
    return url.includes('thumbnail?id=') || url.includes('uc?export=view')
  }
  return url.startsWith('https://')
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('')
}