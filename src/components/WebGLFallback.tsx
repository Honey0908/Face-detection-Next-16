/**
 * WebGL Fallback Component
 *
 * Detects WebGL support and shows fallback UI for unsupported browsers.
 * Required for face-api.js TensorFlow.js backend.
 */

'use client';

import { useEffect, useState, ReactNode } from 'react';
import { Card } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { isWebGLAvailable } from '@/lib/face/modelLoader';

interface WebGLFallbackProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function WebGLFallback({ children, fallback }: WebGLFallbackProps) {
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Check WebGL support on mount
    const checkWebGL = () => {
      const supported = isWebGLAvailable();
      setWebglSupported(supported);
      setChecking(false);

      if (!supported) {
        console.warn(
          'WebGL is not available. Face recognition features will not work.',
        );
      }
    };

    // Small delay to avoid flash of unsupported content
    const timer = setTimeout(checkWebGL, 100);

    return () => clearTimeout(timer);
  }, []);

  // Show loading state while checking
  if (checking || webglSupported === null) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Show fallback UI if WebGL not supported
  if (!webglSupported) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return <DefaultWebGLFallback />;
  }

  // Render children if WebGL is supported
  return <>{children}</>;
}

/**
 * Default fallback UI for unsupported browsers
 */
function DefaultWebGLFallback() {
  return (
    <Card variant="outlined" className="p-6 max-w-md mx-auto">
      <div className="text-center space-y-4">
        {/* Icon */}
        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-amber-100 mx-auto">
          <svg
            className="h-8 w-8 text-amber-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Title */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Browser Not Supported
          </h2>
          <p className="text-sm text-gray-600 mb-3">
            Your browser does not support WebGL, which is required for face
            recognition features.
          </p>
        </div>

        {/* Supported Browsers */}
        <div className="bg-gray-50 rounded-lg p-4 text-left">
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            Supported Browsers:
          </h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li className="flex items-center">
              <svg
                className="h-4 w-4 mr-2 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Google Chrome 90 or later
            </li>
            <li className="flex items-center">
              <svg
                className="h-4 w-4 mr-2 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Microsoft Edge 90 or later
            </li>
            <li className="flex items-center">
              <svg
                className="h-4 w-4 mr-2 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Mozilla Firefox 88 or later
            </li>
            <li className="flex items-center">
              <svg
                className="h-4 w-4 mr-2 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Safari 14 or later
            </li>
          </ul>
        </div>

        {/* Troubleshooting */}
        <div className="text-left text-xs text-gray-500 space-y-2">
          <p className="font-medium">Troubleshooting:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Update your browser to the latest version</li>
            <li>Enable hardware acceleration in browser settings</li>
            <li>Try a different browser from the list above</li>
            <li>Check if WebGL is disabled in your browser flags</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-center pt-2">
          <Button
            variant="outlined"
            size="medium"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
          <Button
            variant="secondary"
            size="medium"
            onClick={() => window.open('https://get.webgl.org/', '_blank')}
          >
            Test WebGL
          </Button>
        </div>

        {/* Contact */}
        <p className="text-xs text-gray-500 pt-2">
          If the problem persists, please contact IT support.
        </p>
      </div>
    </Card>
  );
}
