import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'
import { FormType } from '@prisma/client'
import { adoptionSubmissionSchema } from '@/lib/server/form-schemas'

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
    const prisma = getPrisma()

    const token = randomUUID()

    const request = await prisma.request.create({
      data: {
        token,
        type: payload.type as unknown as FormType,
        status: 'PENDING',
        name: payload.nombreCompleto,
        phone: payload.numeroCelular,
        email: payload.email,
        data: payload,
        files: payload.photos,
      },
    })

    return NextResponse.json({ token, id: request.id })
  } catch (error) {
    console.error('Error creating adoption request:', error)
    return NextResponse.json({ error: 'Error creating request' }, { status: 500 })
  }
}
