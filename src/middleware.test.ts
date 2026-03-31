import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { middleware } from './middleware'

const { getTokenMock } = vi.hoisted(() => ({
  getTokenMock: vi.fn(),
}))

vi.mock('next-auth/jwt', () => ({
  getToken: getTokenMock,
}))

describe('admin middleware', () => {
  beforeEach(() => {
    getTokenMock.mockReset()
  })

  it('redirects anonymous users to login', async () => {
    getTokenMock.mockResolvedValue(null)
    const req = new NextRequest('http://localhost/admin/dashboard')

    const res = await middleware(req)
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('/admin/login')
  })

  it('redirects non-admin users to login with forbidden error', async () => {
    getTokenMock.mockResolvedValue({ role: 'USER' })
    const req = new NextRequest('http://localhost/admin/dashboard')

    const res = await middleware(req)
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('error=forbidden')
  })

  it('allows admin users through', async () => {
    getTokenMock.mockResolvedValue({ role: 'ADMIN' })
    const req = new NextRequest('http://localhost/admin/dashboard')

    const res = await middleware(req)
    expect(res.headers.get('x-middleware-next')).toBe('1')
  })
})
