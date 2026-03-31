## 1. Register API — Validation Error Response

- [x] 1.1 Read `src/app/api/register/route.ts` and identify the current error catch block
- [x] 1.2 Import or reference the existing Zod validation schema used in the route
- [x] 1.3 Add a type-narrowing check for `ZodError` (or equivalent validation error type) in the catch block
- [x] 1.4 Return `HTTP 400` with `{ success: false, error: "VALIDATION_ERROR", details: z.issues }` for validation failures
- [x] 1.5 Ensure all non-validation exceptions continue to return `HTTP 500` with `{ success: false, error: "INTERNAL_ERROR", message: string }`
- [x] 1.6 Verify: send a POST to `/api/register` with `employeeId: "AB"` — response must be 400 with `VALIDATION_ERROR` details array

## 2. Scan Page — Duplicate Response Parsing

- [x] 2.1 Read `src/app/scan/page.tsx` and locate the API response handling code after the `/api/lunch` fetch
- [x] 2.2 Define (or import) a typed interface for all possible API response shapes: success, duplicate, not-found, error
- [x] 2.3 Replace bare `catch(error)` JSON logging with structured parsing that checks `response.success` and `response.error` fields
- [x] 2.4 Map `error === "DUPLICATE_SCAN"` (or `success: false` with duplicate message) to the `ALREADY_TAKEN` scan state
- [x] 2.5 Ensure no `Scan error: {}` log ever reaches the browser console for any defined response shape
- [x] 2.6 Verify: trigger a duplicate scan — UI must show "Already recorded" state, not empty error object in console

## 3. Face Model Loading — Process-Level Singleton

- [x] 3.1 Read the current model initialization code in `src/lib/face/` and identify where TensorFlow backend and model loads are triggered
- [x] 3.2 Introduce a module-level `let initPromise: Promise<void> | null = null` guard variable
- [x] 3.3 Wrap the TensorFlow backend registration and `faceapi.nets` load calls so they only execute when `initPromise` is `null`
- [x] 3.4 Return the existing `initPromise` if initialization is already in progress or complete
- [x] 3.5 Reset `initPromise` to `null` on initialization failure so subsequent retries trigger a clean attempt
- [x] 3.6 Verify: perform two sequential scan operations — the `cpu backend was already registered` warning must not appear after the first scan
- [x] 3.7 Verify: check dev log — warm-path `cache-load` time must be under 50ms for the second scan

## 4. Prisma Client — Connection Keep-Alive

- [x] 4.1 Read `src/lib/prisma.ts` and confirm the singleton Prisma client setup
- [x] 4.2 Add `connection_limit` and `pool_timeout` parameters to `DATABASE_URL` in `.env.local` (e.g., `?connection_limit=10&pool_timeout=5`)
- [x] 4.3 Add a keep-alive interval in `src/lib/prisma.ts` that runs `prisma.$queryRaw\`SELECT 1\`` on a conservative schedule (e.g., every 4 minutes)
- [x] 4.4 Guard the keep-alive so it only starts when `process.env.NODE_ENV !== 'test'`
- [x] 4.5 Wrap the keep-alive query in try/catch that logs a warning without exposing DATABASE_URL or credentials
- [x] 4.6 Verify: leave the app idle for 5+ minutes, then trigger a scan — no `Error { kind: Closed }` entry should appear in the server log

## 5. Observability & Logging Checks

- [x] 5.1 Confirm register route logs the validation error type and field path at INFO or WARN level (not ERROR for 400s)
- [x] 5.2 Confirm scan route emits structured log entry for duplicate scan attempts with `employeeName` field
- [x] 5.3 Confirm face model loader emits a single "Face models loaded" log on first initialization and nothing on subsequent calls
- [x] 5.4 Confirm Prisma keep-alive logs a WARN (not ERROR) on transient failure, with no credential leakage

## 6. Verification — End-to-End Checks

- [x] 6.1 Run the dev server and open the Next.js MCP log — confirm zero `cpu backend was already registered` warnings during a normal scan session
- [x] 6.2 Submit a registration with `employeeId: "AB"` — browser network panel must show 400, not 500
- [x] 6.3 Scan twice as the same employee in one day — second scan must show `ALREADY_TAKEN` UI state, no console error
- [x] 6.4 Check dev log after idle period — no `Error { kind: Closed }` under normal operation
- [x] 6.5 Run `openspec validate --changes fix-api-validation-scan-errors` — must report 1 passed, 0 failed
