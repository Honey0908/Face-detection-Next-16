## 1. Project Setup & Dependencies

- [x] 1.1 Install face-api.js and @tensorflow/tfjs-core packages via pnpm
- [x] 1.2 Download and place model files (tiny_face_detector, face_landmark_68, face_recognition) in /public/models/ directory
- [x] 1.3 Create src/lib/face/ directory structure for face utilities
- [x] 1.4 Add environment variable FACE_MATCH_THRESHOLD (default: 0.6) to .env.local
- [x] 1.5 Update tsconfig.json to handle face-api.js type definitions if needed

## 2. Face Model Loading (Client-Side)

- [x] 2.1 Create src/lib/face/modelLoader.ts with loadFaceModels() function that loads all 3 models from /public/models/
- [x] 2.2 Implement retry logic with exponential backoff (3 attempts: 1s, 2s, 4s delays) for model loading failures
- [x] 2.3 Add WebGL detection utility to check browser compatibility before loading models
- [x] 2.4 Create src/lib/face/ModelProvider.tsx (Client Component) with React Context for model loading state
- [x] 2.5 Implement useModelLoader hook that returns { modelsLoaded, loading, error } state
- [x] 2.6 Add singleton pattern to modelLoader to prevent duplicate initialization attempts

## 3. Face Detection Utilities (Client-Side)

- [x] 3.1 Create src/lib/face/detection.ts with detectSingleFace() function using TinyFaceDetector
- [x] 3.2 Implement single-face validation that returns error for multiple faces or no face detected
- [x] 3.3 Add confidence scoring and bounding box data extraction from detection results
- [x] 3.4 Implement 5-second timeout mechanism for face detection attempts
- [x] 3.5 Add frame rate optimization logic that throttles detection based on device performance
- [x] 3.6 Create detection state enum (idle, detecting, face_found, no_face, multiple_faces, timeout, error)

## 4. Descriptor Extraction Utilities (Client-Side)

- [x] 4.1 Create src/lib/face/extraction.ts with extractDescriptor() function that extracts 128-d Float32Array
- [x] 4.2 Implement descriptor validation (length check, NaN/Infinity detection, L2 norm verification)
- [x] 4.3 Add averageDescriptors() function that computes element-wise mean of 3-5 descriptors
- [x] 4.4 Implement descriptor serialization utilities (Float32Array ↔ number array conversion)
- [x] 4.5 Add error handling for extraction failures (model not loaded, invalid detection, TensorFlow errors)

## 5. Face Matching Utilities (Server-Side)

- [x] 5.1 Create src/lib/face/matching.ts with euclideanDistance() function for 128-d descriptor comparison
- [x] 5.2 Implement findBestMatch() function that compares against all registered users and returns closest match
- [x] 5.3 Add threshold-based matching logic (default 0.6, configurable via env variable)
- [x] 5.4 Implement confidence level calculation (high <0.3, medium 0.3-0.5, low 0.5-0.6)
- [x] 5.5 Create in-memory descriptor cache with cache invalidation on new user registration
- [x] 5.6 Add descriptor validation before matching (128 length, finite values check)

## 6. Webcam Utilities (Client-Side)

- [x] 6.1 Create src/lib/face/webcam.ts with requestWebcam() function using navigator.mediaDevices.getUserMedia()
- [x] 6.2 Implement video stream constraints (1280x720 ideal, facingMode: 'user')
- [x] 6.3 Add webcam permission handling with specific error messages (NotAllowedError, NotFoundError, NotReadableError)
- [x] 6.4 Create stream lifecycle functions (startStream, stopStream, cleanupStream)
- [x] 6.5 Implement frame capture from video using canvas element
- [x] 6.6 Add HTTPS requirement check and detection for production vs localhost

## 7. WebcamCapture Component (Client Component)

- [x] 7.1 Create src/components/organisms/WebcamCapture/WebcamCapture.tsx as Client Component
- [x] 7.2 Implement video element with autoplay, playsInline, and horizontal mirroring
- [x] 7.3 Add face detection overlay with bounding box rendering (green for valid, red for multiple)
- [x] 7.4 Implement camera status indicator (active, inactive, error states)
- [x] 7.5 Add loading state UI during camera initialization
- [x] 7.6 Implement cleanup on component unmount to stop camera stream

## 8. Registration Page UI (Client-Side)

- [x] 8.1 Create src/app/register/page.tsx as Server Component that renders RegistrationForm
- [x] 8.2 Create src/components/organisms/RegistrationForm/RegistrationForm.tsx (Client Component)
- [x] 8.3 Implement employee information form with validation (employeeId, name, department, email fields)
- [x] 8.4 Add multi-capture interface with capture counter (1/3, 2/3, 3/3 or up to 5/5)
- [x] 8.5 Implement capture button with single face validation before allowing capture
- [x] 8.6 Add thumbnail display for captured images with delete/retake functionality
- [x] 8.7 Create state machine for registration flow (FORM_INPUT → CAMERA_READY → CAPTURING → PROCESSING → SUBMITTING)
- [x] 8.8 Add employee consent checkbox ("Employee has provided consent for face data collection")
- [x] 8.9 Implement visual feedback (progress indicator, success animation, error messages)

## 9. Registration API Route (Server-Side)

- [x] 9.1 Create src/app/api/register/route.ts with POST handler
- [x] 9.2 Implement request validation using zod schema (employeeId, name, faceDescriptors array)
- [x] 9.3 Add employee ID uniqueness check before processing descriptors
- [x] 9.4 Implement descriptor averaging logic (compute mean of 3-5 descriptors)
- [x] 9.5 Create User record in database with averaged descriptor using Prisma
- [x] 9.6 Invalidate descriptor cache after successful registration
- [x] 9.7 Return structured response { success, userId?, error? }
- [x] 9.8 Add error handling for database errors, validation errors, and duplicate IDs

## 10. Scan Page UI (Client-Side)

- [x] 10.1 Create src/app/scan/page.tsx as Server Component that renders ScanInterface
- [x] 10.2 Create src/components/organisms/ScanInterface/ScanInterface.tsx (Client Component)
- [x] 10.3 Implement scan state machine with 7 states (IDLE, CAMERA_LOADING, SCANNING, MATCHING, SUCCESS, ALREADY_TAKEN, NOT_REGISTERED, ERROR)
- [x] 10.4 Add Start button that transitions from IDLE to CAMERA_LOADING
- [x] 10.5 Implement continuous face detection during SCANNING with 5-second timeout countdown
- [x] 10.6 Add automatic descriptor extraction and API submission when valid face detected
- [x] 10.7 Implement result display states with appropriate messages and icons (checkmark for success, X for errors)
- [x] 10.8 Add 5-second cooldown after SUCCESS or ALREADY_TAKEN before returning to IDLE
- [x] 10.9 Create visual feedback components (status messages, loading spinners, countdown timers)

## 11. Lunch Scanning API Route (Server-Side)

- [x] 11.1 Create src/app/api/lunch/route.ts with POST handler
- [x] 11.2 Implement request validation for faceDescriptor (128-length number array)
- [x] 11.3 Call findBestMatch() to compare descriptor against all registered users
- [x] 11.4 If no match found (distance >= 0.6), return { success: false, message: "Employee not registered" }
- [x] 11.5 If match found, check for existing lunch record with same userId and today's date (YYYY-MM-DD)
- [x] 11.6 If duplicate found, return { success: false, message: "Already recorded today", employeeName }
- [x] 11.7 If first scan today, create LunchRecord with userId, date, timestamp, confidence
- [x] 11.8 Return { success: true, message, employeeName, scannedTime }
- [x] 11.9 Add error handling for database errors, invalid descriptors, and matching failures

## 12. Error Handling & Edge Cases

- [x] 12.1 Add global error boundary around webcam components to catch TensorFlow.js errors
- [x] 12.2 Implement user-friendly error messages for all error scenarios (camera denied, no camera, camera in use, etc.)
- [x] 12.3 Add fallback UI for browsers without WebGL support
- [x] 12.4 Implement retry mechanisms for network errors in API calls
- [x] 12.5 Add logging for face matching failures and confidence scores for debugging
- [x] 12.6 Create error toast notifications using existing design system components

## 13. Performance Optimization

- [x] 13.1 Verify model files are properly cached by browser (check cache headers)
- [x] 13.2 Implement descriptor cache warmup on server startup (load all users into memory)
- [x] 13.3 Add performance monitoring to track scan time (target: <300ms total)
- [x] 13.4 Optimize descriptor comparison loop to minimize memory allocations
- [x] 13.5 Test face detection frame rate throttling on low-end device (CPU fallback)

## 14. Accessibility & UX Polish

- [x] 14.1 Add keyboard navigation support (Start button activates on Enter)
- [x] 14.2 Implement ARIA live regions for state change announcements to screen readers
- [x] 14.3 Ensure high contrast mode compatibility for bounding boxes and text
- [x] 14.4 Add helpful guidance messages ("Please face the camera", "Move to better lighting") based on detection state
- [x] 14.5 Test and optimize video mirroring for natural user experience

## 15. Testing & Validation

- [x] 15.1 Test registration workflow with 3, 4, and 5 captures to verify descriptor averaging
- [x] 15.2 Test scan workflow with registered user (first scan, duplicate scan, not registered scenarios)
- [x] 15.3 Verify duplicate prevention works correctly (same employee can't scan twice on same day)
- [x] 15.4 Test face matching accuracy with threshold 0.6 (verify true positives and no false positives)
- [x] 15.5 Test camera permissions (grant, deny, browser without camera)
- [x] 15.6 Validate HTTPS requirement in production environment (webcam access blocked on HTTP)
- [x] 15.7 Test error scenarios (network failures, camera disconnection, model loading failures)
- [x] 15.8 Performance test: Verify scan completes in <300ms with 500 registered users

## 16. Documentation & Deployment Prep

- [x] 16.1 Document model file download and setup instructions in README
- [x] 16.2 Add environment variable documentation (FACE_MATCH_THRESHOLD, database URL)
- [x] 16.3 Create admin guide for registration workflow
- [x] 16.4 Document browser compatibility requirements (Chrome 90+, Edge 90+, Firefox 88+)
- [x] 16.5 Add deployment checklist (HTTPS requirement, model files in CDN, descriptor cache setup)
- [x] 16.6 Create troubleshooting guide for common issues (camera access, poor lighting, false negatives)
