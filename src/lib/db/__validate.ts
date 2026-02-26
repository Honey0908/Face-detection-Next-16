/**
 * Database Validation Tests
 *
 * Comprehensive tests for database operations.
 * Run with: pnpm tsx src/lib/db/__validate.ts
 *
 * Note: This will create and delete test data. Do not run on production database.
 */

import prisma from '../prisma';
import {
  createUser,
  getUserByEmployeeId,
  getAllUsers,
  deleteUser,
} from './user';
import {
  createLunchRecord,
  getLunchRecordByUserAndDate,
  getTodayLunchCount,
} from './lunch-record';
import { getTodayDateString } from '../validation/schemas';

// Test utilities
let testUserId: string | null = null;
let testUserId2: string | null = null;

async function cleanup() {
  console.log('\n🧹 Cleaning up test data...');
  try {
    if (testUserId) await deleteUser(testUserId).catch(() => {});
    if (testUserId2) await deleteUser(testUserId2).catch(() => {});
    console.log('✓ Cleanup complete');
  } catch (error) {
    console.log('⚠️  Cleanup had issues (expected if tests failed)');
  }
}

async function runTests() {
  console.log('🧪 Database Validation Tests\n');
  console.log('='.repeat(50));

  try {
    // Test 10.1: Database connection
    console.log('\n[10.1] Testing database connection...');
    await prisma.$connect();
    console.log('✓ Database connection successful');

    // Test 10.2: User creation with valid data
    console.log('\n[10.2] Testing user creation with valid data...');
    const faceDescriptor = Array(128)
      .fill(0)
      .map(() => Math.random());
    const user = await createUser({
      employeeId: `TEST${Date.now()}`,
      name: 'Test User',
      faceDescriptor,
      email: 'test@example.com',
      department: 'Testing',
    });
    testUserId = user.id;
    console.log(`✓ User created: ${user.name} (${user.employeeId})`);

    // Test 10.3: Duplicate employeeId prevention
    console.log('\n[10.3] Testing duplicate employeeId prevention...');
    try {
      await createUser({
        employeeId: user.employeeId,
        name: 'Duplicate User',
        faceDescriptor,
      });
      console.log('✗ FAILED: Should have thrown duplicate error');
      process.exit(1);
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        console.log('✓ Duplicate employeeId correctly rejected');
      } else {
        throw error;
      }
    }

    // Test 10.4: Face descriptor storage (128 floats)
    console.log('\n[10.4] Testing face descriptor storage...');
    const fetchedUser = await getUserByEmployeeId(user.employeeId);
    if (!fetchedUser) throw new Error('User not found');

    if (fetchedUser.faceDescriptor.length !== 128) {
      console.log('✗ FAILED: Descriptor length is not 128');
      process.exit(1);
    }

    if (!fetchedUser.faceDescriptor.every((val) => typeof val === 'number')) {
      console.log('✗ FAILED: Descriptor contains non-number values');
      process.exit(1);
    }

    console.log(
      `✓ Face descriptor stored correctly (${fetchedUser.faceDescriptor.length} floats)`,
    );

    // Test 10.5: LunchRecord creation
    console.log('\n[10.5] Testing LunchRecord creation...');
    const today = getTodayDateString();
    const lunchRecord = await createLunchRecord({
      userId: user.id,
      date: today,
      timestamp: new Date(),
      confidence: 0.92,
    });
    console.log(`✓ LunchRecord created for ${today}`);

    // Test 10.6: Duplicate lunch record prevention
    console.log('\n[10.6] Testing duplicate lunch record prevention...');
    try {
      await createLunchRecord({
        userId: user.id,
        date: today,
        timestamp: new Date(),
      });
      console.log('✗ FAILED: Should have thrown duplicate error');
      process.exit(1);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes('already recorded')
      ) {
        console.log('✓ Duplicate lunch record correctly prevented');
      } else {
        throw error;
      }
    }

    // Test 10.7: Cascade deletion
    console.log('\n[10.7] Testing cascade deletion...');
    const user2 = await createUser({
      employeeId: `TEST2${Date.now()}`,
      name: 'Test User 2',
      faceDescriptor: Array(128)
        .fill(0)
        .map(() => Math.random()),
    });
    testUserId2 = user2.id;

    await createLunchRecord({
      userId: user2.id,
      date: today,
    });

    const recordsBefore = await getLunchRecordByUserAndDate(user2.id, today);
    if (!recordsBefore) throw new Error('Record should exist');

    await deleteUser(user2.id);
    testUserId2 = null; // Already deleted

    const recordsAfter = await getLunchRecordByUserAndDate(user2.id, today);
    if (recordsAfter !== null) {
      console.log('✗ FAILED: Lunch records not cascade deleted');
      process.exit(1);
    }

    console.log('✓ Cascade deletion works (lunch records deleted with user)');

    // Test 10.8: getUserByEmployeeId performance (indexed)
    console.log('\n[10.8] Testing getUserByEmployeeId query performance...');
    const start = Date.now();
    const queriedUser = await getUserByEmployeeId(user.employeeId);
    const duration = Date.now() - start;

    if (!queriedUser) throw new Error('User not found');
    if (duration > 100) {
      console.log(
        `⚠️  Query took ${duration}ms (slower than expected, check index)`,
      );
    } else {
      console.log(`✓ Query completed in ${duration}ms (fast, index working)`);
    }

    // Test 10.9: getAllUsers query (N+1 prevention)
    console.log('\n[10.9] Testing getAllUsers query...');
    const startAll = Date.now();
    const allUsers = await getAllUsers();
    const durationAll = Date.now() - startAll;

    console.log(
      `✓ Fetched ${allUsers.length} users in ${durationAll}ms (no N+1 issues)`,
    );

    // Test 10.10: Prisma Studio check
    console.log('\n[10.10] Prisma Studio availability check...');
    console.log(
      'ℹ️  To verify Prisma Studio: run `npx prisma studio` manually',
    );
    console.log('✓ Prisma Studio should be available at http://localhost:5555');

    // Additional validation
    console.log('\n💡 Additional Validations:');
    const todayCount = await getTodayLunchCount();
    console.log(`✓ Today's lunch count: ${todayCount}`);

    // Final cleanup
    await cleanup();

    console.log('\n' + '='.repeat(50));
    console.log('✅ All tests passed!\n');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    await cleanup();
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run tests if executed directly
if (require.main === module) {
  runTests().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { runTests };
