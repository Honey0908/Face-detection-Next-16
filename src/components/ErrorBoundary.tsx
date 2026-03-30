/**
 * Error Boundary Component
 *
 * Catches TensorFlow.js and React errors in face detection components.
 * Provides user-friendly error messages and recovery options.
 */

'use client';

import React, { Component, ReactNode } from 'react';
import { Button } from '@/components/atoms/Button';
import { Card } from '@/components/atoms/Card';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, resetError: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    // Check if it's a TensorFlow.js error
    if (
      error.message.includes('WebGL') ||
      error.message.includes('TensorFlow') ||
      error.message.includes('backend')
    ) {
      console.error('TensorFlow.js error detected:', error.message);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleReset);
      }

      // Default error UI
      return (
        <Card variant="outlined" className="p-6 max-w-md mx-auto my-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mx-auto">
              <svg
                className="h-8 w-8 text-red-600"
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

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Something Went Wrong
              </h2>
              <p className="text-sm text-gray-600 mb-1">
                {this.getErrorMessage(this.state.error)}
              </p>
              {this.getErrorHint(this.state.error) && (
                <p className="text-xs text-gray-500 mt-2">
                  {this.getErrorHint(this.state.error)}
                </p>
              )}
            </div>

            <div className="flex gap-3 justify-center">
              <Button
                variant="primary"
                size="medium"
                onClick={this.handleReset}
              >
                Try Again
              </Button>
              <Button
                variant="outlined"
                size="medium"
                onClick={() => window.location.reload()}
              >
                Reload Page
              </Button>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <details className="text-left mt-4">
                <summary className="text-xs text-gray-500 cursor-pointer">
                  Error Details (Development Only)
                </summary>
                <pre className="text-xs text-gray-700 mt-2 p-2 bg-gray-50 rounded overflow-auto max-h-40">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </Card>
      );
    }

    return this.props.children;
  }

  /**
   * Get user-friendly error message
   */
  private getErrorMessage(error: Error): string {
    const message = error.message.toLowerCase();

    if (message.includes('webgl')) {
      return 'WebGL is not available in your browser. Face detection requires WebGL support.';
    }

    if (message.includes('tensorflow') || message.includes('backend')) {
      return 'Face detection system initialization failed. Please try again.';
    }

    if (message.includes('camera') || message.includes('mediadevices')) {
      return 'Camera access failed. Please check your camera permissions.';
    }

    if (message.includes('model') || message.includes('load')) {
      return 'Face detection models failed to load. Please check your internet connection.';
    }

    return 'An unexpected error occurred while processing your request.';
  }

  /**
   * Get contextual hint for error resolution
   */
  private getErrorHint(error: Error): string | null {
    const message = error.message.toLowerCase();

    if (message.includes('webgl')) {
      return 'Try updating your browser or using Chrome, Edge, or Firefox.';
    }

    if (message.includes('camera') || message.includes('mediadevices')) {
      return 'Make sure you have granted camera permissions and no other app is using the camera.';
    }

    if (message.includes('model') || message.includes('load')) {
      return 'Check your internet connection and try again.';
    }

    if (message.includes('tensorflow')) {
      return 'Try refreshing the page to reinitialize the face detection system.';
    }

    return null;
  }
}
