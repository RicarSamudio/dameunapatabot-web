import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GET } from './route'

const { requireAdminSessionMock, findManyMock } = vi.hoisted(() => ({
  requireAdminSessionMock: vi.fn(),
  findManyMock: vi.fn(),
}))

vi.mock('@/lib/server/admin-guard', () => ({
  requireAdminSession: requireAdminSessionMock,
}))

vi.mock('@/lib/prisma', () => ({
  getPrisma: () => ({
    request: {
      findMany: findManyMock,
    },
  }),
}))

describe('GET /api/admin/requests', () => {
  beforeEach(() => {
    requireAdminSessionMock.mockReset()
    findManyMock.mockReset()
  })

  it('returns 401 when no session is present', async () => {
    requireAdminSessionMock.mockResolvedValue({
      ok: false,
      status: 401,
      body: { error: 'Unauthorized' },
    })

    const req = new Request('http://localhost/api/admin/requests')
    const res = await GET(req)
    const body = await res.json()

    expect(res.status).toBe(401)
    expect(body).toEqual({ error: 'Unauthorized' })
  })

  it('returns 403 for non-admin users', async () => {
    requireAdminSessionMock.mockResolvedValue({
      ok: false,
      status: 403,
      body: { error: 'Forbidden' },
    })

    const req = new Request('http://localhost/api/admin/requests')
    const res = await GET(req)
    const body = await res.json()

    expect(res.status).toBe(403)
    expect(body).toEqual({ error: 'Forbidden' })
  })

  it('returns records for admin users', async () => {
    requireAdminSessionMock.mockResolvedValue({
      ok: true,
      session: { user: { email: 'admin@example.com', role: 'ADMIN' } },
    })
    findManyMock.mockResolvedValue([{ id: 'r1' }])

    const req = new Request('http://localhost/api/admin/requests?status=all&type=all')
    const res = await GET(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toEqual([{ id: 'r1' }])
  })
})
