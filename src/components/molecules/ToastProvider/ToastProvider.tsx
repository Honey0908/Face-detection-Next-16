'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { Toast } from '@/components/atoms/Toast';
import type { SemanticColor } from '@/types/design';

export interface ToastOptions {
  variant?: SemanticColor;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastItem extends ToastOptions {
  id: string;
}

interface ToastContextValue {
  showToast: (options: ToastOptions) => void;
  showSuccess: (message: string, title?: string) => void;
  showError: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

/**
 * Custom hook to show toast notifications
 *
 * @example
 * const { showSuccess, showError } = useToast();
 * showSuccess('Lunch recorded successfully');
 * showError('Failed to load camera', 'Camera Error');
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

interface ToastProviderProps {
  children: ReactNode;
  maxToasts?: number;
  defaultDuration?: number;
}

/**
 * Toast provider component to manage toast notifications
 * Add this to your app layout to enable toasts throughout the app
 *
 * @example
 * <ToastProvider maxToasts={3}>
 *   {children}
 * </ToastProvider>
 */
export function ToastProvider({
  children,
  maxToasts = 5,
  defaultDuration = 5000,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback(
    (options: ToastOptions) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newToast: ToastItem = {
        ...options,
        id,
        duration: options.duration ?? defaultDuration,
      };

      setToasts((prev) => {
        const updated = [newToast, ...prev];
        // Keep only the most recent maxToasts
        return updated.slice(0, maxToasts);
      });
    },
    [defaultDuration, maxToasts],
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showSuccess = useCallback(
    (message: string, title?: string) => {
      showToast({ variant: 'success', message, title });
    },
    [showToast],
  );

  const showError = useCallback(
    (message: string, title?: string) => {
      showToast({ variant: 'error', message, title });
    },
    [showToast],
  );

  const showWarning = useCallback(
    (message: string, title?: string) => {
      showToast({ variant: 'warning', message, title });
    },
    [showToast],
  );

  const showInfo = useCallback(
    (message: string, title?: string) => {
      showToast({ variant: 'info', message, title });
    },
    [showToast],
  );

  const contextValue: ToastContextValue = {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}

      {/* Toast container - fixed position at top-right */}
      <div
        className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast
              variant={toast.variant}
              title={toast.title}
              message={toast.message}
              duration={toast.duration}
              onClose={() => removeToast(toast.id)}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
