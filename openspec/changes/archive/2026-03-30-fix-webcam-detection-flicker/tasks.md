## 1. Detection Loop Stabilization

- [x] 1.1 Add in-flight detection guard in `WebcamCapture` to prevent overlapping async detection runs (Validation: no concurrent detection invocation when interval ticks overlap).
- [x] 1.2 Remove per-tick UI transition to transient detecting state and keep last stable state until new result is resolved (Validation: status text/button no longer alternates each tick).

## 2. Stable Ready-State Gating

- [x] 2.1 Add consecutive positive detection gating for `FACE_FOUND` before enabling capture-ready UI (Validation: isolated single positive frame does not enable capture).
- [x] 2.2 Reset stability counters on non-face results and keep error handling behavior unchanged (Validation: non-face transitions clear readiness and errors still surface).

## 3. Verification

- [x] 3.1 Run targeted checks (type/lint or equivalent) and verify no regressions in `WebcamCapture` compile/runtime behavior (Validation: checks pass or issues documented).
- [x] 3.2 Manually verify registration and scan pages no longer flicker between waiting and ready states under steady camera input (Validation: both flows show stable guidance/button state).
