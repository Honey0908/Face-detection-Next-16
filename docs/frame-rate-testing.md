# Frame Rate Throttling Testing Guide

## Overview

Face detection includes adaptive frame rate throttling to ensure smooth operation on low-end devices. This document provides testing instructions for validating throttling behavior.

## Throttling Logic

The system adjusts detection intervals based on device capabilities:

| Device Tier | Memory | CPU Cores | Detection Interval | FPS |
| ----------- | ------ | --------- | ------------------ | --- |
| High-end    | ≥8 GB  | ≥8 cores  | 100ms              | 10  |
| Mid-range   | ≥4 GB  | 4-7 cores | 150ms              | 6.7 |
| Low-end     | <4 GB  | <4 cores  | 200ms              | 5   |

Implementation: `src/lib/face/detection.ts → getOptimalDetectionInterval()`

## Testing Scenarios

### 1. High-End Device Testing

**Target**: Modern laptop/desktop with ≥8GB RAM, ≥8 CPU cores

**Steps**:

1. Open DevTools → Console
2. Run: `navigator.deviceMemory` and `navigator.hardwareConcurrency`
3. Start face detection
4. Monitor console for "Detection interval: XXXms"
5. Verify smooth camera feed (30 FPS video, 10 FPS detection)

**Expected**:

- Detection interval: 100ms (10 FPS)
- No frame drops or UI freezing
- CPU usage: <30%

### 2. Mid-Range Device Testing

**Target**: Laptop with 4-6GB RAM, 4 CPU cores

**Steps**:

1. Check device specs in DevTools
2. Start detection
3. Observe performance

**Expected**:

- Detection interval: 150ms (6.7 FPS)
- Smooth operation
- CPU usage: 30-50%

### 3. Low-End Device Testing

**Target**: Older laptop, budget device, or throttled browser

**Methods**:

#### A. CPU Throttling (Chrome DevTools)

1. Open DevTools → Performance tab
2. Click gear icon → CPU: **6x slowdown**
3. Start face detection
4. Monitor frame rate and responsiveness

**Expected**:

- Detection interval: 200ms (5 FPS)
- Video feed remains smooth (30 FPS)
- Detection overlay updates every 200ms
- No browser lag or freezing

#### B. Hardware Concurrency Override

```javascript
// In browser console before loading page
Object.defineProperty(navigator, 'hardwareConcurrency', {
  get: () => 2,
});
```

#### C. Memory Simulation

```javascript
// In browser console
Object.defineProperty(navigator, 'deviceMemory', {
  get: () => 2, // Simulate 2GB device
});
```

### 4. Fallback to TinyFaceDetector

Test CPU-optimized model on low-end devices:

**Steps**:

1. Disable GPU acceleration in browser:
   - Chrome: `chrome://flags/#disable-accelerated-video-decode`
2. Restart browser
3. Start face detection
4. Verify TinyFaceDetector is used (check console logs)

**Expected**:

- Model loads successfully
- Detection accuracy sufficient (not full SSD)
- Faster inference on CPU-only devices

## Performance Validation

### Key Metrics

Monitor these in DevTools Performance tab:

| Metric        | Target | Critical |
| ------------- | ------ | -------- |
| Video FPS     | ≥25    | ≥15      |
| Detection FPS | 5-10   | ≥3       |
| CPU Usage     | <50%   | <80%     |
| Memory Usage  | <200MB | <500MB   |
| Task Duration | <50ms  | <100ms   |

### Memory Leak Testing

1. Start detection
2. Let run for 5 minutes
3. Monitor memory usage in DevTools → Memory → Take Heap Snapshot
4. Stop detection
5. Force GC (garbage collection)
6. Verify memory returns to baseline

**Expected**: Memory growth <10MB over 5 minutes

## Browser Compatibility Testing

Test throttling across browsers:

| Browser     | API Support                       | Test Result |
| ----------- | --------------------------------- | ----------- |
| Chrome 90+  | deviceMemory, hardwareConcurrency | ✅          |
| Firefox 90+ | hardwareConcurrency only          | ✅          |
| Safari 14+  | hardwareConcurrency only          | ✅          |
| Edge 90+    | deviceMemory, hardwareConcurrency | ✅          |

### Fallback Behavior

If APIs unavailable, system defaults to **200ms (5 FPS)** - safest option.

## Common Issues & Solutions

### Issue 1: Choppy Video Feed

**Symptom**: Video stutters, frame drops  
**Cause**: Detection interval too fast for device  
**Solution**: Increase base interval in code or add adaptive adjustment

### Issue 2: Slow Detection Response

**Symptom**: Bounding box updates lag behind movement  
**Cause**: Detection interval too slow  
**Solution**: Verify device tier detection is working correctly

### Issue 3: Browser Freezing

**Symptom**: UI becomes unresponsive during detection  
**Cause**: Synchronous blocking operations  
**Solution**: Verify all detection is async, check for blocking loops

## Automated Testing

For CI/CD integration:

```javascript
// Test device detection logic
describe('getOptimalDetectionInterval', () => {
  it('returns 100ms for high-end devices', () => {
    Object.defineProperty(navigator, 'deviceMemory', { value: 16 });
    Object.defineProperty(navigator, 'hardwareConcurrency', { value: 16 });

    expect(getOptimalDetectionInterval()).toBe(100);
  });

  it('returns 200ms for low-end devices', () => {
    Object.defineProperty(navigator, 'deviceMemory', { value: 2 });
    Object.defineProperty(navigator, 'hardwareConcurrency', { value: 2 });

    expect(getOptimalDetectionInterval()).toBe(200);
  });

  it('defaults to 200ms when APIs unavailable', () => {
    Object.defineProperty(navigator, 'deviceMemory', { value: undefined });

    expect(getOptimalDetectionInterval()).toBe(200);
  });
});
```

## Manual Validation Checklist

Before marking task complete:

- [ ] Test on 3 different device tiers (or simulated)
- [ ] Verify interval adjusts correctly based on device specs
- [ ] Confirm video feed remains smooth (≥25 FPS) during detection
- [ ] Check CPU usage stays under 50% on mid-range devices
- [ ] Validate no memory leaks over 5-minute session
- [ ] Test graceful degradation when APIs unavailable
- [ ] Verify TinyFaceDetector fallback works on low-end devices
- [ ] Document actual performance metrics in testing log

## Testing Log Template

```
Date: YYYY-MM-DD
Tester: [Name]
Device: [Make/Model]
Specs: RAM: XGB, CPU: X cores, GPU: [Yes/No]
Browser: [Chrome/Firefox/Safari] v[XX]

Detection Interval: XXXms
Video FPS: XX
Detection FPS: X
CPU Usage: XX%
Memory Usage: XXXMB

Issues: [None / Description]
Pass: [Yes / No]
```

## Conclusion

Frame rate throttling ensures accessibility across device tiers. Testing validates:

1. Adaptive intervals based on hardware
2. Smooth operation on low-end devices
3. No performance degradation over time
4. Graceful fallback when APIs unavailable

For production deployment, recommend testing on representative sample of employee devices.
