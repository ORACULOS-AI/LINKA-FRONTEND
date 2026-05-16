import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { backendFetch } from '@/lib/auth/backend'
import { ACCESS_COOKIE, clearAuthCookies } from '@/lib/auth/cookies'

export async function POST() {
  const store = await cookies()
  const accessToken = store.get(ACCESS_COOKIE)?.value

  if (accessToken) {
    await backendFetch('/api/v1/auth/logout', {
      method: 'POST',
      accessToken,
    }).catch(() => undefined)
  }

  const res = NextResponse.json({ ok: true })
  clearAuthCookies(res)
  return res
}
