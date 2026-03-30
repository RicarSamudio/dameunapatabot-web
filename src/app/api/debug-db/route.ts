import { NextResponse } from 'next/server'
import { getPrisma } from '@/lib/prisma'

export async function GET() {
  try {
    const prisma = getPrisma()
    const count = await prisma.request.count()
    return NextResponse.json({ 
      success: true, 
      requestCount: count,
      DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'UNDEFINED'
    })
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      code: error.code,
      DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'UNDEFINED'
    }, { status: 500 })
  }
}
