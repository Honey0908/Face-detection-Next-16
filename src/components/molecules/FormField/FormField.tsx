'use client';

import { InputHTMLAttributes, forwardRef } from 'react';
import { Input } from '@/components/atoms/Input';
import { Label } from '@/components/atoms/Label';
import { cn } from '@/lib/utils';
import type { ComponentSize } from '@/types/design';

export interface FormFieldProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size'
> {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  size?: Exclude<ComponentSize, 'xs' | 'xl'>;
  containerClassName?: string;
}

/**
 * FormField molecule combining Label, Input, and error/helper text
 *
 * @example
 * <FormField
 *   label="Email"
 *   type="email"
 *   required
 *   error="Invalid email"
 * />
 */
export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  (
    {
      label,
      error,
      helperText,
      required = false,
      size = 'md',
      containerClassName,
      className,
      id,
      ...props
    },
    ref,
  ) => {
    const inputId =
      id || `form-field-${label.toLowerCase().replace(/\s+/g, '-')}`;

    return (
      <div className={cn('flex flex-col gap-1.5', containerClassName)}>
        <Label htmlFor={inputId} required={required}>
          {label}
        </Label>

        <Input
          ref={ref}
          id={inputId}
          size={size}
          error={!!error}
          className={className}
          aria-invalid={!!error}
          aria-describedby={
            error
              ? `${inputId}-error`
              : helperText
                ? `${inputId}-helper`
                : undefined
          }
          {...props}
        />

        {error && (
          <p
            id={`${inputId}-error`}
            className="text-sm text-error"
            role="alert"
          >
            {error}
          </p>
        )}

        {!error && helperText && (
          <p id={`${inputId}-helper`} className="text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

FormField.displayName = 'FormField';
