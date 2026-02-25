# 🍽️ Smart Office Lunch Tracking System (Face Recognition Based)

A Next.js-based internal office application that uses Face Recognition to track employee lunch counts automatically.

This system allows employees to scan their face at the lunch counter, increments their lunch count, and provides an admin dashboard to monitor daily and monthly usage.

---

# 🚀 Project Overview

This project is designed for office environments with 300–500 employees per day.

Instead of manual entry or ID cards, the system uses facial recognition to:

- Identify employees
- Prevent duplicate lunch scans
- Track daily and monthly lunch counts
- Provide real-time dashboard statistics

---

# 🏗️ Tech Stack

## Frontend

- Next.js (App Router)
- TypeScript
- face-api.js
- Webcam API (navigator.mediaDevices)

## Backend

- Next.js API Routes
- postgres
- Prisma (optional)

## Deployment

- Internal office server OR
- Cloud deployment (AWS / DigitalOcean / Vercel)

---

# 🧠 Core Concept: Face Descriptor

Instead of storing raw face images, the system stores a **128-dimensional face descriptor**.

When:

1. User registers → descriptor is generated and stored.
2. User scans → new descriptor is generated.
3. System compares both using Euclidean distance.
4. If distance < threshold (0.6), it's a match.

This improves:

- Privacy
- Speed
- Storage efficiency

---

# 📂 Project Structure

---

# 🔁 Application Flow

## 1️⃣ User Registration (Admin Only)

- Capture 3–5 face images
- Generate face descriptor
- Store descriptor in database

Stored Data:

```ts
{
  employeeId: string
  name: string
  faceDescriptor: number[]
}



2️⃣ Lunch Scan Flow

Open webcam

Detect face

Generate descriptor

Compare with stored descriptors

If match found:

Check if lunch already taken today

If not → insert record

If yes → show "Already Taken"

3️⃣ Admin Dashboard

Displays:

Total members who took lunch today

Monthly total lunch count

Per-user monthly count

Export CSV (optional future feature)

🗄️ Database Schema
Users Collection
{
  _id: ObjectId
  employeeId: string
  name: string
  faceDescriptor: number[]
  createdAt: Date
}

LunchRecords Collection
{
  _id: ObjectId
  userId: ObjectId
  date: string (YYYY-MM-DD)
  timestamp: Date
}

🔐 Duplicate Prevention Logic

Before inserting lunch record:

findOne({
  userId,
  date: today
})


If exists → reject scan.

⚙️ Matching Logic
const distance = euclideanDistance(desc1, desc2)

if (distance < 0.6) {
  return match
}


Recommended threshold: 0.5 – 0.6

Lower threshold = stricter matching.

📊 API Endpoints
POST /api/register

Registers new employee with face descriptor.

POST /api/lunch

Validates scan and increments lunch count.

GET /api/stats

Returns:

Total today

Monthly totals

Per-user stats

⚡ Performance Expectations

For 300–500 users:

Face detection: ~100ms

Descriptor comparison: <100ms

API call: ~50ms

Total scan time: <300ms

🔒 Security & Privacy Considerations

Do NOT store raw face images.

Store only descriptors.

Use HTTPS.

Encrypt database if possible.

Take employee consent before enrollment.
```
