'use client'

import { useEffect, useRef, useState } from 'react'
import { X, Check } from 'lucide-react'

type Props = {
  file: File
  onConfirm: (blob: Blob) => void
  onCancel: () => void
}

const OUTPUT_SIZE = 400

export function AvatarCropModal({ file, onConfirm, onCancel }: Props) {
  const imgRef = useRef<HTMLImageElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [imgSrc, setImgSrc] = useState('')
  const [crop, setCrop] = useState({ x: 0, y: 0, size: 200 })
  const [dragging, setDragging] = useState<'move' | 'resize' | null>(null)
  const dragStart = useRef({ mx: 0, my: 0, cx: 0, cy: 0, cs: 0 })

  useEffect(() => {
    const url = URL.createObjectURL(file)
    setImgSrc(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  useEffect(() => {
    const img = imgRef.current
    if (!img || !imgSrc) return
    const onLoad = () => {
      const container = containerRef.current
      if (!container) return
      const containerW = container.clientWidth
      const scale = containerW / img.naturalWidth
      const displayH = img.naturalHeight * scale
      const size = Math.min(containerW, displayH) * 0.7
      setCrop({ x: (containerW - size) / 2, y: (displayH - size) / 2, size })
    }
    img.addEventListener('load', onLoad)
    return () => img.removeEventListener('load', onLoad)
  }, [imgSrc])

  function pointerDown(e: React.PointerEvent, kind: 'move' | 'resize') {
    e.preventDefault()
    setDragging(kind)
    dragStart.current = { mx: e.clientX, my: e.clientY, cx: crop.x, cy: crop.y, cs: crop.size }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  function pointerMove(e: React.PointerEvent) {
    if (!dragging) return
    const { mx, my, cx, cy, cs } = dragStart.current
    const dx = e.clientX - mx
    const dy = e.clientY - my
    const container = containerRef.current
    if (!container) return
    const img = imgRef.current
    if (!img) return
    const containerW = container.clientWidth
    const displayH = img.clientHeight

    if (dragging === 'move') {
      const newX = Math.max(0, Math.min(cx + dx, containerW - cs))
      const newY = Math.max(0, Math.min(cy + dy, displayH - cs))
      setCrop((c) => ({ ...c, x: newX, y: newY }))
    } else {
      const delta = Math.max(dx, dy)
      const newSize = Math.max(60, Math.min(cs + delta, containerW - cx, displayH - cy))
      setCrop((c) => ({ ...c, size: newSize }))
    }
  }

  function confirm() {
    const img = imgRef.current
    const canvas = canvasRef.current
    if (!img || !canvas) return

    const scaleX = img.naturalWidth / img.clientWidth
    const scaleY = img.naturalHeight / img.clientHeight

    canvas.width = OUTPUT_SIZE
    canvas.height = OUTPUT_SIZE
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(
      img,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.size * scaleX,
      crop.size * scaleY,
      0, 0,
      OUTPUT_SIZE,
      OUTPUT_SIZE,
    )
    canvas.toBlob((blob) => { if (blob) onConfirm(blob) }, 'image/jpeg', 0.88)
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-surface shadow-xl">
        <header className="flex items-center justify-between border-b border-border px-5 py-3">
          <h2 className="font-display text-base font-semibold">Recortar foto de perfil</h2>
          <button type="button" onClick={onCancel} className="rounded p-1 hover:bg-surface-2">
            <X className="h-4 w-4" />
          </button>
        </header>

        <div
          ref={containerRef}
          className="relative overflow-hidden select-none bg-black"
          onPointerMove={pointerMove}
          onPointerUp={() => setDragging(null)}
        >
          {imgSrc && (
            // eslint-disable-next-line @next/next/no-img-element
            <img ref={imgRef} src={imgSrc} alt="" className="block w-full" draggable={false} />
          )}

          {/* dark overlay with crop hole via box-shadow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              boxShadow: `0 0 0 9999px rgba(0,0,0,0.55)`,
              top: crop.y,
              left: crop.x,
              width: crop.size,
              height: crop.size,
              borderRadius: '50%',
              outline: '2px solid rgba(255,255,255,0.8)',
            }}
          />

          {/* drag handle — move */}
          <div
            className="absolute cursor-move"
            style={{ top: crop.y, left: crop.x, width: crop.size, height: crop.size, borderRadius: '50%' }}
            onPointerDown={(e) => pointerDown(e, 'move')}
          />

          {/* resize handle — bottom-right corner */}
          <div
            className="absolute cursor-se-resize"
            style={{
              top: crop.y + crop.size - 14,
              left: crop.x + crop.size - 14,
              width: 24,
              height: 24,
              background: 'white',
              borderRadius: '50%',
              border: '2px solid rgba(0,0,0,0.3)',
            }}
            onPointerDown={(e) => pointerDown(e, 'resize')}
          />
        </div>

        <canvas ref={canvasRef} className="hidden" />

        <footer className="flex justify-end gap-2 border-t border-border px-5 py-3">
          <button type="button" onClick={onCancel} className="btn btn-tertiary btn-sm">
            Cancelar
          </button>
          <button type="button" onClick={confirm} className="btn btn-primary btn-sm flex items-center gap-1.5">
            <Check className="h-4 w-4" /> Usar esta foto
          </button>
        </footer>
      </div>
    </div>
  )
}
