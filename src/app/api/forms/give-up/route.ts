import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, phone, email, animalType, breed, age, sex, description } = body
    
    const token = randomUUID()
    
    const request = await prisma.request.create({
      data: {
        token,
        type: 'GIVE_UP',
        status: 'PENDING',
        name,
        phone,
        email: email || null,
        data: {
          animalType,
          breed,
          age,
          sex,
          description,
        },
        files: [],
      },
    })
    
    return NextResponse.json({ token, id: request.id })
  } catch (error) {
    console.error('Error creating give-up request:', error)
    return NextResponse.json({ error: 'Error creating request' }, { status: 500 })
  }
}
