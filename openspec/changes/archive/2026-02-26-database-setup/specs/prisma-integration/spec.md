## ADDED Requirements

### Requirement: Prisma schema file definition

The system SHALL define database schema using Prisma Schema Language in prisma/schema.prisma file.

#### Scenario: Schema file location

- **WHEN** project is initialized with Prisma
- **THEN** the system creates schema definition at prisma/schema.prisma

#### Scenario: Data source configuration

- **WHEN** schema file is processed
- **THEN** the system configures PostgreSQL as the datasource using DATABASE_URL environment variable

#### Scenario: Client generator configuration

- **WHEN** schema file is processed
- **THEN** the system configures Prisma Client generator for TypeScript output

### Requirement: Type-safe Prisma Client generation

The system SHALL generate TypeScript types from Prisma schema for compile-time type safety.

#### Scenario: Client generation on schema changes

- **WHEN** prisma schema is modified
- **THEN** running "prisma generate" creates updated Prisma Client with new types

#### Scenario: Generated types location

- **WHEN** Prisma Client is generated
- **THEN** the system outputs types to node_modules/.prisma/client directory

#### Scenario: Type exports for application use

- **WHEN** importing Prisma Client in application code
- **THEN** the system provides full TypeScript type definitions for all models and operations

### Requirement: Database migration workflow

The system SHALL provide migration tooling for versioned schema changes in development and production.

#### Scenario: Development migration creation

- **WHEN** developer modifies schema in development
- **THEN** running "prisma migrate dev" creates a new migration file and applies it

#### Scenario: Migration file generation

- **WHEN** migration is created
- **THEN** the system generates SQL migration file in prisma/migrations directory with timestamp and name

#### Scenario: Production migration deployment

- **WHEN** deploying to production
- **THEN** running "prisma migrate deploy" applies pending migrations without creating new ones

#### Scenario: Migration history tracking

- **WHEN** migrations are applied
- **THEN** the system records applied migrations in \_prisma_migrations table

### Requirement: Schema validation

The system SHALL validate Prisma schema syntax and constraints before generating client or migrations.

#### Scenario: Invalid schema detection

- **WHEN** schema contains syntax errors
- **THEN** the system rejects generation/migration with detailed error message

#### Scenario: Constraint validation

- **WHEN** schema defines invalid relationships or types
- **THEN** the system reports constraint violations before database operations

#### Scenario: Format checking

- **WHEN** running "prisma format"
- **THEN** the system auto-formats schema file with consistent indentation and ordering

### Requirement: Environment variable configuration

The system SHALL support environment-based database configuration through .env file integration.

#### Scenario: .env file loading

- **WHEN** Prisma CLI commands are executed
- **THEN** the system automatically loads environment variables from .env file

#### Scenario: Multiple environment URLs

- **WHEN** DIRECT_URL is provided alongside DATABASE_URL
- **THEN** the system uses DIRECT_URL for migrations and DATABASE_URL for client connections

#### Scenario: Missing DATABASE_URL handling

- **WHEN** DATABASE_URL is not defined
- **THEN** the system throws clear error indicating missing environment variable

### Requirement: Prisma Client singleton pattern

The system SHALL provide utility for creating singleton Prisma Client instance to prevent connection exhaustion.

#### Scenario: Development mode hot reload

- **WHEN** Next.js hot reloads in development
- **THEN** the system reuses existing Prisma Client from global object instead of creating new instance

#### Scenario: Production instance creation

- **WHEN** application starts in production
- **THEN** the system creates single Prisma Client instance per process

#### Scenario: Global client access

- **WHEN** application modules import Prisma Client
- **THEN** all modules share the same client instance

### Requirement: Migration rollback support

The system SHALL support rolling back failed migrations through Prisma's migration resolution commands.

#### Scenario: Failed migration detection

- **WHEN** migration fails during application
- **THEN** the system marks migration as failed in \_prisma_migrations table

#### Scenario: Manual rollback

- **WHEN** developer runs "prisma migrate resolve --rolled-back <migration-name>"
- **THEN** the system marks migration as rolled back and allows retry

#### Scenario: Migration conflict resolution

- **WHEN** migrations are out of sync between environments
- **THEN** the system provides "prisma migrate resolve" command to mark migrations as applied

### Requirement: Schema introspection

The system SHALL support introspecting existing database to generate Prisma schema.

#### Scenario: Database introspection

- **WHEN** running "prisma db pull" on existing database
- **THEN** the system generates Prisma schema matching current database structure

#### Scenario: Schema sync detection

- **WHEN** schema diverges from database
- **THEN** introspection identifies differences between schema file and actual database

### Requirement: Prisma Studio integration

The system SHALL provide Prisma Studio for GUI-based database browsing and editing.

#### Scenario: Studio launch

- **WHEN** running "prisma studio"
- **THEN** the system opens web interface on localhost:5555 for database exploration

#### Scenario: Data viewing

- **WHEN** accessing Prisma Studio
- **THEN** the system displays all tables with ability to view, filter, and edit records

#### Scenario: Relationship navigation

- **WHEN** viewing related records in Studio
- **THEN** the system allows clicking through foreign key relationships

### Requirement: Build integration

The system SHALL integrate Prisma Client generation into application build process.

#### Scenario: Client generation in build

- **WHEN** running application build command
- **THEN** the system runs "prisma generate" as part of build pipeline

#### Scenario: Postinstall hook

- **WHEN** dependencies are installed
- **THEN** the system automatically generates Prisma Client via postinstall script

#### Scenario: Build without database connection

- **WHEN** generating Prisma Client
- **THEN** the system succeeds without requiring active database connection

### Requirement: Type export for application use

The system SHALL export Prisma types for use throughout the application.

#### Scenario: Model type exports

- **WHEN** importing from Prisma Client
- **THEN** the system provides User, LunchRecord and other model types

#### Scenario: Input type exports

- **WHEN** building create/update operations
- **THEN** the system provides UserCreateInput, LunchRecordUpdateInput types

#### Scenario: Prisma namespace access

- **WHEN** using Prisma type utilities
- **THEN** the system provides access to Prisma namespace with JsonValue, Decimal, and other utility types
