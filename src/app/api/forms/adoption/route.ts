import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { FormType } from '@prisma/client'
import { adoptionSubmissionSchema } from '@/lib/server/form-schemas'
import { createIdempotentRequest, idempotencyErrorResponse } from '@/lib/server/idempotent-request'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = adoptionSubmissionSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: 'FORM_VALIDATION_ERROR',
            message: 'Invalid adoption payload',
            details: parsed.error.flatten(),
          },
        },
        { status: 400 }
      )
    }

    const payload = parsed.data
    const token = randomUUID()

    const request = await createIdempotentRequest(req, {
        token,
        type: payload.type as unknown as FormType,
        status: 'PENDING',
        name: payload.nombreCompleto,
        phone: payload.numeroCelular,
        email: payload.email,
        data: payload,
        files: payload.photos,
    })

    return NextResponse.json({ token: request.token, id: request.id })
  } catch (error) {
    const idempotencyResponse = idempotencyErrorResponse(error)
    if (idempotencyResponse) return idempotencyResponse
    console.error('Error creating adoption request:', error)
    return NextResponse.json({ error: 'Error creating request' }, { status: 500 })
  }
}
