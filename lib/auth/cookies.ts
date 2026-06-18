import type { NextResponse } from 'next/server'

export const ACCESS_COOKIE = 'selinka_access'
export const REFRESH_COOKIE = 'selinka_refresh'

const ACCESS_MAX_AGE = 30 * 60
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60

type SetTokensInput = {
  accessToken: string
  refreshToken: string
  rememberMe?: boolean
}

const isProd = process.env.NODE_ENV === 'production'

export function setAuthCookies(res: NextResponse, { accessToken, refreshToken, rememberMe = true }: SetTokensInput) {
  res.cookies.set(ACCESS_COOKIE, accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: ACCESS_MAX_AGE,
  })
  res.cookies.set(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    ...(rememberMe ? { maxAge: REFRESH_MAX_AGE } : {}),
  })
}

export function clearAuthCookies(res: NextResponse) {
  res.cookies.delete(ACCESS_COOKIE)
  res.cookies.delete(REFRESH_COOKIE)
}
