/**
 * Design system type definitions
 */

/**
 * Component size variants
 */
export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Color variants from the design system
 */
export type ColorVariant = 'primary' | 'secondary' | 'accent' | 'highlight';

/**
 * Semantic color variants
 */
export type SemanticColor = 'success' | 'error' | 'warning' | 'info';

/**
 * All available color options
 */
export type Color = ColorVariant | SemanticColor | 'neutral';

/**
 * Button variants
 */
export type ButtonVariant = ColorVariant | 'outline' | 'ghost' | 'link';

/**
 * Badge variants
 */
export type BadgeVariant = SemanticColor | 'neutral';

/**
 * Shadow elevation levels
 */
export type ShadowSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Border radius options
 */
export type BorderRadius = 'none' | 'sm' | 'md' | 'lg' | 'full';

/**
 * Spacing scale (matches Tailwind spacing)
 */
export type Spacing =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 8
  | 10
  | 12
  | 16
  | 20
  | 24
  | 32
  | 40
  | 48
  | 56
  | 64;
