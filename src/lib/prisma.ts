import { PrismaClient } from '@prisma/client'

let prisma: PrismaClient | undefined

export function getPrisma(): PrismaClient {
  if (!prisma) {
    // @ts-ignore - Prisma 5 supports datasourceUrl option
    prisma = new PrismaClient({
      datasourceUrl: process.env.DATABASE_URL
    })
  }
  return prisma
}
