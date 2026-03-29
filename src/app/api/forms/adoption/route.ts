import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    const token = randomUUID()
    
    // Determine type based on the type field or default to DOG
    const type = body.type === 'CAT' ? 'GIVE_UP' : 'ADOPTION'
    
    const request = await prisma.request.create({
      data: {
        token,
        type: type,
        status: 'PENDING',
        name: body.nombreCompleto,
        phone: body.numeroCelular,
        email: body.instagramFacebook || null,
        data: body,
        files: [],
      },
    })
    
    return NextResponse.json({ token, id: request.id })
  } catch (error) {
    console.error('Error creating adoption request:', error)
    return NextResponse.json({ error: 'Error creating request' }, { status: 500 })
  }
}
