import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// For Prisma 7+, pass an adapter/accelerateUrl to the PrismaClient constructor.
// Use a minimal adapter with the DATABASE_URL from env. Use `as any` to
// avoid type errors if local types differ.
const clientOptions: any = {
  adapter: {
    url: process.env.DATABASE_URL || undefined,
  },
}

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient(process.env.NODE_ENV === 'production' ? clientOptions : clientOptions)

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
