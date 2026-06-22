import { FormType, Status } from '@prisma/client'
import { NextResponse } from 'next/server'
import { getPrisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/server/admin-guard'

const validStatuses = new Set<string>(Object.values(Status))
const validTypes = new Set<string>(Object.values(FormType))

export async function GET(req: Request) {
  const auth = await requireAdminSession()
  if (!auth.ok) {
    console.warn('admin_forbidden', { route: '/api/admin/requests', status: auth.status })
    return NextResponse.json(auth.body, { status: auth.status })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const type = searchParams.get('type')

  const where: Record<string, unknown> = {}
  
  if (status && status !== 'all') {
    if (!validStatuses.has(status)) {
      return NextResponse.json({ error: 'Invalid status filter' }, { status: 400 })
    }
    where.status = status
  }
  
  if (type && type !== 'all') {
    if (!validTypes.has(type)) {
      return NextResponse.json({ error: 'Invalid type filter' }, { status: 400 })
    }
    where.type = type
  }

  const prisma = getPrisma()
  const requests = await prisma.request.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  return NextResponse.json(requests)
}
