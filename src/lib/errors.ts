/**
 * Error Messages
 *
 * Centralized user-friendly error messages for the application.
 * Provides consistent messaging across components.
 */

export const ERROR_MESSAGES = {
  // Camera Errors
  CAMERA_PERMISSION_DENIED:
    'Camera permission denied. Please allow camera access in your browser settings and try again.',
  CAMERA_NOT_FOUND:
    'No camera found. Please connect a camera to your device and try again.',
  CAMERA_IN_USE:
    'Camera is already in use. Please close other applications using the camera.',
  CAMERA_UNSUPPORTED:
    'Your browser does not support camera access. Please use Chrome, Edge, or Firefox.',
  CAMERA_HTTPS_REQUIRED:
    'Camera access requires HTTPS. Please use a secure connection or localhost for development.',
  CAMERA_INITIALIZATION_FAILED:
    'Failed to initialize camera. Please refresh the page and try again.',

  // Face Detection Errors
  FACE_NOT_DETECTED:
    'No face detected. Please position your face in the camera view.',
  MULTIPLE_FACES_DETECTED:
    'Multiple faces detected. Please ensure only one person is in the frame.',
  FACE_TOO_FAR: 'Face too far from camera. Please move closer to the camera.',
  FACE_TOO_CLOSE: 'Face too close to camera. Please move back slightly.',
  POOR_LIGHTING:
    'Poor lighting detected. Please move to a well-lit area for better detection.',
  FACE_DETECTION_TIMEOUT:
    'Face detection timed out. Please try again and make sure your face is clearly visible.',
  FACE_DETECTION_FAILED:
    'Face detection failed. Please try again or contact support if the problem persists.',

  // Model Loading Errors
  MODELS_NOT_LOADED:
    'Face recognition models not loaded. Please wait a moment and try again.',
  MODEL_LOADING_FAILED:
    'Failed to load face recognition models. Please check your internet connection.',
  MODEL_LOADING_TIMEOUT:
    'Model loading timed out. Please refresh the page or check your network connection.',
  WEBGL_NOT_SUPPORTED:
    'Your browser does not support WebGL, which is required for face recognition. Please try a different browser.',
  TENSORFLOW_ERROR:
    'Face recognition system error. Please refresh the page and try again.',

  // Registration Errors
  REGISTRATION_FAILED:
    'Registration failed. Please try again or contact an administrator.',
  EMPLOYEE_ID_EXISTS:
    'Employee ID already registered. Please use a different ID.',
  INVALID_EMPLOYEE_DATA:
    'Invalid employee information. Please check your input and try again.',
  INSUFFICIENT_CAPTURES:
    'Not enough face captures. Please capture at least 3 images.',
  CAPTURE_QUALITY_LOW:
    'Capture quality too low. Please ensure good lighting and try again.',
  DESCRIPTOR_EXTRACTION_FAILED:
    'Failed to extract face data. Please try capturing again with better lighting.',

  // Scan/Matching Errors
  SCAN_FAILED: 'Scan failed. Please try again or contact an administrator.',
  EMPLOYEE_NOT_REGISTERED:
    'Face not recognized. Please register at the admin desk before scanning.',
  ALREADY_SCANNED_TODAY: 'You have already recorded lunch attendance today.',
  MATCHING_FAILED:
    'Face matching failed. Please try again with better lighting.',
  LOW_CONFIDENCE_MATCH:
    'Face match confidence too low. Please position your face clearly and try again.',

  // Network Errors
  NETWORK_ERROR:
    'Network error. Please check your internet connection and try again.',
  API_ERROR: 'Server error. Please try again later or contact support.',
  REQUEST_TIMEOUT:
    'Request timed out. Please check your connection and try again.',
  SERVER_UNAVAILABLE:
    'Server is currently unavailable. Please try again later.',

  // Database Errors
  DATABASE_ERROR:
    'Database error. Please try again or contact an administrator.',
  RECORD_NOT_FOUND: 'Record not found. Please contact an administrator.',
  DUPLICATE_RECORD:
    'Duplicate record detected. This action has already been completed.',

  // Validation Errors
  INVALID_INPUT: 'Invalid input. Please check your information and try again.',
  REQUIRED_FIELD_MISSING:
    'Required field missing. Please fill in all required fields.',
  INVALID_FORMAT: 'Invalid format. Please check your input and try again.',
  CONSENT_REQUIRED:
    'Consent is required to proceed. Please check the consent checkbox.',

  // Generic Errors
  UNKNOWN_ERROR:
    'An unexpected error occurred. Please try again or contact support.',
  OPERATION_CANCELLED: 'Operation was cancelled. You can try again when ready.',
  BROWSER_NOT_SUPPORTED:
    'Your browser is not supported. Please use Chrome, Edge, or Firefox.',
  FEATURE_NOT_AVAILABLE:
    'This feature is not available in your current environment.',
} as const;

// Error categories for logging and analytics
export enum ErrorCategory {
  CAMERA = 'camera',
  FACE_DETECTION = 'face_detection',
  MODEL_LOADING = 'model_loading',
  REGISTRATION = 'registration',
  SCAN = 'scan',
  NETWORK = 'network',
  DATABASE = 'database',
  VALIDATION = 'validation',
  UNKNOWN = 'unknown',
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low', // User can recover easily
  MEDIUM = 'medium', // Requires user action
  HIGH = 'high', // Requires admin intervention
  CRITICAL = 'critical', // System failure
}

// Error context interface for logging
export interface ErrorContext {
  category: ErrorCategory;
  severity: ErrorSeverity;
  message: string;
  userMessage: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

/**
 * Categorize error by message or type
 */
export function categorizeError(error: Error | string): ErrorCategory {
  const message = typeof error === 'string' ? error : error.message;
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('camera') || lowerMessage.includes('webcam')) {
    return ErrorCategory.CAMERA;
  }
  if (lowerMessage.includes('face') || lowerMessage.includes('detection')) {
    return ErrorCategory.FACE_DETECTION;
  }
  if (
    lowerMessage.includes('model') ||
    lowerMessage.includes('tensorflow') ||
    lowerMessage.includes('webgl')
  ) {
    return ErrorCategory.MODEL_LOADING;
  }
  if (lowerMessage.includes('register')) {
    return ErrorCategory.REGISTRATION;
  }
  if (lowerMessage.includes('scan') || lowerMessage.includes('match')) {
    return ErrorCategory.SCAN;
  }
  if (
    lowerMessage.includes('network') ||
    lowerMessage.includes('fetch') ||
    lowerMessage.includes('connection')
  ) {
    return ErrorCategory.NETWORK;
  }
  if (lowerMessage.includes('database') || lowerMessage.includes('prisma')) {
    return ErrorCategory.DATABASE;
  }
  if (lowerMessage.includes('validation') || lowerMessage.includes('invalid')) {
    return ErrorCategory.VALIDATION;
  }

  return ErrorCategory.UNKNOWN;
}

/**
 * Determine error severity
 */
export function getErrorSeverity(category: ErrorCategory): ErrorSeverity {
  switch (category) {
    case ErrorCategory.CAMERA:
    case ErrorCategory.FACE_DETECTION:
      return ErrorSeverity.MEDIUM;
    case ErrorCategory.MODEL_LOADING:
      return ErrorSeverity.HIGH;
    case ErrorCategory.REGISTRATION:
    case ErrorCategory.SCAN:
      return ErrorSeverity.MEDIUM;
    case ErrorCategory.NETWORK:
      return ErrorSeverity.MEDIUM;
    case ErrorCategory.DATABASE:
      return ErrorSeverity.HIGH;
    case ErrorCategory.VALIDATION:
      return ErrorSeverity.LOW;
    default:
      return ErrorSeverity.MEDIUM;
  }
}

/**
 * Create error context for logging
 */
export function createErrorContext(
  error: Error | string,
  metadata?: Record<string, unknown>,
): ErrorContext {
  const category = categorizeError(error);
  const severity = getErrorSeverity(category);
  const message = typeof error === 'string' ? error : error.message;

  // Get user-friendly message based on category
  let userMessage = ERROR_MESSAGES.UNKNOWN_ERROR;

  // Try to match specific error messages
  for (const [key, value] of Object.entries(ERROR_MESSAGES)) {
    if (message.toLowerCase().includes(key.toLowerCase().replace(/_/g, ' '))) {
      userMessage = value;
      break;
    }
  }

  return {
    category,
    severity,
    message,
    userMessage,
    timestamp: new Date(),
    metadata,
  };
}
