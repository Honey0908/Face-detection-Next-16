## Context

The Smart Office Lunch Tracking System currently has no persistence layer. The application needs to:

- Store employee data with 128-dimensional face descriptors for recognition
- Track daily lunch scans with duplicate prevention
- Support 300-500 concurrent users with sub-300ms response times
- Provide admin analytics on lunch counts

**Current State**: No database configured. Components and UI exist but cannot persist data.

**Constraints**:

- Must NOT store raw face images (privacy requirement)
- Must support Float[] type for 128-element face descriptors
- Unique constraint on (userId, date) to prevent duplicate lunch scans per day
- Target: Sub-50ms database query times for lunch validation
- Deployment on Vercel (serverless environment considerations)

**Stakeholders**: Office employees (300-500/day), admin users, internal IT team

## Goals / Non-Goals

**Goals:**

- Configure PostgreSQL database for development and production
- Integrate Prisma ORM for type-safe database operations
- Define schema for Users (employees + face descriptors)
- Define schema for LunchRecords (daily scan tracking)
- Implement connection pooling for concurrent access
- Establish migration workflow for schema versioning
- Create reusable database client singleton pattern

**Non-Goals:**

- Database performance optimization (future iteration)
- Advanced security features (row-level security, audit logs)
- Database backup/restore automation
- Multi-region replication
- Full-text search capabilities
- Real-time subscriptions or WebSocket support
- Data analytics/reporting complex queries (future)

## Decisions

### Decision 1: PostgreSQL over MongoDB

**Choice**: Use PostgreSQL as the primary database

**Rationale**:

- **Type Safety**: Native support for arrays (Float[]) for face descriptors without nested documents
- **ACID Compliance**: Strong consistency guarantees for duplicate prevention (critical for lunch tracking)
- **Indexing**: Composite indexes on (userId, date) for fast duplicate checks
- **Ecosystem**: Better Prisma support and type generation compared to MongoDB
- **Hosting**: Wide availability on managed platforms (Vercel Postgres, Supabase, Railway)

**Alternatives Considered**:

- **MongoDB**: Originally mentioned in project docs, but lacks native array types and strong consistency for our use case. Would require more complex duplicate prevention logic.
- **MySQL**: Adequate, but PostgreSQL has better JSON/array support for potential future metadata storage.

### Decision 2: Prisma as ORM

**Choice**: Use Prisma for database access

**Rationale**:

- **Type Safety**: Auto-generated TypeScript types from schema
- **Migration System**: Built-in schema versioning and migration workflow
- **Developer Experience**: Intuitive schema language, excellent IDE autocomplete
- **Next.js Integration**: Official support with App Router and Server Components
- **Client Generation**: Single source of truth for database schema

**Alternatives Considered**:

- **Raw SQL with pg**: More control but loses type safety and migration tooling
- **Drizzle ORM**: Newer, lighter, but Prisma has more mature ecosystem and documentation

### Decision 3: Face Descriptor Storage as Float[]

**Choice**: Store face descriptors as `Float[]` (PostgreSQL array type)

**Rationale**:

- **Performance**: Native array type enables efficient storage without serialization overhead
- **Privacy**: No raw images stored, only numerical feature vectors
- **Query Capability**: Can add array similarity functions (pgvector extension) in future for database-side matching
- **Size**: 128 floats × 4 bytes = 512 bytes per descriptor (acceptable for 500 users)

**Alternatives Considered**:

- **JSON/JSONB**: More flexible but slower for 128-element arrays and lacks native array operations
- **Binary BYTEA**: More compact but harder to inspect and debug during development

### Decision 4: Connection Pooling Strategy

**Choice**: Use Prisma's built-in connection pooling with pgBouncer for production

**Rationale**:

- **Serverless**: Vercel functions are stateless; need connection pooling to avoid exhausting connections
- **Prisma Data Proxy**: Optional for serverless, but adds latency
- **PgBouncer**: Industry-standard, reduces connection overhead from 300-500 concurrent requests
- **Development**: Direct connection for local dev, pooled connection for production

**Configuration**:

- `connection_limit`: 10-20 per Prisma client instance
- `pool_timeout`: 5 seconds
- Use `DATABASE_URL` for direct connection, `DIRECT_URL` for migrations in serverless

**Alternatives Considered**:

- **No Pooling**: Would exhaust PostgreSQL max_connections (default 100) with 300-500 users
- **Prisma Accelerate**: Paid service, overkill for internal office app

### Decision 5: Schema Design

**Choice**: Two-table schema with relational integrity

**Users Table**:

```prisma
model User {
  id             String   @id @default(cuid())
  employeeId     String   @unique
  name           String
  faceDescriptor Float[]
  email          String?
  department     String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  lunchRecords   LunchRecord[]
}
```

**LunchRecords Table**:

```prisma
model LunchRecord {
  id         String   @id @default(cuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  date       String   // YYYY-MM-DD format for indexing
  timestamp  DateTime @default(now())
  confidence Float?

  @@unique([userId, date])
  @@index([date])
}
```

**Rationale**:

- `@@unique([userId, date])`: Database-level duplicate prevention (critical business rule)
- `@@index([date])`: Fast lookups for "today's count" admin queries
- `onDelete: Cascade`: Delete employee's lunch records when employee is removed
- `cuid()`: Collision-resistant IDs for distributed systems
- Separate `date` (string) and `timestamp` (DateTime): Date for business logic, timestamp for audit trail

**Alternatives Considered**:

- **Single table**: Denormalized, but harder to query employee info separately
- **UUID instead of CUID**: CUIDs are more compact and time-ordered
- **Storing descriptors in separate table**: Overkill for 1:1 relationship

## Risks / Trade-offs

### [Risk] Face Descriptor Array Size Limits

PostgreSQL arrays have no hard limit, but 128 floats × 500 users = ~250KB total is negligible. If scaling to 10K+ users, consider BYTEA compression.

**Mitigation**: Monitor array storage size. Add alert if database size exceeds 1GB.

### [Risk] Connection Pool Exhaustion in Serverless

Vercel serverless functions spawn multiple instances. Each needs database connections.

**Mitigation**:

- Use connection pooling (PgBouncer)
- Set conservative `connection_limit` in Prisma
- Monitor connection count via PostgreSQL `pg_stat_activity`

### [Risk] Descriptor Comparison Not in Database

Current design fetches all descriptors to Node.js for Euclidean distance calculation. At 500 users, this is ~250KB per scan.

**Mitigation**: Acceptable for 300-500 users. Future: add `pgvector` extension for database-side similarity search if scaling to 1000+ users.

### [Risk] Migration Failures in Production

Schema changes could break production if not tested.

**Mitigation**:

- Always run migrations in staging environment first
- Use Prisma's migration preview before applying
- Keep migration files in version control
- Document rollback procedure (Prisma migrate resolve)

### [Trade-off] Type Safety vs Flexibility

Prisma's strict types prevent runtime errors but make schema changes more rigid compared to MongoDB.

**Acceptance**: Type safety is worth the trade-off for this use case. Face descriptors are fixed-size (128), and schema is stable.

### [Trade-off] Date as String vs DateTime

Storing date as `String` (YYYY-MM-DD) instead of `Date` type for business logic clarity.

**Acceptance**: Simplifies duplicate checks and avoids timezone complexity. Timestamp field preserves exact scan time.

## Migration Plan

### Development Setup

1. Install dependencies:

   ```bash
   pnpm add @prisma/client
   pnpm add -D prisma
   ```

2. Initialize Prisma:

   ```bash
   npx prisma init
   ```

3. Configure `.env`:

   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/face_detection"
   ```

4. Create schema in `prisma/schema.prisma`

5. Generate initial migration:

   ```bash
   npx prisma migrate dev --name init
   ```

6. Generate Prisma Client:
   ```bash
   npx prisma generate
   ```

### Production Deployment

1. Provision PostgreSQL database (Vercel Postgres, Supabase, or Railway)

2. Set environment variables in deployment platform:
   - `DATABASE_URL`: Connection string with pooling (e.g., via PgBouncer)
   - `DIRECT_URL`: Direct connection for migrations (optional)

3. Run migrations on deploy:

   ```bash
   npx prisma migrate deploy
   ```

4. Verify Prisma Client generation in build step

### Rollback Strategy

If migration fails:

1. Revert deployment to previous version
2. Mark failed migration as rolled back:
   ```bash
   npx prisma migrate resolve --rolled-back <migration-name>
   ```
3. Fix migration and redeploy

### Monitoring

- Track query performance via Prisma logging (development)
- Monitor database metrics: connection count, query latency, storage size
- Set alerts for connection pool exhaustion and slow queries (>100ms)

## Open Questions

1. **Production Database Provider**: Vercel Postgres (easiest), Supabase (more features), or Railway (cheapest)?
   - **Resolution Needed By**: Before production deployment
   - **Default**: Use Vercel Postgres for simplicity unless cost is prohibitive

2. **Connection Pooling Method**: Built-in Prisma vs external PgBouncer?
   - **Resolution Needed By**: Load testing phase
   - **Default**: Start with Prisma's built-in pooling, add PgBouncer if connection issues arise

3. **Seeding Strategy**: Should we create seed data for testing (demo employees)?
   - **Resolution Needed By**: QA phase
   - **Recommendation**: Yes, create `prisma/seed.ts` with 5-10 test employees

4. **Backup Frequency**: How often should database backups run?
   - **Resolution Needed By**: Production launch
   - **Recommendation**: Daily automatic backups via hosting provider

5. **Face Descriptor Validation**: Should the database validate that face descriptors are exactly 128 floats?
   - **Resolution Needed By**: Implementation phase
   - **Recommendation**: Add application-level validation in Prisma middleware or Zod schema, not database constraints
