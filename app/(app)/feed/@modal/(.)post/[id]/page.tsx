'use client'

import { use } from 'react'
import { useSearchParams } from 'next/navigation'
import { PostOverlay } from '@/components/feed/PostOverlay'

export default function InterceptedPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const sp = useSearchParams()
  const m = Number(sp.get('m'))
  const initialMediaIndex = Number.isFinite(m) && m > 0 ? m : 0

  return <PostOverlay id={id} initialMediaIndex={initialMediaIndex} />
}
