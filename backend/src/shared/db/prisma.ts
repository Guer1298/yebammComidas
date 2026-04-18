import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

if (!process.env.DATABASE_URL) {
  throw new Error('Falta DATABASE_URL en el entorno. Revisa tu archivo .env')
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined
}

const createPrismaClient = () =>
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['warn', 'error'],
  })

export const prisma = global.__prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma
}