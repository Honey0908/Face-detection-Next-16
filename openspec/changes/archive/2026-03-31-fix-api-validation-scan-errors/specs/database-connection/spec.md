## MODIFIED Requirements

### Requirement: Connection pooling configuration

The system SHALL configure connection pooling to handle concurrent requests from 300-500 users without exhausting database connections and with stable behavior after idle periods.

#### Scenario: Connection pool limits

- **WHEN** connection pool is initialized
- **THEN** the system sets connection_limit between 10-20 per Prisma client instance

#### Scenario: Connection timeout handling

- **WHEN** acquiring a connection takes longer than 5 seconds
- **THEN** the system throws a pool timeout error

#### Scenario: Idle period recovery

- **WHEN** the application has been idle and receives the next database request
- **THEN** the system serves the request without emitting `Error { kind: Closed }` under normal operating conditions

### Requirement: Singleton database client pattern

The system SHALL use a singleton pattern for the Prisma client to prevent multiple client instances in serverless environments and to centralize keep-alive behavior.

#### Scenario: Single client instance in development

- **WHEN** hot module reloading occurs in development mode
- **THEN** the system reuses the existing Prisma client instance instead of creating a new one

#### Scenario: Client instance per serverless function

- **WHEN** running in production serverless environment
- **THEN** each serverless function instance creates and reuses one Prisma client

#### Scenario: Shared keep-alive owner

- **WHEN** keep-alive logic is enabled
- **THEN** exactly one singleton Prisma client manages periodic keep-alive queries per process

## ADDED Requirements

### Requirement: Database keep-alive health check

The system SHALL execute a lightweight periodic keep-alive query to reduce idle connection closure in long-running processes.

#### Scenario: Keep-alive execution

- **WHEN** keep-alive interval elapses in non-test runtime
- **THEN** the system executes a lightweight query (`SELECT 1`) using the singleton Prisma client

#### Scenario: Keep-alive failure handling

- **WHEN** a keep-alive query fails
- **THEN** the system logs a warning without exposing credentials and keeps the process available for subsequent requests

#### Scenario: Keep-alive disabled in tests

- **WHEN** runtime environment is test
- **THEN** the system disables periodic keep-alive execution by default
