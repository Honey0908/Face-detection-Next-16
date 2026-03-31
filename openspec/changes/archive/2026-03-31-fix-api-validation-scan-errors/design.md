## Context

Next.js MCP diagnostics and dev log inspection identified reliability and performance defects across four existing capabilities: registration API validation handling, scan flow duplicate-state rendering, face model initialization lifecycle, and Prisma database connection longevity.

Current state:
- Validation failures in the register endpoint are propagating as 500 errors.
- Duplicate scan responses are not surfaced correctly in the scan UI and collapse into an empty error object.
- Face model initialization incurs repeated backend registration and expensive cache-load time during scan requests.
- Prisma occasionally reports closed Postgres connections after idle periods.

Constraints:
- Keep existing business behavior and API shape as stable as possible.
- Preserve privacy model (descriptor-only, no raw face image persistence).
- Avoid schema changes unless strictly required.
- Maintain compatibility with App Router and existing strict TypeScript rules.

Stakeholders:
- Employees performing scan operations.
- Admin users registering employees.
- Operators monitoring logs and system latency.

## Goals / Non-Goals

**Goals:**
- Return 400 for request validation issues in register API while retaining 500 for true server failures.
- Ensure scan UI renders duplicate-scan outcomes deterministically from structured API responses.
- Make face model/backend initialization idempotent per process to remove repeated registration and reduce warm-path latency.
- Stabilize Prisma connection behavior during idle intervals to reduce first-request failures and latency spikes.
- Add explicit observability signals for these paths so regressions are easy to detect.

**Non-Goals:**
- No redesign of face matching algorithm or threshold tuning.
- No database schema migrations for this change.
- No visual redesign of register/scan pages.
- No major auth or authorization changes.

## Decisions

1. Normalize API validation error handling in register route.
- Decision: Catch schema-validation exceptions and return a dedicated client-error payload with HTTP 400.
- Rationale: Validation failures are caller faults, not server faults; this enables correct client retries and cleaner monitoring.
- Alternative considered: Keep 500 but enrich message. Rejected because it preserves incorrect semantics and noisy error reporting.

2. Standardize scan client error parsing against response contract.
- Decision: Route all non-success responses through one typed parser branch that preserves message and error code.
- Rationale: Prevents empty-object logging and ensures duplicate scans map to the Already Taken UI state.
- Alternative considered: Infer state from status text only. Rejected due to brittle behavior and localization risk.

3. Use module-level singleton for face model/runtime initialization.
- Decision: Introduce a singleton guard in face model loading utility for TensorFlow backend and model load promises.
- Rationale: Ensures one-time initialization per process and removes repeated backend registration warnings.
- Alternative considered: Initialize in each request path with fast checks. Rejected due to race potential and repeated startup cost in dev/hot reload cycles.

4. Harden Prisma connection lifecycle with pool tuning and keep-alive.
- Decision: Set pool-related URL parameters and maintain lightweight periodic health query from shared Prisma client lifecycle utilities.
- Rationale: Reduces idle disconnects and lowers cold-after-idle request failures.
- Alternative considered: Reconnect on demand only. Rejected because it shifts failures to user-facing paths and increases tail latency.

5. Add measurable acceptance checks via logs and status codes.
- Decision: Keep structured logs for validation failures, duplicate scans, model init path, and DB health checks.
- Rationale: Verifiable outcomes are required for operational confidence and OpenSpec verification.
- Alternative considered: Rely on manual QA only. Rejected due to weak regression detection.

## Risks / Trade-offs

- [Risk] Overly broad validation catch may hide non-validation exceptions -> Mitigation: Narrow exception checks to explicit validation error types and rethrow unknown errors to 500 handler.
- [Risk] Singleton state can become stale after severe runtime faults -> Mitigation: Use promise-reset on initialization failure and expose controlled re-init path.
- [Risk] Keep-alive query may add low constant DB load -> Mitigation: Use conservative interval and lightweight query; disable in test environment.
- [Risk] UI error mapping changes may alter edge-case messaging -> Mitigation: Add integration tests for duplicate, validation, and unknown error branches.
- [Risk] Dev and production behavior can diverge under hot reload -> Mitigation: Validate in both local dev and production-like run mode.

## Migration Plan

1. Implement code changes in route handler, scan client, face model loader, and Prisma lifecycle utility.
2. Add or update tests for:
- Register validation returns 400 with structured details.
- Scan duplicate response maps to Already Taken state.
- Model init executes once and warm-path load is near-zero.
- Prisma idle periods do not emit closed-connection errors.
3. Verify using Next.js MCP and application logs:
- No repeated backend registration warnings on normal scan usage.
- No 500 responses for schema-invalid register requests.
- No empty-object scan errors for duplicate attempts.
4. Deploy with feature-safe defaults (no schema migration needed).
5. Rollback strategy:
- Revert route/client utility commits as one unit.
- Restore prior Prisma connection URL parameters if unexpected pool behavior appears.

## Open Questions

- Should the duplicate-scan response include a stable machine-readable error code everywhere for analytics consistency?
- What keep-alive interval best balances idle stability and DB load in the target hosting environment?
- Should model initialization metrics be exported to a dedicated performance dashboard or remain in structured logs only?
