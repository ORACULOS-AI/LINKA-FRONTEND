import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { backendFetch } from '@/lib/auth/backend'
import { REFRESH_COOKIE, clearAuthCookies, setAuthCookies } from '@/lib/auth/cookies'

export async function POST() {
  const store = await cookies()
  const refreshToken = store.get(REFRESH_COOKIE)?.value
  if (!refreshToken) {
    return NextResponse.json({ detail: 'Sem refresh token.' }, { status: 401 })
  }

  const backendRes = await backendFetch('/api/v1/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  })

  const body = await backendRes.json().catch(() => ({}))
  const payload = body?.data ?? body
  if (!backendRes.ok || !payload?.access_token || !payload?.refresh_token) {
    const res = NextResponse.json(
      { detail: body?.detail ?? 'Refresh falhou.' },
      { status: 401 },
    )
    clearAuthCookies(res)
    return res
  }

  const res = NextResponse.json({ ok: true })
  setAuthCookies(res, { accessToken: payload.access_token, refreshToken: payload.refresh_token })
  return res
}
