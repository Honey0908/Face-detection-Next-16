## ADDED Requirements

### Requirement: Browser webcam access via MediaDevices API

The system SHALL request webcam access using `navigator.mediaDevices.getUserMedia()`.

#### Scenario: Request video-only stream

- **WHEN** requesting webcam access
- **THEN** the system requests video stream with constraints `{ video: true, audio: false }`

#### Scenario: Successful access grant

- **WHEN** user grants webcam permission
- **THEN** the system receives a MediaStream object with active video track

#### Scenario: Permission denied

- **WHEN** user denies webcam permission
- **THEN** the system receives a `NotAllowedError` and displays permission request UI

### Requirement: Webcam permission handling

The system SHALL handle various webcam permission states gracefully.

#### Scenario: First-time permission request

- **WHEN** user visits the application for the first time
- **THEN** the browser shows a permission prompt and the system waits for user response

#### Scenario: Previously granted permission

- **WHEN** user has previously granted webcam permission
- **THEN** the system immediately accesses the webcam without prompting

#### Scenario: Previously denied permission

- **WHEN** user has previously denied webcam permission
- **THEN** the system shows instructions to manually enable camera in browser settings

#### Scenario: Permission revoked during session

- **WHEN** user revokes camera permission while the app is running
- **THEN** the system detects stream end and notifies the user

### Requirement: Video stream constraints

The system SHALL request optimal video quality for face detection.

#### Scenario: Default resolution request

- **WHEN** requesting webcam stream
- **THEN** the system requests constraints: `{ width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' }`

#### Scenario: Front-facing camera preference

- **WHEN** device has multiple cameras
- **THEN** the system prefers the front-facing camera (`facingMode: 'user'`)

#### Scenario: Fallback to available resolution

- **WHEN** requested resolution is not available
- **THEN** the system accepts whatever resolution the device provides

### Requirement: Video element management

The system SHALL attach webcam stream to HTML video element for display and processing.

#### Scenario: Stream attachment

- **WHEN** MediaStream is obtained
- **THEN** the system sets `video.srcObject = stream` and calls `video.play()`

#### Scenario: Video autoplay

- **WHEN** video element is attached to stream
- **THEN** the system enables autoplay with `autoPlay={true}` and `playsInline={true}` attributes

#### Scenario: Video mirroring

- **WHEN** displaying front-facing camera feed
- **THEN** the system mirrors the video horizontally for natural user experience

### Requirement: Stream lifecycle management

The system SHALL properly start, pause, and stop webcam streams.

#### Scenario: Start stream

- **WHEN** component mounts and requires webcam
- **THEN** the system requests and starts the video stream

#### Scenario: Stop stream on unmount

- **WHEN** component unmounts or navigation occurs
- **THEN** the system stops all video tracks and releases webcam access

#### Scenario: Cleanup on error

- **WHEN** an error occurs during streaming
- **THEN** the system stops all tracks and cleans up resources before error propagation

### Requirement: Frame capture from video stream

The system SHALL capture still frames from live video for face detection.

#### Scenario: Canvas-based frame capture

- **WHEN** capturing a frame
- **THEN** the system draws the current video frame to a canvas element

#### Scenario: Frame format conversion

- **WHEN** a frame is captured
- **THEN** the system converts it to ImageData or HTMLCanvasElement for face-api.js processing

#### Scenario: Capture timing

- **WHEN** performing continuous detection
- **THEN** the system captures frames at regular intervals based on detection performance

### Requirement: Error handling for webcam access failures

The system SHALL provide specific error messages for different webcam access failures.

#### Scenario: NotAllowedError

- **WHEN** user denies camera permission
- **THEN** the system displays "Camera access denied. Please allow access in browser settings."

#### Scenario: NotFoundError

- **WHEN** no camera is available on the device
- **THEN** the system displays "No camera found. Please connect a webcam."

#### Scenario: NotReadableError

- **WHEN** camera is in use by another application
- **THEN** the system displays "Camera is in use by another application. Please close other apps using the camera."

#### Scenario: OverconstrainedError

- **WHEN** requested camera constraints cannot be satisfied
- **THEN** the system falls back to default constraints and retries

### Requirement: HTTPS requirement enforcement

The system SHALL require HTTPS for webcam access in production environments.

#### Scenario: HTTPS in production

- **WHEN** application is accessed via HTTPS
- **THEN** the system allows webcam access requests

#### Scenario: HTTP localhost exception

- **WHEN** application is accessed via `http://localhost` or `http://127.0.0.1`
- **THEN** the browser allows webcam access for development purposes

#### Scenario: HTTP production block

- **WHEN** application is accessed via HTTP in production (non-localhost)
- **THEN** the browser blocks webcam access and the system shows HTTPS requirement message

### Requirement: Camera status monitoring

The system SHALL monitor webcam status and notify of changes.

#### Scenario: Camera active indicator

- **WHEN** webcam stream is active
- **THEN** the system provides status `{ active: true, error: null }`

#### Scenario: Camera inactive indicator

- **WHEN** webcam stream is stopped or not started
- **THEN** the system provides status `{ active: false, error: null }`

#### Scenario: Camera error status

- **WHEN** webcam encounters an error
- **THEN** the system provides status `{ active: false, error: string }`

### Requirement: Multi-tab camera handling

The system SHALL handle scenarios where camera is accessed in multiple browser tabs.

#### Scenario: Camera shared across tabs

- **WHEN** camera is already in use by another tab of the same application
- **THEN** browser MAY allow shared access or report camera is busy

#### Scenario: Camera exclusive access

- **WHEN** another application has exclusive camera access
- **THEN** the system detects `NotReadableError` and instructs user to close the other application

### Requirement: Video metadata access

The system SHALL provide access to video stream metadata for UI feedback.

#### Scenario: Resolution information

- **WHEN** video stream is active
- **THEN** the system exposes actual video width and height dimensions

#### Scenario: Device information

- **WHEN** available from MediaStream API
- **THEN** the system exposes camera device label and ID for debugging

#### Scenario: Frame rate information

- **WHEN** stream settings are available
- **THEN** the system exposes actual frame rate being captured
