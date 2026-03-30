# Face Recognition Testing & Validation Guide

## Overview

This document provides comprehensive testing procedures for the Smart Office Lunch Tracking System. All tests should be executed before production deployment.

---

## Test Environment Setup

### Prerequisites

- Next.js development server running (`pnpm dev`)
- PostgreSQL database with migrations applied
- Face-api.js models downloaded to `/public/models/`
- Test user data (minimum 10 employees registered)
- Multiple test devices (desktop, laptop with different cameras)

### Test Data Requirements

```typescript
// Minimum test dataset
- 10 registered employees with varied:
  * Face shapes (round, oval, square)
  * Skin tones (diverse representation)
  * Accessories (glasses, no glasses, beard, clean-shaven)
  * Lighting conditions during registration

// Additional test users for edge cases:
- 2 similar-looking individuals (siblings, twins if available)
- 1 user with glasses (both with/without in different captures)
- 1 user with significant beard growth difference
```

---

## Group 15.1: Registration Workflow Testing

### Objective

Verify descriptor averaging works correctly with 3, 4, and 5 face captures.

### Test Cases

#### TC 15.1.1: Registration with 3 Captures (Minimum)

**Steps**:

1. Navigate to registration page
2. Enter employee details:
   ```
   Employee ID: TEST001
   Name: John Doe
   Department: Engineering
   Email: john@test.com
   ```
3. Capture exactly 3 face images (wait for "Face detected!" before each capture)
4. Submit registration

**Expected Results**:

- ✅ All 3 captures accepted
- ✅ Descriptor averaging succeeds
- ✅ Success response with `userId`
- ✅ Console log: "Averaged 3 descriptors for user TEST001"
- ✅ Database record created with 128-element descriptor array

**Validation Queries**:

```sql
-- Check user exists
SELECT id, "employeeId", name, "faceDescriptor"
FROM "User" WHERE "employeeId" = 'TEST001';

-- Verify descriptor length
SELECT array_length("faceDescriptor", 1) FROM "User"
WHERE "employeeId" = 'TEST001';
-- Expected: 128
```

#### TC 15.1.2: Registration with 5 Captures (Maximum)

**Steps**:

1. Register new employee with different ID: TEST002
2. Capture 5 face images with varied angles:
   - Face straight
   - Face slightly left
   - Face slightly right
   - Face slightly up
   - Face slightly down
3. Submit

**Expected Results**:

- ✅ All 5 captures accepted
- ✅ Better accuracy than 3-capture registration (validate in scan tests)
- ✅ Descriptor array length: 128
- ✅ Averaging completes in <500ms (check performance log)

#### TC 15.1.3: Registration with 4 Captures (Mid-Range)

**Steps**:

1. Register employee TEST003 with 4 captures
2. Vary lighting: 2 captures in good lighting, 2 in moderate lighting

**Expected Results**:

- ✅ Registration succeeds
- ✅ Descriptor quality sufficient for matching

#### TC 15.1.4: Attempt Registration with <3 Captures (Edge Case)

**Steps**:

1. Try to submit with only 2 captures

**Expected Results**:

- ❌ Validation error: "At least 3 face captures required"
- ❌ Status 400 Bad Request

#### TC 15.1.5: Attempt Registration with >5 Captures (Edge Case)

**Steps**:

1. Try to capture 6 images

**Expected Results**:

- ❌ Validation error: "Maximum 5 face captures allowed"
- ❌ Status 400 Bad Request

---

## Group 15.2: Lunch Scan Workflow Testing

### Objective

Validate complete scan workflow: first scan, duplicate prevention, unregistered users.

#### TC 15.2.1: First Scan of the Day (Happy Path)

**Setup**: Use registered employee TEST001

**Steps**:

1. Navigate to lunch scan page
2. Position face in camera
3. Wait for "Face detected!" message
4. Allow system to auto-scan (or click capture if manual)

**Expected Results**:

- ✅ Face match found
- ✅ Confidence: `distance < 0.6`
- ✅ Success message: "Lunch recorded successfully"
- ✅ Display: Employee name, scan time
- ✅ Database record created in `LunchRecord` table
- ✅ Response time: <300ms (see performance log)

**Validation Queries**:

```sql
-- Check lunch record created
SELECT id, "userId", date, timestamp, confidence
FROM "LunchRecord"
WHERE "userId" = (SELECT id FROM "User" WHERE "employeeId" = 'TEST001')
AND date = CURRENT_DATE;
```

#### TC 15.2.2: Duplicate Scan Prevention

**Setup**: Use same employee TEST001 immediately after TC 15.2.1

**Steps**:

1. Scan face again on same day

**Expected Results**:

- ⚠️ Status: Success (200) but duplicate detected
- ⚠️ Message: "Lunch already recorded today"
- ⚠️ Display: Employee name with "Already taken" indicator
- ⚠️ No new database record created
- ⚠️ Console log: "Duplicate scan attempt for user [userId]"

**Validation Query**:

```sql
-- Verify only 1 record exists for today
SELECT COUNT(*) FROM "LunchRecord"
WHERE "userId" = (SELECT id FROM "User" WHERE "employeeId" = 'TEST001')
AND date = CURRENT_DATE;
-- Expected: 1
```

#### TC 15.2.3: Unregistered User Scan

**Setup**: Use face not in database (test with colleague not registered)

**Steps**:

1. Scan unregistered face

**Expected Results**:

- ❌ Status: 404 Not Found
- ❌ Message: "Employee not found. Please register first."
- ❌ No database record created
- ❌ Console log: Face matching result shows no match within threshold

#### TC 15.2.4: Next Day Scan (Same Employee)

**Setup**: Change system date or wait until next day

**Steps**:

1. Scan TEST001 again on different day

**Expected Results**:

- ✅ Scan succeeds (new record created)
- ✅ Previous day's record still exists
- ✅ Both records retrievable by date

**Validation Query**:

```sql
-- Should show 2 records (different dates)
SELECT date, timestamp FROM "LunchRecord"
WHERE "userId" = (SELECT id FROM "User" WHERE "employeeId" = 'TEST001')
ORDER BY date DESC;
```

---

## Group 15.3: Duplicate Prevention Logic

### Objective

Thoroughly verify database-level duplicate prevention.

#### TC 15.3.1: Concurrent Duplicate Attempts

**Setup**: Simulate race condition

**Steps**:

1. Open 2 browser tabs simultaneously
2. Position TEST001 face in both
3. Trigger scan at exact same time (within 100ms)

**Expected Results**:

- ✅ Only 1 record created
- ✅ One request succeeds, other returns "Already recorded"
- ✅ Database transaction isolation prevents double-insert

#### TC 15.3.2: Cross-Day Boundary Testing

**Setup**: Scan at 11:59 PM

**Steps**:

1. Scan TEST002 at 23:59:00
2. Wait for midnight (00:00:01)
3. Scan TEST002 again at 00:00:05

**Expected Results**:

- ✅ First scan: Record with `date = 2026-02-26`
- ✅ Second scan: Record with `date = 2026-02-27`
- ✅ Both records exist (different dates)

---

## Group 15.4: Face Matching Accuracy

### Objective

Validate matching threshold 0.6 achieves acceptable true positive rate without false positives.

#### TC 15.4.1: True Positive Testing

**Setup**: All registered test users

**Steps**:

1. For each registered user (10 total):
   - Scan under similar conditions as registration
   - Record: match success, distance, confidence level

**Expected Results**:

- ✅ True positive rate: ≥95% (9-10 out of 10 users match)
- ✅ Average distance: <0.5 for valid matches
- ✅ Confidence: "high" or "very-high" for good matches

**Test Data Log**:

```
Employee ID | Match | Distance | Confidence | Notes
-----------+-------+----------+------------+-------
TEST001     | ✓     | 0.42     | high       | Good lighting
TEST002     | ✓     | 0.38     | very-high  | Similar to registration
TEST003     | ✓     | 0.51     | high       | Slight angle difference
...
```

#### TC 15.4.2: False Positive Prevention

**Setup**: 5 unregistered individuals

**Steps**:

1. Scan 5 different unregistered faces
2. Record if any incorrectly match registered users

**Expected Results**:

- ❌ False positive rate: 0% (no unregistered users should match)
- ❌ All distances: >0.6
- ❌ All return "Employee not found"

#### TC 15.4.3: Similar Faces Differentiation

**Setup**: Two similar-looking test users (if available)

**Steps**:

1. Register both as TEST_SIM1 and TEST_SIM2
2. Scan TEST_SIM1 → verify matches TEST_SIM1 (not TEST_SIM2)
3. Scan TEST_SIM2 → verify matches TEST_SIM2 (not TEST_SIM1)

**Expected Results**:

- ✅ Correct user matches in both cases
- ✅ Distance to correct user: <0.6
- ✅ Distance to similar user: typically 0.65-0.8

---

## Group 15.5: Camera Permissions Testing

### Objective

Validate handling of camera permission scenarios.

#### TC 15.5.1: Permission Granted

**Steps**:

1. Fresh browser with no stored permissions
2. Navigate to scan page
3. Click "Allow" on camera permission prompt

**Expected Results**:

- ✅ Camera stream starts
- ✅ Video feed displays
- ✅ Status: "Camera active"

#### TC 15.5.2: Permission Denied

**Steps**:

1. Navigate to scan page
2. Click "Block" on camera permission prompt

**Expected Results**:

- ❌ Error message: "Camera access denied. Please grant permissions."
- ❌ Video feed not displayed
- ❌ Retry button available

#### TC 15.5.3: Permission Revoked Mid-Session

**Steps**:

1. Start with camera active
2. Revoke permission via browser settings (lock icon → Site settings)
3. Try to scan

**Expected Results**:

- ❌ Error: "Camera access lost"
- ❌ Graceful degradation (no crash)
- ❌ Retry button functional

#### TC 15.5.4: Browser Without Camera

**Setup**: Test on desktop without webcam

**Steps**:

1. Try to access scan page

**Expected Results**:

- ❌ Error: "No camera device found"
- ❌ Message: "Please use a device with a camera"

---

## Group 15.6: HTTPS Requirement Validation

### Objective

Verify webcam access blocked on HTTP in production.

#### TC 15.6.1: HTTPS Environment (Production)

**Steps**:

1. Deploy to production with HTTPS (e.g., https://lunch-tracker.company.com)
2. Access scan page

**Expected Results**:

- ✅ Camera permission prompt appears
- ✅ Webcam accessible

#### TC 15.6.2: HTTP Environment (Should Fail)

**Steps**:

1. Try to access via HTTP (e.g., http://localhost:3000 on remote server)

**Expected Results**:

- ❌ Browser error: "getUserMedia requires HTTPS"
- ❌ Camera not accessible
- ❌ Fallback error message displayed

#### TC 15.6.3: Localhost Exception

**Steps**:

1. Access `http://localhost:3000` in development

**Expected Results**:

- ✅ Webcam works (localhost exempt from HTTPS requirement)

---

## Group 15.7: Error Scenario Testing

### Objective

Validate graceful error handling for edge cases.

#### TC 15.7.1: Network Failure During Scan

**Steps**:

1. Initiate scan
2. Disconnect network (airplane mode) before response
3. Wait for timeout

**Expected Results**:

- ❌ Error message: "Network error. Please check your connection."
- ❌ Retry option available
- ❌ No corrupt data written to database

#### TC 15.7.2: Camera Disconnection Mid-Scan

**Steps**:

1. Start camera stream
2. Physically disconnect USB webcam (or simulate)
3. Observe behavior

**Expected Results**:

- ❌ Error: "Camera disconnected"
- ❌ Video stream stops gracefully
- ❌ Retry button appears
- ❌ No application crash

#### TC 15.7.3: Model Loading Failure

**Steps**:

1. Remove or corrupt model files in `/public/models/`
2. Restart server
3. Try to scan

**Expected Results**:

- ❌ Error: "Failed to load face detection models"
- ❌ Console error with specific model name
- ❌ Scan button disabled
- ❌ Fallback message: "Please contact admin"

#### TC 15.7.4: Database Connection Failure

**Steps**:

1. Stop PostgreSQL service
2. Attempt scan

**Expected Results**:

- ❌ Status: 500 Internal Server Error
- ❌ Error: "Database connection failed"
- ❌ No crash, application remains responsive

---

## Group 15.8: Performance Testing with Scale

### Objective

Verify scan completes in <300ms with 500 registered users.

### Setup

```bash
# Generate 500 test users with synthetic descriptors
pnpm run test:seed-users --count 500
```

#### TC 15.8.1: Baseline Performance (10 Users)

**Steps**:

1. Database: 10 registered users
2. Scan registered user 10 times
3. Record average time

**Expected Results**:

- ⏱️ Average: <150ms
- ⏱️ P95: <200ms
- ⏱️ Max: <250ms

#### TC 15.8.2: Scale Test (500 Users)

**Steps**:

1. Database: 500 registered users
2. Scan registered user 20 times
3. Measure performance breakdown:
   - Descriptor cache load
   - Face matching loop
   - Database query

**Expected Results**:

- ⏱️ Total time: <300ms (target)
- ⏱️ Average: <280ms
- ⏱️ P95: <350ms
- ⏱️ Max: <400ms

**Performance Breakdown**:

```
Operation          | Target | Measured | Status
------------------+--------+----------+--------
Parse request      | <10ms  | ~5ms     | ✅
Schema validation  | <5ms   | ~3ms     | ✅
Descriptor cache   | <20ms  | ~15ms    | ✅
Face matching      | <200ms | ~180ms   | ✅
DB duplicate check | <30ms  | ~20ms    | ✅
DB insert          | <30ms  | ~25ms    | ✅
Total              | <300ms | ~250ms   | ✅
```

#### TC 15.8.3: Worst-Case Scenario

**Setup**: User matches last in descriptor list (500th comparison)

**Steps**:

1. Insert target user descriptor last in cache
2. Scan target user

**Expected Results**:

- ⏱️ Still completes in <400ms
- ⏱️ Optimization: Early exit if distance <0.3 (strong match)

#### TC 15.8.4: Concurrent User Load

**Setup**: Simulate 10 simultaneous scans

**Steps**:

1. Use load testing tool (e.g., k6, Apache JMeter)

```javascript
// k6 test script
export default function () {
  http.post('http://localhost:3000/api/lunch', payload);
}
```

2. Send 10 concurrent requests

**Expected Results**:

- ✅ All requests succeed
- ✅ Average response: <500ms
- ✅ No database deadlocks
- ✅ Server CPU: <70%

---

## Test Summary Template

```
Test Date: YYYY-MM-DD
Tester: [Name]
Environment: [dev/staging/production]

Group 15.1: Registration Workflow
[x] TC 15.1.1 - 3 captures: PASS
[x] TC 15.1.2 - 5 captures: PASS
[x] TC 15.1.3 - 4 captures: PASS
[x] TC 15.1.4 - <3 captures: PASS
[x] TC 15.1.5 - >5 captures: PASS

Group 15.2: Scan Workflow
[x] TC 15.2.1 - First scan: PASS
[x] TC 15.2.2 - Duplicate: PASS
[x] TC 15.2.3 - Unregistered: PASS
[x] TC 15.2.4 - Next day: PASS

Group 15.3: Duplicate Prevention
[x] TC 15.3.1 - Concurrent: PASS
[x] TC 15.3.2 - Cross-day: PASS

Group 15.4: Matching Accuracy
[x] TC 15.4.1 - True positive: 95% (9.  5/10)
[x] TC 15.4.2 - False positive: 0% (0/5)
[x] TC 15.4.3 - Similar faces: PASS

Group 15.5: Camera Permissions
[x] TC 15.5.1 - Granted: PASS
[x] TC 15.5.2 - Denied: PASS
[x] TC 15.5.3 - Revoked: PASS
[x] TC 15.5.4 - No camera: PASS

Group 15.6: HTTPS Requirement
[x] TC 15.6.1 - HTTPS: PASS
[x] TC 15.6.2 - HTTP (blocked): PASS
[x] TC 15.6.3 - Localhost: PASS

Group 15.7: Error Scenarios
[x] TC 15.7.1 - Network failure: PASS
[x] TC 15.7.2 - Camera disconnect: PASS
[x] TC 15.7.3 - Model loading: PASS
[x] TC 15.7.4 - Database failure: PASS

Group 15.8: Performance at Scale
[x] TC 15.8.1 - 10 users: 145ms avg ✅
[x] TC 15.8.2 - 500 users: 265ms avg ✅
[x] TC 15.8.3 - Worst case: 380ms ✅
[x] TC 15.8.4 - Concurrent: 450ms avg ✅

Overall Result: PASS / FAIL
Blockers: [None / List issues]
Recommendations: [Optimization suggestions]
```

---

## Automated Testing Script

For CI/CD integration:

```typescript
// test/integration/face-recognition.test.ts
import { describe, it, expect, beforeAll } from 'vitest';

describe('Face Recognition Integration Tests', () => {
  beforeAll(async () => {
    // Seed test data
    await seedTestUsers();
  });

  describe('Group 15.1: Registration', () => {
    it('should accept 3 captures', async () => {
      const res = await fetch('/api/register', {
        method: 'POST',
        body: JSON.stringify({
          employeeId: 'TEST001',
          name: 'Test User',
          department: 'QA',
          faceDescriptors: generate3Descriptors(),
        }),
      });
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.success).toBe(true);
    });

    // Add more tests...
  });

  describe('Group 15.2: Scan Workflow', () => {
    it('should record first lunch scan', async () => {
      // Test implementation
    });

    it('should prevent duplicate scan', async () => {
      // Test implementation
    });
  });

  // More test groups...
});
```

---

## Sign-Off Checklist

Before marking Group 15 tasks complete:

- [ ] All test cases executed at least once
- [ ] Test results documented in summary template
- [ ] Performance metrics meet targets (<300ms at 500 users)
- [ ] Zero critical bugs found or all resolved
- [ ] Edge cases handled gracefully
- [ ] Error messages user-friendly and actionable
- [ ] Compatibility verified across browsers
- [ ] Documentation updated with findings

---

## Next Steps

After completing Group 15:

1. Address any FAIL results
2. Document known limitations
3. Proceed to Group 16 (Documentation & Deployment)
4. Schedule user acceptance testing (UAT)
5. Plan production rollout
