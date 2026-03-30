# Capability: Descriptor Extraction

## Purpose

Extract 128-dimensional floating-point face descriptors from detected faces using FaceRecognitionNet. Supports multi-capture averaging for registration, descriptor validation, serialization, and error handling.

## Requirements

### Requirement: Extract 128-dimensional face descriptors

The system SHALL extract exactly 128-dimensional floating-point descriptors from detected faces using FaceRecognitionNet.

#### Scenario: Successful descriptor extraction

- **WHEN** a valid face detection is provided
- **THEN** the system extracts a Float32Array of length 128

#### Scenario: Descriptor value range

- **WHEN** a descriptor is extracted
- **THEN** each of the 128 values is a floating-point number typically in the range of -2.0 to 2.0

#### Scenario: Descriptor consistency

- **WHEN** the same face is captured multiple times under similar conditions
- **THEN** the extracted descriptors have Euclidean distance less than 0.3 from each other

### Requirement: Face landmarks processing

The system SHALL detect 68 facial landmarks before extracting descriptors.

#### Scenario: Landmark detection required

- **WHEN** attempting to extract a descriptor
- **THEN** the system first detects 68 facial landmark points

#### Scenario: Landmark detection failure

- **WHEN** facial landmarks cannot be detected
- **THEN** the system returns an error and does not attempt descriptor extraction

#### Scenario: Landmark confidence

- **WHEN** facial landmarks are detected
- **THEN** the system validates landmark quality before proceeding to descriptor extraction

### Requirement: Descriptor extraction performance

The system SHALL extract descriptors within 50ms per face.

#### Scenario: Extraction timing on GPU

- **WHEN** WebGL acceleration is available
- **THEN** the system completes descriptor extraction in under 50ms

#### Scenario: Extraction timing on CPU

- **WHEN** only CPU is available (WebGL fallback)
- **THEN** the system completes descriptor extraction in under 150ms

### Requirement: Descriptor validation

The system SHALL validate extracted descriptors before use.

#### Scenario: Valid descriptor format

- **WHEN** a descriptor is extracted
- **THEN** the system validates it is a Float32Array of exactly 128 elements

#### Scenario: NaN value detection

- **WHEN** a descriptor contains NaN values
- **THEN** the system rejects the descriptor and returns an extraction error

#### Scenario: Infinity value detection

- **WHEN** a descriptor contains Infinity or -Infinity values
- **THEN** the system rejects the descriptor and returns an extraction error

### Requirement: Descriptor normalization

The system SHALL normalize extracted descriptors for consistent matching.

#### Scenario: Descriptor already normalized

- **WHEN** FaceRecognitionNet returns a descriptor
- **THEN** the descriptor is already L2-normalized by the model

#### Scenario: Descriptor magnitude verification

- **WHEN** validating a descriptor
- **THEN** the system verifies the L2 norm is approximately 1.0 (within 0.01 tolerance)

### Requirement: Multiple descriptor extraction

The system SHALL support extracting descriptors from multiple sequential frames.

#### Scenario: Sequential extraction batch

- **WHEN** extracting descriptors for registration (3-5 captures)
- **THEN** the system processes each frame independently and returns an array of descriptors

#### Scenario: Extraction array format

- **WHEN** multiple descriptors are extracted
- **THEN** the system returns an array of Float32Array objects, each of length 128

### Requirement: Descriptor averaging for registration

The system SHALL compute averaged descriptors from multiple captures.

#### Scenario: Element-wise averaging

- **WHEN** given 3-5 descriptors from registration captures
- **THEN** the system computes the arithmetic mean for each of the 128 dimensions

#### Scenario: Averaged descriptor validation

- **WHEN** an averaged descriptor is computed
- **THEN** the resulting descriptor is a Float32Array of length 128 with normalized values

#### Scenario: Minimum captures for averaging

- **WHEN** fewer than 3 descriptors are provided for averaging
- **THEN** the system returns an error requiring at least 3 captures

### Requirement: Descriptor serialization

The system SHALL convert descriptors to plain arrays for API transmission.

#### Scenario: Float32Array to number array

- **WHEN** preparing a descriptor for API request
- **THEN** the system converts Float32Array to a standard JavaScript array of numbers

#### Scenario: Descriptor deserialization

- **WHEN** receiving a descriptor from API as number array
- **THEN** the system converts it back to Float32Array for processing

### Requirement: Error handling for extraction failures

The system SHALL handle extraction errors without crashing the workflow.

#### Scenario: Model not loaded error

- **WHEN** attempting extraction before models are loaded
- **THEN** the system returns an error indicating models are not ready

#### Scenario: Invalid detection input

- **WHEN** provided with an invalid or null face detection
- **THEN** the system returns an error without attempting extraction

#### Scenario: TensorFlow.js runtime error

- **WHEN** TensorFlow.js encounters an error during extraction
- **THEN** the system catches the error, logs it, and returns a null descriptor with error details
