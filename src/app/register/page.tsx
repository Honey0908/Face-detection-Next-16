/**
 * Employee Registration Page
 *
 * Server Component that renders the employee registration interface.
 * Admin-only page for enrolling new employees in the face recognition system.
 */

import RegistrationForm from '@/components/organisms/RegistrationForm';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { WebGLFallback } from '@/components/WebGLFallback';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Employee Registration
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Register a new employee for lunch tracking
          </p>
        </div>

        {/* Registration Form with WebGL Check and Error Boundary */}
        <WebGLFallback>
          <ErrorBoundary>
            <RegistrationForm />
          </ErrorBoundary>
        </WebGLFallback>
      </div>
    </div>
  );
}
