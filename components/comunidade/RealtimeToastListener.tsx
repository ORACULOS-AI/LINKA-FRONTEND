"use client"

import { useRealtimeToasts } from "@/lib/hooks/useRealtimeToasts"

/**
 * Component that listens for real-time notifications and shows toasts
 * This component doesn't render anything visible - it just runs the hook
 */
export function RealtimeToastListener() {
  useRealtimeToasts()
  return null
}
