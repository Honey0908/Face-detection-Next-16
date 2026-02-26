/**
 * Database Error Types
 *
 * Custom error classes for database operations.
 * Provides meaningful error messages and types for error handling in API routes.
 */

import { Prisma } from '@prisma/client';

/**
 * Base Database Error
 */
export class DatabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

/**
 * Duplicate Lunch Record Error
 *
 * Thrown when user attempts to scan lunch twice on the same day.
 */
export class DuplicateLunchRecordError extends Error {
  constructor(
    public employeeName: string,
    public date: string,
  ) {
    super(`Lunch already recorded for ${employeeName} on ${date}`);
    this.name = 'DuplicateLunchRecordError';
  }
}

/**
 * User Not Found Error
 *
 * Thrown when querying for a user that doesn't exist.
 */
export class UserNotFoundError extends Error {
  constructor(
    public identifier: string,
    public identifierType: 'id' | 'employeeId' = 'id',
  ) {
    super(`User not found: ${identifierType} = ${identifier}`);
    this.name = 'UserNotFoundError';
  }
}

/**
 * Invalid Face Descriptor Error
 *
 * Thrown when face descriptor doesn't meet requirements (128 floats).
 */
export class InvalidDescriptorError extends Error {
  constructor(
    message: string = 'Invalid face descriptor: must be array of 128 numbers',
  ) {
    super(message);
    this.name = 'InvalidDescriptorError';
  }
}

/**
 * Face Match Not Found Error
 *
 * Thrown when no matching face is found in the database.
 */
export class FaceMatchNotFoundError extends Error {
  constructor(message: string = 'No matching face found in database') {
    super(message);
    this.name = 'FaceMatchNotFoundError';
  }
}

/**
 * Duplicate Employee ID Error
 *
 * Thrown when attempting to create user with existing employeeId.
 */
export class DuplicateEmployeeIdError extends Error {
  constructor(public employeeId: string) {
    super(`Employee ID '${employeeId}' already exists`);
    this.name = 'DuplicateEmployeeIdError';
  }
}

/**
 * Connection Error
 *
 * Thrown when database connection fails.
 */
export class DatabaseConnectionError extends Error {
  constructor(message: string = 'Failed to connect to database') {
    super(message);
    this.name = 'DatabaseConnectionError';
  }
}

/**
 * Handle Prisma unique constraint violation
 *
 * Converts Prisma P2002 error to appropriate custom error.
 */
export function handleUniqueConstraintError(
  error: Prisma.PrismaClientKnownRequestError,
  context?: { employeeId?: string; userId?: string; date?: string },
): never {
  if (error.code === 'P2002') {
    const target = (error.meta?.target as string[]) ?? [];

    // Lunch record duplicate (userId + date)
    if (target.includes('userId') && target.includes('date')) {
      throw new DuplicateLunchRecordError(
        context?.userId ?? 'Unknown',
        context?.date ?? 'today',
      );
    }

    // Employee ID duplicate
    if (target.includes('employeeId')) {
      throw new DuplicateEmployeeIdError(context?.employeeId ?? 'Unknown');
    }

    // Generic unique constraint
    throw new DatabaseError(
      `Duplicate entry for: ${target.join(', ')}`,
      'P2002',
    );
  }

  throw error;
}

/**
 * Handle Prisma foreign key violation
 *
 * Converts Prisma P2003 error to appropriate custom error.
 */
export function handleForeignKeyError(
  error: Prisma.PrismaClientKnownRequestError,
): never {
  if (error.code === 'P2003') {
    const field = error.meta?.field_name as string | undefined;

    if (field === 'userId') {
      throw new UserNotFoundError('Invalid userId', 'id');
    }

    throw new DatabaseError(
      `Invalid foreign key reference: ${field ?? 'unknown'}`,
      'P2003',
    );
  }

  throw error;
}

/**
 * Safe error logger
 *
 * Logs errors without exposing sensitive information (credentials, connection strings).
 */
export function logDatabaseError(error: unknown, operation: string): void {
  const timestamp = new Date().toISOString();

  // Sanitize error message to remove credentials
  let message = error instanceof Error ? error.message : String(error);

  // Remove connection strings and passwords
  message = message.replace(/postgresql:\/\/[^@]+@/, 'postgresql://***:***@');
  message = message.replace(/password=[^&\s]+/gi, 'password=***');
  message = message.replace(/npg_[A-Za-z0-9]+/g, 'npg_***');

  console.error(`[${timestamp}] Database Error in ${operation}:`, {
    message,
    name: error instanceof Error ? error.name : 'Unknown',
    stack: error instanceof Error ? error.stack?.split('\n')[0] : undefined,
  });
}

/**
 * Wrap database operation with error handling
 *
 * Catches Prisma errors and converts them to custom errors.
 * Logs errors without exposing credentials.
 */
export async function withErrorHandling<T>(
  operation: string,
  fn: () => Promise<T>,
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    logDatabaseError(error, operation);

    // Handle Prisma-specific errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new DatabaseError('Duplicate entry detected', error.code);
      }
      if (error.code === 'P2003') {
        throw new DatabaseError('Invalid reference', error.code);
      }
      if (error.code === 'P2025') {
        throw new DatabaseError('Record not found', error.code);
      }
    }

    // Connection errors
    if (error instanceof Prisma.PrismaClientInitializationError) {
      throw new DatabaseConnectionError(
        'Failed to initialize database connection',
      );
    }

    if (error instanceof Prisma.PrismaClientRustPanicError) {
      throw new DatabaseConnectionError('Database connection panic');
    }

    // Re-throw custom errors as-is
    if (
      error instanceof DuplicateLunchRecordError ||
      error instanceof UserNotFoundError ||
      error instanceof InvalidDescriptorError ||
      error instanceof FaceMatchNotFoundError ||
      error instanceof DuplicateEmployeeIdError
    ) {
      throw error;
    }

    // Generic database error
    throw new DatabaseError(
      error instanceof Error ? error.message : 'Unknown database error',
    );
  }
}

/**
 * Check if error is a known database error
 */
export function isDatabaseError(error: unknown): error is DatabaseError {
  return (
    error instanceof DatabaseError ||
    error instanceof DuplicateLunchRecordError ||
    error instanceof UserNotFoundError ||
    error instanceof InvalidDescriptorError ||
    error instanceof FaceMatchNotFoundError ||
    error instanceof DuplicateEmployeeIdError ||
    error instanceof DatabaseConnectionError
  );
}

/**
 * Get HTTP status code for database error
 */
export function getErrorStatusCode(error: unknown): number {
  if (error instanceof UserNotFoundError) return 404;
  if (error instanceof FaceMatchNotFoundError) return 404;
  if (error instanceof DuplicateLunchRecordError) return 409;
  if (error instanceof DuplicateEmployeeIdError) return 409;
  if (error instanceof InvalidDescriptorError) return 400;
  if (error instanceof DatabaseConnectionError) return 503;
  return 500;
}
