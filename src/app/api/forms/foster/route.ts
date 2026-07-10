import { Prisma } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { fosterSubmissionSchema } from '@/lib/server/form-schemas'
import { createIdempotentRequest, idempotencyErrorResponse } from '@/lib/server/idempotent-request'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = fosterSubmissionSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: 'FORM_VALIDATION_ERROR',
            message: 'Invalid foster payload',
            details: parsed.error.flatten(),
          },
        },
        { status: 400 }
      )
    }

    const payload = parsed.data
    const token = randomUUID()
    const requestData: Prisma.JsonObject = {
      housingType: payload.housingType,
      hasPets: payload.hasPets,
      hasChildren: payload.hasChildren,
      availability: payload.availability,
      experience: payload.experience,
      comments: payload.comments || '',
    }

    const request = await createIdempotentRequest(req, {
        token,
        type: 'FOSTER',
        status: 'PENDING',
        name: payload.name,
        phone: payload.phone,
        email: payload.email || null,
        data: requestData,
        files: [],
    })

    return NextResponse.json({ token: request.token, id: request.id })
  } catch (error) {
    const idempotencyResponse = idempotencyErrorResponse(error)
    if (idempotencyResponse) return idempotencyResponse
    console.error('Error creating foster request:', error)
    return NextResponse.json({ error: 'Error creating request' }, { status: 500 })
  }
}
