## ADDED Requirements

### Requirement: Real-time face detection in video stream

The system SHALL detect faces in real-time from webcam video stream using TinyFaceDetector.

#### Scenario: Single face detected

- **WHEN** one face is present in the video frame
- **THEN** the system detects the face and returns detection data with bounding box coordinates

#### Scenario: Multiple faces in frame

- **WHEN** more than one face is present in the video frame
- **THEN** the system detects all faces but returns an error state indicating "multiple faces detected"

#### Scenario: No face in frame

- **WHEN** no face is present in the video frame
- **THEN** the system returns null detection result

#### Scenario: Continuous detection

- **WHEN** video stream is active
- **THEN** the system performs face detection on every video frame

### Requirement: Face detection performance

The system SHALL perform face detection with latency under 100ms per frame.

#### Scenario: Detection on standard hardware

- **WHEN** running on a laptop with GPU support
- **THEN** the system completes face detection in under 100ms per frame

#### Scenario: Detection on low-end hardware

- **WHEN** running on a device without GPU (CPU fallback)
- **THEN** the system completes face detection in under 300ms per frame

### Requirement: Single face validation

The system SHALL enforce single-face-only policy for registration and scanning workflows.

#### Scenario: Validation passes

- **WHEN** exactly one face is detected in the frame
- **THEN** the system marks validation as passed and allows processing to continue

#### Scenario: Validation fails with multiple faces

- **WHEN** two or more faces are detected in the frame
- **THEN** the system marks validation as failed with reason "multiple_faces"

#### Scenario: Validation fails with no face

- **WHEN** no face is detected in the frame
- **THEN** the system marks validation as failed with reason "no_face"

### Requirement: Face detection confidence scoring

The system SHALL provide confidence scores for detected faces.

#### Scenario: High confidence detection

- **WHEN** a face is clearly visible and well-lit
- **THEN** the system returns a confidence score above 0.8

#### Scenario: Low confidence detection

- **WHEN** a face is partially obscured or poorly lit
- **THEN** the system returns a confidence score between 0.3 and 0.8

#### Scenario: Very low confidence rejection

- **WHEN** detection confidence is below 0.3
- **THEN** the system treats the detection as unreliable and requests better positioning

### Requirement: Detection bounding box data

The system SHALL provide bounding box coordinates for detected faces.

#### Scenario: Bounding box format

- **WHEN** a face is detected
- **THEN** the system returns bounding box with `x`, `y`, `width`, and `height` properties in pixels

#### Scenario: Face position validation

- **WHEN** detected face is too close to frame edges (within 10% margin)
- **THEN** the system warns user to center their face

### Requirement: Detection timeout handling

The system SHALL implement timeout for face detection attempts.

#### Scenario: Timeout after 5 seconds

- **WHEN** no valid face is detected for 5 consecutive seconds
- **THEN** the system stops detection and returns a timeout error

#### Scenario: Reset timeout on successful detection

- **WHEN** a valid face is detected
- **THEN** the system resets the 5-second timeout counter

### Requirement: Error handling for detection failures

The system SHALL handle detection errors gracefully without crashing the application.

#### Scenario: TensorFlow.js runtime error

- **WHEN** TensorFlow.js encounters a runtime error during detection
- **THEN** the system catches the error, logs it, and returns a null detection result

#### Scenario: Invalid video frame

- **WHEN** the video frame is invalid or corrupted
- **THEN** the system skips the frame and continues with the next frame

### Requirement: Detection state management

The system SHALL expose detection state to UI components.

#### Scenario: Detection states

- **WHEN** face detection is running
- **THEN** the system exposes state as one of: `idle`, `detecting`, `face_found`, `no_face`, `multiple_faces`, `timeout`, `error`

#### Scenario: State transitions

- **WHEN** detection state changes
- **THEN** the system notifies subscribed components via state callback

### Requirement: Frame rate optimization

The system SHALL optimize detection frame rate based on device capabilities.

#### Scenario: High-performance device

- **WHEN** device can process frames faster than 10ms
- **THEN** the system runs detection on every frame (60 FPS)

#### Scenario: Low-performance device

- **WHEN** device processes frames slower than 100ms
- **THEN** the system throttles detection to every 3rd frame (20 FPS)
