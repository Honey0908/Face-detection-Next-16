/**
 * WebcamCapture Component
 *
 * Client component for webcam access and face capture.
 * Includes real-time face detection overlay and camera status indicator.
 */

'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  requestWebcam,
  startStream,
  cleanupStream,
  isVideoReady,
  captureFrame,
} from '@/lib/face/webcam';
import {
  detectSingleFace,
  DetectionState,
  DetectionResult,
  getDetectionMessage,
  getOptimalDetectionInterval,
} from '@/lib/face/detection';
import { useModelLoader } from '@/lib/face/ModelProvider';

// Camera status enum
export enum CameraStatus {
  INACTIVE = 'inactive',
  INITIALIZING = 'initializing',
  ACTIVE = 'active',
  ERROR = 'error',
}

// Component props
export interface WebcamCaptureProps {
  onCapture?: (canvas: HTMLCanvasElement, detection: DetectionResult) => void;
  onError?: (error: string) => void;
  autoDetect?: boolean;
  showOverlay?: boolean;
  mirrorVideo?: boolean;
  className?: string;
}

/**
 * WebcamCapture Component
 *
 * Displays live webcam feed with optional face detection overlay.
 */
export function WebcamCapture({
  onCapture,
  onError,
  autoDetect = true,
  showOverlay = true,
  mirrorVideo = true,
  className = '',
}: WebcamCaptureProps) {
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // State
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>(
    CameraStatus.INACTIVE,
  );
  const [detectionState, setDetectionState] = useState<DetectionState>(
    DetectionState.IDLE,
  );
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [lastDetection, setLastDetection] = useState<DetectionResult | null>(
    null,
  );
  const [guidanceMessage, setGuidanceMessage] = useState<string>('');
  const [announceMessage, setAnnounceMessage] = useState<string>('');

  // Model loading state
  const {
    modelsLoaded,
    loading: modelsLoading,
    error: modelsError,
  } = useModelLoader();

  // Update guidance message based on detection state
  useEffect(() => {
    let message = '';
    switch (detectionState) {
      case DetectionState.NO_FACE:
        message = 'Please position your face in the camera frame';
        break;
      case DetectionState.MULTIPLE_FACES:
        message =
          'Multiple faces detected. Please ensure only one person is visible';
        break;
      case DetectionState.FACE_FOUND:
        message = 'Face detected! Ready to capture';
        break;
      case DetectionState.DETECTING:
        message = 'Scanning for face...';
        break;
      default:
        message = '';
    }
    setGuidanceMessage(message);
  }, [detectionState]);

  /**
   * Initialize webcam
   */
  const initializeWebcam = useCallback(async () => {
    if (!videoRef.current) return;

    setCameraStatus(CameraStatus.INITIALIZING);
    setErrorMessage('');
    setAnnounceMessage('Starting camera...');

    try {
      const result = await requestWebcam();

      if (!result.success || !result.stream) {
        throw new Error(result.error || 'Failed to access webcam');
      }

      streamRef.current = result.stream;
      await startStream(videoRef.current, result.stream);

      setCameraStatus(CameraStatus.ACTIVE);
      setAnnounceMessage('Camera active. Ready for face detection');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown camera error';
      setErrorMessage(message);
      setCameraStatus(CameraStatus.ERROR);
      setAnnounceMessage(`Camera error: ${message}`);
      onError?.(message);
    }
  }, [onError]);

  /**
   * Draw face detection overlay on canvas
   */
  const drawDetectionOverlay = useCallback((detection: DetectionResult) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    // Match canvas size to video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear previous drawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw bounding box if face found
    if (
      detection.state === DetectionState.FACE_FOUND &&
      detection.boundingBox
    ) {
      const box = detection.boundingBox;

      // Green for single face, red for multiple
      ctx.strokeStyle =
        detection.state === DetectionState.FACE_FOUND ? '#22c55e' : '#ef4444';
      ctx.lineWidth = 3;

      // Draw rectangle
      ctx.strokeRect(box.x, box.y, box.width, box.height);

      // Draw confidence score
      if (detection.confidence !== undefined) {
        const confidence = (detection.confidence * 100).toFixed(1);
        ctx.fillStyle = '#22c55e';
        ctx.font = '16px sans-serif';
        ctx.fillText(`${confidence}%`, box.x, box.y - 10);
      }
    }

    // Draw multiple faces warning
    if (detection.state === DetectionState.MULTIPLE_FACES) {
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText('Multiple faces detected', 10, 30);
    }
  }, []);

  /**
   * Perform face detection on current video frame
   */
  const performDetection = useCallback(async () => {
    if (!videoRef.current || !isVideoReady(videoRef.current) || !modelsLoaded) {
      return;
    }

    setDetectionState(DetectionState.DETECTING);

    try {
      const result = await detectSingleFace(videoRef.current, {
        inputSize: 224,
        scoreThreshold: 0.5,
        timeout: 5000,
      });

      setLastDetection(result);
      setDetectionState(result.state);

      // Draw overlay if enabled
      if (showOverlay && canvasRef.current) {
        drawDetectionOverlay(result);
      }
    } catch (error) {
      console.error('Detection error:', error);
      setDetectionState(DetectionState.ERROR);
    }
  }, [modelsLoaded, showOverlay, drawDetectionOverlay]);

  /**
   * Capture current frame
   */
  const capture = useCallback(() => {
    if (!videoRef.current || !isVideoReady(videoRef.current)) {
      onError?.('Video not ready for capture');
      return;
    }

    try {
      const canvas = captureFrame(videoRef.current);

      if (onCapture && lastDetection) {
        setAnnounceMessage('Face captured successfully');
        onCapture(canvas, lastDetection);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Capture failed';
      onError?.(message);
    }
  }, [lastDetection, onCapture, onError]);

  /**
   * Start continuous detection
   */
  const startDetection = useCallback(() => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }

    const interval = getOptimalDetectionInterval();
    detectionIntervalRef.current = setInterval(performDetection, interval);
  }, [performDetection]);

  /**
   * Stop continuous detection
   */
  const stopDetection = useCallback(() => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    setDetectionState(DetectionState.IDLE);
  }, []);

  // Initialize webcam on mount
  useEffect(() => {
    initializeWebcam();

    // Capture refs for cleanup
    const video = videoRef.current;
    const stream = streamRef.current;

    return () => {
      stopDetection();
      if (video && stream) {
        cleanupStream(video, stream);
      }
    };
  }, [initializeWebcam, stopDetection]);

  // Start/stop detection based on autoDetect and models loaded
  useEffect(() => {
    if (autoDetect && cameraStatus === CameraStatus.ACTIVE && modelsLoaded) {
      startDetection();
    } else {
      stopDetection();
    }

    return () => {
      stopDetection();
    };
  }, [autoDetect, cameraStatus, modelsLoaded, startDetection, stopDetection]);

  // Get status color
  const getStatusColor = () => {
    switch (cameraStatus) {
      case CameraStatus.ACTIVE:
        return 'bg-green-500';
      case CameraStatus.INITIALIZING:
        return 'bg-yellow-500';
      case CameraStatus.ERROR:
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Get status text
  const getStatusText = () => {
    if (modelsLoading) return 'Loading models...';
    if (modelsError) return `Model error: ${modelsError}`;

    switch (cameraStatus) {
      case CameraStatus.ACTIVE:
        return autoDetect
          ? getDetectionMessage(detectionState)
          : 'Camera active';
      case CameraStatus.INITIALIZING:
        return 'Initializing camera...';
      case CameraStatus.ERROR:
        return errorMessage || 'Camera error';
      default:
        return 'Camera inactive';
    }
  };

  // Keyboard navigation handler
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, action: () => void) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        action();
      }
    },
    [],
  );

  return (
    <div className={`relative ${className}`}>
      {/* ARIA Live Region for Screen Readers */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announceMessage}
      </div>

      {/* Video Container */}
      <div className="relative rounded-lg overflow-hidden bg-gray-900">
        {/* Video Element */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-auto ${mirrorVideo ? 'scale-x-[-1]' : ''}`}
          style={{ maxHeight: '720px' }}
        />

        {/* Detection Overlay Canvas */}
        {showOverlay && (
          <canvas
            ref={canvasRef}
            className={`absolute top-0 left-0 w-full h-full pointer-events-none ${
              mirrorVideo ? 'scale-x-[-1]' : ''
            }`}
          />
        )}

        {/* Loading State */}
        {(cameraStatus === CameraStatus.INITIALIZING || modelsLoading) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p>{getStatusText()}</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {cameraStatus === CameraStatus.ERROR && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-900 bg-opacity-90">
            <div className="text-white text-center px-4">
              <p className="text-lg font-semibold mb-2">Camera Error</p>
              <p className="text-sm">{errorMessage}</p>
              <button
                onClick={initializeWebcam}
                onKeyDown={(e) => handleKeyDown(e, initializeWebcam)}
                aria-label="Retry camera initialization"
                className="mt-4 px-4 py-2 bg-white text-red-900 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-red-900"
              >
                Retry
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Status Indicator */}
      <div className="mt-4 flex items-center gap-3">
        <div
          className={`w-3 h-3 rounded-full ${getStatusColor()}`}
          role="img"
          aria-label={`Camera status: ${getStatusText()}`}
        ></div>
        <span className="text-sm text-gray-700">{getStatusText()}</span>
      </div>

      {/* Guidance Message */}
      {guidanceMessage && (
        <div
          className="mt-2 text-sm text-gray-600 bg-blue-50 border-l-4 border-blue-500 p-3 rounded"
          role="alert"
          aria-live="polite"
        >
          {guidanceMessage}
        </div>
      )}

      {/* Capture Button (if onCapture provided) */}
      {onCapture && cameraStatus === CameraStatus.ACTIVE && modelsLoaded && (
        <button
          onClick={capture}
          onKeyDown={(e) => handleKeyDown(e, capture)}
          disabled={detectionState !== DetectionState.FACE_FOUND}
          aria-label={
            detectionState === DetectionState.FACE_FOUND
              ? 'Capture face image'
              : 'Waiting for face detection'
          }
          aria-disabled={detectionState !== DetectionState.FACE_FOUND}
          className="mt-4 w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {detectionState === DetectionState.FACE_FOUND
            ? 'Capture Face'
            : 'Waiting for face...'}
        </button>
      )}
    </div>
  );
}

export default WebcamCapture;
