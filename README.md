# Smart Office Lunch Tracking System

A Next.js-based internal office application using facial recognition to track employee lunch counts automatically. Built with face-api.js for face detection and PostgreSQL for data storage.

## Features

- 🔐 **Privacy-First**: Stores face descriptors (128-dimensional vectors), not raw images
- ⚡ **Fast Scanning**: <300ms scan time with 500 registered employees
- 🎯 **High Accuracy**: 0.6 Euclidean distance threshold for reliable matching
- 🔄 **Duplicate Prevention**: Automatic detection of same-day duplicate scans
- ♿ **Accessible**: ARIA live regions, keyboard navigation, screen reader support
- 📊 **Performance Monitoring**: Built-in tracking for scan times and bottlenecks

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Face-API Model Setup](#face-api-model-setup)
4. [Environment Variables](#environment-variables)
5. [Database Setup](#database-setup)
6. [Running Locally](#running-locally)
7. [Admin Guide](#admin-guide)
8. [Browser Compatibility](#browser-compatibility)
9. [Deployment](#deployment)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- **Node.js**: v18.17+ or v20.0+
- **pnpm**: v8.0+ (or npm/yarn)
- **PostgreSQL**: v14+ (local or hosted)
- **Webcam**: Required for face capture
- **HTTPS**: Required in production (webcam access restriction)

---

## Installation

```bash
# Clone repository
git clone <repository-url>
cd face-detection

# Install dependencies
pnpm install

# Copy environment template
cp .env.example .env.local
```

---

## Face-API Model Setup

Face-api.js requires pre-trained TensorFlow models for face detection and recognition.

### Download Models

1. **Create models directory**:

   ```bash
   mkdir -p public/models
   ```

2. **Download model files**:

   **Option A: Direct Download**

   ```bash
   cd public/models

   # TinyFaceDetector (lightweight, CPU-optimized)
   curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-weights_manifest.json
   curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-shard1

   # Face Landmark 68 Points
   curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-weights_manifest.json
   curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-shard1

   # Face Recognition (descriptor extraction)
   curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-weights_manifest.json
   curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-shard1
   curl -O https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-shard2
   ```

   **Option B: Clone Face-API Repository**

   ```bash
   git clone https://github.com/justadudewhohacks/face-api.js.git temp-models
   cp temp-models/weights/* public/models/
   rm -rf temp-models
   ```

3. **Verify model files**:

   ```bash
   ls -lh public/models/
   ```

   Expected output:

   ```
   tiny_face_detector_model-weights_manifest.json
   tiny_face_detector_model-shard1 (4.2MB)
   face_landmark_68_model-weights_manifest.json
   face_landmark_68_model-shard1 (350KB)
   face_recognition_model-weights_manifest.json
   face_recognition_model-shard1 (5.1MB)
   face_recognition_model-shard2 (5.1MB)
   ```

### Model Caching (Production)

For production, serve models from CDN for faster loading:

```typescript
// next.config.ts
export default {
  async headers() {
    return [
      {
        source: '/models/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable', // 1 year
          },
        ],
      },
    ];
  },
};
```

**CDN Setup** (Optional):

```bash
# Upload to S3/CloudFlare/etc.
aws s3 sync public/models/ s3://your-bucket/models/

# Update ModelProvider.tsx
const MODEL_URL = process.env.NEXT_PUBLIC_MODEL_CDN_URL || '/models';
```

---

## Environment Variables

Create `.env.local` in project root:

```env
# Database Connection
DATABASE_URL="postgresql://user:password@localhost:5432/lunch_tracker"

# Face Matching Threshold
FACE_MATCH_THRESHOLD=0.6  # Range: 0.4 (strict) to 0.8 (lenient)

# Next.js
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Optional: Model CDN
NEXT_PUBLIC_MODEL_CDN_URL=""  # Leave empty to use /public/models

# Optional: Logging
LOG_LEVEL="info"  # debug | info | warn | error
```

### Variable Descriptions

| Variable                    | Required | Default   | Description                                  |
| --------------------------- | -------- | --------- | -------------------------------------------- |
| `DATABASE_URL`              | ✅       | -         | PostgreSQL connection string                 |
| `FACE_MATCH_THRESHOLD`      | ❌       | 0.6       | Face matching sensitivity (lower = stricter) |
| `NEXT_PUBLIC_APP_URL`       | ✅       | -         | Application base URL                         |
| `NEXT_PUBLIC_MODEL_CDN_URL` | ❌       | `/models` | CDN URL for model files                      |
| `LOG_LEVEL`                 | ❌       | `info`    | Logging verbosity                            |

### Threshold Tuning Guide

- **0.4-0.5**: Very strict (fewer false positives, more false negatives)
- **0.6**: Recommended (balanced accuracy)
- **0.7-0.8**: Lenient (fewer false negatives, risk of false positives)

Test with your office population and adjust based on results.

---

## Database Setup

```bash
# Run migrations
pnpm prisma migrate dev --name init

# Generate Prisma client
pnpm prisma generate

# (Optional) Seed test data
pnpm prisma db seed
```

### Manual Database Setup

If using existing database:

```sql
CREATE DATABASE lunch_tracker;

-- Run migrations from prisma/migrations/
\i prisma/migrations/XXXXXX_init/migration.sql
```

---

## Running Locally

```bash
# Development mode
pnpm dev

# Production build
pnpm build
pnpm start

# Run tests
pnpm test

# Linting
pnpm lint
```

Access application:

- **Development**: http://localhost:3000
- **Production**: https://your-domain.com (HTTPS required)

---

## Admin Guide

### Employee Registration Workflow

1. **Navigate to Registration Page**
   - URL: `/register` or admin dashboard

2. **Enter Employee Details**:

   ```
   Employee ID: Unique identifier (e.g., EMP001)
   Name: Full name
   Department: Engineering, HR, Sales, etc.
   Email (optional): For notifications
   ```

3. **Capture Faces (3-5 captures)**:
   - Position employee 2-3 feet from camera
   - Ensure good lighting (face clearly visible)
   - Capture variations:
     - Face straight ahead
     - Slight left turn
     - Slight right turn
     - With/without glasses (if applicable)
     - Different expressions (neutral, smile)

   **Best Practices**:
   - ✅ Good overhead lighting
   - ✅ Neutral background
   - ✅ Face fills 40-60% of frame
   - ❌ Avoid backlighting (window behind)
   - ❌ Avoid harsh shadows
   - ❌ Avoid partial face occlusion

4. **Submit Registration**:
   - System averages all descriptors
   - Success confirmation shows `userId`
   - Employee ready for lunch scanning

### Lunch Scanning Process

1. Employee approaches kiosk/station
2. Camera activates automatically
3. System detects face and matches against database
4. Results displayed:
   - ✅ **Success**: "Welcome, [Name]! Lunch recorded."
   - ⚠️ **Duplicate**: "[Name], you've already taken lunch today."
   - ❌ **Not Found**: "Employee not found. Please register first."

### Managing Employees

**Update Employee**:

```bash
# Re-register with new captures (overwrites descriptor)
# Use same Employee ID
```

**Delete Employee**:

```bash
pnpm prisma studio
# Navigate to User table → Delete record
```

**Generate Reports**:

```sql
-- Today's lunch count
SELECT COUNT(*) FROM "LunchRecord"
WHERE date = CURRENT_DATE;

-- Monthly report per employee
SELECT u.name, u."employeeId", COUNT(lr.id) as lunch_count
FROM "User" u
LEFT JOIN "LunchRecord" lr ON u.id = lr."userId"
WHERE lr.date >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY u.id, u.name, u."employeeId"
ORDER BY lunch_count DESC;
```

---

## Browser Compatibility

### Supported Browsers

| Browser | Minimum Version | Webcam API | Face-API.js | Status                |
| ------- | --------------- | ---------- | ----------- | --------------------- |
| Chrome  | 90+             | ✅         | ✅          | Fully Supported       |
| Edge    | 90+             | ✅         | ✅          | Fully Supported       |
| Firefox | 88+             | ✅         | ✅          | Fully Supported       |
| Safari  | 14+             | ✅         | ⚠️          | Limited (performance) |
| Opera   | 76+             | ✅         | ✅          | Supported             |

### Browser Feature Requirements

- **getUserMedia API**: For webcam access
- **WebGL**: For TensorFlow.js (face-api.js)
- **ES6+ Support**: Arrow functions, async/await, modules
- **LocalStorage**: For model caching (optional)

### Known Limitations

1. **Safari**:
   - Slower TensorFlow.js performance (WebGL limitations)
   - Recommend Chrome/Edge for best experience
2. **Mobile Browsers**:
   - Portrait mode supported but not recommended
   - Landscape mode preferred
   - Front camera will be used automatically

3. **Internet Explorer**:
   - ❌ Not supported (no getUserMedia API)

### Verification Script

Test browser compatibility:

```javascript
// Run in browser console
const checkBrowserSupport = async () => {
  const results = {
    getUserMedia: !!navigator.mediaDevices?.getUserMedia,
    webgl: (() => {
      try {
        const canvas = document.createElement('canvas');
        return !!(
          canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
        );
      } catch {
        return false;
      }
    })(),
    es6: (() => {
      try {
        eval('const x = () => {};');
        return true;
      } catch {
        return false;
      }
    })(),
  };

  console.table(results);
  return Object.values(results).every((v) => v);
};

checkBrowserSupport().then((supported) => {
  console.log(
    supported ? '✅ Browser fully supported' : '❌ Browser not compatible',
  );
});
```

---

## Deployment

### Pre-Deployment Checklist

- [ ] **HTTPS Certificate**: Webcam requires HTTPS in production
- [ ] **Environment Variables**: Set in hosting platform
- [ ] **Database**: PostgreSQL accessible from deployment
- [ ] **Model Files**: Uploaded to CDN or included in build
- [ ] **Descriptor Cache**: Warmup enabled (instrumentation.ts)
- [ ] **Performance Testing**: Verified <300ms with expected user count
- [ ] **Browser Testing**: Tested on Chrome, Edge, Firefox
- [ ] **Error Handling**: All error scenarios graceful
- [ ] **Logging**: Configured for production monitoring

### Deployment Platforms

#### Vercel (Recommended for Next.js)

```bash
# Install Vercel CLI
pnpm add -g vercel

# Deploy
vercel --prod

# Set environment variables
vercel env add DATABASE_URL
vercel env add FACE_MATCH_THRESHOLD
vercel env add NEXT_PUBLIC_APP_URL
```

**PostgreSQL Options**:

- Vercel Postgres
- Supabase
- Railway
- Neon

**Model Files**: Served from `/public/models/` automatically

#### AWS (EC2 + RDS)

```bash
# Build application
pnpm build

# Install PM2 for process management
pnpm add -g pm2

# Start application
pm2 start npm --name "lunch-tracker" -- start

# Configure Nginx reverse proxy
# /etc/nginx/sites-available/lunch-tracker
server {
    listen 443 ssl;
    server_name lunch.company.com;

    ssl_certificate /etc/letsencrypt/live/lunch.company.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/lunch.company.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /models/ {
        alias /var/www/lunch-tracker/public/models/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### Docker

```dockerfile
# Dockerfile
FROM node:20-alpine AS base

# Dependencies
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - '3000:3000'
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/lunch_tracker
      - FACE_MATCH_THRESHOLD=0.6
      - NEXT_PUBLIC_APP_URL=https://lunch.company.com
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=lunch_tracker
      - POSTGRES_PASSWORD=password

volumes:
  postgres_data:
```

### Post-Deployment Verification

1. **Health Check**:

   ```bash
   curl https://lunch.company.com/api/health
   # Expected: {"status": "ok", "database": "connected"}
   ```

2. **Model Loading**:
   - Navigate to scan page
   - Open DevTools → Network tab
   - Verify models load from CDN/server
   - Check for 200 status codes

3. **Performance Test**:

   ```bash
   # Using k6
   k6 run performance/scan-test.js

   # Verify P95 < 300ms
   ```

4. **Error Monitoring**:
   - Configure Sentry, LogRocket, or similar
   - Set up alerts for 5xx errors
   - Monitor descriptor cache hit rate

---

## Troubleshooting

### Common Issues

#### Issue 1: Camera Not Working

**Symptoms**: "Camera access denied" or black screen

**Solutions**:

1. **Check HTTPS**: Webcam requires HTTPS in production

   ```bash
   # Verify URL starts with https://
   echo $NEXT_PUBLIC_APP_URL
   ```

2. **Browser Permissions**:
   - Click lock icon in address bar
   - Enable camera permissions
   - Reload page

3. **Hardware**: Verify webcam connected and working
   ```bash
   # Test from different browser
   # Try https://webcamtests.com
   ```

#### Issue 2: Face Not Detected

**Symptoms**: "No face detected" message persists

**Solutions**:

1. **Lighting**: Move to well-lit area (face clearly visible)
2. **Distance**: Position 2-3 feet from camera
3. **Angle**: Face camera directly (not profile view)
4. **Occlusion**: Remove masks, hands from face
5. **Model Loading**: Check DevTools console for errors

#### Issue 3: False Negatives (Registered User Not Matching)

**Symptoms**: "Employee not found" for registered user

**Solutions**:

1. **Check Threshold**: May be too strict

   ```env
   # Increase to 0.65 or 0.7
   FACE_MATCH_THRESHOLD=0.65
   ```

2. **Re-register**: Capture new faces with better quality
   - Use same lighting as scanning area
   - Capture 5 images (maximum)

3. **Verify Descriptor**:
   ```bash
   pnpm prisma studio
   # Check User table → faceDescriptor length = 128
   ```

#### Issue 4: Poor Performance (Scan > 300ms)

**Symptoms**: Slow scan response

**Solutions**:

1. **Check Descriptor Cache**:

   ```bash
   # View server logs on startup
   # Should see: "Loaded X descriptors into cache"
   ```

2. **Database Indexing**:

   ```sql
   CREATE INDEX IF NOT EXISTS idx_lunch_record_user_date
   ON "LunchRecord"("userId", date);
   ```

3. **Optimize Threshold**:
   ```typescript
   // In matching.ts - enable early exit
   if (distance < matchThreshold * 0.5) {
     return bestMatch; // Strong match, no need to continue
   }
   ```

#### Issue 5: Model Loading Failures

**Symptoms**: "Failed to load face detection models"

**Solutions**:

1. **Verify Model Files**:

   ```bash
   ls -lh public/models/
   # Should show 7 files (~15MB total)
   ```

2. **Check CDN** (if using):

   ```bash
   curl -I https://cdn.company.com/models/tiny_face_detector_model-weights_manifest.json
   # Should return 200 OK
   ```

3. **CORS Headers** (if models on different domain):
   ```typescript
   // next.config.ts
   async headers() {
     return [{
       source: '/models/:path*',
       headers: [
         { key: 'Access-Control-Allow-Origin', value: '*' },
       ],
     }];
   }
   ```

#### Issue 6: Duplicate Scans Not Prevented

**Symptoms**: Same employee can scan multiple times per day

**Solutions**:

1. **Check Date Format**:

   ```typescript
   // Should be YYYY-MM-DD, not timestamp
   const dateString = today.toISOString().split('T')[0];
   ```

2. **Database Constraint**:

   ```sql
   -- Add unique constraint if missing
   ALTER TABLE "LunchRecord"
   ADD CONSTRAINT unique_user_date UNIQUE ("userId", date);
   ```

3. **Time Zone**: Ensure server and database use same timezone

   ```bash
   # Check timezone
   echo $TZ

   # Set if needed
   export TZ="America/Los_Angeles"
   ```

#### Issue 7: High Memory Usage

**Symptoms**: Server crashes or OOM errors

**Solutions**:

1. **Descriptor Cache Size**: With 500 users ~65KB

   ```bash
   # Monitor memory
   node --max-old-space-size=2048 server.js
   ```

2. **Model Caching**: Models load once (~15MB)
   - Should not reload on each request
   - Check ModelProvider context

3. **Memory Leaks**: Use Node.js profiler
   ```bash
   node --inspect server.js
   # Open chrome://inspect
   # Take heap snapshots
   ```

### Debug Mode

Enable detailed logging:

```env
LOG_LEVEL=debug
```

Console will show:

- Face detection timing
- Descriptor matching details
- Database query times
- Cache hit/miss rates

### Support Contacts

For additional help:

- **Documentation**: `/docs/` directory
- **GitHub Issues**: [Link to repo issues]
- **Internal Support**: IT@company.com

---

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
