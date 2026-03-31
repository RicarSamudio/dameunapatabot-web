import { beforeEach, describe, expect, it, vi } from 'vitest'
import { POST } from './route'

const { writeFileMock, mkdirMock, existsSyncMock } = vi.hoisted(() => ({
  writeFileMock: vi.fn(),
  mkdirMock: vi.fn(),
  existsSyncMock: vi.fn(() => true),
}))

vi.mock('fs/promises', () => ({
  writeFile: writeFileMock,
  mkdir: mkdirMock,
}))

vi.mock('fs', () => ({
  existsSync: existsSyncMock,
}))

describe('POST /api/upload', () => {
  beforeEach(() => {
    writeFileMock.mockReset()
    mkdirMock.mockReset()
    existsSyncMock.mockClear()
  })

  it('returns deterministic 4xx for invalid upload type', async () => {
    const formData = new FormData()
    formData.append('files', new File([new Uint8Array([1, 2])], 'bad.exe', { type: 'application/octet-stream' }))

    const req = new Request('http://localhost/api/upload', {
      method: 'POST',
      body: formData,
    })

    const res = await POST(req as never)
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error.code).toBe('UPLOAD_TYPE_NOT_ALLOWED')
    expect(writeFileMock).not.toHaveBeenCalled()
  })

  it('stores valid files and returns uploaded urls', async () => {
    const formData = new FormData()
    formData.append('files', new File([new Uint8Array([1, 2, 3])], 'ok.png', { type: 'image/png' }))

    const req = new Request('http://localhost/api/upload', {
      method: 'POST',
      body: formData,
    })

    const res = await POST(req as never)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.count).toBe(1)
    expect(Array.isArray(body.urls)).toBe(true)
    expect(body.urls[0]).toMatch(/^\/uploads\//)
    expect(writeFileMock).toHaveBeenCalledTimes(1)
  })
})
