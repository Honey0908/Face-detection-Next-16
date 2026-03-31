## MODIFIED Requirements

### Requirement: Scan API endpoint integration

The system SHALL submit face descriptors to `/api/lunch` endpoint for matching and recording, and MUST parse duplicate responses into a deterministic UI state.

#### Scenario: Scan request format

- **WHEN** submitting a scan
- **THEN** the system sends POST request with `{ faceDescriptor: number[] }` (128 numbers)

#### Scenario: Success response

- **WHEN** API responds with success
- **THEN** the system receives `{ success: true, message: string, employeeName: string, scannedTime: string }`

#### Scenario: Duplicate response

- **WHEN** API detects duplicate scan
- **THEN** the system receives `{ success: false, error: "DUPLICATE_SCAN", message: string, employeeName: string }`

#### Scenario: Not found response

- **WHEN** API finds no match
- **THEN** the system receives `{ success: false, error: "NOT_REGISTERED", message: string }`

#### Scenario: Error response

- **WHEN** API encounters an error
- **THEN** the system receives `{ success: false, error: string, message?: string }`

### Requirement: Scan state machine implementation

The system SHALL implement explicit state machine for scan flow with 7 states and map duplicate responses to `ALREADY_TAKEN` without falling through to generic error state.

#### Scenario: IDLE state

- **WHEN** in IDLE state
- **THEN** the system displays "Press Start to scan" button and webcam is off

#### Scenario: CAMERA_LOADING state

- **WHEN** user clicks Start button
- **THEN** the system transitions to CAMERA_LOADING, requests webcam permissions, and shows "Loading camera..." message

#### Scenario: SCANNING state

- **WHEN** camera is ready
- **THEN** the system transitions to SCANNING, shows live video feed, and continuously detects faces

#### Scenario: MATCHING state

- **WHEN** a valid face is detected in SCANNING
- **THEN** the system transitions to MATCHING, shows "Matching..." indicator, and sends descriptor to API

#### Scenario: SUCCESS state

- **WHEN** match is found and lunch is recorded
- **THEN** the system transitions to SUCCESS, displays "Success! Welcome, [Name]", and starts 5-second cooldown

#### Scenario: ALREADY_TAKEN state from API duplicate

- **WHEN** API returns `success: false` with `error: "DUPLICATE_SCAN"`
- **THEN** the system transitions to ALREADY_TAKEN, displays "Already recorded", and starts 5-second cooldown

#### Scenario: NOT_REGISTERED state

- **WHEN** no match is found (distance >0.6)
- **THEN** the system transitions to NOT_REGISTERED, displays "Not registered" message, and returns to SCANNING after 3 seconds

#### Scenario: ERROR state

- **WHEN** any non-duplicate error occurs (network, camera, malformed response, etc.)
- **THEN** the system transitions to ERROR, displays error message, and provides "Try Again" button
