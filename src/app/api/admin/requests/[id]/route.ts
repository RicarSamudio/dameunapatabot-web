import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/server/admin-guard'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminSession()
  if (!auth.ok) {
    console.warn('admin_forbidden', { route: '/api/admin/requests/[id]', status: auth.status })
    return NextResponse.json(auth.body, { status: auth.status })
  }

  const { id } = await params
  const body = await req.json()
  const { status, rejectionReason } = body

  if (!['APPROVED', 'REJECTED'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  if (status === 'REJECTED' && !rejectionReason) {
    return NextResponse.json({ error: 'Rejection reason required' }, { status: 400 })
  }

  const prisma = getPrisma()
  const request = await prisma.request.update({
    where: { id },
    data: {
      status,
      rejectionReason: status === 'REJECTED' ? rejectionReason : null,
      reviewedAt: new Date(),
      reviewedBy: auth.session?.user?.email || 'admin',
    },
  })

  return NextResponse.json(request)
}
