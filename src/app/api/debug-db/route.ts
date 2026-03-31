import { NextResponse } from 'next/server'
import { getPrisma } from '@/lib/prisma'
import { assertDebugAccess } from '@/lib/server/debug-guard'

export async function GET(req: Request) {
  const access = assertDebugAccess(req)
  if (!access.ok) {
    console.warn('debug_denied', { route: '/api/debug-db' })
    return access.response
  }

  try {
    const prisma = getPrisma()
    const count = await prisma.request.count()
    return NextResponse.json({
      success: true,
      requestCount: count,
      timestamp: new Date().toISOString(),
    })
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: 'Unable to fetch request count',
      },
      { status: 500 }
    )
  }
}
