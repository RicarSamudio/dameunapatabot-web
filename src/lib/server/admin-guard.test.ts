import { beforeEach, describe, expect, it, vi } from 'vitest'
import { requireAdminSession } from './admin-guard'

const { getServerSessionMock } = vi.hoisted(() => ({
  getServerSessionMock: vi.fn(),
}))

vi.mock('next-auth', () => ({
  getServerSession: getServerSessionMock,
}))

describe('requireAdminSession', () => {
  beforeEach(() => {
    getServerSessionMock.mockReset()
  })

  it('returns 401 when unauthenticated', async () => {
    getServerSessionMock.mockResolvedValue(null)

    const result = await requireAdminSession()
    expect(result).toEqual({ ok: false, status: 401, body: { error: 'Unauthorized' } })
  })

  it('returns 403 for non-admin roles', async () => {
    getServerSessionMock.mockResolvedValue({ user: { email: 'user@example.com', role: 'USER' } })

    const result = await requireAdminSession()
    expect(result).toEqual({ ok: false, status: 403, body: { error: 'Forbidden' } })
  })

  it('returns session data for admin role', async () => {
    getServerSessionMock.mockResolvedValue({ user: { email: 'admin@example.com', role: 'ADMIN' } })

    const result = await requireAdminSession()
    expect(result).toEqual({ ok: true, session: { user: { email: 'admin@example.com', role: 'ADMIN' } } })
  })
})
