import { NextResponse } from 'next/server'
import { assertDebugAccess } from '@/lib/server/debug-guard'

export async function GET(req: Request) {
  const access = assertDebugAccess(req)
  if (!access.ok) {
    console.warn('debug_denied', { route: '/api/debug' })
    return access.response
  }

  return NextResponse.json({
    ok: true,
    NODE_ENV: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  })
}
