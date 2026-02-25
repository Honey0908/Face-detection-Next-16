'use client';

import { InputHTMLAttributes, forwardRef } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/atoms/Input';
import { Icon } from '@/components/atoms/Icon';
import { cn } from '@/lib/utils';
import type { ComponentSize } from '@/types/design';

export interface SearchFieldProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size' | 'type'
> {
  size?: Exclude<ComponentSize, 'xs' | 'xl'>;
  onClear?: () => void;
}

/**
 * SearchField molecule combining Input with search icon and clear button
 *
 * @example
 * <SearchField
 *   placeholder="Search employees..."
 *   onClear={() => setValue('')}
 * />
 */
export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(
  ({ size = 'md', onClear, value, className, ...props }, ref) => {
    const showClearButton = value && String(value).length > 0;

    return (
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <Icon icon={Search} size={size} className="text-gray-400" />
        </div>

        <Input
          ref={ref}
          type="text"
          size={size}
          value={value}
          className={cn('pl-10', showClearButton && 'pr-10', className)}
          {...props}
        />

        {showClearButton && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Clear search"
          >
            <Icon icon={X} size={size} />
          </button>
        )}
      </div>
    );
  },
);

SearchField.displayName = 'SearchField';
