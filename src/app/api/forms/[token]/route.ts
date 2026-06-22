import { NextResponse } from 'next/server'
import { getPrisma } from '@/lib/prisma'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const prisma = getPrisma()
  const request = await prisma.request.findUnique({
    where: { token },
    select: {
      token: true,
      type: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      reviewedAt: true,
      rejectionReason: true,
    },
  })

  if (!request) {
    return NextResponse.json({ error: 'Request not found' }, { status: 404 })
  }

  return NextResponse.json({
    token: request.token,
    type: request.type,
    status: request.status,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
    reviewedAt: request.reviewedAt,
    rejectionReason: request.rejectionReason,
  })
}
