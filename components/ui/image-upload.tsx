import { ChangeEvent, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ImageIcon, X } from 'lucide-react'
import Image from 'next/image'

interface ImageUploadProps {
  value?: string
  onChange?: (value: string) => void
  disabled?: boolean
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null)

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      // Criar preview local
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        setPreview(base64)
        onChange?.(base64)
      }
      reader.readAsDataURL(file)

      // TODO: Implementar upload para servidor
      // const formData = new FormData()
      // formData.append('file', file)
      // const response = await fetch('/api/upload', {
      //   method: 'POST',
      //   body: formData
      // })
      // const { url } = await response.json()
      // onChange?.(url)
    } catch {
      // Upload failed
    }
  }

  const handleRemove = () => {
    setPreview(null)
    onChange?.('')
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-40 h-40 border-2 border-dashed rounded-lg flex items-center justify-center overflow-hidden">
        {preview ? (
          <>
            <Image
              src={preview}
              alt="Preview"
              fill
              style={{ objectFit: 'cover' }}
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={handleRemove}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
            <span className="text-sm text-muted-foreground mt-2">
              Clique para fazer upload
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={disabled}
            />
          </label>
        )}
      </div>
    </div>
  )
}
