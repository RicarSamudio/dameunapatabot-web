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
  randomUUID: () => 'token-456',
}))

describe('POST /api/forms/give-up', () => {
  beforeEach(() => {
    createMock.mockReset()
  })

  it('persists uploaded photos into files', async () => {
    createMock.mockResolvedValue({ id: 'req-2' })

    const req = new Request('http://localhost/api/forms/give-up', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: 'Juan Perez',
        phone: '11998877',
        email: '',
        animalType: 'DOG',
        breed: 'Mestizo',
        age: '2',
        sex: 'M',
        description: 'Tiene buen comportamiento y necesita hogar.',
        photos: ['/uploads/one.jpg', '/uploads/two.jpg'],
      }),
    })

    const res = await POST(req as never)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toEqual({ token: 'token-456', id: 'req-2' })
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          files: ['/uploads/one.jpg', '/uploads/two.jpg'],
        }),
      })
    )
  })
})
