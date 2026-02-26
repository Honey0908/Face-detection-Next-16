# Production Deployment Guide

Comprehensive guide for deploying the database to production environments.

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Setup](#environment-setup)
3. [Migration Strategy](#migration-strategy)
4. [Vercel Deployment](#vercel-deployment)
5. [Rollback Procedures](#rollback-procedures)
6. [Monitoring](#monitoring)
7. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

Before deploying to production:

- [ ] Database backup created
- [ ] All migrations tested in staging environment
- [ ] Connection pooling configured (for serverless)
- [ ] Environment variables documented
- [ ] Rollback procedure tested
- [ ] Team notified of deployment window
- [ ] Database monitoring enabled

---

## Environment Setup

### 1. PostgreSQL Database

Choose a production-ready PostgreSQL provider:

**Recommended Providers**:

- **Neon** (serverless, auto-scaling)
- **Supabase** (includes auth, storage)
- **AWS RDS** (traditional managed database)
- **Railway** (simple deployment)

### 2. Connection Pooling

**For serverless deployments (Vercel, AWS Lambda), connection pooling is REQUIRED.**

#### Neon Setup

```env
# Pooled connection (use for application queries)
DATABASE_URL="postgresql://user:pass@ep-xxx-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&pgbouncer=true&connection_limit=1"

# Direct connection (use ONLY for migrations)
DIRECT_URL="postgresql://user:pass@ep-xxx.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

#### Key Parameters

- `pgbouncer=true` - Enables connection pooling
- `connection_limit=1` - Limits connections per serverless function
- `sslmode=require` - Enforces SSL/TLS encryption

### 3. Migrate Prisma Schema

Update `prisma/schema.prisma` to use `DIRECT_URL` for migrations:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")      // Pooled connection
  directUrl = env("DIRECT_URL")        // Direct connection for migrations
}
```

---

## Migration Strategy

### Initial Production Deployment

**Step 1: Review Migrations**

```bash
# Check pending migrations
npx prisma migrate status
```

**Step 2: Apply Migrations**

```bash
# Deploy all pending migrations (does NOT prompt)
npx prisma migrate deploy
```

**Step 3: Verify Schema**

```bash
# Open Prisma Studio to verify tables
npx prisma studio
```

**Step 4: Generate Client**

```bash
# Generate Prisma Client with new schema
npx prisma generate
```

### Subsequent Deployments

**Development Workflow:**

1. Create migration locally:

   ```bash
   npx prisma migrate dev --name add_new_field
   ```

2. Test in staging:

   ```bash
   DATABASE_URL="<staging_url>" npx prisma migrate deploy
   ```

3. Commit migration files:

   ```bash
   git add prisma/migrations/
   git commit -m "feat: add new field migration"
   ```

4. Deploy to production (CI/CD):
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   pnpm build
   ```

---

## Vercel Deployment

### Environment Variables

In Vercel Project Settings → Environment Variables:

```env
# Required
DATABASE_URL="postgresql://user:pass@pooler-host/db?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://user:pass@direct-host/db"

# Optional (if using multiple environments)
DATABASE_URL_PREVIEW="postgresql://..."  # For preview deployments
DATABASE_URL_DEVELOPMENT="postgresql://..."  # For dev branch
```

### Build Configuration

**vercel.json** (optional):

```json
{
  "buildCommand": "prisma generate && prisma migrate deploy && next build",
  "installCommand": "pnpm install"
}
```

**package.json scripts**:

```json
{
  "scripts": {
    "build": "prisma generate && next build",
    "postinstall": "prisma generate",
    "vercel-build": "prisma migrate deploy && pnpm build"
  }
}
```

### Deploy Process

1. **Push to GitHub**:

   ```bash
   git push origin main
   ```

2. **Vercel Auto-Deploys**:
   - Runs `pnpm install`
   - Runs `postinstall` → `prisma generate`
   - Runs `prisma migrate deploy` (from build command)
   - Runs `next build`

3. **Verify Deployment**:
   - Check Vercel deployment logs
   - Test database connection via health endpoint
   - Verify Prisma Client is included in build

### Common Vercel Issues

**Issue**: `PrismaClient is unable to run in production`

**Solution**: Ensure `prisma generate` runs before `next build`:

```json
"build": "prisma generate && next build"
```

**Issue**: `Can't reach database server`

**Solution**: Use pooled connection with `pgbouncer=true` and `connection_limit=1`

---

## Rollback Procedures

### Scenario 1: Migration Failed Mid-Execution

```bash
# 1. Check what failed
npx prisma migrate status

# 2. Mark migration as rolled back
npx prisma migrate resolve --rolled-back 20260226_failed_migration

# 3. Fix the migration SQL manually or in schema
# Edit prisma/migrations/20260226_failed_migration/migration.sql

# 4. Re-apply the fixed migration
npx prisma migrate deploy
```

### Scenario 2: Need to Revert Last Migration

**⚠️ WARNING: This can cause data loss**

```bash
# 1. Restore database from backup
# (Provider-specific, e.g., Neon restore from snapshot)

# 2. Mark migration as rolled back
npx prisma migrate resolve --rolled-back 20260226_add_field

# 3. Delete migration files
rm -rf prisma/migrations/20260226_add_field

# 4. Revert schema.prisma changes
git revert <commit_hash>

# 5. Re-deploy
git push origin main
```

### Scenario 3: Revert to Specific Migration

```bash
# 1. Restore database snapshot from before breaking migration

# 2. Mark all migrations after target as rolled back
npx prisma migrate resolve --rolled-back 20260227_breaking_change
npx prisma migrate resolve --rolled-back 20260228_another_change

# 3. Remove migration directories
rm -rf prisma/migrations/20260227_*
rm -rf prisma/migrations/20260228_*

# 4. Deploy to target state
npx prisma migrate deploy
```

---

## Monitoring

### Health Check Endpoint

Create `src/app/api/health/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 },
    );
  }
}
```

### Database Metrics to Monitor

- **Connection Pool Usage**: Track active connections
- **Query Performance**: Monitor slow queries (>100ms)
- **Error Rates**: Prisma errors, connection timeouts
- **Database Size**: Monitor table growth
- **Migration Status**: Verify migrations applied successfully

### Logging Best Practices

```typescript
// src/lib/db/logger.ts
export function logDatabaseQuery(query: string, duration: number) {
  if (duration > 100) {
    console.warn(`[DB] Slow query (${duration}ms):`, query);
  } else {
    console.log(`[DB] Query completed (${duration}ms)`);
  }
}

// Usage in database operations
const start = Date.now();
const result = await prisma.user.findMany();
logDatabaseQuery('findMany(User)', Date.now() - start);
```

---

## Troubleshooting

### Connection Errors

**Error**: `P1001: Can't reach database server`

**Causes**:

- Database is paused (Neon auto-pauses after inactivity)
- Incorrect connection string
- Firewall blocking connection
- SSL/TLS configuration issue

**Solutions**:

1. Wake database (visit Neon console)
2. Verify `DATABASE_URL` format
3. Add `?sslmode=require` to connection string
4. Check IP whitelist (if applicable)

### Migration Errors

**Error**: `P3006: Migration failed to apply`

**Causes**:

- SQL syntax error in migration file
- Database schema drift
- Insufficient permissions

**Solutions**:

1. Check migration SQL file for syntax errors
2. Run `npx prisma db pull` to check drift
3. Verify database user has DDL permissions

### Type Generation Errors

**Error**: `@prisma/client not found`

**Causes**:

- `prisma generate` not run
- Build order incorrect
- Missing postinstall script

**Solutions**:

1. Run `npx prisma generate` manually
2. Add postinstall script: `"postinstall": "prisma generate"`
3. Ensure build command includes `prisma generate && next build`

### Performance Issues

**Symptom**: Slow queries (>500ms)

**Causes**:

- Missing indexes
- N+1 query problem
- Connection pool exhausted

**Solutions**:

1. Add indexes to frequently queried fields:

   ```prisma
   @@index([date])
   @@index([employeeId])
   ```

2. Use `include` to prevent N+1:

   ```typescript
   const users = await prisma.user.findMany({
     include: { lunchRecords: true }, // Single query
   });
   ```

3. Increase connection pool size (for non-serverless):
   ```env
   DATABASE_URL="postgresql://...?connection_limit=20"
   ```

---

## Emergency Contacts

**Database Issues**:

- Check Neon/provider status page
- Contact database provider support
- Review database logs in provider console

**Application Issues**:

- Check Vercel deployment logs
- Review error tracking (Sentry, etc.)
- Check health endpoint: `https://yourapp.com/api/health`

---

## Post-Deployment Checklist

After successful deployment:

- [ ] Health check endpoint returns 200
- [ ] Prisma Studio can connect
- [ ] Test user creation works
- [ ] Test lunch recording works
- [ ] Verify duplicate prevention works
- [ ] Check query performance (<100ms)
- [ ] Monitor error logs for 24 hours
- [ ] Document any issues encountered
- [ ] Update team on deployment status

---

## Resources

- [Prisma Docs: Deploy Migrations](https://www.prisma.io/docs/guides/deployment/deploy-database-changes)
- [Vercel + Prisma Guide](https://www.prisma.io/docs/guides/deployment/deploy-to-vercel)
- [Connection Pooling Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)
- [Neon Serverless Guide](https://neon.tech/docs/serverless/serverless-driver)

---

**Last Updated**: February 26, 2026
