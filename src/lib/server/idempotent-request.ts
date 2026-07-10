import { createHash } from 'node:crypto'
import type { Prisma } from '@prisma/client'
import { getPrisma } from '@/lib/prisma'

const IDEMPOTENCY_KEY_PATTERN = /^[A-Za-z0-9._:-]{16,128}$/

const canonicalize = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(canonicalize)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, entry]) => [key, canonicalize(entry)])
    )
  }
  return value
}

const fingerprint = (data: Prisma.RequestUncheckedCreateInput): string => {
  const payload = { ...data } as Record<string, unknown>
  delete payload.token
  delete payload.idempotencyKey
  delete payload.idempotencyHash

  return createHash('sha256')
    .update(JSON.stringify(canonicalize(payload)))
    .digest('hex')
}

export class InvalidIdempotencyKeyError extends Error {
  constructor() {
    super('Invalid Idempotency-Key')
    this.name = 'InvalidIdempotencyKeyError'
  }
}

export class IdempotencyConflictError extends Error {
  constructor() {
    super('Idempotency-Key was already used with a different payload')
    this.name = 'IdempotencyConflictError'
  }
}

const isUniqueConstraintError = (error: unknown): boolean => (
  typeof error === 'object'
  && error !== null
  && 'code' in error
  && error.code === 'P2002'
)

export async function createIdempotentRequest(
  request: Request,
  data: Prisma.RequestUncheckedCreateInput
) {
  const prisma = getPrisma()
  const rawKey = request.headers.get('idempotency-key')?.trim()

  if (!rawKey) {
    return prisma.request.create({ data })
  }
  if (!IDEMPOTENCY_KEY_PATTERN.test(rawKey)) {
    throw new InvalidIdempotencyKeyError()
  }

  const scopedKey = `${data.type}:${rawKey}`
  const payloadHash = fingerprint(data)

  try {
    return await prisma.request.create({
      data: {
        ...data,
        idempotencyKey: scopedKey,
        idempotencyHash: payloadHash,
      },
    })
  } catch (error) {
    if (!isUniqueConstraintError(error)) throw error

    const existing = await prisma.request.findUnique({
      where: { idempotencyKey: scopedKey },
    })
    if (!existing) throw error
    if (existing.idempotencyHash !== payloadHash) {
      throw new IdempotencyConflictError()
    }
    return existing
  }
}

export const idempotencyErrorResponse = (error: unknown): Response | null => {
  if (error instanceof InvalidIdempotencyKeyError) {
    return Response.json({
      error: {
        code: 'INVALID_IDEMPOTENCY_KEY',
        message: error.message,
      },
    }, { status: 400 })
  }
  if (error instanceof IdempotencyConflictError) {
    return Response.json({
      error: {
        code: 'IDEMPOTENCY_CONFLICT',
        message: error.message,
      },
    }, { status: 409 })
  }
  return null
}
