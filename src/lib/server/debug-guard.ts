import { NextResponse } from 'next/server'

export function assertDebugAccess(request: Request): { ok: true } | { ok: false; response: NextResponse } {
  if (process.env.NODE_ENV === 'production') {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Not Found' }, { status: 404 }),
    }
  }

  const configuredToken = process.env.DEBUG_API_TOKEN
  if (!configuredToken) {
    return { ok: true }
  }

  const requestToken = request.headers.get('x-debug-token')
  if (requestToken !== configuredToken) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    }
  }

  return { ok: true }
}
