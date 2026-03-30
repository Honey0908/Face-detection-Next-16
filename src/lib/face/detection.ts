/**
 * Face Detection Utilities
 *
 * Real-time face detection using TinyFaceDetector with
 * confidence scoring and state management.
 */

import * as faceapi from 'face-api.js';

// Detection state enum
export enum DetectionState {
  IDLE = 'idle',
  DETECTING = 'detecting',
  FACE_FOUND = 'face_found',
  NO_FACE = 'no_face',
  MULTIPLE_FACES = 'multiple_faces',
  TIMEOUT = 'timeout',
  ERROR = 'error',
}

// Detection result interface
export interface DetectionResult {
  state: DetectionState;
  detection?: faceapi.FaceDetection;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  confidence?: number;
  error?: string;
}

// Detection options
export interface DetectionOptions {
  inputSize?: 128 | 160 | 224 | 320 | 416 | 512 | 608;
  scoreThreshold?: number;
  timeout?: number;
}

// Default options
const DEFAULT_OPTIONS: Required<DetectionOptions> = {
  inputSize: 224, // Balance between speed and accuracy
  scoreThreshold: 0.5, // Minimum confidence for valid detection
  timeout: 5000, // 5 seconds
};

/**
 * Detect a single face in an image or video frame
 *
 * @param input - HTML image, video, or canvas element
 * @param options - Detection configuration options
 * @returns Detection result with state and bounding box info
 */
export async function detectSingleFace(
  input: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
  options: DetectionOptions = {},
): Promise<DetectionResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  try {
    // Create timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Detection timeout')), opts.timeout);
    });

    // Create detection promise
    const detectionPromise = faceapi.detectAllFaces(
      input,
      new faceapi.TinyFaceDetectorOptions({
        inputSize: opts.inputSize,
        scoreThreshold: opts.scoreThreshold,
      }),
    );

    // Race between detection and timeout
    const detections = await Promise.race([detectionPromise, timeoutPromise]);

    // Validate results
    if (!detections || detections.length === 0) {
      return {
        state: DetectionState.NO_FACE,
        error: 'No face detected in frame',
      };
    }

    if (detections.length > 1) {
      return {
        state: DetectionState.MULTIPLE_FACES,
        error: `Multiple faces detected (${detections.length}). Please ensure only one person is in frame.`,
      };
    }

    // Single face found - extract data
    const detection = detections[0];
    const box = detection.box;

    return {
      state: DetectionState.FACE_FOUND,
      detection: detection,
      boundingBox: {
        x: box.x,
        y: box.y,
        width: box.width,
        height: box.height,
      },
      confidence: detection.score,
    };
  } catch (error) {
    if (error instanceof Error && error.message === 'Detection timeout') {
      return {
        state: DetectionState.TIMEOUT,
        error: 'Face detection timed out. Please try again.',
      };
    }

    console.error('Face detection error:', error);
    return {
      state: DetectionState.ERROR,
      error: error instanceof Error ? error.message : 'Unknown detection error',
    };
  }
}

/**
 * Extract confidence score from detection result
 *
 * @param result - Detection result
 * @returns Confidence score (0-1)
 */
export function getConfidenceScore(result: DetectionResult): number | null {
  if (
    result.state === DetectionState.FACE_FOUND &&
    result.confidence !== undefined
  ) {
    return result.confidence;
  }
  return null;
}

/**
 * Check if detection result is valid (single face found)
 *
 * @param result - Detection result
 * @returns True if valid single face detected
 */
export function isValidDetection(result: DetectionResult): boolean {
  return result.state === DetectionState.FACE_FOUND && !!result.detection;
}

/**
 * Get user-friendly message for detection state
 *
 * @param state - Detection state
 * @returns Human-readable message
 */
export function getDetectionMessage(state: DetectionState): string {
  switch (state) {
    case DetectionState.IDLE:
      return 'Ready to detect face';
    case DetectionState.DETECTING:
      return 'Detecting face...';
    case DetectionState.FACE_FOUND:
      return 'Face detected successfully';
    case DetectionState.NO_FACE:
      return 'No face detected. Please position your face in the frame.';
    case DetectionState.MULTIPLE_FACES:
      return 'Multiple faces detected. Only one person should be visible.';
    case DetectionState.TIMEOUT:
      return 'Detection timed out. Please try again.';
    case DetectionState.ERROR:
      return 'Error during face detection. Please try again.';
    default:
      return 'Unknown state';
  }
}

/**
 * Calculate frame rate throttle based on device performance
 *
 * Uses device memory and hardware concurrency as heuristics.
 *
 * @returns Optimal detection interval in milliseconds
 */
export function getOptimalDetectionInterval(): number {
  // Default to 200ms (5 FPS) - safe for all devices
  let interval = 200;

  // Check if performance hints are available
  if ('deviceMemory' in navigator) {
    const memory = (navigator as any).deviceMemory; // GB
    if (memory >= 8) {
      interval = 100; // 10 FPS for high-end devices
    } else if (memory >= 4) {
      interval = 150; // 6.7 FPS for mid-range
    }
  }

  // Further optimize based on CPU cores
  if (navigator.hardwareConcurrency >= 8) {
    interval = Math.max(100, interval - 50);
  } else if (navigator.hardwareConcurrency >= 4) {
    interval = Math.max(150, interval - 25);
  }

  return interval;
}
