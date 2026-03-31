import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'
import { giveUpSubmissionSchema } from '@/lib/server/form-schemas'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = giveUpSubmissionSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: 'FORM_VALIDATION_ERROR',
            message: 'Invalid give-up payload',
            details: parsed.error.flatten(),
          },
        },
        { status: 400 }
      )
    }

    const prisma = getPrisma()
    const { name, phone, email, animalType, breed, age, sex, description, photos } = parsed.data

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
        files: photos,
      },
    })

    return NextResponse.json({ token, id: request.id })
  } catch (error) {
    console.error('Error creating give-up request:', error)
    return NextResponse.json({ error: 'Error creating request' }, { status: 500 })
  }
}
