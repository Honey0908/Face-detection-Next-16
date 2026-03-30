## MODIFIED Requirements

### Requirement: Frame capture from video stream

The system SHALL capture still frames from live video for face detection and keep capture-readiness signaling stable across continuous detection cycles.

#### Scenario: Canvas-based frame capture

- **WHEN** capturing a frame
- **THEN** the system draws the current video frame to a canvas element

#### Scenario: Frame format conversion

- **WHEN** a frame is captured
- **THEN** the system converts it to ImageData or HTMLCanvasElement for face-api.js processing

#### Scenario: Capture timing

- **WHEN** performing continuous detection
- **THEN** the system captures frames at regular intervals based on detection performance

#### Scenario: Stable ready-state transition

- **WHEN** continuous detection reports consecutive valid single-face results
- **THEN** the system enters ready-to-capture UI state without transient per-frame oscillation
