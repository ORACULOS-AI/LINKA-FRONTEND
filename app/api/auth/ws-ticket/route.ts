import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { ACCESS_COOKIE } from '@/lib/auth/cookies'

/**
 * Retorna o JWT armazenado em cookie httpOnly para que o cliente
 * possa abrir uma WebSocket autenticada ao backend
 * (`ws://.../api/v1/ws?token=<JWT>`).
 *
 * O cookie é httpOnly → JS não lê direto. Esta rota lê server-side
 * e devolve em JSON. Mesma origem do frontend, cookie de access curto
 * (30min). O ws-token é o próprio access_token.
 */
export async function GET() {
  const jar = await cookies()
  const access = jar.get(ACCESS_COOKIE)?.value
  if (!access) {
    return NextResponse.json({ detail: 'Não autenticado' }, { status: 401 })
  }
  return NextResponse.json({ token: access })
}
