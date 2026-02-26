## ADDED Requirements

### Requirement: User table schema definition

The system SHALL define a User table with fields for employee identification, face descriptors, and optional metadata.

#### Scenario: User table structure

- **WHEN** database schema is created
- **THEN** the User table includes fields: id (String/CUID), employeeId (String/unique), name (String), faceDescriptor (Float[]), email (String/optional), department (String/optional), createdAt (DateTime), updatedAt (DateTime)

#### Scenario: Primary key generation

- **WHEN** a new user record is created
- **THEN** the system auto-generates a CUID as the primary key identifier

### Requirement: Unique employee ID constraint

The system SHALL enforce unique employee IDs to prevent duplicate employee registrations.

#### Scenario: Duplicate employee ID prevention

- **WHEN** attempting to create a user with an existing employeeId
- **THEN** the system rejects the operation with a unique constraint violation error

#### Scenario: Case-sensitive employee IDs

- **WHEN** comparing employee IDs for uniqueness
- **THEN** the system treats "EMP001" and "emp001" as different values

### Requirement: Face descriptor storage

The system SHALL store face descriptors as arrays of exactly 128 floating-point numbers.

#### Scenario: Valid descriptor storage

- **WHEN** storing a face descriptor with 128 float values
- **THEN** the system persists the descriptor as a Float[] array in PostgreSQL

#### Scenario: Descriptor array size validation

- **WHEN** attempting to store a descriptor with length other than 128
- **THEN** the system rejects the operation with a validation error

#### Scenario: Descriptor precision

- **WHEN** storing floating-point descriptor values
- **THEN** the system preserves decimal precision up to PostgreSQL float type limits

### Requirement: Optional metadata fields

The system SHALL support optional email and department fields without requiring them for user creation.

#### Scenario: User creation without optional fields

- **WHEN** creating a user with only required fields (employeeId, name, faceDescriptor)
- **THEN** the system creates the user record with email and department set to NULL

#### Scenario: User creation with optional fields

- **WHEN** creating a user with email and department provided
- **THEN** the system stores both optional fields in the database

### Requirement: Automatic timestamp management

The system SHALL automatically manage createdAt and updatedAt timestamps for user records.

#### Scenario: Creation timestamp

- **WHEN** a new user record is created
- **THEN** the system sets createdAt to the current UTC timestamp

#### Scenario: Update timestamp

- **WHEN** a user record is modified
- **THEN** the system automatically updates updatedAt to the current UTC timestamp

#### Scenario: Timestamp immutability

- **WHEN** user record is updated
- **THEN** the system preserves the original createdAt value without modification

### Requirement: User-LunchRecord relationship

The system SHALL define a one-to-many relationship from User to LunchRecords with cascade deletion.

#### Scenario: User with lunch records

- **WHEN** querying a user
- **THEN** the system provides access to all associated lunch records

#### Scenario: Cascade deletion

- **WHEN** a user record is deleted
- **THEN** the system automatically deletes all associated lunch records for that user

### Requirement: Name field requirements

The system SHALL store employee names as non-empty strings with no format restrictions.

#### Scenario: Valid name storage

- **WHEN** storing an employee name
- **THEN** the system accepts any non-empty string including special characters, spaces, and unicode

#### Scenario: Empty name rejection

- **WHEN** attempting to create a user with empty or null name
- **THEN** the system rejects the operation with a validation error

### Requirement: Query performance optimization

The system SHALL support efficient user lookups by employeeId without requiring full table scans.

#### Scenario: Employee ID index usage

- **WHEN** querying user by employeeId
- **THEN** the system uses the unique index for O(log n) lookup performance

#### Scenario: Face descriptor retrieval

- **WHEN** fetching all users for face matching
- **THEN** the system retrieves all face descriptors in a single query without N+1 issues
