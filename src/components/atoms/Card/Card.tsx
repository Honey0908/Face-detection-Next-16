import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

/**
 * Card component for containing content with elevation
 *
 * @example
 * <Card padding="md">Content here</Card>
 * <Card hover padding="lg">Hoverable card</Card>
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ padding = 'md', hover = false, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          'bg-white rounded-lg border border-gray-200',
          'shadow-sm',
          'transition-shadow duration-200',

          // Hover effect
          hover && 'hover:shadow-md cursor-pointer',

          // Padding variants
          {
            'p-0': padding === 'none',
            'p-3': padding === 'sm',
            'p-4': padding === 'md',
            'p-6': padding === 'lg',
          },

          className,
        )}
        {...props}
      />
    );
  },
);

Card.displayName = 'Card';
