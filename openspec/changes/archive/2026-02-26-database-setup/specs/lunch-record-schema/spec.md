## ADDED Requirements

### Requirement: LunchRecord table schema definition

The system SHALL define a LunchRecord table with fields for tracking daily lunch scans including user reference, date, timestamp, and confidence score.

#### Scenario: LunchRecord table structure

- **WHEN** database schema is created
- **THEN** the LunchRecord table includes fields: id (String/CUID), userId (String), date (String/YYYY-MM-DD), timestamp (DateTime), confidence (Float/optional)

#### Scenario: Primary key generation

- **WHEN** a new lunch record is created
- **THEN** the system auto-generates a CUID as the primary key identifier

### Requirement: User reference relationship

The system SHALL maintain referential integrity between LunchRecord and User tables with cascade deletion.

#### Scenario: Valid user reference

- **WHEN** creating a lunch record
- **THEN** the system validates that userId references an existing user in the User table

#### Scenario: Foreign key constraint

- **WHEN** attempting to create a lunch record with non-existent userId
- **THEN** the system rejects the operation with a foreign key violation error

#### Scenario: User deletion cascade

- **WHEN** a user is deleted
- **THEN** the system automatically deletes all lunch records for that user

### Requirement: Duplicate prevention constraint

The system SHALL enforce a unique constraint on (userId, date) combination to prevent multiple lunch scans per employee per day.

#### Scenario: First lunch scan of the day

- **WHEN** creating the first lunch record for a user on a specific date
- **THEN** the system successfully creates the record

#### Scenario: Duplicate lunch scan prevention

- **WHEN** attempting to create a second lunch record for the same user and date
- **THEN** the system rejects the operation with a unique constraint violation error

#### Scenario: Same user different days

- **WHEN** creating lunch records for the same user on different dates
- **THEN** the system allows multiple records (one per day)

### Requirement: Date format standardization

The system SHALL store dates as strings in YYYY-MM-DD format for consistent querying and indexing.

#### Scenario: Date string format

- **WHEN** storing a lunch record date
- **THEN** the system formats the date as "YYYY-MM-DD" (e.g., "2026-02-25")

#### Scenario: Timezone-independent date

- **WHEN** determining the date for a lunch scan
- **THEN** the system uses the server's local date regardless of UTC offset

#### Scenario: Date-based queries

- **WHEN** querying lunch records by date
- **THEN** the system performs exact string matching on the date field

### Requirement: Timestamp precision

The system SHALL record the exact scan time with millisecond precision for audit purposes.

#### Scenario: Automatic timestamp on creation

- **WHEN** a lunch record is created
- **THEN** the system sets timestamp to the current UTC time with millisecond precision

#### Scenario: Timestamp immutability

- **WHEN** a lunch record exists
- **THEN** the system prevents modification of the timestamp field

### Requirement: Optional confidence score

The system SHALL support optional confidence scores from face matching without requiring them for record creation.

#### Scenario: Record with confidence score

- **WHEN** creating a lunch record with a face matching confidence value
- **THEN** the system stores the confidence as a Float between 0.0 and 1.0

#### Scenario: Record without confidence score

- **WHEN** creating a lunch record without providing confidence
- **THEN** the system creates the record with confidence set to NULL

#### Scenario: Confidence value range

- **WHEN** storing confidence scores
- **THEN** the system accepts any Float value (validation handled at application layer)

### Requirement: Date-based indexing

The system SHALL create an index on the date field to optimize daily aggregate queries.

#### Scenario: Today's lunch count query

- **WHEN** querying all lunch records for current date
- **THEN** the system uses the date index for efficient retrieval without full table scan

#### Scenario: Date range queries

- **WHEN** querying lunch records between two dates
- **THEN** the system leverages the date index for range scan performance

### Requirement: Composite index for duplicate checks

The system SHALL create a composite unique index on (userId, date) for fast duplicate detection.

#### Scenario: Pre-insertion duplicate check

- **WHEN** checking if user has scanned lunch today
- **THEN** the system uses the composite index for O(log n) lookup performance

#### Scenario: Index enforcement on insert

- **WHEN** attempting to insert duplicate (userId, date) combination
- **THEN** the system rejects the operation immediately via index constraint

### Requirement: Record immutability

The system SHALL treat lunch records as immutable after creation with no update operations allowed.

#### Scenario: Update prevention

- **WHEN** attempting to update an existing lunch record
- **THEN** the system rejects the operation (application layer enforces this)

#### Scenario: Deletion allowed for corrections

- **WHEN** admin needs to correct an erroneous scan
- **THEN** the system allows deletion of lunch records by admin users

### Requirement: Bulk retrieval efficiency

The system SHALL support efficient bulk queries for admin dashboard statistics without N+1 query issues.

#### Scenario: Monthly records for all users

- **WHEN** querying all lunch records for a specific month
- **THEN** the system retrieves records with user data in a single join query

#### Scenario: User-specific monthly count

- **WHEN** querying lunch count for a specific user and month
- **THEN** the system performs a count query using composite index
