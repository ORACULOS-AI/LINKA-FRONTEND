import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { backendFetch } from '@/lib/auth/backend'
import { ACCESS_COOKIE } from '@/lib/auth/cookies'

type Ctx = { params: Promise<{ path: string[] }> }

async function proxy(req: NextRequest, { params }: Ctx, method: string) {
  const { path } = await params
  const store = await cookies()
  const accessToken = store.get(ACCESS_COOKIE)?.value
  if (!accessToken) {
    return NextResponse.json({ detail: 'Não autenticado.' }, { status: 401 })
  }

  const search = req.nextUrl.search
  const url = `/api/v1/${path.join('/')}${search}`

  const headers: Record<string, string> = { Accept: 'application/json' }
  const ct = req.headers.get('content-type')
  if (ct) headers['Content-Type'] = ct

  let body: BodyInit | undefined
  if (method !== 'GET' && method !== 'DELETE') {
    body = await req.text()
    if (!body) body = undefined
  }

  const backendRes = await backendFetch(url, { method, accessToken, headers, body })
  const text = await backendRes.text()
  const isJson = backendRes.headers.get('content-type')?.includes('application/json')
  return new NextResponse(text || null, {
    status: backendRes.status,
    headers: isJson ? { 'content-type': 'application/json' } : undefined,
  })
}

export async function GET(req: NextRequest, ctx: Ctx)    { return proxy(req, ctx, 'GET') }
export async function POST(req: NextRequest, ctx: Ctx)   { return proxy(req, ctx, 'POST') }
export async function PUT(req: NextRequest, ctx: Ctx)    { return proxy(req, ctx, 'PUT') }
export async function PATCH(req: NextRequest, ctx: Ctx)  { return proxy(req, ctx, 'PATCH') }
export async function DELETE(req: NextRequest, ctx: Ctx) { return proxy(req, ctx, 'DELETE') }
