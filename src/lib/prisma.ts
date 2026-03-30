import { PrismaClient } from '@prisma/client'

let prisma: PrismaClient | undefined

export function getPrisma(): PrismaClient {
  if (!prisma) {
    // Prisma 7 requires URL passed directly in constructor
    prisma = new PrismaClient({
      datasourceUrl: process.env.DATABASE_URL,
    })
  }
  return prisma
}
