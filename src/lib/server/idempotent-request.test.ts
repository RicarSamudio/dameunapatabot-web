import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createIdempotentRequest,
  IdempotencyConflictError,
} from './idempotent-request'

const createMock = vi.fn()
const findUniqueMock = vi.fn()

vi.mock('@/lib/prisma', () => ({
  getPrisma: () => ({
    request: {
      create: createMock,
      findUnique: findUniqueMock,
    },
  }),
}))

const data = {
  token: 'tracking-token',
  type: 'VOLUNTEER',
  status: 'PENDING',
  name: 'Ana',
  phone: '0981000000',
  email: 'ana@example.com',
  data: { areas: ['eventos'] },
  files: [],
}

const requestWithKey = (key = 'wamid.valid-message-id-123456') => new Request(
  'https://example.test/api/forms/volunteer',
  { method: 'POST', headers: { 'Idempotency-Key': key } }
)

describe('createIdempotentRequest', () => {
  beforeEach(() => {
    createMock.mockReset()
    findUniqueMock.mockReset()
  })

  it('persists a scoped key and payload fingerprint', async () => {
    createMock.mockResolvedValue({ id: 'req-1', token: 'tracking-token' })

    await expect(createIdempotentRequest(requestWithKey(), data as never)).resolves.toEqual({
      id: 'req-1',
      token: 'tracking-token',
    })

    expect(createMock).toHaveBeenCalledWith({
      data: expect.objectContaining({
        idempotencyKey: 'VOLUNTEER:wamid.valid-message-id-123456',
        idempotencyHash: expect.stringMatching(/^[a-f0-9]{64}$/),
      }),
    })
  })

  it('replays across requests even when the route generated a new tracking token', async () => {
    let persisted: Record<string, unknown> | undefined
    createMock
      .mockImplementationOnce(async ({ data: created }) => {
        persisted = created
        return { id: 'req-original', ...created }
      })
      .mockRejectedValueOnce({ code: 'P2002' })
    findUniqueMock.mockImplementation(async () => ({
      id: 'req-original',
      token: 'tracking-token',
      idempotencyHash: persisted?.idempotencyHash,
    }))

    await createIdempotentRequest(requestWithKey(), data as never)
    await expect(createIdempotentRequest(requestWithKey(), {
      ...data,
      token: 'new-random-token-from-retry',
    } as never)).resolves.toMatchObject({
      id: 'req-original',
      token: 'tracking-token',
    })
  })

  it('returns the existing request after a unique-key race', async () => {
    createMock.mockRejectedValue({ code: 'P2002' })
    findUniqueMock.mockResolvedValue({
      id: 'req-existing',
      token: 'existing-token',
      idempotencyHash: expect.anything,
    })

    // Prime the expected fingerprint without relying on its implementation value.
    createMock.mockImplementationOnce(async ({ data: persisted }) => {
      findUniqueMock.mockResolvedValue({
        id: 'req-existing',
        token: 'existing-token',
        idempotencyHash: persisted.idempotencyHash,
      })
      throw { code: 'P2002' }
    })

    await expect(createIdempotentRequest(requestWithKey(), data as never)).resolves.toEqual({
      id: 'req-existing',
      token: 'existing-token',
      idempotencyHash: expect.any(String),
    })
    expect(findUniqueMock).toHaveBeenCalledWith({
      where: { idempotencyKey: 'VOLUNTEER:wamid.valid-message-id-123456' },
    })
  })

  it('rejects reuse of the same key with different data', async () => {
    createMock.mockImplementationOnce(async ({ data: persisted }) => {
      findUniqueMock.mockResolvedValue({
        id: 'req-existing',
        token: 'existing-token',
        idempotencyHash: `${persisted.idempotencyHash}different`,
      })
      throw { code: 'P2002' }
    })

    await expect(createIdempotentRequest(requestWithKey(), data as never)).rejects.toBeInstanceOf(
      IdempotencyConflictError
    )
  })

  it('rejects malformed idempotency keys', async () => {
    await expect(createIdempotentRequest(requestWithKey('short'), data as never)).rejects.toThrow(
      'Invalid Idempotency-Key'
    )
    expect(createMock).not.toHaveBeenCalled()
  })
})
