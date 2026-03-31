## MODIFIED Requirements

### Requirement: Registration API endpoint

The system SHALL submit registration data to `/api/register` endpoint and classify request-validation failures as client errors.

#### Scenario: Successful registration request

- **WHEN** all validation passes
- **THEN** the system sends POST request with `{ employeeId, name, department?, email?, faceDescriptor: number[] }`

#### Scenario: Registration response success

- **WHEN** API responds with success
- **THEN** the system displays success message with employee name and resets form

#### Scenario: Registration response validation error

- **WHEN** API request body fails schema validation
- **THEN** the API returns HTTP `400` with `{ success: false, error: "VALIDATION_ERROR", details: [...] }`

#### Scenario: Registration response server error

- **WHEN** API encounters an unexpected internal failure
- **THEN** the API returns HTTP `500` with `{ success: false, error: "INTERNAL_ERROR", message: string }`

### Requirement: Registration error handling

The system SHALL handle various error scenarios gracefully and avoid retrying non-retriable validation failures.

#### Scenario: Network error during submission

- **WHEN** network fails during registration submission
- **THEN** the system retains form data and captured descriptors, allows retry

#### Scenario: Camera unavailable during capture

- **WHEN** camera becomes unavailable mid-capture
- **THEN** the system shows camera error and allows resuming when camera returns

#### Scenario: Model loading failure

- **WHEN** face-api.js models fail to load
- **THEN** the system shows "Models not ready" message and disables capture functionality

#### Scenario: Validation failure response handling

- **WHEN** the API returns HTTP `400` with `VALIDATION_ERROR`
- **THEN** the client displays field-level and/or form-level validation feedback and MUST NOT auto-retry the request
