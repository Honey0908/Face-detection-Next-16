# 🤖 GitHub Copilot Instructions

## Project: Smart Office Lunch Tracking System (Face Recognition Based)

### 📋 Overview
A Next.js-based internal office application that uses facial recognition to track employee lunch counts automatically. Designed for office environments with 300–500 employees. The system stores face descriptors (not raw images) for privacy and efficiency, using face-api.js for face detection and Euclidean distance for matching.

---

## 🏗️ Architecture & Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router with Server Components)
- **Language**: TypeScript (strict mode)
- **Face Detection**: face-api.js (with TensorFlow.js backend)
- **Webcam Access**: Browser Webcam API (Client Component only)
- **Styling**: CSS Modules or Tailwind CSS

### Backend
- **Server Components**: Default for data fetching and rendering
- **Route Handlers**: For API endpoints (`src/app/api/`)
- **Server Actions**: For mutations and form submissions
- **Database**: Postgres with Prisma ORM
- **Runtime**: Node.js

### Deployment
- Vercel (recommended for Next.js), AWS, or internal server

---

## 📂 Project Structure

```
├── src/
│   ├── app/
│   │   ├── api/                    # API endpoints
│   │   │   ├── register/           # Employee registration
│   │   │   ├── lunch/              # Lunch scan endpoint
│   │   │   └── stats/              # Dashboard statistics
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Landing page
│   │   └── globals.css             # Global styles
│   ├── components/                 # Reusable React components
│   ├── lib/                        # Utility functions
│   ├── services/                   # Business logic (face matching, descriptors)
│   └── types/                      # TypeScript interfaces
├── public/                         # Static assets
├── docs/
│   └── project-definition.md       # Project specification
├── next.config.ts                  # Next.js configuration
├── tsconfig.json                   # TypeScript configuration
├── package.json                    # Dependencies
└── README.md                       # Getting started
```

---

## 🔑 Core Concepts & Logic

### 1. Face Descriptors
- **What**: 128-dimensional numerical arrays representing facial features
- **Why**: Privacy-preserving, efficient, and fast for comparison
- **Process**:
  - Face detection → feature extraction → descriptor generation
  - Never store raw images
  - One descriptor per face capture for registration (3-5 captures per employee)

### 2. Face Matching Algorithm
```typescript
// Euclidean Distance Calculation
const distance = euclideanDistance(registeredDescriptor, scannedDescriptor)
const isMatch = distance < THRESHOLD // 0.5 - 0.6 recommended
```

### 3. Duplicate Prevention
- Before inserting lunch record, query database for today's entry
- Pattern: `{ userId, date: YYYY-MM-DD }`
- Reject duplicate scans on the same calendar day

---

## 🗄️ Database Schema

### Users Collection
```typescript
{
  _id: ObjectId,
  employeeId: string,          // Unique employee ID
  name: string,                // Employee name
  faceDescriptor: number[],    // 128-dimensional face descriptor
  email?: string,              // Optional: for notifications
  department?: string,         // Optional: for filtering
  createdAt: Date,
  updatedAt: Date
}
```

### LunchRecords Collection
```typescript
{
  _id: ObjectId,
  userId: ObjectId,            // Reference to Users collection
  date: string,                // Format: YYYY-MM-DD
  timestamp: Date,             // Exact scan time
  confidence?: number          // Face matching confidence score
}
```

### Prisma Schema (If Used)
```typescript
model User {
  id String @id @default(auto()) @map("_id") @db.ObjectId
  employeeId String @unique
  name String
  faceDescriptor Float[]
  lunchRecords LunchRecord[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model LunchRecord {
  id String @id @default(auto()) @map("_id") @db.ObjectId
  userId String @db.ObjectId
  user User @relation(fields: [userId], references: [id])
  date String // YYYY-MM-DD
  timestamp DateTime @default(now())
  confidence Float?
  createdAt DateTime @default(now())
}
```

---

## 🔁 Application Workflows

### Workflow 1: Employee Registration (Admin Only)
1. **Capture** 3-5 face images via webcam
2. **Process** each image:
   - Detect face in frame
   - Extract features
   - Generate 128-d descriptor
3. **Average** descriptors (optional: improves accuracy)
4. **Store** employee data + descriptor in database
5. **Confirm** registration success

**Endpoint**: `POST /api/register`

**Request Body**:
```json
{
  "employeeId": "EMP001",
  "name": "John Doe",
  "department": "Engineering",
  "email": "john@office.com",
  "faceDescriptors": [[...], [...], [...]]
}
```

**Response**:
```json
{
  "success": true,
  "message": "Registration successful",
  "userId": "507f1f77bcf86cd799439011"
}
```

### Workflow 2: Lunch Scan Flow
1. **Open** webcam
2. **Detect** face in frame
3. **Generate** descriptor from detected face
4. **Query** database for match within threshold
5. **Check** duplicate (today's record exists?)
6. **Result**:
   - ✅ First scan today → insert record, increment counter
   - ⚠️ Already scanned today → show "Already taken"
   - ❌ No match found → show "Employee not found"

**Endpoint**: `POST /api/lunch`

**Request Body**:
```json
{
  "faceDescriptor": [0.123, 0.456, ...]
}
```

**Response** (Success):
```json
{
  "success": true,
  "message": "Lunch recorded successfully",
  "userId": "507f1f77bcf86cd799439011",
  "employeeName": "John Doe",
  "scannedTime": "2026-02-19T12:45:00Z"
}
```

**Response** (Duplicate):
```json
{
  "success": false,
  "message": "Lunch already recorded today",
  "employeeName": "John Doe"
}
```

### Workflow 3: Admin Dashboard
- **Display**: Total employees who took lunch today
- **Display**: Monthly lunch count per employee
- **Display**: Daily trends (optional)
- **Feature**: Export CSV (future enhancement)

**Endpoint**: `GET /api/stats?month=2026-02&department=Engineering`

**Response**:
```json
{
  "todayCount": 234,
  "monthCount": 4560,
  "perUserStats": [
    {
      "employeeId": "EMP001",
      "name": "John Doe",
      "department": "Engineering",
      "monthlyCount": 20,
      "todayScanned": true
    }
  ],
  "generatedAt": "2026-02-19T15:30:00Z"
}
```

---

## 🎯 Performance Requirements

Target scan time: **< 300ms total**

- Face detection: ~100ms
- Descriptor comparison: <50ms
- Database query: ~50ms
- API overhead: ~50ms

**Optimization Tips**:
- Cache model files (face-api.js)
- Use connection pooling for postgres
- Implement request debouncing on frontend
- Preload models on app startup

---

## 🔐 Security & Privacy Guidelines

### ✅ DO:
- Store only face descriptors (not images)
- Use HTTPS for all communications
- Validate all user inputs
- Implement rate limiting on API endpoints
- Add employee consent workflow
- Audit logs for admin actions
- Use environment variables for secrets

### ❌ DON'T:
- Never store raw face images
- Never expose raw postgres credentials
- Never skip input validation
- Never log sensitive employee data
- Never expose face descriptors to clients unnecessarily

### Required Security Headers:
```typescript
// Use in API routes
res.setHeader('Content-Type', 'application/json')
res.setHeader('X-Content-Type-Options', 'nosniff')
res.setHeader('X-Frame-Options', 'DENY')
```

---

## 💻 Coding Conventions

### TypeScript
- Use **strict mode**: `strict: true` in tsconfig.json
- Define types for API responses and request bodies
- Use `interface` for public API contracts, `type` for internal usage
- No `any` types without `// @ts-ignore` comment explaining why

### Naming Conventions
- **Files**: `kebab-case.ts` for components and utilities
- **Components**: `PascalCase.tsx` for React components
- **Functions**: `camelCase` for functions and methods
- **Constants**: `UPPER_SNAKE_CASE` for env vars and magic numbers
- **Database**: `camelCase` for field names

### API Routes
```typescript
// File: src/app/api/lunch/route.ts (Route Handler - Server Component)
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    // Validate input
    // Process logic
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### Server Components (Default)
```typescript
// File: src/app/dashboard/page.tsx
// This is a Server Component by default - no 'use client' needed
import { getEmployeeStats } from '@/lib/data'

export default async function DashboardPage() {
  // Fetch data directly in Server Component
  const stats = await getEmployeeStats()
  
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Today's count: {stats.todayCount}</p>
      <LunchChart data={stats} /> {/* Client Component for interactivity */}
    </div>
  )
}
```

### Client Components (Only When Needed)
```typescript
// File: src/components/lunch-chart.tsx
'use client'

import { useState } from 'react'

export default function LunchChart({ data }) {
  const [filter, setFilter] = useState('today')
  
  return (
    <div>
      {/* Interactive UI here */}
    </div>
  )
}
```

### Server Actions (For Mutations)
```typescript
// File: src/app/actions.ts
'use server'

export async function recordLunch(formData: FormData) {
  const descriptor = formData.get('faceDescriptor')
  
  // Database mutation
  const result = await db.lunchRecords.create({
    data: { descriptor }
  })
  
  // Refresh UI after mutation
  revalidatePath('/dashboard')
  return result
}
```

### Error Handling
```typescript
// Define custom error types
class FaceMatchError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'FaceMatchError'
  }
}

// Return structured error responses
{
  "success": false,
  "error": "DUPLICATE_SCAN",
  "message": "Lunch already recorded today",
  "timestamp": "2026-02-19T12:45:00Z"
}
```

### Server-First Approach (Next.js 16 Best Practice)
1. **Default to Server Components** - All components are Server Components by default
2. **Use `'use client'` sparingly** - Only for interactive features (forms, state, hooks)
3. **Fetch data in Server Components** - Use async/await directly in components
4. **Use Server Actions** - For mutations instead of API routes when possible
5. **Keep Client Components small** - Isolate interactivity to reduce JS bundle

### Before Coding
1. Check `src/types/` for existing interfaces
2. Review similar endpoints for patterns
3. Plan database queries to avoid N+1 queries
4. Decide: Server Component or Client Component?

### When Creating Pages/Layouts
- Default to **Server Component** (no `'use client'` directive)
- Fetch data using `async/await`
- Use `cache: 'no-store'` for dynamic data
- Use `next: { revalidate: 60 }` for ISR

```typescript
// ✅ Server Component Page
export default async function Page() {
  const data = await fetch(url, { cache: 'no-store' })
  return <div>{data}</div>
}

// ❌ Avoid - unnecessary client rendering
'use client'
export default function Page() {
  // ...
}
```

### When Creating Components
- **Server Component** (default): For display, data fetching, database queries
- **Client Component** (`'use client'`): Only for interactivity (buttons, forms, state)
- Keep Client Components small and near the leaves of the component tree

```typescript
// ✅ Server Component - Fetches and displays data
export default async function EmployeeList() {
  const employees = await getEmployees()
  return (
    <div>
      {employees.map(emp => (
        <EmployeeCard key={emp.id} employee={emp} />
      ))}
    </div>
  )
}

// ✅ Client Component - Only handles interactivity
'use client'
export function EmployeeCard({ employee }) {
  const [selected, setSelected] = useState(false)
  return (
    <div onClick={() => setSelected(!selected)}>
      {employee.name}
    </div>
  )
}
```

### When Handling Form Submissions
- Use **Server Actions** instead of API routes for simple mutations
- Pass Server Actions as `action` prop to `<form>`

```typescript
// ✅ Server Action - Preferred for mutations
'use server'
export async function recordLunch(formData: FormData) {
  const descriptor = JSON.parse(formData.get('descriptor'))
  await db.lunchRecords.create({ data: { descriptor } })
  revalidatePath('/dashboard')
}

// Client Component using Server Action
'use client'
export function ScanForm() {
  return <form action={recordLunch}>{/* ... */}</form>
}
```

### When Calling Server Functions from Client Components
- Import Server Actions/Functions from a separate file
- Call them from event handlers or form submissions

```typescript
// ✅ Correct Pattern
'use client'
import { recordLunch } from '@/app/actions'

export function ScanButton() {
  return (
    <button onClick={async () => {
      await recordLunch(descriptor)
    }}>
      Scan Lunch
    </button>
  )
}
```

### When Working with Face Detection
- Initialize models in a **Client Component** (webcam requires browser)
- Keep face detection logic in a separate utility file
- Cache models in memory for performance

```typescript
// ✅ Client Component for Webcam
'use client'
import { useEffect, useRef } from 'react'
import { initializeModels, extractDescriptor } from '@/lib/face'

export function WebcamScanner() {
  const videoRef = useRef(null)

  useEffect(() => {
    initializeModels()
  }, [])

  async function handleCapture() {
    const descriptor = await extractDescriptor(videoRef.current)
    // Send to server
  }

  return <video ref={videoRef} />
}
```

### Data Fetching in Server Components
```typescript
// ✅ Dynamic data - fetch on every request
const data = await fetch(url, { cache: 'no-store' })

// ✅ Static data - cached until revalidation
const data = await fetch(url, { cache: 'force-cache' })

// ✅ ISR - revalidate every 60 seconds
const data = await fetch(url, { next: { revalidate: 60 } })
```

### Error Handling
- Use try-catch in Route Handlers and Server Actions
- Return structured error responses
- Log errors for debugging

```typescript
export async function POST(request: NextRequest) {
  try {
    // ... logic
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Operation failed' },
      { status: 500 }
    )
  }
}
```

### Performance Optimization
- Use Server Components to reduce client JS bundle
- Load face-api models once at app startup
- Use connection pooling for postgres
- Implement request deduplication
- Cache face detection models

---

## 🚀 Recommended Libraries & Utilities

- **face-api.js**: Face detection and descriptor extraction
- **postgres** or **Prisma**: Database ORM
- **zod**: TypeScript-first schema validation
- **next/navigation**: Client-side routing (useRouter, useSearchParams)
- **next/cache**: Server-side caching (revalidatePath, revalidateTag)

---

## 📊 Key Metrics & Monitoring

Track these metrics for optimization:
- Average scan time per employee
- Face matching accuracy rate
- Duplicate scan attempts per day
- Database query response times
- API endpoint response times
- Webcam initialization time

---

## 🔗 Key Files Reference

- **Face Matching Logic**: `src/services/faceMatching.ts`
- **API Endpoints**: `src/app/api/` directory
- **Database Connection**: `.env.local` (postgres URI)
- **Types**: `src/types/index.ts`
- **Components**: `src/components/` directory

---

## ⚠️ Important Notes for Copilot

1. **Default to Server Components** - Use `'use client'` only for interactivity
2. **Face Recognition Model**: Always initialize face-api.js models in useEffect or at app startup
3. **Descriptor Storage**: Always validate descriptor is array of 128 numbers
4. **Timezone Handling**: Always use UTC for date comparisons in database queries
5. **Concurrent Requests**: Implement request queue for face matching to prevent race conditions
6. **Environment Variables**: Never commit `.env.local` or hardcode API keys
7. **Responsive Design**: Ensure webcam interface works on mobile (landscape mode recommended)
8. **Server Actions preferred**: Use Server Actions for database mutations instead of API routes
9. **Data Fetching**: Fetch data in Server Components, pass to Client Components via props
10. **Bundle Size**: Keep client-side JavaScript minimal by using Server Components

---

## 📝 Code Examples for Reference

### Initialize Face-API Models
```typescript
import * as faceapi from 'face-api.js'

async function initializeModels() {
  const MODEL_URL = '/models'
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
  ])
}
```

### Extract Face Descriptor
```typescript
async function extractFaceDescriptor(imageBitmap: ImageBitmap) {
  const detection = await faceapi
    .detectSingleFace(imageBitmap, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptors()

  if (!detection) throw new FaceNotDetectedError()

  return {
    descriptor: detection.descriptor,
    confidence: detection.detection.score,
  }
}
```

### Euclidean Distance Calculation
```typescript
function euclideanDistance(a: Float32Array, b: Float32Array): number {
  let sum = 0
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i]
    sum += diff * diff
  }
  return Math.sqrt(sum)
}
```

---

## 🎓 Best Practices Summary

1. **Always validate face descriptor is 128 numbers**
2. **Always check for duplicate scans before inserting**
3. **Always use HTTPS in production**
4. **Always handle edge cases (no face, low confidence, etc.)**
5. **Always log significant events for debugging**
6. **Always use TypeScript strict mode**
7. **Always implement rate limiting on sensitive endpoints**
8. **Always ask for employee consent before enrollment**

---

Generated: February 19, 2026
