import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'

export async function GET() {
  try {
    const filePath = join(process.cwd(), 'public', 'INFORME_CITOLOGICO_Bella.pdf')
    const fileBuffer = await readFile(filePath)
    
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="INFORME_CITOLOGICO_Bella.pdf"',
        'Content-Length': String(fileBuffer.length),
      },
    })
  } catch {
    return NextResponse.json(
      { error: 'File not found' },
      { status: 404 }
    )
  }
}