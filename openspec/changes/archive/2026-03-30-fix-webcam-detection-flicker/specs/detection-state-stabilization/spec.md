## ADDED Requirements

### Requirement: Stable capture readiness signaling

The system SHALL expose capture-ready UI only after consecutive stable single-face detections are observed during continuous scanning.

#### Scenario: Consecutive positive detections enable ready state

- **WHEN** the detector returns `FACE_FOUND` in consecutive detection cycles
- **THEN** the UI enters capture-ready state and enables the capture action

#### Scenario: Single-frame positive jitter does not enable ready state

- **WHEN** only one isolated `FACE_FOUND` result is observed between non-matching frames
- **THEN** the UI remains in non-ready state

### Requirement: No transient per-frame UI oscillation

The system SHALL avoid rendering a transient processing-only state as the primary UI state on every detection interval tick.

#### Scenario: Processing between detections

- **WHEN** a detection cycle starts while continuous scanning is active
- **THEN** the UI keeps the last stable detection outcome until a new stable outcome is available

#### Scenario: Guidance and button consistency

- **WHEN** a user keeps their face within frame under stable conditions
- **THEN** guidance text and capture button state remain consistent without rapid alternating labels

### Requirement: Single in-flight detection execution

The system SHALL ensure at most one asynchronous detection run is active at a time for a webcam stream.

#### Scenario: Interval tick while detection is in-flight

- **WHEN** a new detection interval tick occurs before the previous detection promise resolves
- **THEN** the new tick is ignored and no overlapping detection run is started

#### Scenario: Detection completion unlocks next run

- **WHEN** the active detection run completes or fails
- **THEN** the system allows the next scheduled detection cycle to proceed
