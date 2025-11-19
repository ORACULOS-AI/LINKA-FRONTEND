import React from 'react'
import { formatImageSrc } from '@/lib/utils'

interface ImageProps {
  image?:
    | {
        data: string
        contentType: string
      }
    | string
    | null
  className?: string
}

const ImageDisplay: React.FC<ImageProps> = ({ image, className }) => {
  if (!image) {
    return <p>Imagem não disponível</p>
  }

  let imageUrl: string

  if (typeof image === 'string') {
    // Se for uma URL do S3 ou base64, usa diretamente
    imageUrl = image.startsWith('data:') || image.startsWith('http') 
      ? image 
      : `data:image/jpeg;base64,${image}`
  } else if ('data' in image && 'contentType' in image) {
    // Se for um objeto com data e contentType, converte para base64
    imageUrl = `data:${image.contentType};base64,${image.data}`
  } else {
    return <p>Formato de imagem inválido</p>
  }

  return (
    <img
      src={formatImageSrc(imageUrl)}
      alt="Imagem"
      className={className}
      style={{ maxWidth: '100%', height: 'auto' }}
    />
  )
}

export default ImageDisplay
