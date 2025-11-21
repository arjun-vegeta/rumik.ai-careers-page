import { PrismaClient } from '@prisma/client'

// ============================================
// Database Client Configuration
// ============================================

// Prevents multiple Prisma Client instances in development (hot reloading)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
