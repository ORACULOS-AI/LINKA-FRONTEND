'use client'

import { useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'

type WSMessage =
  | { type: 'notification'; payload: unknown }
  | { type: 'feed.update'; payload: { post_id: string } }
  | { type: 'thread.message'; payload: { thread_id: string } }
  | { type: 'presence'; payload: { user_id: string; online: boolean } }

const WS_URL =
  process.env.NEXT_PUBLIC_LINKA_WS_URL ?? 'ws://localhost:8000/ws'

const MAX_BACKOFF_MS = 30_000

export type WSStatus = 'idle' | 'connecting' | 'open' | 'closed'

export function useWS(enabled: boolean = true) {
  const [status, setStatus] = useState<WSStatus>('idle')
  const queryClient = useQueryClient()
  const wsRef = useRef<WebSocket | null>(null)
  const attemptRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const closedByUserRef = useRef(false)

  useEffect(() => {
    if (!enabled) return

    closedByUserRef.current = false

    const connect = () => {
      setStatus('connecting')
      const ws = new WebSocket(WS_URL)
      wsRef.current = ws

      ws.onopen = () => {
        attemptRef.current = 0
        setStatus('open')
      }

      ws.onmessage = (event) => {
        let msg: WSMessage
        try {
          msg = JSON.parse(event.data) as WSMessage
        } catch {
          return
        }
        switch (msg.type) {
          case 'notification':
            queryClient.invalidateQueries({ queryKey: ['notifications'] })
            break
          case 'feed.update':
            queryClient.invalidateQueries({ queryKey: ['feed'] })
            break
          case 'thread.message':
            queryClient.invalidateQueries({
              queryKey: ['thread', msg.payload.thread_id],
            })
            break
          case 'presence':
            queryClient.setQueryData(
              ['presence', msg.payload.user_id],
              msg.payload.online,
            )
            break
        }
      }

      ws.onclose = () => {
        setStatus('closed')
        if (closedByUserRef.current) return
        const attempt = attemptRef.current + 1
        attemptRef.current = attempt
        const backoff = Math.min(MAX_BACKOFF_MS, 1000 * 2 ** (attempt - 1))
        const jitter = Math.random() * 250
        timerRef.current = setTimeout(connect, backoff + jitter)
      }

      ws.onerror = () => {
        ws.close()
      }
    }

    connect()

    return () => {
      closedByUserRef.current = true
      if (timerRef.current) clearTimeout(timerRef.current)
      wsRef.current?.close()
    }
  }, [enabled, queryClient])

  return { status }
}
