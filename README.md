This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Design System

This project includes a custom design system built with Tailwind CSS and follows atomic design principles.

### Components

- **Atoms**: Button, Input, Label, Badge, Icon, Avatar, Card
- **Molecules**: FormField, SearchField, StatCard

All components are TypeScript-first with full type safety and follow consistent design patterns.

### Usage

```tsx
import { Button, FormField, Badge } from '@/components';

function MyComponent() {
  return (
    <div>
      <Button variant="primary" size="lg">
        Click Me
      </Button>
      <FormField label="Email" type="email" required />
      <Badge variant="success">Active</Badge>
    </div>
  );
}
```

### Documentation

- **Design System Guide**: See [docs/design-system.md](docs/design-system.md) for comprehensive documentation
- **Component Template**: Use [docs/component-template.tsx](docs/component-template.tsx) when creating new components
- **Migration Guide**: See [docs/migration-guide.md](docs/migration-guide.md) for migrating existing code
- **Component Showcase**: Run the dev server and visit `/showcase` to see all components

### Design Tokens

All colors, spacing, and other design tokens are defined in `tailwind.config.ts` and can be accessed via Tailwind utilities:

```tsx
// ✅ Correct - using design tokens
<div className="bg-primary text-white p-md rounded-lg">

// ❌ Avoid - hardcoded values
<div className="bg-[#8100D1] text-white p-[16px] rounded-lg">
```

### Enforcement

ESLint rules are configured to enforce design system usage:

- No hardcoded color values (hex, rgb)
- No inline styles
- Required accessibility attributes

Run linting:

```bash
pnpm eslint 'src/**/*.{ts,tsx}'
```

## Database Setup

This project uses **PostgreSQL** with **Prisma ORM** for database management.

### Prerequisites

- PostgreSQL database (e.g., Neon, Supabase, local PostgreSQL)
- Node.js 18+ installed

### Environment Configuration

1. Copy `.env.example` to `.env`:

   ```bash
   cp .env.example .env
   ```

2. Set your `DATABASE_URL`:

   ```env
   DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"
   ```

   **Format**: `postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require`

   **Examples**:
   - **Neon**: `postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require`
   - **Local**: `postgresql://postgres:password@localhost:5432/lunchtrack`

3. For serverless deployments (Vercel), also set `DIRECT_URL`:
   ```env
   DIRECT_URL="postgresql://user:password@host:5432/database?sslmode=require"
   ```

### Database Schema

The database has two main tables:

- **User**: Employee profiles with face descriptors
  - `id` (CUID primary key)
  - `employeeId` (unique identifier)
  - `name` (employee name)
  - `faceDescriptor` (Float[] - 128-dimensional array for face matching)
  - `email` (optional)
  - `department` (optional)
  - `timestamps` (createdAt, updatedAt)

- **LunchRecord**: Daily lunch scan records
  - `id` (CUID primary key)
  - `userId` (foreign key to User)
  - `date` (YYYY-MM-DD format)
  - `timestamp` (exact scan time)
  - `confidence` (face match confidence score)
  - Unique constraint on `[userId, date]` prevents duplicate scans

### Prisma Commands

#### Initial Setup

```bash
# Install dependencies
pnpm install

# Generate Prisma Client (auto-runs on postinstall)
npx prisma generate

# Apply database schema
npx prisma db push
```

#### Development Migrations

```bash
# Create and apply a new migration
npx prisma migrate dev --name your_migration_name

# Reset database (⚠️ deletes all data)
npx prisma migrate reset

# Check migration status
npx prisma migrate status
```

#### Production Migrations

```bash
# Apply pending migrations (CI/CD)
npx prisma migrate deploy
```

#### Database Inspection

```bash
# Open Prisma Studio (visual database editor)
npx prisma studio

# Pull schema from existing database
npx prisma db pull

# Validate schema file
npx prisma validate
```

### Connection Pooling

For production, use connection pooling to handle serverless function scaling:

```env
# Pooled connection (for queries)
DATABASE_URL="postgresql://user:pass@pooler-host:5432/db?pgbouncer=true"

# Direct connection (for migrations)
DIRECT_URL="postgresql://user:pass@direct-host:5432/db"
```

**Neon Example**:

- Pooled: `ep-xxx-pooler.c-4.us-east-1.aws.neon.tech`
- Direct: `ep-xxx.c-4.us-east-1.aws.neon.tech`

### Database Utilities

Import database operations from `src/lib/db/`:

```typescript
// User operations
import { getUserByEmployeeId, createUser, getAllUsers } from '@/lib/db/user';

// Lunch record operations
import {
  createLunchRecord,
  getLunchRecordByUserAndDate,
  getTodayLunchCount,
  getMonthlyLunchStats,
} from '@/lib/db/lunch-record';

// Example: Check if user scanned today
const today = getTodayDateString();
const existing = await getLunchRecordByUserAndDate(userId, today);
if (existing) {
  console.log('Already scanned today!');
}
```

### Validation

Input validation uses Zod schemas:

```typescript
import {
  createUserSchema,
  faceDescriptorSchema,
} from '@/lib/validation/schemas';

// Validate user input
const result = createUserSchema.safeParse(data);
if (result.success) {
  await createUser(result.data);
}
```

### Error Handling

Custom error types for better error messages:

```typescript
import {
  DuplicateLunchRecordError,
  UserNotFoundError,
  isDatabaseError,
  getErrorStatusCode,
} from '@/lib/db/errors';

try {
  await createLunchRecord({ userId, date });
} catch (error) {
  if (error instanceof DuplicateLunchRecordError) {
    return res.status(409).json({ error: 'Already scanned today' });
  }
  throw error;
}
```

### Rollback Procedure

If a migration fails in production:

1. **Check migration status**:

   ```bash
   npx prisma migrate status
   ```

2. **Resolve failed migration**:

   ```bash
   # Mark as rolled back
   npx prisma migrate resolve --rolled-back MIGRATION_NAME

   # Fix schema and create new migration
   npx prisma migrate dev --name fix_migration
   ```

3. **Deploy fixed migration**:

   ```bash
   npx prisma migrate deploy
   ```

4. **Verify with Studio**:
   ```bash
   npx prisma studio
   ```

### Testing

Run comprehensive database tests:

```bash
pnpm tsx src/lib/db/__validate.ts
```

Tests verify:

- Database connectivity
- User CRUD operations
- Face descriptor storage (128 floats)
- Duplicate prevention
- Cascade deletion
- Query performance
- Index efficiency

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
