import { Prisma } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { volunteerSubmissionSchema } from '@/lib/server/form-schemas'
import { createIdempotentRequest, idempotencyErrorResponse } from '@/lib/server/idempotent-request'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = volunteerSubmissionSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: 'FORM_VALIDATION_ERROR',
            message: 'Invalid volunteer payload',
            details: parsed.error.flatten(),
          },
        },
        { status: 400 }
      )
    }

    const payload = parsed.data
    const token = randomUUID()
    const requestData: Prisma.JsonObject = {
      areas: payload.areas,
      availability: payload.availability,
      experience: payload.experience,
      comments: payload.comments || '',
    }

    const request = await createIdempotentRequest(req, {
        token,
        type: 'VOLUNTEER',
        status: 'PENDING',
        name: payload.name,
        phone: payload.phone,
        email: payload.email,
        data: requestData,
        files: [],
    })

    return NextResponse.json({ token: request.token, id: request.id })
  } catch (error) {
    const idempotencyResponse = idempotencyErrorResponse(error)
    if (idempotencyResponse) return idempotencyResponse
    console.error('Error creating volunteer request:', error)
    return NextResponse.json({ error: 'Error creating request' }, { status: 500 })
  }
}
