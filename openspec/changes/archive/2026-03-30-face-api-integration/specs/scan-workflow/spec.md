## ADDED Requirements

### Requirement: Real-time lunch scanning workflow

The system SHALL enable employees to scan their face for automatic lunch recording.

#### Scenario: Successful scan flow

- **WHEN** an employee faces the camera and is recognized
- **THEN** the system detects face, extracts descriptor, matches against database, records lunch, and displays success message with employee name

#### Scenario: First scan of the day

- **WHEN** an employee scans for the first time on a given day
- **THEN** the system creates a lunch record with current date and timestamp

#### Scenario: Already scanned today

- **WHEN** an employee who already scanned today attempts another scan
- **THEN** the system displays "Lunch already recorded today, [Employee Name]" without creating duplicate record

#### Scenario: Employee not registered

- **WHEN** a face is detected but no match is found in database (distance >0.6)
- **THEN** the system displays "Employee not registered. Please contact admin."

### Requirement: Scan state machine implementation

The system SHALL implement explicit state machine for scan flow with 7 states.

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

#### Scenario: ALREADY_TAKEN state

- **WHEN** employee has already scanned today
- **THEN** the system transitions to ALREADY_TAKEN, displays "Already recorded", and starts 5-second cooldown

#### Scenario: NOT_REGISTERED state

- **WHEN** no match is found (distance >0.6)
- **THEN** the system transitions to NOT_REGISTERED, displays "Not registered" message, and returns to SCANNING after 3 seconds

#### Scenario: ERROR state

- **WHEN** any error occurs (network, camera, etc.)
- **THEN** the system transitions to ERROR, displays error message, and provides "Try Again" button

### Requirement: Scan timeout enforcement

The system SHALL enforce 5-second timeout for face detection during scanning.

#### Scenario: Timeout countdown

- **WHEN** in SCANNING state with no valid face detected
- **THEN** the system displays countdown timer showing seconds remaining

#### Scenario: Timeout expiry

- **WHEN** 5 seconds elapse without valid face detection
- **THEN** the system transitions to ERROR state with message "No face detected. Please try again."

#### Scenario: Reset timeout on face detection

- **WHEN** a valid face is detected
- **THEN** the system resets the 5-second timeout counter

### Requirement: Duplicate scan prevention

The system SHALL prevent employees from scanning multiple times on the same calendar day.

#### Scenario: Check existing record on match

- **WHEN** face is matched to a user
- **THEN** the system queries database for lunch record with `userId` and `date = YYYY-MM-DD` (today's date in UTC)

#### Scenario: Duplicate record found

- **WHEN** database returns existing record for today
- **THEN** the system rejects the scan and returns ALREADY_TAKEN response

#### Scenario: First scan today allowed

- **WHEN** no existing record found for today
- **THEN** the system creates new lunch record and returns SUCCESS response

### Requirement: Post-scan cooldown period

The system SHALL enforce a 5-second cooldown after successful or duplicate scans.

#### Scenario: Cooldown after SUCCESS

- **WHEN** scan completes successfully
- **THEN** the system disables scanning for 5 seconds and displays countdown

#### Scenario: Cooldown after ALREADY_TAKEN

- **WHEN** duplicate scan is detected
- **THEN** the system disables scanning for 5 seconds and displays countdown

#### Scenario: Return to IDLE after cooldown

- **WHEN** 5-second cooldown completes
- **THEN** the system transitions to IDLE state and re-enables the Start button

### Requirement: Scan API endpoint integration

The system SHALL submit face descriptors to `/api/lunch` endpoint for matching and recording.

#### Scenario: Scan request format

- **WHEN** submitting a scan
- **THEN** the system sends POST request with `{ faceDescriptor: number[] }` (128 numbers)

#### Scenario: Success response

- **WHEN** API responds with success
- **THEN** the system receives `{ success: true, message: string, employeeName: string, scannedTime: string }`

#### Scenario: Duplicate response

- **WHEN** API detects duplicate scan
- **THEN** the system receives `{ success: false, message: "Already recorded today", employeeName: string }`

#### Scenario: Not found response

- **WHEN** API finds no match
- **THEN** the system receives `{ success: false, message: "Employee not registered" }`

#### Scenario: Error response

- **WHEN** API encounters an error
- **THEN** the system receives `{ success: false, error: string }`

### Requirement: Single face validation during scan

The system SHALL enforce single-face-only policy during lunch scanning.

#### Scenario: One face detected

- **WHEN** exactly one face is detected in the scanning frame
- **THEN** the system proceeds to descriptor extraction and matching

#### Scenario: Multiple faces detected

- **WHEN** two or more faces are detected in the scanning frame
- **THEN** the system displays "Only one person at a time" and continues scanning without matching

#### Scenario: No face detected

- **WHEN** no face is detected in the scanning frame
- **THEN** the system displays "Please face the camera" and continues scanning

### Requirement: Scan visual feedback

The system SHALL provide clear visual feedback throughout the scan process.

#### Scenario: Face detection indicator

- **WHEN** in SCANNING state
- **THEN** the system displays green bounding box when face is detected, red box for multiple faces, no box for no face

#### Scenario: Status message display

- **WHEN** state changes
- **THEN** the system updates prominent status message: "Scanning...", "Matching...", "Success!", "Already recorded", etc.

#### Scenario: Loading indicators

- **WHEN** in CAMERA_LOADING or MATCHING states
- **THEN** the system displays animated loading spinner

#### Scenario: Success animation

- **WHEN** transitioning to SUCCESS state
- **THEN** the system displays checkmark icon with green background

#### Scenario: Error indication

- **WHEN** transitioning to ERROR or NOT_REGISTERED states
- **THEN** the system displays X icon with red background

### Requirement: Scan error handling

The system SHALL handle various error scenarios gracefully.

#### Scenario: Network error during matching

- **WHEN** API request fails due to network error
- **THEN** the system transitions to ERROR state with "Network error. Please try again." and provides retry button

#### Scenario: Camera disconnection during scan

- **WHEN** camera stream ends unexpectedly during SCANNING
- **THEN** the system transitions to ERROR state with "Camera disconnected" and returns to IDLE

#### Scenario: Models not loaded

- **WHEN** attempting to scan before face-api.js models are loaded
- **THEN** the system displays "Loading face recognition models..." and disables Start button

#### Scenario: Invalid descriptor extracted

- **WHEN** descriptor extraction fails (NaN values, wrong length)
- **THEN** the system logs error and continues scanning for next frame

### Requirement: Scan performance requirements

The system SHALL meet performance targets for responsive scanning experience.

#### Scenario: Total scan time target

- **WHEN** employee faces camera and is recognized
- **THEN** the system completes entire flow (detection → extraction → matching → recording) in under 300ms

#### Scenario: Face detection latency

- **WHEN** face appears in camera view
- **THEN** the system detects it within 100ms

#### Scenario: API matching latency

- **WHEN** descriptor is sent to matching API
- **THEN** the API responds with match result in under 100ms

### Requirement: Scan accessibility features

The system SHALL provide accessibility features for scan interface.

#### Scenario: Keyboard navigation

- **WHEN** user navigates via keyboard
- **THEN** the Start button is focusable and activates scan on Enter key

#### Scenario: Screen reader announcements

- **WHEN** state changes during scan
- **THEN** the system announces state changes to screen readers (ARIA live regions)

#### Scenario: High contrast mode support

- **WHEN** user has high contrast mode enabled
- **THEN** the system maintains readable text and visible bounding boxes

### Requirement: Scan session management

The system SHALL manage scan session lifecycle properly.

#### Scenario: Component mount

- **WHEN** scan page loads
- **THEN** the system initializes in IDLE state with webcam off

#### Scenario: Component unmount

- **WHEN** user navigates away from scan page
- **THEN** the system stops webcam stream and clears any active timers

#### Scenario: Browser tab visibility change

- **WHEN** user switches to another browser tab during scan
- **THEN** the system continues scanning if camera is active (no pause behavior)

### Requirement: Scan logging and audit trail

The system SHALL log scan attempts for monitoring and debugging.

#### Scenario: Log successful scans

- **WHEN** a lunch record is created
- **THEN** the system logs: timestamp, userId, employeeId, scan duration, match confidence

#### Scenario: Log duplicate attempts

- **WHEN** a duplicate scan is detected
- **THEN** the system logs: timestamp, userId, employeeId, "duplicate_attempt"

#### Scenario: Log failed matches

- **WHEN** no match is found
- **THEN** the system logs: timestamp, "no_match", descriptor (for debugging false negatives)

#### Scenario: Log errors

- **WHEN** errors occur during scanning
- **THEN** the system logs: timestamp, error type, error message, state before error
