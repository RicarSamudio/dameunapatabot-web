import { describe, expect, it } from 'vitest'
import {
  buildStoredFilename,
  sanitizeOriginalName,
  UploadPolicyError,
  validateUploadBatch,
  validateUploadFile,
} from './upload-policy'

const makeFile = (name: string, type = 'image/png', size = 1): File => {
  const data = new Uint8Array(size)
  return new File([data], name, { type })
}

describe('upload-policy', () => {
  it('rejects empty uploads with deterministic code', () => {
    expect(() => validateUploadBatch([])).toThrowError(
      expect.objectContaining({ code: 'UPLOAD_NO_FILES' } satisfies Partial<UploadPolicyError>)
    )
  })

  it('accepts a valid file and batch', () => {
    const valid = makeFile('cat-photo.png', 'image/png', 1024)

    expect(() => validateUploadFile(valid)).not.toThrow()
    expect(() => validateUploadBatch([valid])).not.toThrow()
  })

  it('rejects invalid type/extension combinations', () => {
    const invalid = makeFile('shell.exe', 'application/octet-stream', 10)

    expect(() => validateUploadFile(invalid)).toThrowError(
      expect.objectContaining({ code: 'UPLOAD_TYPE_NOT_ALLOWED' } satisfies Partial<UploadPolicyError>)
    )
  })

  it('rejects oversized files', () => {
    const overLimit = makeFile('large.jpg', 'image/jpeg', 5 * 1024 * 1024 + 1)

    expect(() => validateUploadFile(overLimit)).toThrowError(
      expect.objectContaining({ code: 'UPLOAD_FILE_TOO_LARGE' } satisfies Partial<UploadPolicyError>)
    )
  })

  it('sanitizes incoming names and preserves extension in stored name', () => {
    expect(sanitizeOriginalName('../My Fancy@Cat!!.png')).toBe('My_Fancy_Cat_')

    const stored = buildStoredFilename('cat.png')
    expect(stored.endsWith('.png')).toBe(true)
  })
})
