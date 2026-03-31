import path from 'path'
import { randomUUID } from 'crypto'

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024
const MAX_FILES_PER_REQUEST = 10

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
])

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif'])

export type UploadErrorCode =
  | 'UPLOAD_NO_FILES'
  | 'UPLOAD_FILE_TOO_LARGE'
  | 'UPLOAD_TYPE_NOT_ALLOWED'
  | 'UPLOAD_INVALID_NAME'

export class UploadPolicyError extends Error {
  readonly code: UploadErrorCode
  readonly status: number
  readonly details?: Record<string, unknown>

  constructor(code: UploadErrorCode, message: string, details?: Record<string, unknown>) {
    super(message)
    this.code = code
    this.status = 400
    this.details = details
  }
}

export function validateUploadBatch(files: File[]): void {
  if (!files.length) {
    throw new UploadPolicyError('UPLOAD_NO_FILES', 'No files provided')
  }

  if (files.length > MAX_FILES_PER_REQUEST) {
    throw new UploadPolicyError('UPLOAD_FILE_TOO_LARGE', 'Too many files in one request', {
      maxFiles: MAX_FILES_PER_REQUEST,
    })
  }

  for (const file of files) {
    validateUploadFile(file)
  }
}

export function validateUploadFile(file: File): void {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new UploadPolicyError('UPLOAD_FILE_TOO_LARGE', 'File exceeds size limit', {
      name: file.name,
      maxBytes: MAX_FILE_SIZE_BYTES,
      size: file.size,
    })
  }

  const extension = path.extname(file.name).toLowerCase()
  if (!extension || !ALLOWED_EXTENSIONS.has(extension) || !ALLOWED_MIME_TYPES.has(file.type)) {
    throw new UploadPolicyError('UPLOAD_TYPE_NOT_ALLOWED', 'File type is not allowed', {
      name: file.name,
      mimeType: file.type,
      extension,
    })
  }

  sanitizeOriginalName(file.name)
}

export function sanitizeOriginalName(name: string): string {
  const normalized = path.basename(name).normalize('NFKC')
  const [baseName, ...rest] = normalized.split('.')

  if (!baseName || rest.length === 0) {
    throw new UploadPolicyError('UPLOAD_INVALID_NAME', 'Invalid filename', { name })
  }

  const sanitized = baseName.replace(/[^a-zA-Z0-9_-]/g, '_').replace(/_+/g, '_').trim()

  if (!sanitized) {
    throw new UploadPolicyError('UPLOAD_INVALID_NAME', 'Invalid filename', { name })
  }

  return sanitized
}

export function buildStoredFilename(originalName: string): string {
  sanitizeOriginalName(originalName)
  const extension = path.extname(originalName).toLowerCase()
  return `${randomUUID()}${extension}`
}
