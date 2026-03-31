import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })

  if (!token) {
    const loginUrl = new URL('/admin/login', request.url)
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (token.role !== 'ADMIN') {
    const loginUrl = new URL('/admin/login', request.url)
    loginUrl.searchParams.set('error', 'forbidden')
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/dashboard/:path*', '/admin/solicitud/:path*'],
}
