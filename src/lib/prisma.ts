import { PrismaClient } from '@prisma/client'

let prisma: PrismaClient

try {
  prisma = new PrismaClient()
} catch (e) {
  console.error('PrismaClient init failed:', e)
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL || 'postgresql://localhost/postgres',
      },
    },
  })
}

export { prisma }
