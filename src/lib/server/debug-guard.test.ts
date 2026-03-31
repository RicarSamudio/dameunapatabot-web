import { afterEach, describe, expect, it, vi } from 'vitest'
import { assertDebugAccess } from './debug-guard'

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('assertDebugAccess', () => {
  it('denies debug access in production', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('DEBUG_API_TOKEN', 'secret-token')

    const request = new Request('http://localhost/api/debug')
    const result = assertDebugAccess(request)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.response.status).toBe(404)
      await expect(result.response.json()).resolves.toEqual({ error: 'Not Found' })
    }
  })

  it('allows access outside production when no token is configured', () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('DEBUG_API_TOKEN', '')

    const request = new Request('http://localhost/api/debug')
    expect(assertDebugAccess(request)).toEqual({ ok: true })
  })

  it('requires a matching debug token when configured', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('DEBUG_API_TOKEN', 'secret-token')

    const withoutToken = assertDebugAccess(new Request('http://localhost/api/debug'))
    expect(withoutToken.ok).toBe(false)
    if (!withoutToken.ok) {
      expect(withoutToken.response.status).toBe(403)
      await expect(withoutToken.response.json()).resolves.toEqual({ error: 'Forbidden' })
    }

    const withToken = assertDebugAccess(
      new Request('http://localhost/api/debug', {
        headers: { 'x-debug-token': 'secret-token' },
      })
    )

    expect(withToken).toEqual({ ok: true })
  })
})
