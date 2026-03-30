/**
 * Registration Form Component
 *
 * Client component for employee registration with multi-capture face enrollment.
 * Implements state machine for registration flow and consent tracking.
 */

'use client';

import React, { useState, useCallback } from 'react';
import { WebcamCapture } from '@/components/organisms/WebcamCapture';
import { extractDescriptor, serializeDescriptor } from '@/lib/face/extraction';
import { DetectionResult, DetectionState } from '@/lib/face/detection';
import { ModelProvider } from '@/lib/face/ModelProvider';
import { apiPost } from '@/lib/api';
import { useToast } from '@/components';

// Registration state enum
export enum RegistrationState {
  FORM_INPUT = 'form_input',
  CAMERA_READY = 'camera_ready',
  CAPTURING = 'capturing',
  PROCESSING = 'processing',
  SUBMITTING = 'submitting',
  SUCCESS = 'success',
  ERROR = 'error',
}

// Form data interface
interface FormData {
  employeeId: string;
  name: string;
  department: string;
  email: string;
  consent: boolean;
}

// Form errors interface (separate from FormData)
interface FormErrors {
  employeeId?: string;
  name?: string;
  department?: string;
  email?: string;
  consent?: string;
}

// Captured image data
interface CapturedImage {
  id: string;
  canvas: HTMLCanvasElement;
  descriptor: Float32Array;
  timestamp: number;
}

// Component props
export interface RegistrationFormProps {
  minCaptures?: number;
  maxCaptures?: number;
  onSuccess?: (userId: string) => void;
  onError?: (error: string) => void;
}

/**
 * Registration Form Component
 */
function RegistrationFormInner({
  minCaptures = 3,
  maxCaptures = 5,
  onSuccess,
  onError,
}: RegistrationFormProps) {
  // State
  const [registrationState, setRegistrationState] = useState<RegistrationState>(
    RegistrationState.FORM_INPUT,
  );
  const [formData, setFormData] = useState<FormData>({
    employeeId: '',
    name: '',
    department: '',
    email: '',
    consent: false,
  });
  const [captures, setCaptures] = useState<CapturedImage[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Toast notifications
  const { showSuccess, showError } = useToast();

  /**
   * Validate form data
   */
  const validateForm = useCallback((): boolean => {
    const errors: FormErrors = {};

    if (!formData.employeeId.trim()) {
      errors.employeeId = 'Employee ID is required';
    }

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!formData.department.trim()) {
      errors.department = 'Department is required';
    }

    if (!formData.consent) {
      errors.consent = 'Consent is required';
    }

    if (formData.email && !isValidEmail(formData.email)) {
      errors.email = 'Invalid email address';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  /**
   * Validate email format
   */
  const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  /**
   * Handle form field change
   */
  const handleFieldChange = (
    field: keyof FormData,
    value: string | boolean,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    setFormErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  /**
   * Handle form submission
   */
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      setRegistrationState(RegistrationState.CAMERA_READY);
    }
  };

  /**
   * Handle face capture
   */
  const handleCapture = useCallback(
    async (canvas: HTMLCanvasElement, detection: DetectionResult) => {
      if (detection.state !== DetectionState.FACE_FOUND) {
        setErrorMessage('Please ensure a clear view of your face');
        return;
      }

      setRegistrationState(RegistrationState.PROCESSING);
      setErrorMessage('');

      try {
        // Extract descriptor from canvas
        const result = await extractDescriptor(canvas);

        if (!result.success || !result.descriptor) {
          throw new Error(result.error || 'Failed to extract face descriptor');
        }

        // Create captured image data
        const capturedImage: CapturedImage = {
          id: `capture-${Date.now()}-${Math.random()}`,
          canvas: canvas,
          descriptor: result.descriptor,
          timestamp: Date.now(),
        };

        setCaptures((prev) => [...prev, capturedImage]);
        setRegistrationState(RegistrationState.CAPTURING);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Capture failed';
        setErrorMessage(message);
        setRegistrationState(RegistrationState.CAPTURING);
        onError?.(message);
      }
    },
    [onError],
  );

  /**
   * Handle delete capture
   */
  const handleDeleteCapture = (captureId: string) => {
    setCaptures((prev) => prev.filter((c) => c.id !== captureId));
  };

  /**
   * Handle registration submission
   */
  const handleRegistration = async () => {
    if (captures.length < minCaptures) {
      setErrorMessage(`Please capture at least ${minCaptures} images`);
      return;
    }

    setRegistrationState(RegistrationState.SUBMITTING);
    setErrorMessage('');

    try {
      // Serialize descriptors
      const descriptors = captures.map((c) =>
        serializeDescriptor(c.descriptor),
      );

      // Submit to API with retry
      const data = await apiPost<{
        success: boolean;
        userId?: string;
        error?: string;
      }>(
        '/api/register',
        {
          employeeId: formData.employeeId,
          name: formData.name,
          department: formData.department,
          email: formData.email || undefined,
          faceDescriptors: descriptors,
        },
        {
          retryOptions: {
            maxRetries: 2,
            initialDelay: 1000,
          },
        },
      );

      if (!data.success) {
        throw new Error(data.error || 'Registration failed');
      }

      // Success
      setSuccessMessage(`${formData.name} registered successfully!`);
      setRegistrationState(RegistrationState.SUCCESS);
      showSuccess(
        `${formData.name} has been registered successfully!`,
        'Registration Complete',
      );
      if (data.userId) {
        onSuccess?.(data.userId);
      }

      // Reset form after 3 seconds
      setTimeout(() => {
        resetForm();
      }, 3000);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Registration failed';
      setErrorMessage(message);
      setRegistrationState(RegistrationState.ERROR);
      showError(message, 'Registration Failed');
      onError?.(message);
    }
  };

  /**
   * Reset form to initial state
   */
  const resetForm = () => {
    setFormData({
      employeeId: '',
      name: '',
      department: '',
      email: '',
      consent: false,
    });
    setCaptures([]);
    setErrorMessage('');
    setFormErrors({});
    setSuccessMessage('');
    setRegistrationState(RegistrationState.FORM_INPUT);
  };

  /**
   * Go back to form
   */
  const handleBackToForm = () => {
    setCaptures([]);
    setErrorMessage('');
    setRegistrationState(RegistrationState.FORM_INPUT);
  };

  // Render based on state
  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      {/* Form Input State */}
      {registrationState === RegistrationState.FORM_INPUT && (
        <form onSubmit={handleFormSubmit} className="space-y-6">
          {/* Employee ID */}
          <div>
            <label
              htmlFor="employeeId"
              className="block text-sm font-medium text-gray-700"
            >
              Employee ID *
            </label>
            <input
              type="text"
              id="employeeId"
              value={formData.employeeId}
              onChange={(e) => handleFieldChange('employeeId', e.target.value)}
              className={`mt-1 block w-full rounded-md border ${
                formErrors.employeeId ? 'border-red-500' : 'border-gray-300'
              } px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500`}
              placeholder="EMP001"
            />
            {formErrors.employeeId && (
              <p className="mt-1 text-sm text-red-600">
                {formErrors.employeeId}
              </p>
            )}
          </div>

          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              className={`mt-1 block w-full rounded-md border ${
                formErrors.name ? 'border-red-500' : 'border-gray-300'
              } px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500`}
              placeholder="John Doe"
            />
            {formErrors.name && (
              <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
            )}
          </div>

          {/* Department */}
          <div>
            <label
              htmlFor="department"
              className="block text-sm font-medium text-gray-700"
            >
              Department *
            </label>
            <input
              type="text"
              id="department"
              value={formData.department}
              onChange={(e) => handleFieldChange('department', e.target.value)}
              className={`mt-1 block w-full rounded-md border ${
                formErrors.department ? 'border-red-500' : 'border-gray-300'
              } px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500`}
              placeholder="Engineering"
            />
            {formErrors.department && (
              <p className="mt-1 text-sm text-red-600">
                {formErrors.department}
              </p>
            )}
          </div>

          {/* Email (Optional) */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email (Optional)
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => handleFieldChange('email', e.target.value)}
              className={`mt-1 block w-full rounded-md border ${
                formErrors.email ? 'border-red-500' : 'border-gray-300'
              } px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500`}
              placeholder="john@company.com"
            />
            {formErrors.email && (
              <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
            )}
          </div>

          {/* Consent Checkbox */}
          <div className="flex items-start">
            <input
              type="checkbox"
              id="consent"
              checked={formData.consent}
              onChange={(e) => handleFieldChange('consent', e.target.checked)}
              className={`mt-1 h-4 w-4 rounded border ${
                formErrors.consent ? 'border-red-500' : 'border-gray-300'
              } text-blue-600 focus:ring-blue-500`}
            />
            <label
              htmlFor="consent"
              className="ml-2 block text-sm text-gray-900"
            >
              Employee has provided consent for face data collection *
            </label>
          </div>
          {formErrors.consent && (
            <p className="mt-1 text-sm text-red-600">{formErrors.consent}</p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Continue to Face Capture
          </button>
        </form>
      )}

      {/* Camera/Capture States */}
      {(registrationState === RegistrationState.CAMERA_READY ||
        registrationState === RegistrationState.CAPTURING ||
        registrationState === RegistrationState.PROCESSING) && (
        <div className="space-y-6">
          {/* Progress Indicator */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium text-gray-900">
                Capture Face Images
              </h3>
              <span className="text-sm font-medium text-blue-600">
                {captures.length}/{maxCaptures} captured
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(captures.length / maxCaptures) * 100}%` }}
              ></div>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Capture at least {minCaptures} clear images for accurate
              recognition
            </p>
          </div>

          {/* Webcam Capture */}
          <WebcamCapture
            onCapture={handleCapture}
            onError={setErrorMessage}
            autoDetect={true}
            showOverlay={true}
            mirrorVideo={true}
          />

          {/* Captured Images Thumbnails */}
          {captures.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Captured Images:
              </h4>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
                {captures.map((capture, index) => (
                  <div key={capture.id} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-300">
                      <img
                        src={capture.canvas.toDataURL()}
                        alt={`Capture ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      onClick={() => handleDeleteCapture(capture.id)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete"
                    >
                      ×
                    </button>
                    <span className="absolute bottom-1 left-1 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                      {index + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {errorMessage}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleBackToForm}
              className="flex-1 py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to Form
            </button>
            <button
              onClick={handleRegistration}
              disabled={captures.length < minCaptures}
              className="flex-1 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {captures.length < minCaptures
                ? `Capture ${minCaptures - captures.length} more`
                : 'Register Employee'}
            </button>
          </div>
        </div>
      )}

      {/* Submitting State */}
      {registrationState === RegistrationState.SUBMITTING && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-900">
            Registering employee...
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Please wait while we process the data
          </p>
        </div>
      )}

      {/* Success State */}
      {registrationState === RegistrationState.SUCCESS && (
        <div className="text-center py-12">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <svg
              className="h-8 w-8 text-green-600"
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {successMessage}
          </h3>
          <p className="text-sm text-gray-600">
            Redirecting to new registration...
          </p>
        </div>
      )}

      {/* Error State */}
      {registrationState === RegistrationState.ERROR && (
        <div className="text-center py-12">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <svg
              className="h-8 w-8 text-red-600"
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Registration Failed
          </h3>
          <p className="text-sm text-red-600 mb-6">{errorMessage}</p>
          <button
            onClick={resetForm}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Wrapped with ModelProvider
 */
export default function RegistrationForm(props: RegistrationFormProps) {
  return (
    <ModelProvider>
      <RegistrationFormInner {...props} />
    </ModelProvider>
  );
}
