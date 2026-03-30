import { PrismaClient } from '@prisma/client'

let _prisma: PrismaClient | undefined

export function getPrisma(): PrismaClient {
  if (!_prisma) {
    // Call without arguments - Prisma reads DATABASE_URL from environment
    _prisma = new PrismaClient()
  }
  return _prisma
}
