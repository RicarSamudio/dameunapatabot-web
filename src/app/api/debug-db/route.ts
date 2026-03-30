import { NextResponse } from 'next/server'
import { getPrisma } from '@/lib/prisma'

export async function GET() {
  const url = process.env.DATABASE_URL || ''
  
  // Mask password in URL for security
  const maskedUrl = url.replace(/:([^@]+)@/, ':****@')
  
  try {
    const prisma = getPrisma()
    const count = await prisma.request.count()
    return NextResponse.json({ 
      success: true, 
      requestCount: count,
      DATABASE_URL_masked: maskedUrl,
      urlLength: url.length,
    })
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      code: error.code,
      DATABASE_URL_masked: maskedUrl,
      urlLength: url.length,
    }, { status: 500 })
  }
}
