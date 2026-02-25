'use client';

import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import type { ComponentSize } from '@/types/design';

export interface InputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size'
> {
  size?: Exclude<ComponentSize, 'xs' | 'xl'>;
  error?: boolean;
}

/**
 * Input component with design system sizing and error states
 *
 * @example
 * <Input placeholder="Enter text" size="md" />
 * <Input error placeholder="Invalid input" />
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ size = 'md', error = false, className, disabled, ...props }, ref) => {
    return (
      <input
        ref={ref}
        disabled={disabled}
        className={cn(
          // Base styles
          'w-full rounded-md border',
          'bg-white',
          'transition-colors duration-200',
          'placeholder:text-gray-400',
          'focus:outline-none focus:ring-2 focus:ring-offset-0',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50',

          // Border and focus states
          error
            ? 'border-error text-error-dark focus:border-error focus:ring-error/20'
            : 'border-gray-300 text-gray-900 focus:border-primary focus:ring-primary/20',

          // Size styles
          {
            'px-3 py-1.5 text-sm': size === 'sm',
            'px-4 py-2 text-base': size === 'md',
            'px-5 py-2.5 text-lg': size === 'lg',
          },

          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = 'Input';
