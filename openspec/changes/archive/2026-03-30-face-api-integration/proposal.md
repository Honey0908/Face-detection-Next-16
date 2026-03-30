## Why

The lunch tracking system requires facial recognition to automatically identify employees without manual input. Currently, the database schema supports face descriptors, but the actual face detection, recognition, and matching capabilities are missing. Integrating face-api.js will enable real-time face detection from webcam feeds, descriptor extraction, and accurate face matching for both employee registration and daily lunch scanning.

## What Changes

- Add face-api.js library and TensorFlow.js backend for browser-based face detection
- Implement face detection and 128-dimensional descriptor extraction from webcam frames
- Create face matching service using Euclidean distance algorithm with 0.6 threshold
- Build webcam capture interface using browser MediaDevices API
- Create multi-capture registration workflow (3-5 captures per employee)
- Build real-time lunch scanning flow with duplicate detection
- Add model file loading and initialization utilities
- Implement client-side state management for scan flow (IDLE → SCANNING → MATCHING → RESULT)
- Create UI feedback components for face detection status and scan results

## Capabilities

### New Capabilities

- `face-model-loading`: Loading and caching face-api.js neural network models (TinyFaceDetector, FaceLandmark68Net, FaceRecognitionNet) from public directory with initialization management
- `face-detection`: Real-time face detection in video streams with single-face validation and confidence scoring
- `descriptor-extraction`: Extract 128-dimensional facial descriptors from detected faces with validation
- `face-matching`: Euclidean distance-based face matching against registered descriptors with configurable threshold (0.6) and best-match selection
- `webcam-capture`: Browser webcam access with permissions handling, video stream management, and frame capture utilities
- `registration-workflow`: Multi-capture employee registration flow with admin authentication, descriptor averaging, and database persistence
- `scan-workflow`: Real-time lunch scanning with face detection, matching, duplicate prevention, and state machine management

### Modified Capabilities

_No existing capabilities require requirement changes. The user-schema and lunch-record-schema already support face descriptor storage._

## Impact

### Code Changes

- **New Services**: `src/lib/face/` directory with model loading, detection, extraction, and matching utilities
- **New Components**: `src/components/organisms/` webcam interface, registration form, and scan interface components
- **New Client Components**: All face detection logic requires `'use client'` directive due to webcam and TensorFlow.js browser dependencies
- **API Routes**: New endpoints at `src/app/api/register/` and `src/app/api/lunch/` for descriptor matching and record creation

### Dependencies

- `face-api.js` (~2MB): Face detection and recognition library
- `@tensorflow/tfjs-core`: TensorFlow.js runtime dependency
- Model files (~6MB total): Host in `/public/models/` directory for browser loading

### Performance Considerations

- Model loading: ~500ms on first load (cache subsequent loads)
- Face detection: ~100ms per frame with TinyFaceDetector
- Descriptor extraction: ~50ms per detection
- Matching against 500 users: <50ms in-memory comparison
- Target total scan time: <300ms

### Security & Privacy

- Face descriptors only (no raw images stored or transmitted)
- Client-side processing means sensitive biometric data never leaves browser until converted to descriptors
- Admin-only access to registration endpoints
- HTTPS required for webcam access in production
