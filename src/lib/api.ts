/**
 * API Utilities
 *
 * Utilities for making API requests with retry logic, error handling,
 * and timeout management.
 */

interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  timeout?: number;
  retryableStatuses?: number[];
}

interface FetchWithRetryOptions extends RequestInit {
  retryOptions?: RetryOptions;
}

const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffFactor: 2, // Exponential backoff
  timeout: 30000, // 30 seconds
  retryableStatuses: [408, 429, 500, 502, 503, 504], // HTTP status codes to retry
};

/**
 * Check if error is retryable
 */
function isRetryableError(error: unknown, status?: number): boolean {
  // Network errors are retryable
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true;
  }

  // Timeout errors are retryable
  if (error instanceof Error && error.name === 'AbortError') {
    return true;
  }

  // Check HTTP status codes
  if (status !== undefined) {
    return DEFAULT_RETRY_OPTIONS.retryableStatuses.includes(status);
  }

  return false;
}

/**
 * Calculate delay for exponential backoff
 */
function calculateDelay(
  attemptNumber: number,
  initialDelay: number,
  maxDelay: number,
  backoffFactor: number,
): number {
  const delay = initialDelay * Math.pow(backoffFactor, attemptNumber - 1);
  return Math.min(delay, maxDelay);
}

/**
 * Wait for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch with timeout
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Fetch with automatic retry on network errors
 *
 * Retries failed requests with exponential backoff for:
 * - Network errors (connection issues)
 * - Timeout errors
 * - Specific HTTP status codes (408, 429, 500, 502, 503, 504)
 *
 * @param url - URL to fetch
 * @param options - Fetch options with optional retry configuration
 * @returns Promise resolving to Response
 *
 * @example
 * ```typescript
 * const response = await fetchWithRetry('/api/lunch', {
 *   method: 'POST',
 *   body: JSON.stringify({ faceDescriptor: [...] }),
 *   retryOptions: {
 *     maxRetries: 3,
 *     initialDelay: 1000,
 *   }
 * })
 * ```
 */
export async function fetchWithRetry(
  url: string,
  options: FetchWithRetryOptions = {},
): Promise<Response> {
  const { retryOptions, ...fetchOptions } = options;
  const config = { ...DEFAULT_RETRY_OPTIONS, ...retryOptions };

  let lastError: Error | null = null;
  let lastStatus: number | undefined;

  for (let attempt = 1; attempt <= config.maxRetries + 1; attempt++) {
    try {
      // Make the request with timeout
      const response = await fetchWithTimeout(
        url,
        fetchOptions,
        config.timeout,
      );

      // Check if response status is retryable
      if (!response.ok && isRetryableError(null, response.status)) {
        lastStatus = response.status;

        // Don't retry on last attempt
        if (attempt <= config.maxRetries) {
          const delay = calculateDelay(
            attempt,
            config.initialDelay,
            config.maxDelay,
            config.backoffFactor,
          );

          console.warn(
            `Request failed with status ${response.status}. Retrying in ${delay}ms (attempt ${attempt}/${config.maxRetries + 1})...`,
          );

          await sleep(delay);
          continue;
        }
      }

      // Return successful response or non-retryable error
      return response;
    } catch (error) {
      lastError = error as Error;

      // Check if error is retryable
      if (isRetryableError(error, lastStatus)) {
        // Don't retry on last attempt
        if (attempt <= config.maxRetries) {
          const delay = calculateDelay(
            attempt,
            config.initialDelay,
            config.maxDelay,
            config.backoffFactor,
          );

          console.warn(
            `Request failed: ${lastError.message}. Retrying in ${delay}ms (attempt ${attempt}/${config.maxRetries + 1})...`,
          );

          await sleep(delay);
          continue;
        }
      }

      // Non-retryable error, throw immediately
      throw error;
    }
  }

  // All retries exhausted
  if (lastError) {
    throw new Error(
      `Request failed after ${config.maxRetries + 1} attempts: ${lastError.message}`,
    );
  }

  throw new Error(`Request failed after ${config.maxRetries + 1} attempts`);
}

/**
 * Type-safe API request helper
 */
export async function apiRequest<T = unknown>(
  url: string,
  options: FetchWithRetryOptions = {},
): Promise<T> {
  const response = await fetchWithRetry(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error ||
        errorData.message ||
        `API request failed with status ${response.status}`,
    );
  }

  return response.json();
}

/**
 * POST request with retry
 */
export async function apiPost<T = unknown>(
  url: string,
  data: unknown,
  options: FetchWithRetryOptions = {},
): Promise<T> {
  return apiRequest<T>(url, {
    method: 'POST',
    body: JSON.stringify(data),
    ...options,
  });
}

/**
 * GET request with retry
 */
export async function apiGet<T = unknown>(
  url: string,
  options: FetchWithRetryOptions = {},
): Promise<T> {
  return apiRequest<T>(url, {
    method: 'GET',
    ...options,
  });
}
