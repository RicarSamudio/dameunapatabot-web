import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { giveUpSubmissionSchema } from '@/lib/server/form-schemas'
import { createIdempotentRequest, idempotencyErrorResponse } from '@/lib/server/idempotent-request'

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

    const { name, phone, email, animalType, breed, age, sex, description, photos } = parsed.data

    const token = randomUUID()

    const request = await createIdempotentRequest(req, {
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
    })

    return NextResponse.json({ token: request.token, id: request.id })
  } catch (error) {
    const idempotencyResponse = idempotencyErrorResponse(error)
    if (idempotencyResponse) return idempotencyResponse
    console.error('Error creating give-up request:', error)
    return NextResponse.json({ error: 'Error creating request' }, { status: 500 })
  }
}
