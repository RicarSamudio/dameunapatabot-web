import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'

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

vi.mock('crypto', async (importOriginal) => ({
  ...await importOriginal<typeof import('crypto')>(),
  randomUUID: () => 'volunteer-token-123',
}))

describe('POST /api/forms/volunteer', () => {
  beforeEach(() => {
    createMock.mockReset()
    findUniqueMock.mockReset()
  })

  it('persists volunteer applications as VOLUNTEER requests', async () => {
    createMock.mockResolvedValue({ id: 'volunteer-req-1', token: 'volunteer-token-123' })

    const req = new Request('http://localhost/api/forms/volunteer', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: 'Carlos Ruiz',
        phone: '0981123456',
        email: 'carlos@example.com',
        areas: ['rescate', 'eventos'],
        availability: 'Sábados de mañana',
        experience: 'Tengo movilidad y experiencia ayudando en jornadas.',
        comments: 'Puedo ayudar en Asunción y alrededores.',
      }),
    })

    const res = await POST(req as never)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toEqual({ token: 'volunteer-token-123', id: 'volunteer-req-1' })
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          token: 'volunteer-token-123',
          type: 'VOLUNTEER',
          status: 'PENDING',
          name: 'Carlos Ruiz',
          phone: '0981123456',
          email: 'carlos@example.com',
          data: expect.objectContaining({
            areas: ['rescate', 'eventos'],
            availability: 'Sábados de mañana',
          }),
          files: [],
        }),
      })
    )
  })

  it('returns the original request when the same idempotency key is replayed', async () => {
    createMock.mockImplementationOnce(async ({ data }) => {
      findUniqueMock.mockResolvedValue({
        id: 'volunteer-existing',
        token: 'existing-tracking-token',
        idempotencyHash: data.idempotencyHash,
      })
      throw { code: 'P2002' }
    })

    const req = new Request('http://localhost/api/forms/volunteer', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'idempotency-key': 'wamid.message-id-123456789',
      },
      body: JSON.stringify({
        name: 'Carlos Ruiz',
        phone: '0981123456',
        email: 'carlos@example.com',
        areas: ['eventos'],
        availability: 'Sábados',
        experience: 'Experiencia ayudando en eventos.',
      }),
    })

    const res = await POST(req as never)
    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({
      token: 'existing-tracking-token',
      id: 'volunteer-existing',
    })
  })

  it('returns 409 when an idempotency key is reused with another payload', async () => {
    createMock.mockImplementationOnce(async () => {
      findUniqueMock.mockResolvedValue({
        id: 'volunteer-existing',
        token: 'existing-tracking-token',
        idempotencyHash: 'different-payload-hash',
      })
      throw { code: 'P2002' }
    })

    const req = new Request('http://localhost/api/forms/volunteer', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'idempotency-key': 'wamid.message-id-123456789',
      },
      body: JSON.stringify({
        name: 'Carlos Ruiz',
        phone: '0981123456',
        email: 'carlos@example.com',
        areas: ['eventos'],
        availability: 'Sábados',
        experience: 'Experiencia ayudando en eventos.',
      }),
    })

    const res = await POST(req as never)
    expect(res.status).toBe(409)
    await expect(res.json()).resolves.toMatchObject({
      error: { code: 'IDEMPOTENCY_CONFLICT' },
    })
  })

  it('rejects invalid volunteer payloads', async () => {
    const req = new Request('http://localhost/api/forms/volunteer', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: 'C',
        phone: '123',
        email: 'bad-email',
        areas: [],
      }),
    })

    const res = await POST(req as never)
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error.code).toBe('FORM_VALIDATION_ERROR')
    expect(createMock).not.toHaveBeenCalled()
  })
})
