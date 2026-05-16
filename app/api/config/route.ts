import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { backendFetch } from '@/lib/auth/backend'
import { ACCESS_COOKIE } from '@/lib/auth/cookies'

export async function GET(req: NextRequest) {
  const store = await cookies()
  const accessToken = store.get(ACCESS_COOKIE)?.value
  const tenant = req.headers.get('x-tenant') ?? 'default'

  const backendRes = await backendFetch('/api/v1/config', {
    method: 'GET',
    accessToken,
    headers: { 'X-Tenant': tenant },
  })
  const text = await backendRes.text()
  return new NextResponse(text || null, {
    status: backendRes.status,
    headers: { 'content-type': 'application/json' },
  })
}
