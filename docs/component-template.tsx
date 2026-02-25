/**
 * Component Template
 *
 * Use this template when creating new design system components.
 * Copy this file and replace placeholders with your component details.
 */

import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import type { ComponentSize } from '@/types/design';

/**
 * Props interface extending appropriate HTML element attributes
 *
 * Omit 'size' if extending elements that have native size attribute
 */
export interface MyComponentProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Component size variant
   * @default 'md'
   */
  size?: ComponentSize;

  /**
   * Visual variant/style
   * @default 'default'
   */
  variant?: 'default' | 'primary' | 'secondary';

  /**
   * Whether the component is disabled
   * @default false
   */
  disabled?: boolean;

  // Add other specific props here
}

/**
 * MyComponent Description
 *
 * Brief description of what this component does and when to use it.
 *
 * @example
 * ```tsx
 * <MyComponent variant="primary" size="md">
 *   Content here
 * </MyComponent>
 * ```
 *
 * @example
 * ```tsx
 * // With custom styling
 * <MyComponent
 *   variant="secondary"
 *   className="mt-4"
 * >
 *   Custom content
 * </MyComponent>
 * ```
 */
export const MyComponent = forwardRef<HTMLDivElement, MyComponentProps>(
  (
    {
      size = 'md',
      variant = 'default',
      disabled = false,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base styles - always applied
          'inline-flex items-center justify-center',
          'rounded-lg transition-colors',

          // Variant styles - use design tokens
          {
            'bg-gray-100 text-gray-900': variant === 'default',
            'bg-primary text-white hover:bg-primary-hover':
              variant === 'primary',
            'bg-secondary text-white hover:bg-secondary-hover':
              variant === 'secondary',
          },

          // Size styles - use consistent spacing
          {
            'px-3 py-1.5 text-sm': size === 'sm',
            'px-4 py-2 text-base': size === 'md',
            'px-6 py-3 text-lg': size === 'lg',
          },

          // State styles
          disabled && 'opacity-50 cursor-not-allowed',

          // Custom className override
          className,
        )}
        aria-disabled={disabled}
        {...props}
      >
        {children}
      </div>
    );
  },
);

// Display name for debugging
MyComponent.displayName = 'MyComponent';

/**
 * CHECKLIST FOR NEW COMPONENTS
 *
 * Before considering the component complete, ensure:
 *
 * [ ] Props interface extends appropriate HTML element attributes
 * [ ] All props have JSDoc comments with @default values
 * [ ] Component uses forwardRef for ref support
 * [ ] displayName is set for debugging
 * [ ] Base styles use design tokens (no hardcoded colors)
 * [ ] Variants use theme colors (bg-primary, text-success, etc.)
 * [ ] Size variants use consistent spacing scale
 * [ ] Disabled/error states are styled appropriately
 * [ ] className prop merges correctly using cn() utility
 * [ ] Accessibility attributes included (aria-*, role, etc.)
 * [ ] JSDoc examples provided showing basic and advanced usage
 * [ ] Component exported from index.ts in component directory
 * [ ] Component added to src/components/index.ts central export
 * [ ] Types exported alongside component
 * [ ] 'use client' directive added if component uses hooks/interactivity
 * [ ] No console.log or debug code left in
 */

/**
 * COMMON PATTERNS
 */

// For components that need client-side features:
// Add at top of file:
// 'use client'

// For icon integration:
// import { Icon } from '@/components/atoms/Icon'
// import { IconName } from 'lucide-react'

// For composition with other atoms:
// import { Button } from '@/components/atoms/Button'
// import { Card } from '@/components/atoms/Card'

// For conditional rendering:
// {condition && <Element />}
// {value ? <Option1 /> : <Option2 />}

// For accessibility:
// aria-label="descriptive text"
// aria-disabled={disabled}
// aria-invalid={hasError}
// aria-describedby={`${id}-helper`}
// role="button" // when div acts as button

/**
 * STYLE GUIDELINES
 */

// Use design tokens:
// ✅ bg-primary, text-success, shadow-md
// ❌ bg-[#8100D1], text-[#10B981], shadow-[0_4px_6px_rgba(0,0,0,0.1)]

// Use semantic class names:
// ✅ disabled && 'opacity-50 cursor-not-allowed'
// ❌ disabled && 'opacity-[0.5] cursor-[not-allowed]'

// Group related styles:
// ✅
// {
//   'px-4 py-2 text-base': size === 'md',
// }
// ❌
// size === 'md' && 'px-4',
// size === 'md' && 'py-2',
// size === 'md' && 'text-base'

/**
 * INDEX.TS TEMPLATE
 *
 * Create index.ts in component directory:
 *
 * ```typescript
 * export { MyComponent } from './MyComponent'
 * export type { MyComponentProps } from './MyComponent'
 * ```
 *
 * Add to src/components/index.ts:
 *
 * ```typescript
 * export { MyComponent } from './atoms/MyComponent'
 * export type { MyComponentProps } from './atoms/MyComponent'
 * ```
 */
