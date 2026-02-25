'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import type { ComponentSize, ButtonVariant } from '@/types/design';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: Exclude<ComponentSize, 'xs'>;
}

/**
 * Button component with design system variants and sizes
 *
 * @example
 * <Button variant="primary" size="md">Click me</Button>
 * <Button variant="secondary" size="sm" disabled>Disabled</Button>
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = 'primary', size = 'md', className, disabled, ...props },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center',
          'font-semibold rounded-md',
          'transition-colors duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:pointer-events-none',

          // Variant styles
          {
            'bg-primary hover:bg-primary-hover text-white focus-visible:ring-primary':
              variant === 'primary',
            'bg-secondary hover:bg-secondary/90 text-white focus-visible:ring-secondary':
              variant === 'secondary',
            'bg-accent hover:bg-accent/90 text-white focus-visible:ring-accent':
              variant === 'accent',
            'bg-highlight hover:bg-highlight/90 text-white focus-visible:ring-highlight':
              variant === 'highlight',
            'border border-gray-300 bg-transparent hover:bg-gray-50 text-gray-700 focus-visible:ring-gray-400':
              variant === 'outline',
            'bg-transparent hover:bg-gray-100 text-gray-700 focus-visible:ring-gray-400':
              variant === 'ghost',
            'bg-transparent hover:underline text-primary p-0 focus-visible:ring-primary':
              variant === 'link',
          },

          // Size styles
          {
            'px-3 py-1.5 text-sm': size === 'sm',
            'px-4 py-2 text-base': size === 'md',
            'px-6 py-3 text-lg': size === 'lg',
          },

          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = 'Button';
