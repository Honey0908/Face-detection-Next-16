import { PrismaClient } from '@prisma/client'

// PrismaClient singleton to prevent multiple instances in serverless environments
// In development, we attach the client to the global object to survive hot reloads
// In production, each serverless function gets its own instance

const prismaClientSingleton = () => {
  return new PrismaClient({
    // Prisma 7.x reads DATABASE_URL from process.env automatically
    // Optional: Configure connection pooling via DATABASE_URL query params
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
}

// Global type declaration for TypeScript in development mode
declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton> | undefined
} & typeof global

// Create singleton instance
const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

// In development, attach to global object to prevent multiple instances during hot reload
if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma
}

export default prisma
