import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import {
  buildStoredFilename,
  UploadPolicyError,
  validateUploadBatch,
} from '@/lib/server/upload-policy'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const files = formData
      .getAll('files')
      .filter((file): file is File => file instanceof File)

    validateUploadBatch(files)

    const uploadDir = path.join(process.cwd(), 'public', 'uploads')

    // Create uploads directory if it doesn't exist
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    const uploadedUrls: string[] = []

    for (const file of files) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const uniqueName = buildStoredFilename(file.name)
      const filePath = path.join(uploadDir, uniqueName)

      await writeFile(filePath, buffer)

      // Store public URL
      uploadedUrls.push(`/uploads/${uniqueName}`)
    }

    return NextResponse.json({
      success: true,
      urls: uploadedUrls,
      count: uploadedUrls.length,
    })
  } catch (error) {
    if (error instanceof UploadPolicyError) {
      console.warn('upload_rejected', {
        code: error.code,
        details: error.details,
      })
      return NextResponse.json(
        {
          error: {
            code: error.code,
            message: error.message,
            details: error.details,
          },
        },
        { status: error.status }
      )
    }

    console.error('Upload error:', error)
    return NextResponse.json(
      {
        error: {
          code: 'UPLOAD_INTERNAL_ERROR',
          message: 'Upload failed',
        },
      },
      { status: 500 }
    )
  }
}
