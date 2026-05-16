import { NextResponse } from 'next/server'
import { z } from 'zod'
import { backendFetch } from '@/lib/auth/backend'

const bodySchema = z.object({ email: z.string().email() })

export async function POST(request: Request) {
  let parsed
  try {
    parsed = bodySchema.parse(await request.json())
  } catch {
    return NextResponse.json({ detail: 'E-mail inválido.' }, { status: 400 })
  }
  const backendRes = await backendFetch('/api/v1/verification/password-reset/send-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: parsed.email }),
  })
  const data = await backendRes.json().catch(() => ({}))
  if (!backendRes.ok) {
    return NextResponse.json(
      { detail: data?.detail ?? 'Falha ao enviar código.' },
      { status: backendRes.status },
    )
  }
  return NextResponse.json({ ok: true })
}
