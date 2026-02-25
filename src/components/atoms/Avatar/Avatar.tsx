'use client';

import { ImgHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import type { ComponentSize } from '@/types/design';

export interface AvatarProps extends Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  'size'
> {
  size?: ComponentSize;
  initials?: string;
}

/**
 * Avatar component for displaying user profile images
 *
 * @example
 * <Avatar src="/user.jpg" alt="John Doe" size="md" />
 * <Avatar initials="JD" size="lg" />
 */
export const Avatar = forwardRef<HTMLImageElement, AvatarProps>(
  ({ size = 'md', initials, src, alt, className, ...props }, ref) => {
    const sizeClasses = {
      'h-6 w-6 text-xs': size === 'xs',
      'h-8 w-8 text-sm': size === 'sm',
      'h-10 w-10 text-base': size === 'md',
      'h-12 w-12 text-lg': size === 'lg',
      'h-16 w-16 text-xl': size === 'xl',
    };

    if (!src && initials) {
      return (
        <div
          className={cn(
            'inline-flex items-center justify-center rounded-full',
            'bg-primary text-white font-semibold',
            sizeClasses,
            className,
          )}
        >
          {initials}
        </div>
      );
    }

    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        ref={ref}
        src={src}
        alt={alt || 'Avatar'}
        className={cn(
          'inline-block rounded-full object-cover',
          sizeClasses,
          className,
        )}
        {...props}
      />
    );
  },
);

Avatar.displayName = 'Avatar';
