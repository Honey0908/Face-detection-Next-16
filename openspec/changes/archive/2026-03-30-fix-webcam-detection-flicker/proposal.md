## Why

The face capture UI flickers between "scanning" and "face detected" states during continuous detection, creating a confusing operator experience and reducing trust in scan readiness. This should be fixed now because the issue directly affects core registration and scan workflows.

### Problem Statement

The webcam detection loop updates transient processing state on every frame, and the UI renders that state directly for button enablement and status messaging. As a result, users see rapid state oscillation and unstable capture affordances.

## What Changes

- Update webcam detection loop behavior so UI-facing detection state is not reset to transient "detecting" on every detection tick.
- Add overlap protection so only one async detection pass runs at a time.
- Add short stability gating (consecutive positive detections) before exposing "ready to capture" state.
- Preserve existing error and timeout handling semantics.
- Keep existing API contracts and component props unchanged.

### Scope

- In scope:
  - Detection state transition behavior in the webcam capture component.
  - UI stability for status text, guidance text, and capture button state.
  - Lightweight tuning to reduce frame-level jitter impact.
- Out of scope:
  - Face matching algorithm or backend matching threshold behavior.
  - Major UX redesign of scan and registration pages.
  - Changes to data models, persistence, or API routes.

### Non-goals

- Do not change lunch-record business rules.
- Do not introduce new public component props for this fix.
- Do not modify storage format for descriptors.

## Capabilities

### New Capabilities

- `detection-state-stabilization`: Stabilize camera-side face detection state transitions so UI does not flicker during continuous scanning.

### Modified Capabilities

- `webcam-capture`: Update continuous detection requirements to avoid per-frame transient-state flicker and enforce stable ready-state signaling.

## Impact

- Affected code:
  - `src/components/organisms/WebcamCapture/WebcamCapture.tsx`
- Potentially affected behavior:
  - Registration capture readiness messaging.
  - Scan readiness messaging and capture button enablement.
- Dependencies/systems:
  - No new dependencies required.
  - No API or schema changes required.
