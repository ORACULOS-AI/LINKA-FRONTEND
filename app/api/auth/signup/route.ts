import { NextResponse } from 'next/server'
import { z } from 'zod'
import { backendFetch } from '@/lib/auth/backend'

const TIPOS = ['pesquisador', 'estudante', 'tecnico_admin', 'externo'] as const
const UFC_TYPES = new Set<(typeof TIPOS)[number]>(['pesquisador', 'estudante', 'tecnico_admin'])

const bodySchema = z.object({
  nome: z.string().min(2),
  email: z.string().email(),
  senha: z.string().min(8),
  tipo_usuario: z.enum(TIPOS),
})

export async function POST(request: Request) {
  let parsed
  try {
    parsed = bodySchema.parse(await request.json())
  } catch {
    return NextResponse.json({ detail: 'Dados inválidos.' }, { status: 400 })
  }

  if (UFC_TYPES.has(parsed.tipo_usuario) && !/@(?:[a-z0-9-]+\.)*ufc\.br$/i.test(parsed.email)) {
    return NextResponse.json(
      { detail: 'Esse tipo de perfil exige e-mail institucional (@ufc.br ou @alu.ufc.br).' },
      { status: 400 },
    )
  }

  const backendRes = await backendFetch('/api/v1/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user: {
        nome: parsed.nome,
        email: parsed.email,
        senha: parsed.senha,
        tipo_usuario: parsed.tipo_usuario,
      },
    }),
  })

  const data = await backendRes.json().catch(() => ({}))
  if (!backendRes.ok) {
    return NextResponse.json(
      { detail: data?.detail ?? 'Falha ao criar conta.' },
      { status: backendRes.status },
    )
  }
  return NextResponse.json({ ok: true, email: parsed.email })
}
