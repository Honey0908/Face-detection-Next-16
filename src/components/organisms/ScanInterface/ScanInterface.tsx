/**
 * Scan Interface Component
 *
 * Client component for lunch attendance scanning with face recognition.
 * Implements 7-state machine for scan workflow with automatic detection.
 */

'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { WebcamCapture } from '@/components/organisms/WebcamCapture';
import { extractDescriptor, serializeDescriptor } from '@/lib/face/extraction';
import { DetectionResult, DetectionState } from '@/lib/face/detection';
import { ModelProvider } from '@/lib/face/ModelProvider';
import { apiPost } from '@/lib/api';
import { useToast } from '@/components';

// Scan state enum (7 states)
export enum ScanState {
  IDLE = 'idle',
  CAMERA_LOADING = 'camera_loading',
  SCANNING = 'scanning',
  MATCHING = 'matching',
  SUCCESS = 'success',
  ALREADY_TAKEN = 'already_taken',
  NOT_REGISTERED = 'not_registered',
  ERROR = 'error',
}

// Scan interface props
export interface ScanInterfaceProps {
  onScanComplete?: (result: ScanResult) => void;
  scanTimeout?: number;
  cooldownDuration?: number;
}

// Scan result interface
export interface ScanResult {
  success: boolean;
  employeeName?: string;
  message: string;
  scannedTime?: string;
}

/**
 * Scan Interface Component
 */
function ScanInterfaceInner({
  onScanComplete,
  scanTimeout = 30000, // 30 seconds
  cooldownDuration = 5000, // 5 seconds
}: ScanInterfaceProps) {
  // State
  const [scanState, setScanState] = useState<ScanState>(ScanState.IDLE);
  const [message, setMessage] = useState<string>('');
  const [employeeName, setEmployeeName] = useState<string>('');
  const [timeoutRemaining, setTimeoutRemaining] = useState<number>(0);
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);

  // Refs
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cooldownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasSubmittedRef = useRef<boolean>(false);

  // Toast notifications
  const { showSuccess, showError, showWarning } = useToast();

  /**
   * Start cooldown before returning to IDLE
   * Defined first to avoid circular dependencies
   */
  const startCooldown = useCallback(() => {
    setCooldownRemaining(cooldownDuration);

    let remaining = cooldownDuration;
    cooldownTimerRef.current = setInterval(() => {
      remaining -= 100;
      setCooldownRemaining(Math.max(0, remaining));

      if (remaining <= 0) {
        if (cooldownTimerRef.current) {
          clearInterval(cooldownTimerRef.current);
        }
        setScanState(ScanState.IDLE);
        setMessage('');
        setEmployeeName('');
      }
    }, 100);
  }, [cooldownDuration]);

  /**
   * Start scan timeout countdown
   */
  const startScanTimeout = useCallback(() => {
    const startTime = Date.now();

    // Clear any existing timeout
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    // Set timeout to cancel scan
    scanTimeoutRef.current = setTimeout(() => {
      if (
        scanState === ScanState.SCANNING ||
        scanState === ScanState.CAMERA_LOADING
      ) {
        setScanState(ScanState.ERROR);
        setMessage('Scan timeout. Please try again.');
        startCooldown();
      }
    }, scanTimeout);

    // Update countdown every second
    countdownIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, scanTimeout - elapsed);
      setTimeoutRemaining(remaining);

      if (remaining === 0) {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
        }
      }
    }, 100);
  }, [scanTimeout, scanState, startCooldown]);

  /**
   * Handle face capture and submission
   */
  const handleCapture = useCallback(
    async (canvas: HTMLCanvasElement, detection: DetectionResult) => {
      // Prevent duplicate submissions
      if (hasSubmittedRef.current) return;
      if (scanState !== ScanState.SCANNING) return;
      if (detection.state !== DetectionState.FACE_FOUND) return;

      hasSubmittedRef.current = true;

      // Clear scan timeout
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }

      setScanState(ScanState.MATCHING);
      setMessage('Matching face...');

      try {
        // Extract descriptor
        const result = await extractDescriptor(canvas);

        if (!result.success || !result.descriptor) {
          throw new Error(result.error || 'Failed to extract face descriptor');
        }

        // Submit to API with retry
        const descriptorArray = serializeDescriptor(result.descriptor);
        const data = await apiPost<{
          success: boolean;
          message?: string;
          employeeName?: string;
          scannedTime?: string;
          error?: string;
        }>(
          '/api/lunch',
          { faceDescriptor: descriptorArray },
          {
            retryOptions: {
              maxRetries: 2,
              initialDelay: 1000,
            },
          },
        );

        if (!data.success) {
          // Handle specific error cases
          if (
            data.error?.includes('already recorded') ||
            data.error?.includes('Already recorded')
          ) {
            setScanState(ScanState.ALREADY_TAKEN);
            setMessage(data.message || 'You have already recorded lunch today');
            setEmployeeName(data.employeeName || '');
            showWarning(
              data.message || 'You have already recorded lunch today',
              'Already Scanned',
            );
          } else if (
            data.error?.includes('not registered') ||
            data.error?.includes('No match found')
          ) {
            setScanState(ScanState.NOT_REGISTERED);
            setMessage(
              data.message ||
                'Face not recognized. Please register at the admin desk.',
            );
            showWarning(
              data.message ||
                'Face not recognized. Please register at the admin desk.',
              'Not Registered',
            );
          } else {
            setScanState(ScanState.ERROR);
            setMessage(data.message || data.error || 'Scan failed');
            showError(
              data.message || data.error || 'Scan failed',
              'Scan Failed',
            );
          }
          startCooldown();
          return;
        }

        // Success
        setScanState(ScanState.SUCCESS);
        setMessage(`Welcome, ${data.employeeName}!`);
        setEmployeeName(data.employeeName || '');
        showSuccess(
          `Lunch recorded successfully for ${data.employeeName}`,
          'Success',
        );
        onScanComplete?.({
          success: true,
          employeeName: data.employeeName,
          message: data.message || 'Lunch recorded successfully',
          scannedTime: data.scannedTime,
        });
        startCooldown();
      } catch (error) {
        console.error('Scan error:', error);
        setScanState(ScanState.ERROR);
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'An error occurred during scan';
        setMessage(errorMessage);
        showError(errorMessage, 'Scan Error');
        startCooldown();
      }
    },
    [
      scanState,
      onScanComplete,
      startCooldown,
      showSuccess,
      showWarning,
      showError,
    ],
  );

  /**
   * Start scan process
   */
  const handleStartScan = useCallback(() => {
    setScanState(ScanState.CAMERA_LOADING);
    setMessage('Initializing camera...');
    setTimeoutRemaining(scanTimeout);
    hasSubmittedRef.current = false;

    // Transition to SCANNING once camera loads
    setTimeout(() => {
      setScanState(ScanState.SCANNING);
      setMessage('Position your face in the frame...');
      startScanTimeout();
    }, 1000);
  }, [scanTimeout, startScanTimeout]);

  /**
   * Cancel scan manually
   */
  const handleCancelScan = useCallback(() => {
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    setScanState(ScanState.IDLE);
    setMessage('');
    hasSubmittedRef.current = false;
  }, []);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
      if (cooldownTimerRef.current) {
        clearInterval(cooldownTimerRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  /**
   * Get status icon
   */
  const getStatusIcon = () => {
    switch (scanState) {
      case ScanState.SUCCESS:
        return (
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100">
            <svg
              className="h-10 w-10 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        );
      case ScanState.ALREADY_TAKEN:
        return (
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-yellow-100">
            <svg
              className="h-10 w-10 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        );
      case ScanState.NOT_REGISTERED:
      case ScanState.ERROR:
        return (
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-100">
            <svg
              className="h-10 w-10 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  /**
   * Get status color
   */
  const getStatusColor = () => {
    switch (scanState) {
      case ScanState.SUCCESS:
        return 'text-green-600';
      case ScanState.ALREADY_TAKEN:
        return 'text-yellow-600';
      case ScanState.NOT_REGISTERED:
      case ScanState.ERROR:
        return 'text-red-600';
      default:
        return 'text-gray-900';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* IDLE State - Start Screen */}
      {scanState === ScanState.IDLE && (
        <div className="p-12 text-center">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-blue-100 mb-6">
            <svg
              className="h-10 w-10 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Ready to Scan
          </h2>
          <p className="text-gray-600 mb-8">
            Click the button below to start lunch attendance scan
          </p>
          <button
            onClick={handleStartScan}
            className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Start Scan
          </button>
        </div>
      )}

      {/* CAMERA_LOADING & SCANNING States - Camera View */}
      {(scanState === ScanState.CAMERA_LOADING ||
        scanState === ScanState.SCANNING) && (
        <div className="p-6">
          {/* Timeout Countdown */}
          {scanState === ScanState.SCANNING && (
            <div className="mb-4 text-center">
              <p className="text-sm text-gray-600">
                Time remaining:{' '}
                <span className="font-medium text-gray-900">
                  {Math.ceil(timeoutRemaining / 1000)}s
                </span>
              </p>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-100"
                  style={{
                    width: `${(timeoutRemaining / scanTimeout) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          )}

          {/* Webcam */}
          <WebcamCapture
            onCapture={handleCapture}
            autoDetect={scanState === ScanState.SCANNING}
            showOverlay={true}
            mirrorVideo={true}
          />

          {/* Message */}
          <p className="mt-4 text-center text-sm text-gray-600">{message}</p>

          {/* Cancel Button */}
          <button
            onClick={handleCancelScan}
            className="mt-4 w-full px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
        </div>
      )}

      {/* MATCHING State - Processing */}
      {scanState === ScanState.MATCHING && (
        <div className="p-12 text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-blue-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{message}</h2>
          <p className="text-gray-600">Please wait...</p>
        </div>
      )}

      {/* Result States (SUCCESS, ALREADY_TAKEN, NOT_REGISTERED, ERROR) */}
      {(scanState === ScanState.SUCCESS ||
        scanState === ScanState.ALREADY_TAKEN ||
        scanState === ScanState.NOT_REGISTERED ||
        scanState === ScanState.ERROR) && (
        <div className="p-12 text-center">
          {getStatusIcon()}
          <h2 className={`text-2xl font-bold ${getStatusColor()} mt-6 mb-2`}>
            {employeeName || message}
          </h2>
          <p className="text-gray-600 mb-6">
            {scanState === ScanState.SUCCESS && 'Lunch recorded successfully'}
            {scanState === ScanState.ALREADY_TAKEN &&
              'Lunch already recorded today'}
            {scanState === ScanState.NOT_REGISTERED &&
              'Please register at admin desk'}
            {scanState === ScanState.ERROR && 'Please try again'}
          </p>
          <p className="text-sm text-gray-500">
            Returning to start in {Math.ceil(cooldownRemaining / 1000)}s...
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Wrapped with ModelProvider
 */
export default function ScanInterface(props: ScanInterfaceProps) {
  return (
    <ModelProvider>
      <ScanInterfaceInner {...props} />
    </ModelProvider>
  );
}
