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
  randomUUID: () => 'volunteer-token-123',
}))

describe('POST /api/forms/volunteer', () => {
  beforeEach(() => {
    createMock.mockReset()
  })

  it('persists volunteer applications as VOLUNTEER requests', async () => {
    createMock.mockResolvedValue({ id: 'volunteer-req-1' })

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
