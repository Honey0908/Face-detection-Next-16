/**
 * Server Instrumentation
 *
 * This file runs once when the Next.js server starts.
 * Used for server initialization tasks like cache warmup.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Server-side initialization
    console.log('🚀 Initializing server...');

    // Warmup descriptor cache
    try {
      const { warmupDescriptorCache } = await import('@/lib/face/matching');
      await warmupDescriptorCache();
    } catch (error) {
      console.error('Failed to warmup cache during initialization:', error);
      // Don't crash server if warmup fails - cache will lazy load on first request
    }

    console.log('✓ Server initialized');
  }
}
