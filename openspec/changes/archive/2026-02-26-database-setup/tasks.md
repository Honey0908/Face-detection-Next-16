## 1. Dependencies and Project Setup

- [x] 1.1 Install @prisma/client as production dependency
- [x] 1.2 Install prisma as development dependency
- [x] 1.3 Initialize Prisma with `npx prisma init` command
- [x] 1.4 Verify .env file creation with DATABASE_URL placeholder
- [x] 1.5 Add .env to .gitignore if not already present
- [x] 1.6 Create .env.example with DATABASE_URL template

## 2. Prisma Schema Definition

- [x] 2.1 Define PostgreSQL datasource in prisma/schema.prisma
- [x] 2.2 Configure Prisma Client generator for TypeScript output
- [x] 2.3 Define User model with id (String/CUID), employeeId (String/unique), name (String), faceDescriptor (Float[])
- [x] 2.4 Add optional fields to User model: email (String?), department (String?)
- [x] 2.5 Add timestamp fields to User model: createdAt, updatedAt with @default and @updatedAt
- [x] 2.6 Define LunchRecord model with id (String/CUID), userId (String), date (String), timestamp (DateTime)
- [x] 2.7 Add optional confidence field to LunchRecord model (Float?)
- [x] 2.8 Define User-LunchRecord relationship with @relation and onDelete: Cascade
- [x] 2.9 Add @@unique constraint on [userId, date] in LunchRecord model
- [x] 2.10 Add @@index on [date] field in LunchRecord model for query performance
- [x] 2.11 Run `npx prisma format` to validate and format schema file

## 3. Database Client Singleton

- [x] 3.1 Create src/lib/prisma.ts file for database client
- [x] 3.2 Implement singleton pattern with global object check for development
- [x] 3.3 Add PrismaClient instantiation with connection pooling configuration
- [x] 3.4 Configure connection pool with connection_limit (10-20 connections)
- [x] 3.5 Add conditional logic to reuse client in development (hot reload support)
- [x] 3.6 Export single prisma client instance as default export
- [x] 3.7 Add TypeScript global declaration for prisma client in dev mode
- [x] 3.8 Test client import in a test file to verify singleton works

## 4. Environment Configuration

- [x] 4.1 Document DATABASE_URL format in .env.example (postgresql://user:password@localhost:5432/dbname)
- [x] 4.2 Add DIRECT_URL to .env.example for serverless migration support
- [x] 4.3 Configure local PostgreSQL database for development
- [x] 4.4 Set DATABASE_URL in .env with local PostgreSQL connection string
- [x] 4.5 Verify connection by running `npx prisma db pull` (should succeed or show empty schema)

## 5. Initial Migration

- [x] 5.1 Generate initial migration with `npx prisma migrate dev --name init`
- [x] 5.2 Verify migration SQL file created in prisma/migrations/
- [x] 5.3 Confirm \_prisma_migrations table created in database
- [x] 5.4 Verify User table created with all fields and constraints
- [x] 5.5 Verify LunchRecord table created with all fields and constraints
- [x] 5.6 Check unique constraint on [userId, date] in LunchRecord table
- [x] 5.7 Check index on date field in LunchRecord table
- [x] 5.8 Verify foreign key relationship between LunchRecord and User with cascade

## 6. Prisma Client Generation

- [x] 6.1 Run `npx prisma generate` to create Prisma Client
- [x] 6.2 Verify node_modules/.prisma/client directory created
- [x] 6.3 Verify TypeScript types available for User and LunchRecord models
- [x] 6.4 Add "postinstall": "prisma generate" script to package.json
- [x] 6.5 Test type imports from @prisma/client in TypeScript file

## 7. Type Exports and Validation

- [x] 7.1 Create src/types/database.ts for database type exports
- [x] 7.2 Export User type from @prisma/client
- [x] 7.3 Export LunchRecord type from @prisma/client
- [x] 7.4 Export Prisma namespace for utility types
- [x] 7.5 Create validation schema for face descriptor (array of 128 floats) using Zod
- [x] 7.6 Create validation schema for employeeId format
- [x] 7.7 Create validation schema for date format (YYYY-MM-DD)

## 8. Database Utility Functions

- [x] 8.1 Create src/lib/db/user.ts for User database operations
- [x] 8.2 Implement getUserByEmployeeId query function
- [x] 8.3 Implement getAllUsers query function for face matching
- [x] 8.4 Implement createUser mutation function with validation
- [x] 8.5 Create src/lib/db/lunch-record.ts for LunchRecord database operations
- [x] 8.6 Implement getLunchRecordByUserAndDate query function
- [x] 8.7 Implement createLunchRecord mutation function
- [x] 8.8 Implement getTodayLunchCount query function for dashboard
- [x] 8.9 Implement getMonthlyLunchStats query function for analytics

## 9. Error Handling

- [x] 9.1 Create src/lib/db/errors.ts for database error types
- [x] 9.2 Define custom DuplicateLunchRecordError class
- [x] 9.3 Define custom UserNotFoundError class
- [x] 9.4 Define custom InvalidDescriptorError class
- [x] 9.5 Add error handling wrapper for Prisma unique constraint violations
- [x] 9.6 Add error handling wrapper for Prisma foreign key violations
- [x] 9.7 Add connection error logging without exposing credentials

## 10. Testing and Validation

- [x] 10.1 Test database connection by importing prisma client in API route
- [x] 10.2 Test User creation with valid data
- [x] 10.3 Test User creation with duplicate employeeId (should fail)
- [x] 10.4 Test face descriptor storage with 128 floats
- [x] 10.5 Test LunchRecord creation with valid userId and date
- [x] 10.6 Test duplicate LunchRecord prevention (same user, same date)
- [x] 10.7 Test cascade deletion (delete user, verify lunch records deleted)
- [x] 10.8 Test query performance for getUserByEmployeeId (should be fast with index)
- [x] 10.9 Test getAllUsers query for face matching (check N+1 prevention)
- [x] 10.10 Verify Prisma Studio works with `npx prisma studio`

## 11. Documentation

- [x] 11.1 Document DATABASE_URL setup in README.md
- [x] 11.2 Document Prisma migration commands (migrate dev, migrate deploy)
- [x] 11.3 Document how to reset database for development
- [x] 11.4 Add comments to prisma/schema.prisma explaining model relationships
- [x] 11.5 Document connection pooling configuration for production
- [x] 11.6 Create migration guide for production deployment

## 12. Production Preparation

- [x] 12.1 Add build script to run prisma generate before Next.js build
- [x] 12.2 Test production build locally with `pnpm build`
- [x] 12.3 Verify Prisma Client included in build output
- [x] 12.4 Document production DATABASE_URL requirements (connection pooling)
- [x] 12.5 Document DIRECT_URL usage for serverless migrations
- [x] 12.6 Create rollback procedure documentation for failed migrations
