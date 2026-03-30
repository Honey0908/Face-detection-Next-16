## Context

The lunch tracking system currently has a complete database schema (User and LunchRecord models via Prisma) and a design system, but lacks facial recognition capabilities. This design covers integrating face-api.js to enable:

1. **Registration**: Admin captures 3-5 face images per employee, extracts descriptors, and stores them
2. **Scanning**: Employee faces camera, system detects face, extracts descriptor, matches against database, and records lunch

**Current State:**

- Database ready with faceDescriptor field (Float[] array)
- Design system components available (Button, Input, Card, etc.)
- No face detection, model loading, or matching logic exists
- No webcam-related UI components

**Constraints:**

- Must work in browser (Next.js App Router with React 18+)
- face-api.js requires TensorFlow.js (browser-only, not available in Node.js)
- Webcam access requires `'use client'` directive
- Target: <300ms total scan time for 500 users
- HTTPS required in production for navigator.mediaDevices

## Goals / Non-Goals

**Goals:**

- Real-time face detection from webcam with <100ms latency per frame
- Extract 128-dimensional descriptors compatible with existing database schema
- Implement Euclidean distance matching with 0.6 threshold
- Multi-capture registration (3-5 images) with descriptor averaging
- State machine for scan flow (IDLE → CAMERA_LOADING → SCANNING → MATCHING → RESULT)
- Graceful error handling for no face, multiple faces, camera permissions
- Model caching to avoid re-downloading on every page load

**Non-Goals:**

- Server-side face detection (TensorFlow.js incompatible with Node.js environment)
- Support for multiple face matching in one frame (business rule: single face only)
- Face image storage (privacy requirement: descriptors only)
- Real-time video recording or frame buffering
- Mobile-optimized face detection (desktop/landscape-first)

## Decisions

### Decision 1: Client-Side Face Detection (Browser)

**Choice:** Run all face detection, descriptor extraction, and model loading in the browser using face-api.js + TensorFlow.js.

**Rationale:**

- **Privacy-first**: Raw video frames never leave the client. Only 128-number descriptors sent to server.
- **Performance**: No video upload latency. Detection happens locally at 10-15 FPS.
- **Required by tech stack**: TensorFlow.js requires browser APIs (WebGL, Web Workers) and doesn't run in Node.js.

**Alternatives Considered:**

- ❌ **Server-side Python/OpenCV**: Requires video frame uploads (~500KB/frame), adds 200-500ms network latency, privacy concerns with raw images on server.
- ❌ **Hybrid (detect client, match server)**: Over-engineered. Matching 500 descriptors in-memory in browser is <50ms.

**Implementation:**

- All face logic in `src/lib/face/` utilities
- Components using face detection must have `'use client'` directive
- Models loaded once on app initialization, cached in memory

---

### Decision 2: TinyFaceDetector Model

**Choice:** Use TinyFaceDetector from face-api.js model suite (not SSD MobileNet or MTCNN).

**Rationale:**

- **Speed**: ~100ms detection vs 200-300ms for SSD MobileNet
- **Size**: 190KB model vs 5.4MB for SSD MobileNet
- **Accuracy trade-off acceptable**: 80-85% detection rate sufficient for controlled office environment (front-facing, well-lit)

**Alternatives Considered:**

- ❌ **SSD MobileNet**: More accurate (95%+ detection) but 3x slower, fails <300ms requirement
- ❌ **MTCNN**: 5-stage model, most accurate but 500ms+ detection time

**Model Files Required:**

```
/public/models/
  tiny_face_detector_model-weights_manifest.json (190KB)
  face_landmark_68_model-weights_manifest.json (350KB)
  face_recognition_model-weights_manifest.json (6.2MB)
```

Total: ~6.7MB. Loaded once, cached by browser. Initial load ~500ms on 10Mbps.

---

### Decision 3: Model Loading Strategy

**Choice:** Load models once on app mount in a dedicated `useModelLoader` hook. Use React Context to share loading state and model readiness across components.

**Rationale:**

- **Avoid redundant loads**: Without caching, each component mounting would re-download 6.7MB
- **Fast page transitions**: Once loaded, models stay in memory for entire session
- **Loading state UI**: Context allows showing global "Models loading..." indicator

**Implementation:**

```typescript
// src/lib/face/useModelLoader.ts
- Loads models from /public/models/ on mount
- Returns { modelsLoaded: boolean, error: string | null }
- Uses singleton pattern to prevent duplicate loads

// src/lib/face/ModelProvider.tsx (Client Component)
- React Context wrapper
- Calls useModelLoader on mount
- Provides loading state to children
```

**Alternatives Considered:**

- ❌ **Load on-demand per page**: Causes 500ms delay every time user navigates to registration/scan pages
- ❌ **Server-side model hosting**: Models must be browser-accessible, can't be server-only

---

### Decision 4: Component Architecture (Server vs Client)

**Choice:**

- **Pages**: Server Components (default)
- **Webcam UI**: Client Components (required for camera access)
- **Forms/Dashboards**: Server Components (data fetching)

**Component Breakdown:**

```
src/components/organisms/
  WebcamCapture.tsx ('use client') - Camera access, face detection overlay
  RegistrationForm.tsx ('use client') - Multi-capture workflow
  ScanInterface.tsx ('use client') - Live scanning state machine

src/app/register/
  page.tsx (Server Component) - Renders RegistrationForm

src/app/scan/
  page.tsx (Server Component) - Renders ScanInterface
```

**Rationale:**

- Minimizes client JS bundle by keeping non-interactive parts server-rendered
- face-api.js (~2MB) + TensorFlow.js (~500KB) only loaded on pages that need camera
- Follows Next.js 16 best practices (Server Component default)

---

### Decision 5: Descriptor Averaging for Registration

**Choice:** Capture 3-5 images during registration, extract descriptor from each, compute element-wise average of descriptors, store the averaged descriptor.

**Rationale:**

- **Robustness**: Single descriptor can be affected by temporary lighting, angle, or expression
- **Accuracy improvement**: Averaged descriptor represents "typical" face state, reduces false negatives
- **Acceptable overhead**: 5 captures × 150ms = 750ms total capture time

**Algorithm:**

```typescript
function averageDescriptors(descriptors: Float32Array[]): Float32Array {
  const avg = new Float32Array(128);
  for (let i = 0; i < 128; i++) {
    let sum = 0;
    for (const desc of descriptors) {
      sum += desc[i];
    }
    avg[i] = sum / descriptors.length;
  }
  return avg;
}
```

**Alternatives Considered:**

- ❌ **Single capture**: Faster but less reliable matching (~70% accuracy vs 85% with averaging)
- ❌ **Store all descriptors**: Database bloat (5× storage), slower matching (5× comparisons)

---

### Decision 6: State Machine for Scan Flow

**Choice:** Implement explicit state machine using React state:

```
IDLE
  ↓ (Start scan)
CAMERA_LOADING (requesting permissions)
  ↓ (Camera ready)
SCANNING (detecting face in video stream)
  ↓ (Face detected & valid)
MATCHING (comparing descriptor to database)
  ↓ (Result received)
SUCCESS | ALREADY_TAKEN | NOT_REGISTERED | ERROR
  ↓ (5-second cooldown)
IDLE
```

**Rationale:**

- **Clear error boundaries**: Each state has specific error handling
- **UI feedback**: State drives loading indicators, messages, and enabled/disabled buttons
- **Timeout enforcement**: SCANNING state has 5-second timeout to prevent user waiting indefinitely

**Implementation:**

```typescript
type ScanState =
  | 'IDLE'
  | 'CAMERA_LOADING'
  | 'SCANNING'
  | 'MATCHING'
  | 'SUCCESS'
  | 'ALREADY_TAKEN'
  | 'NOT_REGISTERED'
  | 'ERROR';

const [scanState, setScanState] = useState<ScanState>('IDLE');
```

**Alternatives Considered:**

- ❌ **Boolean flags** (isLoading, isScanning, isSuccess): Error-prone, hard to reason about state combinations
- ❌ **XState library**: Over-engineered for simple linear flow

---

### Decision 7: API Design for Matching

**Choice:** Client sends descriptor only (not raw image) to API route. Server performs matching and returns result.

**Endpoints:**

**POST /api/register**

```typescript
Request: {
  employeeId: string
  name: string
  department?: string
  email?: string
  faceDescriptors: number[][] // 3-5 descriptors (128 floats each)
}
Response: {
  success: boolean
  userId?: string
  error?: string
}
```

**POST /api/lunch**

```typescript
Request: {
  faceDescriptor: number[] // 128 floats
}
Response: {
  success: boolean
  message: string
  employeeName?: string
  scannedTime?: string
}
```

**Rationale:**

- **Privacy**: No raw images transmitted
- **Security**: Matching logic on server prevents client-side tampering
- **Validation**: Server validates descriptor length (must be 128)

**Alternatives Considered:**

- ❌ **Client-side matching**: Requires downloading all 500 descriptors to client (security risk, slow)
- ❌ **Hybrid (match client, verify server)**: Redundant, adds complexity

---

### Decision 8: Error Handling Strategy

**Choice:** Tiered error handling:

1. **Camera permission denied**: Show permission request modal
2. **No face detected (5-second timeout)**: Show "Please face the camera" message
3. **Multiple faces detected**: Show "Only one person at a time" message
4. **No match found**: Show "Employee not registered" message
5. **Already scanned today**: Show "Already recorded" + employee name
6. **Network error**: Show retry button with exponential backoff

**Rationale:**

- **User-friendly**: Specific messages guide user to resolution
- **Fail-safe**: Network errors don't crash app, allow retry
- **Privacy**: "No match" doesn't reveal registered employee list

**Implementation:**

- Try/catch blocks in all async face operations
- Error boundary component wraps webcam interface
- Toast notifications for API errors (use existing design system)

## Risks / Trade-offs

### Risk 1: Browser Compatibility

**Risk:** face-api.js requires WebGL. Older browsers (IE11, legacy Firefox) may not support it.

**Mitigation:**

- Feature detection: Check for `navigator.mediaDevices` and WebGL support on page load
- Show fallback UI: "Your browser doesn't support face recognition. Please use Chrome/Edge/Firefox."
- Target modern browsers: Chrome 90+, Edge 90+, Firefox 88+ (all support WebGL 2.0)

---

### Risk 2: Model Download Failure

**Risk:** 6.7MB models may fail to load on slow networks or corporate firewalls.

**Mitigation:**

- Retry logic: 3 attempts with exponential backoff (1s, 2s, 4s delays)
- CDN hosting: Consider hosting models on Vercel CDN for faster global delivery
- Loading indicator: Show progress bar during model download
- Offline fallback: Cache models in service worker for repeat visits (future enhancement)

---

### Risk 3: Lighting Conditions

**Risk:** Poor office lighting (backlighting, shadows) can reduce detection accuracy from 85% to 60%.

**Mitigation:**

- UI guidance: Show "Move to better lighting" message if confidence score <0.3
- Threshold tuning: Make 0.6 threshold configurable via environment variable for A/B testing
- Multi-capture registration: Averaged descriptors more robust to lighting variations

---

### Risk 4: Performance on Low-End Devices

**Risk:** Older laptops with no GPU may take 300-500ms for face detection, exceeding <300ms target.

**Mitigation:**

- Debounce scans: After successful scan, 5-second cooldown prevents repeated slow operations
- Model downgrade option: Allow switching to TinyFaceDetector's "fast" variant (even smaller, less accurate)
- CPU fallback: TensorFlow.js automatically falls back to WASM if WebGL unavailable

---

### Risk 5: Descriptor Drift Over Time

**Risk:** Employee appearance changes (facial hair, glasses, aging) may cause descriptors to no longer match after 6-12 months.

**Mitigation:**

- Re-registration workflow: Allow admins to re-capture faces without deleting history
- Threshold adjustment: If false negatives increase, consider raising threshold from 0.6 to 0.65
- Monitoring: Track "not registered" frequency per employee in admin dashboard (future enhancement)

---

### Trade-off 1: Accuracy vs Speed

**Chosen:** TinyFaceDetector (fast, 80-85% accuracy)
**Sacrificed:** SSD MobileNet (slow, 95% accuracy)

**Impact:** ~15-20% of scans may require second attempt. Acceptable for office use case where users can retry immediately.

---

### Trade-off 2: Privacy vs Debugging

**Chosen:** No raw image storage or logging
**Sacrificed:** Can't visually debug false negatives (no "show me what face was detected" option)

**Impact:** Harder to troubleshoot edge cases. Mitigate with detailed error codes and confidence scores in logs.

---

### Trade-off 3: Bundle Size vs Features

**Chosen:** Include full face-api.js + TensorFlow.js (~2.5MB total JS)
**Sacrificed:** Smaller bundle with server-side detection

**Impact:** Longer initial page load (~500ms on 10Mbps). Acceptable for internal office app where users access repeatedly (cached after first load).
