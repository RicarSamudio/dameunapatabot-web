import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'

const createMock = vi.fn()

vi.mock('@/lib/prisma', () => ({
  getPrisma: () => ({
    request: {
      create: createMock,
    },
  }),
}))

vi.mock('crypto', () => ({
  randomUUID: () => 'foster-token-123',
}))

describe('POST /api/forms/foster', () => {
  beforeEach(() => {
    createMock.mockReset()
  })

  it('persists foster applications as FOSTER requests', async () => {
    createMock.mockResolvedValue({ id: 'foster-req-1', token: 'foster-token-123' })

    const req = new Request('http://localhost/api/forms/foster', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: 'Laura Gomez',
        phone: '0981123456',
        email: 'laura@example.com',
        housingType: 'Casa con patio cerrado',
        hasPets: 'Sí, dos perros vacunados',
        hasChildren: 'No',
        availability: 'Hasta 2 meses',
        experience: 'Ya cuidé perros rescatados anteriormente.',
        comments: 'Prefiero cachorros o perros medianos.',
      }),
    })

    const res = await POST(req as never)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toEqual({ token: 'foster-token-123', id: 'foster-req-1' })
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          token: 'foster-token-123',
          type: 'FOSTER',
          status: 'PENDING',
          name: 'Laura Gomez',
          phone: '0981123456',
          email: 'laura@example.com',
          data: expect.objectContaining({
            housingType: 'Casa con patio cerrado',
            availability: 'Hasta 2 meses',
          }),
          files: [],
        }),
      })
    )
  })

  it('rejects invalid foster payloads', async () => {
    const req = new Request('http://localhost/api/forms/foster', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: 'L',
        phone: '123',
      }),
    })

    const res = await POST(req as never)
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error.code).toBe('FORM_VALIDATION_ERROR')
    expect(createMock).not.toHaveBeenCalled()
  })
})
