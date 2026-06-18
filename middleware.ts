import { NextResponse, type NextRequest } from 'next/server'
import { ACCESS_COOKIE, REFRESH_COOKIE } from '@/lib/auth/cookies'

const PROTECTED = [
  '/smoke',
  '/feed',
  '/onboarding',
  '/perfil',
  '/mensagens',
  '/conexoes',
  '/notificacoes',
  '/admin',
]

const AUTH_ROUTES = ['/entrar', '/verificar-email', '/esqueci-senha', '/resetar-senha']

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  const access = request.cookies.get(ACCESS_COOKIE)?.value
  const refresh = request.cookies.get(REFRESH_COOKIE)?.value
  const isAuthed = Boolean(access || refresh)

  const isProtected = PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`))
  const isAuthRoute = AUTH_ROUTES.some((p) => pathname === p || pathname.startsWith(`${p}/`))

  if (isProtected && !isAuthed) {
    const url = request.nextUrl.clone()
    url.pathname = '/entrar'
    url.searchParams.set('next', pathname + (search || ''))
    return NextResponse.redirect(url)
  }

  if (isAuthRoute && isAuthed && pathname !== '/verificar-email') {
    const url = request.nextUrl.clone()
    url.pathname = '/feed'
    url.search = ''
    return NextResponse.redirect(url)
  }

  if (pathname === '/' && isAuthed) {
    const url = request.nextUrl.clone()
    url.pathname = '/feed'
    url.search = ''
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next|favicon.ico|selinka|fonts|.*\\..*).*)'],
}
