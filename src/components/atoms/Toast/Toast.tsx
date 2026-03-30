'use client';

import { HTMLAttributes, forwardRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import type { SemanticColor } from '@/types/design';

export interface ToastProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'title'
> {
  variant?: SemanticColor;
  title?: string;
  message: string;
  duration?: number;
  onClose?: () => void;
  showCloseButton?: boolean;
}

/**
 * Toast component for displaying temporary notifications
 *
 * @example
 * <Toast variant="success" message="Lunch recorded successfully" />
 * <Toast variant="error" title="Error" message="Failed to load camera" />
 */
export const Toast = forwardRef<HTMLDivElement, ToastProps>(
  (
    {
      variant = 'info',
      title,
      message,
      duration = 5000,
      onClose,
      showCloseButton = true,
      className,
      ...props
    },
    ref,
  ) => {
    const [isVisible, setIsVisible] = useState(true);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
      if (duration > 0) {
        const exitTimer = setTimeout(() => {
          setIsExiting(true);
        }, duration - 300); // Start exit animation 300ms before removal

        const removeTimer = setTimeout(() => {
          setIsVisible(false);
          onClose?.();
        }, duration);

        return () => {
          clearTimeout(exitTimer);
          clearTimeout(removeTimer);
        };
      }
    }, [duration, onClose]);

    const handleClose = () => {
      setIsExiting(true);
      setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, 300);
    };

    if (!isVisible) return null;

    // Icon based on variant
    const getIcon = () => {
      switch (variant) {
        case 'success':
          return (
            <svg
              className="w-5 h-5 flex-shrink-0"
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
          );
        case 'error':
          return (
            <svg
              className="w-5 h-5 flex-shrink-0"
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
          );
        case 'warning':
          return (
            <svg
              className="w-5 h-5 flex-shrink-0"
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
          );
        case 'info':
        default:
          return (
            <svg
              className="w-5 h-5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          );
      }
    };

    return (
      <div
        ref={ref}
        role="alert"
        aria-live="polite"
        className={cn(
          // Base styles
          'flex items-start gap-3 p-4 rounded-lg shadow-lg',
          'border max-w-md w-full',
          'transition-all duration-300 ease-in-out',

          // Animation states
          isExiting
            ? 'opacity-0 translate-x-full scale-95'
            : 'opacity-100 translate-x-0 scale-100',

          // Variant styles
          {
            'bg-success/10 border-success text-success-dark':
              variant === 'success',
            'bg-error/10 border-error text-error-dark': variant === 'error',
            'bg-warning/10 border-warning text-warning-dark':
              variant === 'warning',
            'bg-info/10 border-info text-info-dark': variant === 'info',
          },

          className,
        )}
        {...props}
      >
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {title && <h3 className="text-sm font-semibold mb-1">{title}</h3>}
          <p className="text-sm">{message}</p>
        </div>

        {/* Close button */}
        {showCloseButton && (
          <button
            type="button"
            onClick={handleClose}
            className={cn(
              'flex-shrink-0 p-1 rounded-md',
              'hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-offset-1',
              'transition-colors duration-200',
              {
                'focus:ring-success': variant === 'success',
                'focus:ring-error': variant === 'error',
                'focus:ring-warning': variant === 'warning',
                'focus:ring-info': variant === 'info',
              },
            )}
            aria-label="Close notification"
          >
            <svg
              className="w-4 h-4"
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
          </button>
        )}
      </div>
    );
  },
);

Toast.displayName = 'Toast';
