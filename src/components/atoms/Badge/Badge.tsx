import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import type { ComponentSize, SemanticColor } from '@/types/design';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: SemanticColor | 'neutral';
  size?: Exclude<ComponentSize, 'xs' | 'xl'>;
}

/**
 * Badge component for status indicators and labels
 *
 * @example
 * <Badge variant="success">Active</Badge>
 * <Badge variant="error" size="sm">Failed</Badge>
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'neutral', size = 'md', className, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center',
          'font-medium rounded-full',
          'transition-colors duration-200',

          // Variant styles
          {
            'bg-success/10 text-success-dark border border-success/20':
              variant === 'success',
            'bg-error/10 text-error-dark border border-error/20':
              variant === 'error',
            'bg-warning/10 text-warning-dark border border-warning/20':
              variant === 'warning',
            'bg-info/10 text-info-dark border border-info/20':
              variant === 'info',
            'bg-gray-100 text-gray-700 border border-gray-200':
              variant === 'neutral',
          },

          // Size styles
          {
            'px-2 py-0.5 text-xs': size === 'sm',
            'px-2.5 py-1 text-sm': size === 'md',
            'px-3 py-1.5 text-base': size === 'lg',
          },

          className,
        )}
        {...props}
      />
    );
  },
);

Badge.displayName = 'Badge';
