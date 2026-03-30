/**
 * Logging Utilities
 *
 * Structured logging for face recognition events, matching failures,
 * and debugging information.
 */

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export enum LogCategory {
  FACE_MATCHING = 'face_matching',
  FACE_DETECTION = 'face_detection',
  MODEL_LOADING = 'model_loading',
  CAMERA = 'camera',
  REGISTRATION = 'registration',
  SCAN = 'scan',
  API = 'api',
  SYSTEM = 'system',
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  message: string;
  metadata?: Record<string, unknown>;
  userId?: string;
  employeeId?: string;
}

/**
 * Format log entry for console output
 */
function formatLogEntry(entry: LogEntry): string {
  const { timestamp, level, category, message, metadata } = entry;
  const metadataStr = metadata ? ` ${JSON.stringify(metadata)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] [${category}] ${message}${metadataStr}`;
}

/**
 * Log an entry (in production, this could write to a logging service)
 */
function log(entry: LogEntry): void {
  const formatted = formatLogEntry(entry);

  switch (entry.level) {
    case LogLevel.DEBUG:
      console.debug(formatted);
      break;
    case LogLevel.INFO:
      console.info(formatted);
      break;
    case LogLevel.WARN:
      console.warn(formatted);
      break;
    case LogLevel.ERROR:
      console.error(formatted);
      break;
  }

  // In production, send to logging service
  if (process.env.NODE_ENV === 'production') {
    // TODO: Send to logging service (e.g., Sentry, LogRocket, CloudWatch)
    // You can implement this based on your logging backend
  }
}

/**
 * Create logger with category
 */
export function createLogger(category: LogCategory) {
  return {
    debug(message: string, metadata?: Record<string, unknown>) {
      log({
        timestamp: new Date().toISOString(),
        level: LogLevel.DEBUG,
        category,
        message,
        metadata,
      });
    },

    info(message: string, metadata?: Record<string, unknown>) {
      log({
        timestamp: new Date().toISOString(),
        level: LogLevel.INFO,
        category,
        message,
        metadata,
      });
    },

    warn(message: string, metadata?: Record<string, unknown>) {
      log({
        timestamp: new Date().toISOString(),
        level: LogLevel.WARN,
        category,
        message,
        metadata,
      });
    },

    error(message: string, metadata?: Record<string, unknown>) {
      log({
        timestamp: new Date().toISOString(),
        level: LogLevel.ERROR,
        category,
        message,
        metadata,
      });
    },
  };
}

// Pre-configured loggers for  different modules
export const matchingLogger = createLogger(LogCategory.FACE_MATCHING);
export const detectionLogger = createLogger(LogCategory.FACE_DETECTION);
export const modelLogger = createLogger(LogCategory.MODEL_LOADING);
export const cameraLogger = createLogger(LogCategory.CAMERA);
export const registrationLogger = createLogger(LogCategory.REGISTRATION);
export const scanLogger = createLogger(LogCategory.SCAN);
export const apiLogger = createLogger(LogCategory.API);
export const systemLogger = createLogger(LogCategory.SYSTEM);

/**
 * Log face matching attempt
 */
export function logMatchAttempt(params: {
  success: boolean;
  confidence?: number;
  distance?: number;
  employeeId?: string;
  userId?: string;
  threshold: number;
  candidateCount: number;
  duration?: number;
}) {
  const {
    success,
    confidence,
    distance,
    employeeId,
    userId,
    threshold,
    candidateCount,
    duration,
  } = params;

  if (success) {
    matchingLogger.info('Face match successful', {
      employeeId,
      userId,
      confidence,
      distance,
      threshold,
      candidateCount,
      duration,
    });
  } else {
    matchingLogger.warn('Face match failed', {
      distance,
      threshold,
      candidateCount,
      duration,
      reason:
        distance !== undefined && distance >= threshold
          ? 'distance_too_high'
          : 'unknown',
    });
  }
}

/**
 * Log face detection result
 */
export function logDetection(params: {
  success: boolean;
  confidence?: number;
  faceCount?: number;
  duration?: number;
  error?: string;
}) {
  const { success, confidence, faceCount, duration, error } = params;

  if (success) {
    detectionLogger.info('Face detected', {
      confidence,
      faceCount,
      duration,
    });
  } else {
    detectionLogger.warn('Face detection failed', {
      faceCount,
      duration,
      error,
    });
  }
}

/**
 * Log model loading
 */
export function logModelLoading(params: {
  success: boolean;
  duration?: number;
  modelName?: string;
  error?: string;
}) {
  const { success, duration, modelName, error } = params;

  if (success) {
    modelLogger.info(`Model loaded: ${modelName || 'all'}`, {
      duration,
    });
  } else {
    modelLogger.error(`Model loading failed: ${modelName || 'all'}`, {
      duration,
      error,
    });
  }
}

/**
 * Log registration attempt
 */
export function logRegistration(params: {
  success: boolean;
  employeeId: string;
  name: string;
  captureCount?: number;
  averageConfidence?: number;
  duration?: number;
  error?: string;
}) {
  const {
    success,
    employeeId,
    name,
    captureCount,
    averageConfidence,
    duration,
    error,
  } = params;

  if (success) {
    registrationLogger.info('Employee registered successfully', {
      employeeId,
      name,
      captureCount,
      averageConfidence,
      duration,
    });
  } else {
    registrationLogger.error('Registration failed', {
      employeeId,
      name,
      captureCount,
      duration,
      error,
    });
  }
}

/**
 * Log scan attempt
 */
export function logScan(params: {
  success: boolean;
  employeeId?: string;
  employeeName?: string;
  confidence?: number;
  alreadyScanned?: boolean;
  notRegistered?: boolean;
  duration?: number;
  error?: string;
}) {
  const {
    success,
    employeeId,
    employeeName,
    confidence,
    alreadyScanned,
    notRegistered,
    duration,
    error,
  } = params;

  if (success) {
    scanLogger.info('Lunch scan successful', {
      employeeId,
      employeeName,
      confidence,
      duration,
    });
  } else if (alreadyScanned) {
    scanLogger.warn('Duplicate scan attempt', {
      employeeId,
      employeeName,
      duration,
    });
  } else if (notRegistered) {
    scanLogger.warn('Scan failed: Employee not registered', {
      confidence,
      duration,
    });
  } else {
    scanLogger.error('Scan failed', {
      employeeId,
      employeeName,
      confidence,
      duration,
      error,
    });
  }
}

/**
 * Log API request
 */
export function logApiRequest(params: {
  method: string;
  path: string;
  status: number;
  duration?: number;
  error?: string;
}) {
  const { method, path, status, duration, error } = params;

  if (status >= 200 && status < 300) {
    apiLogger.info(`${method} ${path} - ${status}`, {
      duration,
    });
  } else if (status >= 400 && status < 500) {
    apiLogger.warn(`${method} ${path} - ${status}`, {
      duration,
      error,
    });
  } else {
    apiLogger.error(`${method} ${path} - ${status}`, {
      duration,
      error,
    });
  }
}
