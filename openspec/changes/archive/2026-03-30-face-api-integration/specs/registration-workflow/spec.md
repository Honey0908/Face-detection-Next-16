## ADDED Requirements

### Requirement: Multi-capture face registration

The system SHALL capture 3-5 face images per employee during registration.

#### Scenario: Minimum capture requirement

- **WHEN** admin attempts to register an employee
- **THEN** the system requires at least 3 successful face captures before allowing submission

#### Scenario: Maximum capture limit

- **WHEN** admin has captured 5 face images
- **THEN** the system allows additional captures but only uses the most recent 5

#### Scenario: Capture validation

- **WHEN** each face is captured
- **THEN** the system validates single face detected, confidence >0.5, and descriptor successfully extracted

### Requirement: Admin authentication requirement

The system SHALL restrict registration functionality to authenticated admin users only.

#### Scenario: Admin access granted

- **WHEN** an authenticated admin user accesses the registration page
- **THEN** the system displays the registration form and webcam interface

#### Scenario: Non-admin access denied

- **WHEN** a non-admin user attempts to access the registration page
- **THEN** the system redirects to login or shows access denied message

#### Scenario: Unauthenticated access blocked

- **WHEN** an unauthenticated user attempts to access the registration page
- **THEN** the system redirects to authentication page

### Requirement: Employee information collection

The system SHALL collect required employee information along with face descriptors.

#### Scenario: Required fields

- **WHEN** admin submits registration form
- **THEN** the system validates presence of `employeeId` (string, unique) and `name` (string, non-empty)

#### Scenario: Optional fields

- **WHEN** admin submits registration form
- **THEN** the system accepts optional `department` (string) and `email` (string, valid email format) fields

#### Scenario: Employee ID uniqueness validation

- **WHEN** admin enters an employeeId that already exists
- **THEN** the system shows validation error before attempting face capture

### Requirement: Descriptor averaging algorithm

The system SHALL compute averaged descriptor from multiple captures for robust matching.

#### Scenario: Average 3 captures

- **WHEN** admin captures 3 face images
- **THEN** the system computes element-wise average of all 3 descriptors (128 dimensions each)

#### Scenario: Average 5 captures

- **WHEN** admin captures 5 face images
- **THEN** the system computes element-wise average of all 5 descriptors

#### Scenario: Arithmetic mean calculation

- **WHEN** averaging descriptors
- **THEN** the system computes `avgDescriptor[i] = sum(descriptor1[i], descriptor2[i], ...) / count` for each dimension i

### Requirement: Registration form validation

The system SHALL validate all input data before database submission.

#### Scenario: Employee ID format

- **WHEN** admin enters employee ID
- **THEN** the system validates it is alphanumeric, 4-20 characters, no special characters except hyphen and underscore

#### Scenario: Name format

- **WHEN** admin enters employee name
- **THEN** the system validates it is 2-100 characters, alphabetic with spaces allowed

#### Scenario: Email format

- **WHEN** admin enters email (optional)
- **THEN** the system validates it matches standard email regex pattern

#### Scenario: Descriptor validation

- **WHEN** submitting registration
- **THEN** the system validates averaged descriptor is Float32Array of length 128 with all finite values

### Requirement: Registration API endpoint

The system SHALL submit registration data to `/api/register` endpoint.

#### Scenario: Successful registration request

- **WHEN** all validation passes
- **THEN** the system sends POST request with `{ employeeId, name, department?, email?, faceDescriptor: number[] }`

#### Scenario: Registration response success

- **WHEN** API responds with success
- **THEN** the system displays success message with employee name and resets form

#### Scenario: Registration response error

- **WHEN** API responds with error (duplicate ID, database error, etc.)
- **THEN** the system displays specific error message and allows retry

### Requirement: Registration workflow state machine

The system SHALL implement state machine for registration flow.

#### Scenario: State progression

- **WHEN** registration workflow executes
- **THEN** the system transitions through states: `FORM_INPUT → CAMERA_READY → CAPTURING → PROCESSING → SUBMITTING → SUCCESS | ERROR`

#### Scenario: State: FORM_INPUT

- **WHEN** in FORM_INPUT state
- **THEN** the system displays employee information form and disables capture button until form is valid

#### Scenario: State: CAPTURING

- **WHEN** in CAPTURING state
- **THEN** the system shows live webcam feed, capture button, and capture counter (e.g., "2/3 captures")

#### Scenario: State: PROCESSING

- **WHEN** in PROCESSING state
- **THEN** the system computes averaged descriptor and validates data

#### Scenario: State: SUBMITTING

- **WHEN** in SUBMITTING state
- **THEN** the system shows loading indicator and disables all inputs

### Requirement: Capture retry mechanism

The system SHALL allow admins to recapture specific images if quality is poor.

#### Scenario: Delete single capture

- **WHEN** admin clicks delete on a captured image thumbnail
- **THEN** the system removes that capture and decrements counter

#### Scenario: Retake all captures

- **WHEN** admin clicks "Retake All" button
- **THEN** the system clears all captures and returns to CAPTURING state

#### Scenario: Capture quality feedback

- **WHEN** a capture has low confidence (<0.5)
- **THEN** the system displays warning icon on thumbnail and suggests recapture

### Requirement: Visual feedback during registration

The system SHALL provide real-time visual feedback during face capture.

#### Scenario: Face detection overlay

- **WHEN** webcam is active during registration
- **THEN** the system draws bounding box around detected face in real-time

#### Scenario: Capture success animation

- **WHEN** a successful capture is made
- **THEN** the system shows a flash animation and adds thumbnail to capture list

#### Scenario: Progress indicator

- **WHEN** capturing faces
- **THEN** the system displays "Capture 1/3", "Capture 2/3", etc.

### Requirement: Registration consent tracking

The system SHALL record employee consent for biometric data collection.

#### Scenario: Consent checkbox

- **WHEN** admin is registering an employee
- **THEN** the system requires checking "Employee has provided consent for face data collection" before submission

#### Scenario: Consent timestamp

- **WHEN** registration is successful
- **THEN** the system records consent timestamp in database (part of createdAt)

### Requirement: Registration error handling

The system SHALL handle various error scenarios gracefully.

#### Scenario: Network error during submission

- **WHEN** network fails during registration submission
- **THEN** the system retains form data and captured descriptors, allows retry

#### Scenario: Camera unavailable during capture

- **WHEN** camera becomes unavailable mid-capture
- **THEN** the system shows camera error and allows resuming when camera returns

#### Scenario: Model loading failure

- **WHEN** face-api.js models fail to load
- **THEN** the system shows "Models not ready" message and disables capture functionality

### Requirement: Registration performance expectations

The system SHALL complete registration within reasonable time limits.

#### Scenario: Total registration time

- **WHEN** admin completes all 3 captures and submits
- **THEN** the system completes entire registration in under 10 seconds (excluding form input time)

#### Scenario: Per-capture time

- **WHEN** admin clicks capture button
- **THEN** the system processes and stores the capture in under 200ms
