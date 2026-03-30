import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

// Direct instantiation for debugging
let debugPrisma: PrismaClient

try {
  debugPrisma = new PrismaClient()
  console.log('PrismaClient created successfully')
} catch (e: any) {
  console.error('PrismaClient creation failed:', e.message)
  debugPrisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL || 'postgresql://localhost/postgres',
      },
    },
  })
}

export async function GET() {
  try {
    const count = await debugPrisma.request.count()
    return NextResponse.json({ 
      success: true, 
      requestCount: count,
      DATABASE_URL_SET: !!process.env.DATABASE_URL,
      NODE_ENV: process.env.NODE_ENV,
    })
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      code: error.code,
      DATABASE_URL_SET: !!process.env.DATABASE_URL,
    }, { status: 500 })
  }
}
