import { PrismaClient } from '@prisma/client';

// PrismaClient singleton to prevent multiple instances in serverless environments
// In development, we attach the client to the global object to survive hot reloads
// In production, each serverless function gets its own instance

const prismaClientSingleton = () => {
  return new PrismaClient({
    // Prisma 7.x reads DATABASE_URL from process.env automatically
    // Optional: Configure connection pooling via DATABASE_URL query params
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });
};

const KEEP_ALIVE_INTERVAL_MS = 4 * 60 * 1000;

// Global type declaration for TypeScript in development mode
declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton> | undefined;
  prismaKeepAliveInterval: NodeJS.Timeout | undefined;
} & typeof global;

// Create singleton instance
const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

// In development, attach to global object to prevent multiple instances during hot reload
if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}

// Keep connections warm in long-running runtimes to avoid idle close spikes.
if (process.env.NODE_ENV !== 'test' && !globalThis.prismaKeepAliveInterval) {
  globalThis.prismaKeepAliveInterval = setInterval(async () => {
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown keep-alive error';
      console.warn('[prisma] Keep-alive query failed', { message });
    }
  }, KEEP_ALIVE_INTERVAL_MS);

  // Avoid keeping Node process alive because of the keep-alive timer.
  globalThis.prismaKeepAliveInterval.unref?.();
}

export default prisma;
