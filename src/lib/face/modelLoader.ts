/**
 * Face Model Loading Utilities
 *
 * Handles loading of face-api.js models with retry logic,
 * WebGL detection, and singleton pattern.
 */

import * as faceapi from 'face-api.js';

// Model loading state
let modelsLoaded = false;
let initPromise: Promise<void> | null = null;

// Model URLs
const MODEL_URL = '/models';

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_DELAY = 1000; // 1 second
const MAX_DELAY = 4000; // 4 seconds

/**
 * Check if WebGL is available in the browser
 */
export function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return gl !== null && gl !== undefined;
  } catch (error) {
    console.error('WebGL detection error:', error);
    return false;
  }
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calculate exponential backoff delay
 */
function getBackoffDelay(attempt: number): number {
  const delay = INITIAL_DELAY * Math.pow(2, attempt);
  return Math.min(delay, MAX_DELAY);
}

/**
 * Load face-api.js models with retry logic
 *
 * Implements singleton pattern to prevent duplicate loads.
 * Uses exponential backoff for retries: 1s, 2s, 4s.
 *
 * @throws Error if models fail to load after all retries
 */
export async function loadFaceModels(): Promise<void> {
  // Return immediately if already loaded
  if (modelsLoaded) {
    return;
  }

  // Return existing promise if already initializing
  if (initPromise) {
    return initPromise;
  }

  // Check WebGL availability before attempting to load
  if (!isWebGLAvailable()) {
    throw new Error(
      'WebGL is not supported in this browser. Face detection requires WebGL support.',
    );
  }

  // Create a single initialization promise shared by concurrent callers
  initPromise = (async () => {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        console.log(
          `Loading face models (attempt ${attempt + 1}/${MAX_RETRIES})...`,
        );

        // Load all models in parallel
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);

        console.log('Face models loaded successfully');
        modelsLoaded = true;
        return;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.error(
          `Model loading attempt ${attempt + 1} failed:`,
          lastError,
        );

        // Wait before retrying (except on last attempt)
        if (attempt < MAX_RETRIES - 1) {
          const delay = getBackoffDelay(attempt);
          console.log(`Retrying in ${delay}ms...`);
          await sleep(delay);
        }
      }
    }

    // All retries failed: allow clean retry on next call
    initPromise = null;
    throw new Error(
      `Failed to load face models after ${MAX_RETRIES} attempts. ${lastError?.message || 'Unknown error'}`,
    );
  })();

  return initPromise;
}

/**
 * Check if models are currently loaded
 */
export function areModelsLoaded(): boolean {
  return modelsLoaded;
}

/**
 * Reset loading state (for testing purposes)
 */
export function resetLoadingState(): void {
  modelsLoaded = false;
  initPromise = null;
}
