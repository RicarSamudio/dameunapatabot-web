import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GET } from './route'

const { findUniqueMock } = vi.hoisted(() => ({
  findUniqueMock: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  getPrisma: () => ({
    request: {
      findUnique: findUniqueMock,
    },
  }),
}))

describe('GET /api/forms/[token]', () => {
  beforeEach(() => {
    findUniqueMock.mockReset()
  })

  it('returns public status fields for a valid token', async () => {
    findUniqueMock.mockResolvedValue({
      token: 'public-token',
      type: 'ADOPTION',
      status: 'PENDING',
      createdAt: new Date('2026-01-02T03:04:05.000Z'),
      updatedAt: new Date('2026-01-03T03:04:05.000Z'),
      reviewedAt: null,
      rejectionReason: null,
      name: 'Private Name',
      phone: '0991',
      email: 'private@example.com',
      data: { private: true },
      files: ['/uploads/private.jpg'],
    })

    const req = new Request('http://localhost/api/forms/public-token')
    const res = await GET(req, { params: Promise.resolve({ token: 'public-token' }) })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(findUniqueMock).toHaveBeenCalledWith({
      where: { token: 'public-token' },
      select: {
        token: true,
        type: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        reviewedAt: true,
        rejectionReason: true,
      },
    })
    expect(body).toEqual({
      token: 'public-token',
      type: 'ADOPTION',
      status: 'PENDING',
      createdAt: '2026-01-02T03:04:05.000Z',
      updatedAt: '2026-01-03T03:04:05.000Z',
      reviewedAt: null,
      rejectionReason: null,
    })
    expect(body.name).toBeUndefined()
    expect(body.phone).toBeUndefined()
    expect(body.email).toBeUndefined()
    expect(body.data).toBeUndefined()
    expect(body.files).toBeUndefined()
  })

  it('returns 404 for an unknown token', async () => {
    findUniqueMock.mockResolvedValue(null)

    const req = new Request('http://localhost/api/forms/missing')
    const res = await GET(req, { params: Promise.resolve({ token: 'missing' }) })
    const body = await res.json()

    expect(res.status).toBe(404)
    expect(body).toEqual({ error: 'Request not found' })
  })
})
