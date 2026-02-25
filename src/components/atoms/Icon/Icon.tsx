import { HTMLAttributes, forwardRef } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ComponentSize } from '@/types/design';

export interface IconProps extends Omit<
  HTMLAttributes<HTMLSpanElement>,
  'color'
> {
  icon: LucideIcon;
  size?: ComponentSize;
}

/**
 * Icon wrapper component using lucide-react icons
 *
 * @example
 * import { Check } from 'lucide-react'
 * <Icon icon={Check} size="md" />
 */
export const Icon = forwardRef<HTMLSpanElement, IconProps>(
  ({ icon: IconComponent, size = 'md', className, ...props }, ref) => {
    return (
      <span ref={ref} className={cn('inline-flex', className)} {...props}>
        <IconComponent
          className={cn({
            'h-3 w-3': size === 'xs',
            'h-4 w-4': size === 'sm',
            'h-5 w-5': size === 'md',
            'h-6 w-6': size === 'lg',
            'h-8 w-8': size === 'xl',
          })}
        />
      </span>
    );
  },
);

Icon.displayName = 'Icon';
