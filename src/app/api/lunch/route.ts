/**
 * Lunch Scanning API Route
 *
 * Handles lunch attendance recording via face recognition.
 * POST /api/lunch - Record lunch attendance with face matching
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAllUsers } from '@/lib/db/user';
import {
  getTodayLunchRecord,
  createLunchRecord,
  type CreateLunchRecordData,
} from '@/lib/db/lunch-record';
import {
  findBestMatch,
  setCachedDescriptors,
  getCachedDescriptors,
} from '@/lib/face/matching';
import { validateDescriptorForMatching } from '@/lib/face/matching';
import { logMatchAttempt, logScan } from '@/lib/logging';
import { createScanTracker } from '@/lib/performance';

// Request validation schema
const lunchScanSchema = z.object({
  faceDescriptor: z
    .array(z.number())
    .length(128, 'Face descriptor must be exactly 128 numbers'),
});

type LunchScanRequest = z.infer<typeof lunchScanSchema>;

/**
 * POST /api/lunch
 * Record lunch attendance with face recognition
 */
export async function POST(request: NextRequest) {
  // Start performance tracking
  const perf = createScanTracker();

  try {
    // Parse request body
    perf.mark('parse');
    const body = await request.json();
    perf.end('parse');

    // Validate request data
    perf.mark('validate');
    let validatedData: LunchScanRequest;
    try {
      validatedData = lunchScanSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid face descriptor',
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
    perf.end('validate');

    // Validate descriptor format
    if (!validateDescriptorForMatching(validatedData.faceDescriptor)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid face descriptor format',
        },
        { status: 400 },
      );
    }

    // Get all registered users (with caching)
    perf.mark('cache-load');
    let cachedUsers = getCachedDescriptors();

    if (!cachedUsers) {
      // Fetch from database and cache
      const users = await getAllUsers();

      if (!users || users.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: 'No registered users found',
            message: 'Please register at the admin desk',
          },
          { status: 404 },
        );
      }

      // Transform to format expected by matching function
      const userDescriptors = users.map((user) => ({
        userId: user.id,
        descriptor: user.faceDescriptor,
        name: user.name,
        employeeId: user.employeeId,
      }));

      setCachedDescriptors(userDescriptors);
      cachedUsers = userDescriptors;
    }
    perf.end('cache-load');

    // Find best match
    perf.mark('face-match');
    const matchResult = findBestMatch(
      validatedData.faceDescriptor,
      cachedUsers,
    );
    perf.end('face-match');

    // Log match attempt
    logMatchAttempt({
      success: matchResult.matched,
      confidence: matchResult.distance,
      distance: matchResult.distance,
      userId: matchResult.userId,
      threshold: 0.6,
      candidateCount: cachedUsers.length,
    });

    if (!matchResult.matched || !matchResult.userId) {
      // Log failed scan - employee not registered
      logScan({
        success: false,
        notRegistered: true,
      });

      return NextResponse.json(
        {
          success: false,
          error: 'NOT_REGISTERED',
          message: 'Employee not registered. Please visit the admin desk.',
        },
        { status: 404 },
      );
    }

    // Get user info from cached users
    const matchedUser = cachedUsers.find(
      (u) => u.userId === matchResult.userId,
    );
    const employeeName = matchedUser?.name || 'Unknown';

    // Check for existing lunch record today
    perf.mark('db-check');
    const existingRecord = await getTodayLunchRecord(matchResult.userId);
    perf.end('db-check');

    if (existingRecord) {
      // Log duplicate scan attempt
      logScan({
        success: false,
        employeeName: employeeName,
        alreadyScanned: true,
      });

      return NextResponse.json(
        {
          success: false,
          error: 'DUPLICATE_SCAN',
          message: `Lunch already recorded today at ${new Date(existingRecord.timestamp).toLocaleTimeString()}`,
          employeeName: employeeName,
          scannedTime: existingRecord.timestamp.toISOString(),
        },
        { status: 409 },
      );
    }

    // Create lunch record
    try {
      perf.mark('db-create');
      const today = new Date();
      const dateString = today.toISOString().split('T')[0]; // YYYY-MM-DD

      const recordData: CreateLunchRecordData = {
        userId: matchResult.userId,
        date: dateString,
        confidence: matchResult.distance,
      };

      const lunchRecord = await createLunchRecord(recordData);
      perf.end('db-create');

      // Log successful scan
      logScan({
        success: true,
        employeeName: employeeName,
        confidence: matchResult.distance,
      });

      // Log performance
      perf.log();

      return NextResponse.json(
        {
          success: true,
          message: 'Lunch recorded successfully',
          employeeName: employeeName,
          scannedTime: lunchRecord.timestamp.toISOString(),
          confidence: matchResult.confidence,
        },
        { status: 201 },
      );
    } catch (error) {
      console.error('Database error creating lunch record:', error);

      return NextResponse.json(
        {
          success: false,
          error: 'Failed to record lunch',
          message: 'Database error. Please try again.',
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error('Lunch scan API error:', error);

    // Check for specific error types
    if (error instanceof Error) {
      if (error.message.includes('descriptor')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid face data',
            message: 'Face detection error. Please try again.',
          },
          { status: 400 },
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'An unexpected error occurred. Please try again.',
      },
      { status: 500 },
    );
  }
}

/**
 * GET /api/lunch
 * Get lunch statistics (optional endpoint for future use)
 */
export async function GET(request: NextRequest) {
  return NextResponse.json(
    {
      message: 'Use POST to record lunch attendance',
    },
    { status: 200 },
  );
}

/**
 * OPTIONS /api/lunch
 * Handle CORS preflight
 */
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        Allow: 'POST, GET, OPTIONS',
      },
    },
  );
}
