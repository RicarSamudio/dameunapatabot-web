import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'

const { createMock, getPrismaMock } = vi.hoisted(() => {
  const create = vi.fn()
  return {
    createMock: create,
    getPrismaMock: vi.fn(() => ({
      request: {
        create,
      },
    })),
  }
})

vi.mock('@/lib/prisma', () => ({
  getPrisma: getPrismaMock,
}))

vi.mock('crypto', () => ({
  randomUUID: () => 'token-123',
}))

describe('POST /api/forms/adoption', () => {
  beforeEach(() => {
    createMock.mockReset()
    getPrismaMock.mockClear()
  })

  it('persists CAT type, canonical email and photos', async () => {
    createMock.mockResolvedValue({ id: 'req-1' })

    const req = new Request('http://localhost/api/forms/adoption', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        type: 'CAT',
        nombreCompleto: 'Ana Perez',
        numeroCelular: '11223344',
        email: 'ana@example.com',
        photos: ['/uploads/a.png'],
      }),
    })

    const res = await POST(req as never)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toEqual({ token: 'token-123', id: 'req-1' })
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          type: 'CAT',
          email: 'ana@example.com',
          files: ['/uploads/a.png'],
        }),
      })
    )
  })

  it('rejects invalid payloads with deterministic validation error', async () => {
    const req = new Request('http://localhost/api/forms/adoption', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        type: 'CAT',
        nombreCompleto: 'Ana Perez',
        numeroCelular: '11223344',
      }),
    })

    const res = await POST(req as never)
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error.code).toBe('FORM_VALIDATION_ERROR')
    expect(createMock).not.toHaveBeenCalled()
  })
})
