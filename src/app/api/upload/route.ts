import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const files = formData.getAll('files') as File[]
    
    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    
    // Create uploads directory if it doesn't exist
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    const uploadedUrls: string[] = []

    for (const file of files) {
      if (file.size === 0) continue
      
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      // Generate unique filename
      const ext = path.extname(file.name)
      const uniqueName = `${randomUUID()}${ext}`
      const filePath = path.join(uploadDir, uniqueName)
      
      await writeFile(filePath, buffer)
      
      // Store public URL
      uploadedUrls.push(`/uploads/${uniqueName}`)
    }

    return NextResponse.json({ 
      success: true, 
      urls: uploadedUrls,
      count: uploadedUrls.length 
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
