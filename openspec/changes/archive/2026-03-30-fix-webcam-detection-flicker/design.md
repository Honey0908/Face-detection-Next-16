## Context

`WebcamCapture` performs continuous face detection on an interval and currently updates a shared UI-facing detection state twice per cycle: first to a transient processing state and then to a result state. In practice, this creates visible oscillation in guidance text and capture button state, especially when model confidence fluctuates near threshold.

The defect impacts both registration and lunch scan flows because both consume the same camera component. The fix must be local to webcam capture behavior and preserve existing APIs and business rules.

## Goals / Non-Goals

**Goals:**

- Eliminate visible UI flicker caused by per-tick transient state resets.
- Prevent overlapping asynchronous detections from racing and causing out-of-order UI state updates.
- Stabilize readiness signaling by requiring short consecutive positive detections before showing capture-ready UI.
- Keep existing component props and API contracts unchanged.

**Non-Goals:**

- No backend, schema, or API route changes.
- No redesign of scan workflow states outside `WebcamCapture`.
- No change to descriptor extraction or matching logic.

## Decisions

### Decision 1: Remove per-frame UI transition to transient detecting state

- Choice: Do not set `detectionState` to `DETECTING` on every interval tick.
- Rationale: Transient processing state is useful internally but should not be rendered each frame; rendering it causes guaranteed oscillation.
- Alternative considered: Keep `DETECTING` and debounce rendering. Rejected because it adds complexity and still risks unstable state transitions.

### Decision 2: Add in-flight detection lock

- Choice: Use a ref-based guard (`isDetectingRef`) to skip a new tick while a detection promise is still running.
- Rationale: `setInterval` can trigger a second run before the first resolves, producing race conditions and stale writes.
- Alternative considered: Replace `setInterval` with recursive `setTimeout`. Deferred to keep change minimal.

### Decision 3: Add short hysteresis for ready state

- Choice: Require at least 2 consecutive `FACE_FOUND` results before setting UI-ready state.
- Rationale: Reduces frame-level threshold jitter without making capture feel sluggish.
- Alternative considered: Increase threshold only. Rejected as sole fix because it does not address state race/toggle behavior.

## Risks / Trade-offs

- [Risk] Slightly slower readiness indication due to consecutive-frame gating.
  - Mitigation: Keep requirement minimal (2 frames) and maintain current interval.

- [Risk] If detection throughput is very low on older devices, lock may reduce effective sample rate.
  - Mitigation: Guard only skips overlapping runs; does not reduce successful single-run cadence.

- [Risk] Existing tests may assume immediate single-frame readiness.
  - Mitigation: Update/add tests to validate stable transition behavior.

## Migration Plan

- Implement changes in `src/components/organisms/WebcamCapture/WebcamCapture.tsx` behind existing interface.
- Run lint/type checks and targeted behavior verification in registration/scan flows.
- Rollback strategy: revert the component-level change if unexpected regressions appear.

## Open Questions

- Should stability gating count be configurable later for device-specific tuning?
- Should we evolve from interval polling to requestAnimationFrame/setTimeout loop in a future performance change?
