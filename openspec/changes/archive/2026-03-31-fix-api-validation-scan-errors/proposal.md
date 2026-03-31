## Why

Runtime diagnostics from the Next.js MCP server revealed four active defects
that degrade reliability, performance, and UX: a validation error in
`/api/register` is surfaced as a server crash (500) instead of a client error
(400); the scan page silently swallows the "duplicate scan" response; face-api.js
models are re-initialised on every cold-module load causing a 5 × scan-time
regression; and Prisma drops its Postgres connection during idle periods, adding
unpredictable latency on the first post-idle request.

## What Changes

- **`/api/register` — HTTP status on validation failure**: Return `400 Bad Request`
  (with a structured Zod error body) instead of `500 Internal Server Error` when
  input fails Zod validation.
- **`/scan` page — error response parsing**: Fix the client-side `catch` block so
  that a `success: false` duplicate-scan response is displayed correctly instead
  of logging `Scan error: {}`.
- **face-api.js model caching**: Store the TensorFlow.js backend + loaded model
  state in a Node.js module-level singleton so models survive hot-reload cycles
  and are never re-initialised mid-session (eliminates the `cpu backend was already
registered` warning and the 3 532 ms `cache-load` spike).
- **Prisma connection keep-alive**: Add `connection_limit` and `pool_timeout`
  parameters to the `DATABASE_URL` and configure Prisma to emit a periodic
  keep-alive query, eliminating idle-connection drops.

## Capabilities

### New Capabilities

_(none — all changes harden existing behaviour)_

### Modified Capabilities

- `registration-workflow`: Validation errors must return `400` with a structured
  error body (`{ success: false, error: "VALIDATION_ERROR", details: [...] }`);
  server faults remain `500`.
- `scan-workflow`: Client must correctly parse `success: false` duplicate-scan
  responses and display the "Already taken" state; an empty-object error must
  never reach the console.
- `face-model-loading`: Models must be initialised at most **once** per process
  lifetime (module-level singleton); the `cpu backend was already registered`
  warning must not appear; `cache-load` must complete in < 50 ms on warm paths.
- `database-connection`: The Prisma client must maintain an active Postgres
  connection across idle periods using connection-pool configuration; no
  `Error { kind: Closed }` entries should appear in the server log under normal
  operating conditions.

## Impact

| Area              | Files                                                                                 |
| ----------------- | ------------------------------------------------------------------------------------- |
| API route         | `src/app/api/register/route.ts`                                                       |
| Scan page client  | `src/app/scan/page.tsx`                                                               |
| Face model loader | `src/lib/face/` (model-singleton utility)                                             |
| Prisma client     | `src/lib/prisma.ts`, `.env.local` (`DATABASE_URL`)                                    |
| Specs (delta)     | `registration-workflow`, `scan-workflow`, `face-model-loading`, `database-connection` |

No breaking changes to external API contracts or the database schema.
