/**
 * Employee Registration API Route
 *
 * Handles employee registration with face descriptor enrollment.
 * POST /api/register - Register new employee with face data
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createUser, getUserByEmployeeId } from '@/lib/db/user';
import {
  averageDescriptors,
  deserializeDescriptor,
  validateDescriptor,
} from '@/lib/face/extraction';
import { invalidateDescriptorCache } from '@/lib/face/matching';
import { logRegistration, registrationLogger } from '@/lib/logging';
import { createRegistrationTracker } from '@/lib/performance';

// Request validation schema
const registerSchema = z.object({
  employeeId: z
    .string()
    .trim()
    .min(3, 'Employee ID must be at least 3 characters'),
  name: z.string().min(1, 'Name is required').trim(),
  department: z.string().min(1, 'Department is required').trim(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  faceDescriptors: z
    .array(
      z
        .array(z.number())
        .length(128, 'Each descriptor must be exactly 128 numbers'),
    )
    .min(3, 'At least 3 face captures required')
    .max(5, 'Maximum 5 face captures allowed'),
});

type RegisterRequest = z.infer<typeof registerSchema>;

/**
 * POST /api/register
 * Register new employee with face descriptors
 */
export async function POST(request: NextRequest) {
  const perf = createRegistrationTracker();

  try {
    // Parse request body
    perf.mark('parse');
    const body = await request.json();
    perf.end('parse');

    // Validate request data
    perf.mark('validate');
    let validatedData: RegisterRequest;
    try {
      validatedData = registerSchema.parse(body);
      perf.end('validate');
    } catch (error) {
      if (error instanceof z.ZodError) {
        registrationLogger.warn('Registration request validation failed', {
          issueCount: error.issues.length,
          fields: error.issues.map((issue) => issue.path.join('.')),
        });

        return NextResponse.json(
          {
            success: false,
            error: 'VALIDATION_ERROR',
            details: error.issues.map((e: z.ZodIssue) => ({
              field: e.path.join('.'),
              message: e.message,
            })),
          },
          { status: 400 },
        );
      }
      throw error;
    }

    // Check if employee ID already exists
    perf.mark('db-check');
    const existingUser = await getUserByEmployeeId(validatedData.employeeId);
    perf.end('db-check');
    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: `Employee ID ${validatedData.employeeId} is already registered`,
        },
        { status: 409 },
      );
    }

    // Validate all descriptors
    perf.mark('descriptor-validation');
    const descriptors: Float32Array[] = [];
    for (let i = 0; i < validatedData.faceDescriptors.length; i++) {
      const descriptor = deserializeDescriptor(
        validatedData.faceDescriptors[i],
      );

      const validation = validateDescriptor(descriptor);
      if (!validation.isValid) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid descriptor at index ${i}: ${validation.error}`,
          },
          { status: 400 },
        );
      }

      descriptors.push(descriptor);
    }
    perf.end('descriptor-validation');

    // Average all descriptors
    perf.mark('descriptor-average');
    let averagedDescriptor: Float32Array;
    try {
      averagedDescriptor = averageDescriptors(descriptors);
      perf.end('descriptor-average');
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: `Failed to average descriptors: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
        { status: 500 },
      );
    }

    // Convert Float32Array to regular number array for database storage
    const descriptorArray = Array.from(averagedDescriptor);

    // Create user in database
    try {
      perf.mark('db-create');
      const user = await createUser({
        employeeId: validatedData.employeeId,
        name: validatedData.name,
        department: validatedData.department,
        email: validatedData.email || undefined,
        faceDescriptor: descriptorArray,
      });
      perf.end('db-create');

      // Invalidate descriptor cache after successful registration
      invalidateDescriptorCache();

      // Log successful registration
      logRegistration({
        success: true,
        employeeId: validatedData.employeeId,
        name: validatedData.name,
        captureCount: validatedData.faceDescriptors.length,
      });

      // Log performance
      perf.log();

      return NextResponse.json(
        {
          success: true,
          message: `Employee ${validatedData.name} registered successfully`,
          userId: user.id,
        },
        { status: 201 },
      );
    } catch (error) {
      console.error('Database error during registration:', error);

      // Check for unique constraint violations
      if (
        error instanceof Error &&
        error.message.includes('Unique constraint')
      ) {
        return NextResponse.json(
          {
            success: false,
            error: 'Employee ID already exists',
          },
          { status: 409 },
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: 'INTERNAL_ERROR',
          message: 'Failed to create user record',
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error('Registration API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_ERROR',
        message: 'Internal server error',
      },
      { status: 500 },
    );
  }
}

/**
 * OPTIONS /api/register
 * Handle CORS preflight
 */
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        Allow: 'POST, OPTIONS',
      },
    },
  );
}
