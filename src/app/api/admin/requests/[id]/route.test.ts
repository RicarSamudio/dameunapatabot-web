import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GET } from './route'

const { requireAdminSessionMock, findUniqueMock } = vi.hoisted(() => ({
  requireAdminSessionMock: vi.fn(),
  findUniqueMock: vi.fn(),
}))

vi.mock('@/lib/server/admin-guard', () => ({
  requireAdminSession: requireAdminSessionMock,
}))

vi.mock('@/lib/prisma', () => ({
  getPrisma: () => ({
    request: {
      findUnique: findUniqueMock,
    },
  }),
}))

describe('GET /api/admin/requests/[id]', () => {
  beforeEach(() => {
    requireAdminSessionMock.mockReset()
    findUniqueMock.mockReset()
  })

  it('returns 401 when no session is present', async () => {
    requireAdminSessionMock.mockResolvedValue({
      ok: false,
      status: 401,
      body: { error: 'Unauthorized' },
    })

    const req = new Request('http://localhost/api/admin/requests/r1')
    const res = await GET(req, { params: Promise.resolve({ id: 'r1' }) })
    const body = await res.json()

    expect(res.status).toBe(401)
    expect(body).toEqual({ error: 'Unauthorized' })
    expect(findUniqueMock).not.toHaveBeenCalled()
  })

  it('returns one request for admin users', async () => {
    requireAdminSessionMock.mockResolvedValue({
      ok: true,
      session: { user: { email: 'admin@example.com', role: 'ADMIN' } },
    })
    findUniqueMock.mockResolvedValue({ id: 'r1', name: 'Ada' })

    const req = new Request('http://localhost/api/admin/requests/r1')
    const res = await GET(req, { params: Promise.resolve({ id: 'r1' }) })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toEqual({ id: 'r1', name: 'Ada' })
    expect(findUniqueMock).toHaveBeenCalledWith({ where: { id: 'r1' } })
  })

  it('returns 404 when the request does not exist', async () => {
    requireAdminSessionMock.mockResolvedValue({
      ok: true,
      session: { user: { email: 'admin@example.com', role: 'ADMIN' } },
    })
    findUniqueMock.mockResolvedValue(null)

    const req = new Request('http://localhost/api/admin/requests/missing')
    const res = await GET(req, { params: Promise.resolve({ id: 'missing' }) })
    const body = await res.json()

    expect(res.status).toBe(404)
    expect(body).toEqual({ error: 'Request not found' })
  })
})
