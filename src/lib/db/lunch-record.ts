/**
 * Lunch Record Database Operations
 *
 * CRUD operations for LunchRecord model.
 * Handles duplicate prevention and daily/monthly statistics.
 */

import prisma from '../prisma';
import { LunchRecord, Prisma } from '@prisma/client';
import {
  createLunchRecordSchema,
  getTodayDateString,
} from '../validation/schemas';
import { z } from 'zod';

// Export type for API usage
export type CreateLunchRecordData = z.infer<typeof createLunchRecordSchema>;

/**
 * Get lunch record by user ID and date
 *
 * Used to check if user already scanned lunch today (duplicate prevention).
 *
 * @param userId - User's unique ID
 * @param date - Date in YYYY-MM-DD format
 * @returns LunchRecord or null if not found
 */
export async function getLunchRecordByUserAndDate(
  userId: string,
  date: string,
): Promise<LunchRecord | null> {
  try {
    const record = await prisma.lunchRecord.findUnique({
      where: {
        userId_date: {
          userId,
          date,
        },
      },
    });
    return record;
  } catch (error) {
    console.error('Error fetching lunch record:', error);
    throw new Error('Failed to fetch lunch record');
  }
}

/**
 * Get today's lunch record for a specific user
 *
 * Convenience wrapper for checking today's record.
 *
 * @param userId - User's unique ID
 * @returns LunchRecord or null if not found
 */
export async function getTodayLunchRecord(
  userId: string,
): Promise<LunchRecord | null> {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return getLunchRecordByUserAndDate(userId, today);
}

/**
 * Create a new lunch record
 *
 * Validates input and prevents duplicate scans on the same day.
 *
 * @param data - Lunch record creation data
 * @returns Created lunch record
 * @throws Error if duplicate detected or validation fails
 */
export async function createLunchRecord(
  data: z.infer<typeof createLunchRecordSchema>,
): Promise<LunchRecord> {
  // Validate input data
  const validated = createLunchRecordSchema.parse(data);

  // Check for duplicate
  const existing = await getLunchRecordByUserAndDate(
    validated.userId,
    validated.date,
  );

  if (existing) {
    throw new Error('Lunch already recorded for this user today');
  }

  try {
    const record = await prisma.lunchRecord.create({
      data: {
        userId: validated.userId,
        date: validated.date,
        timestamp: validated.timestamp ?? new Date(),
        confidence: validated.confidence ?? null,
      },
    });

    return record;
  } catch (error) {
    // Handle unique constraint violation (backup check)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new Error('Lunch already recorded for this user today');
      }
      if (error.code === 'P2003') {
        throw new Error('Invalid user ID');
      }
    }

    console.error('Error creating lunch record:', error);
    throw new Error('Failed to create lunch record');
  }
}

/**
 * Get today's lunch count
 *
 * Used for dashboard display.
 *
 * @returns Number of employees who scanned lunch today
 */
export async function getTodayLunchCount(): Promise<number> {
  const today = getTodayDateString();

  try {
    const count = await prisma.lunchRecord.count({
      where: {
        date: today,
      },
    });
    return count;
  } catch (error) {
    console.error("Error counting today's lunch records:", error);
    throw new Error("Failed to count today's lunch records");
  }
}

/**
 * Get lunch count for a specific date
 *
 * @param date - Date in YYYY-MM-DD format
 * @returns Number of lunch records for that date
 */
export async function getLunchCountByDate(date: string): Promise<number> {
  try {
    const count = await prisma.lunchRecord.count({
      where: { date },
    });
    return count;
  } catch (error) {
    console.error('Error counting lunch records by date:', error);
    throw new Error('Failed to count lunch records');
  }
}

/**
 * Get monthly lunch statistics
 *
 * Returns lunch count per employee for a given month.
 * Used for admin dashboard and analytics.
 *
 * @param yearMonth - Format: "YYYY-MM" (e.g., "2026-02")
 * @returns Array of user statistics with lunch counts
 */
export async function getMonthlyLunchStats(yearMonth: string) {
  // Validate format
  if (!/^\d{4}-\d{2}$/.test(yearMonth)) {
    throw new Error('Invalid month format. Use YYYY-MM (e.g., "2026-02")');
  }

  const [year, month] = yearMonth.split('-');
  const startDate = `${year}-${month}-01`;

  // Calculate last day of month
  const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
  const endDate = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;

  try {
    // Get all lunch records for the month with user info
    const records = await prisma.lunchRecord.groupBy({
      by: ['userId'],
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: {
        id: true,
      },
    });

    // Fetch user details for each userId
    const userIds = records.map((r) => r.userId);
    const users = await prisma.user.findMany({
      where: {
        id: {
          in: userIds,
        },
      },
      select: {
        id: true,
        employeeId: true,
        name: true,
        department: true,
      },
    });

    // Combine data
    const stats = records.map((record) => {
      const user = users.find((u) => u.id === record.userId);
      return {
        userId: record.userId,
        employeeId: user?.employeeId ?? 'Unknown',
        name: user?.name ?? 'Unknown',
        department: user?.department ?? null,
        monthlyCount: record._count.id,
      };
    });

    return stats;
  } catch (error) {
    console.error('Error fetching monthly lunch stats:', error);
    throw new Error('Failed to fetch monthly lunch statistics');
  }
}

/**
 * Get all lunch records for a specific user
 *
 * @param userId - User's unique ID
 * @param limit - Optional limit for pagination (default: 100)
 * @returns Array of lunch records
 */
export async function getUserLunchRecords(
  userId: string,
  limit: number = 100,
): Promise<LunchRecord[]> {
  try {
    const records = await prisma.lunchRecord.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: limit,
    });
    return records;
  } catch (error) {
    console.error('Error fetching user lunch records:', error);
    throw new Error('Failed to fetch user lunch records');
  }
}

/**
 * Get lunch records with pagination
 *
 * @param options - Pagination and filter options
 * @returns Paginated lunch records
 */
export async function getLunchRecords(options: {
  skip?: number;
  take?: number;
  date?: string;
  userId?: string;
}) {
  try {
    const where: Prisma.LunchRecordWhereInput = {};

    if (options.date) {
      where.date = options.date;
    }

    if (options.userId) {
      where.userId = options.userId;
    }

    const [records, total] = await Promise.all([
      prisma.lunchRecord.findMany({
        where,
        skip: options.skip ?? 0,
        take: options.take ?? 50,
        orderBy: { timestamp: 'desc' },
        include: {
          user: {
            select: {
              employeeId: true,
              name: true,
              department: true,
            },
          },
        },
      }),
      prisma.lunchRecord.count({ where }),
    ]);

    return {
      records,
      total,
      hasMore: (options.skip ?? 0) + records.length < total,
    };
  } catch (error) {
    console.error('Error fetching lunch records:', error);
    throw new Error('Failed to fetch lunch records');
  }
}

/**
 * Delete lunch record
 *
 * @param id - Lunch record ID
 * @returns Deleted lunch record
 */
export async function deleteLunchRecord(id: string): Promise<LunchRecord> {
  try {
    const record = await prisma.lunchRecord.delete({
      where: { id },
    });
    return record;
  } catch (error) {
    console.error('Error deleting lunch record:', error);
    throw new Error('Failed to delete lunch record');
  }
}
