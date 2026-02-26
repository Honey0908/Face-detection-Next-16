/**
 * Database Validation Schemas
 *
 * Zod schemas for validating database inputs.
 * Ensures data integrity before database operations.
 */

import { z } from 'zod';

/**
 * Face Descriptor Validation
 *
 * Face-api.js generates 128-dimensional Float32Array descriptors.
 * We store them as Float[] (number[]) in PostgreSQL.
 */
export const faceDescriptorSchema = z
  .array(z.number())
  .length(128, 'Face descriptor must contain exactly 128 values')
  .refine(
    (arr) => arr.every((val) => typeof val === 'number' && !isNaN(val)),
    'All descriptor values must be valid numbers',
  );

/**
 * Employee ID Validation
 *
 * Format: Alphanumeric, 3-20 characters
 * Example: EMP001, STAFF-123, E00001
 */
export const employeeIdSchema = z
  .string()
  .min(3, 'Employee ID must be at least 3 characters')
  .max(20, 'Employee ID must not exceed 20 characters')
  .regex(
    /^[A-Z0-9-_]+$/i,
    'Employee ID must contain only letters, numbers, hyphens, and underscores',
  );

/**
 * Date Format Validation (YYYY-MM-DD)
 *
 * Used for LunchRecord.date field.
 * Ensures consistent date format for duplicate prevention.
 */
export const dateFormatSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
  .refine((dateStr) => {
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
  }, 'Date must be a valid calendar date');

/**
 * User Creation Validation
 *
 * Validates all fields for creating a new User record.
 */
export const createUserSchema = z.object({
  employeeId: employeeIdSchema,
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  faceDescriptor: faceDescriptorSchema,
  email: z.string().email('Invalid email format').optional().nullable(),
  department: z
    .string()
    .max(50, 'Department name too long')
    .optional()
    .nullable(),
});

/**
 * Lunch Record Creation Validation
 *
 * Validates fields for creating a new LunchRecord.
 */
export const createLunchRecordSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  date: dateFormatSchema,
  timestamp: z.date().optional(),
  confidence: z
    .number()
    .min(0, 'Confidence must be between 0 and 1')
    .max(1, 'Confidence must be between 0 and 1')
    .optional()
    .nullable(),
});

/**
 * Helper function to get today's date in YYYY-MM-DD format
 */
export function getTodayDateString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Helper function to validate face descriptor
 */
export function validateFaceDescriptor(
  descriptor: unknown,
): descriptor is number[] {
  const result = faceDescriptorSchema.safeParse(descriptor);
  return result.success;
}

/**
 * Helper function to validate employee ID
 */
export function validateEmployeeId(employeeId: string): boolean {
  const result = employeeIdSchema.safeParse(employeeId);
  return result.success;
}

/**
 * Helper function to validate date format
 */
export function validateDateFormat(date: string): boolean {
  const result = dateFormatSchema.safeParse(date);
  return result.success;
}
