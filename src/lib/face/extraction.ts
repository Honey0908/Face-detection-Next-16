/**
 * Face Descriptor Extraction Utilities
 *
 * Extracts 128-dimensional face descriptors from detected faces.
 * Includes validation, averaging, and serialization utilities.
 */

import * as faceapi from 'face-api.js';

// Descriptor constants
export const DESCRIPTOR_LENGTH = 128;

// Extraction result interface
export interface ExtractionResult {
  success: boolean;
  descriptor?: Float32Array;
  error?: string;
}

/**
 * Extract 128-dimensional face descriptor from image/video
 *
 * Performs face detection with landmarks and descriptor extraction in one pass.
 *
 * @param input - HTML image, video, or canvas element
 * @param options - Detection options (optional)
 * @returns Extraction result with descriptor or error
 */
export async function extractDescriptor(
  input: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
  options?: faceapi.TinyFaceDetectorOptions,
): Promise<ExtractionResult> {
  try {
    // Detect face with landmarks and descriptor
    const detection = await faceapi
      .detectSingleFace(input, options || new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    // Check if face was detected
    if (!detection) {
      return {
        success: false,
        error: 'No face detected in image',
      };
    }

    // Extract descriptor
    const descriptor = detection.descriptor;

    // Validate descriptor
    const validation = validateDescriptor(descriptor);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error || 'Invalid descriptor',
      };
    }

    return {
      success: true,
      descriptor: descriptor,
    };
  } catch (error) {
    console.error('Descriptor extraction error:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Unknown extraction error',
    };
  }
}

/**
 * Validate face descriptor
 *
 * Checks length, NaN/Infinity values, and L2 norm.
 *
 * @param descriptor - Face descriptor to validate
 * @returns Validation result with error message if invalid
 */
export function validateDescriptor(descriptor: Float32Array | number[]): {
  isValid: boolean;
  error?: string;
} {
  // Check length
  if (descriptor.length !== DESCRIPTOR_LENGTH) {
    return {
      isValid: false,
      error: `Invalid descriptor length: ${descriptor.length}, expected ${DESCRIPTOR_LENGTH}`,
    };
  }

  // Check for NaN or Infinity values
  for (let i = 0; i < descriptor.length; i++) {
    const value = descriptor[i];
    if (!isFinite(value)) {
      return {
        isValid: false,
        error: `Invalid value at index ${i}: ${value}`,
      };
    }
  }

  // Calculate L2 norm (should be reasonable, typically close to 1 for normalized descriptors)
  let sumSquares = 0;
  for (let i = 0; i < descriptor.length; i++) {
    sumSquares += descriptor[i] * descriptor[i];
  }
  const norm = Math.sqrt(sumSquares);

  // L2 norm should be reasonable (not too small or too large)
  if (norm < 0.01 || norm > 100) {
    return {
      isValid: false,
      error: `Abnormal L2 norm: ${norm}`,
    };
  }

  return { isValid: true };
}

/**
 * Average multiple face descriptors
 *
 * Computes element-wise mean of 3-5 descriptors.
 * Useful for registration where multiple captures improve accuracy.
 *
 * @param descriptors - Array of face descriptors (3-5 recommended)
 * @returns Averaged descriptor
 * @throws Error if descriptors array is empty or invalid
 */
export function averageDescriptors(descriptors: Float32Array[]): Float32Array {
  if (descriptors.length === 0) {
    throw new Error('Cannot average empty descriptor array');
  }

  // Validate all descriptors first
  for (let i = 0; i < descriptors.length; i++) {
    const validation = validateDescriptor(descriptors[i]);
    if (!validation.isValid) {
      throw new Error(`Invalid descriptor at index ${i}: ${validation.error}`);
    }
  }

  // Initialize result array
  const averaged = new Float32Array(DESCRIPTOR_LENGTH);

  // Sum all descriptors element-wise
  for (const descriptor of descriptors) {
    for (let i = 0; i < DESCRIPTOR_LENGTH; i++) {
      averaged[i] += descriptor[i];
    }
  }

  // Divide by count to get average
  const count = descriptors.length;
  for (let i = 0; i < DESCRIPTOR_LENGTH; i++) {
    averaged[i] /= count;
  }

  return averaged;
}

/**
 * Serialize Float32Array descriptor to regular number array
 *
 * For JSON transmission or database storage.
 *
 * @param descriptor - Face descriptor as Float32Array
 * @returns Regular number array
 */
export function serializeDescriptor(descriptor: Float32Array): number[] {
  return Array.from(descriptor);
}

/**
 * Deserialize number array to Float32Array descriptor
 *
 * For converting from JSON or database back to descriptor.
 *
 * @param descriptor - Face descriptor as number array
 * @returns Float32Array descriptor
 */
export function deserializeDescriptor(descriptor: number[]): Float32Array {
  return new Float32Array(descriptor);
}

/**
 * Normalize descriptor to unit vector (L2 normalization)
 *
 * Some matching algorithms benefit from normalized descriptors.
 *
 * @param descriptor - Face descriptor to normalize
 * @returns Normalized descriptor
 */
export function normalizeDescriptor(descriptor: Float32Array): Float32Array {
  // Calculate L2 norm
  let sumSquares = 0;
  for (let i = 0; i < descriptor.length; i++) {
    sumSquares += descriptor[i] * descriptor[i];
  }
  const norm = Math.sqrt(sumSquares);

  // Avoid division by zero
  if (norm === 0) {
    throw new Error('Cannot normalize zero vector');
  }

  // Normalize
  const normalized = new Float32Array(DESCRIPTOR_LENGTH);
  for (let i = 0; i < descriptor.length; i++) {
    normalized[i] = descriptor[i] / norm;
  }

  return normalized;
}
