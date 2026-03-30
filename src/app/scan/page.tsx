/**
 * Lunch Scan Page
 *
 * Server Component that renders the lunch scanning interface.
 * Employees scan their face to record lunch attendance.
 */

import ScanInterface from '@/components/organisms/ScanInterface';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { WebGLFallback } from '@/components/WebGLFallback';

export default function ScanPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Lunch Scanner</h1>
          <p className="mt-2 text-sm text-gray-600">
            Scan your face to record lunch attendance
          </p>
        </div>

        {/* Scan Interface with WebGL Check and Error Boundary */}
        <WebGLFallback>
          <ErrorBoundary>
            <ScanInterface />
          </ErrorBoundary>
        </WebGLFallback>
      </div>
    </div>
  );
}
