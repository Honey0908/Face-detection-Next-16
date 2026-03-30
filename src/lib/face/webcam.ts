/**
 * Webcam Utilities (Client-Side)
 *
 * Handles webcam access, permissions, stream lifecycle, and frame capture.
 * Includes HTTPS enforcement and browser compatibility checks.
 */

// Webcam constraints
export const DEFAULT_CONSTRAINTS: MediaStreamConstraints = {
  video: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    facingMode: 'user',
  },
  audio: false,
};

// Webcam error types
export enum WebcamErrorType {
  NOT_ALLOWED = 'NotAllowedError',
  NOT_FOUND = 'NotFoundError',
  NOT_READABLE = 'NotReadableError',
  OVERCONSTRAINED = 'OverconstrainedError',
  TYPE_ERROR = 'TypeError',
  SECURITY_ERROR = 'SecurityError',
  UNKNOWN = 'UnknownError',
}

// Webcam result interface
export interface WebcamResult {
  success: boolean;
  stream?: MediaStream;
  error?: string;
  errorType?: WebcamErrorType;
}

/**
 * Check if running on HTTPS or localhost
 *
 * MediaDevices API requires secure context.
 *
 * @returns True if secure context or localhost
 */
export function isSecureContext(): boolean {
  // Check if window is available (browser environment)
  if (typeof window === 'undefined') {
    return false;
  }

  // Check for HTTPS
  if (window.location.protocol === 'https:') {
    return true;
  }

  // Check for localhost
  const hostname = window.location.hostname;
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '[::1]'
  ) {
    return true;
  }

  return false;
}

/**
 * Check if MediaDevices API is supported
 *
 * @returns True if getUserMedia is available
 */
export function isWebcamSupported(): boolean {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

/**
 * Request webcam access
 *
 * @param constraints - Media stream constraints (optional)
 * @returns Webcam result with stream or error
 */
export async function requestWebcam(
  constraints: MediaStreamConstraints = DEFAULT_CONSTRAINTS,
): Promise<WebcamResult> {
  // Check secure context
  if (!isSecureContext()) {
    return {
      success: false,
      error:
        'Webcam access requires HTTPS in production. Use localhost for development.',
      errorType: WebcamErrorType.SECURITY_ERROR,
    };
  }

  // Check API support
  if (!isWebcamSupported()) {
    return {
      success: false,
      error: 'Webcam API is not supported in this browser.',
      errorType: WebcamErrorType.TYPE_ERROR,
    };
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    return {
      success: true,
      stream: stream,
    };
  } catch (error) {
    const err = error as DOMException;
    const errorType = getWebcamErrorType(err.name);
    const errorMessage = getWebcamErrorMessage(errorType);

    console.error('Webcam access error:', err);

    return {
      success: false,
      error: errorMessage,
      errorType: errorType,
    };
  }
}

/**
 * Get webcam error type from error name
 *
 * @param errorName - DOMException name
 * @returns Webcam error type enum
 */
function getWebcamErrorType(errorName: string): WebcamErrorType {
  switch (errorName) {
    case 'NotAllowedError':
      return WebcamErrorType.NOT_ALLOWED;
    case 'NotFoundError':
      return WebcamErrorType.NOT_FOUND;
    case 'NotReadableError':
      return WebcamErrorType.NOT_READABLE;
    case 'OverconstrainedError':
      return WebcamErrorType.OVERCONSTRAINED;
    case 'TypeError':
      return WebcamErrorType.TYPE_ERROR;
    case 'SecurityError':
      return WebcamErrorType.SECURITY_ERROR;
    default:
      return WebcamErrorType.UNKNOWN;
  }
}

/**
 * Get user-friendly error message for webcam error
 *
 * @param errorType - Webcam error type
 * @returns Human-readable error message
 */
function getWebcamErrorMessage(errorType: WebcamErrorType): string {
  switch (errorType) {
    case WebcamErrorType.NOT_ALLOWED:
      return 'Camera permission denied. Please allow camera access in your browser settings.';
    case WebcamErrorType.NOT_FOUND:
      return 'No camera found. Please connect a camera and try again.';
    case WebcamErrorType.NOT_READABLE:
      return 'Camera is already in use or not accessible. Please close other applications using the camera.';
    case WebcamErrorType.OVERCONSTRAINED:
      return 'Camera does not meet the required specifications. Please try a different camera.';
    case WebcamErrorType.TYPE_ERROR:
      return 'Invalid camera configuration. Please check your settings.';
    case WebcamErrorType.SECURITY_ERROR:
      return 'Camera access is not allowed due to security restrictions.';
    default:
      return 'An unknown error occurred while accessing the camera.';
  }
}

/**
 * Start video stream on video element
 *
 * @param videoElement - HTML video element
 * @param stream - Media stream from getUserMedia
 * @returns Promise that resolves when video is playing
 */
export async function startStream(
  videoElement: HTMLVideoElement,
  stream: MediaStream,
): Promise<void> {
  return new Promise((resolve, reject) => {
    videoElement.srcObject = stream;

    videoElement.onloadedmetadata = () => {
      videoElement
        .play()
        .then(() => resolve())
        .catch((error) => reject(error));
    };

    videoElement.onerror = () => {
      reject(new Error('Failed to load video stream'));
    };
  });
}

/**
 * Stop video stream
 *
 * @param stream - Media stream to stop
 */
export function stopStream(stream: MediaStream): void {
  stream.getTracks().forEach((track) => {
    track.stop();
  });
}

/**
 * Cleanup video element and stream
 *
 * @param videoElement - HTML video element
 * @param stream - Media stream (optional)
 */
export function cleanupStream(
  videoElement: HTMLVideoElement,
  stream?: MediaStream,
): void {
  // Pause video
  if (!videoElement.paused) {
    videoElement.pause();
  }

  // Stop stream if provided
  if (stream) {
    stopStream(stream);
  }

  // Remove srcObject
  videoElement.srcObject = null;
}

/**
 * Capture frame from video element
 *
 * @param videoElement - HTML video element
 * @param canvas - Optional canvas element to reuse
 * @returns Canvas with captured frame
 */
export function captureFrame(
  videoElement: HTMLVideoElement,
  canvas?: HTMLCanvasElement,
): HTMLCanvasElement {
  // Create or reuse canvas
  const canvasElement = canvas || document.createElement('canvas');
  canvasElement.width = videoElement.videoWidth;
  canvasElement.height = videoElement.videoHeight;

  // Draw video frame to canvas
  const ctx = canvasElement.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get 2D context from canvas');
  }

  ctx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);

  return canvasElement;
}

/**
 * Check if video element is ready for capture
 *
 * @param videoElement - HTML video element
 * @returns True if video is ready
 */
export function isVideoReady(videoElement: HTMLVideoElement): boolean {
  return (
    videoElement.readyState === videoElement.HAVE_ENOUGH_DATA &&
    !videoElement.paused &&
    videoElement.videoWidth > 0 &&
    videoElement.videoHeight > 0
  );
}

/**
 * Get available video devices
 *
 * @returns Array of video input devices
 */
export async function getVideoDevices(): Promise<MediaDeviceInfo[]> {
  if (!isWebcamSupported()) {
    return [];
  }

  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter((device) => device.kind === 'videoinput');
  } catch (error) {
    console.error('Error enumerating devices:', error);
    return [];
  }
}
