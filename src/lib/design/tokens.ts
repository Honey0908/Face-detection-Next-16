/**
 * Design tokens extracted from Tailwind configuration
 * Use this to access theme values programmatically in TypeScript
 *
 * @example
 * import { tokens } from '@/lib/design/tokens'
 * const primaryColor = tokens.colors.primary.DEFAULT
 */
export const tokens = {
  colors: {
    primary: {
      DEFAULT: '#8100D1',
      hover: '#6D00B3',
    },
    secondary: '#B500B2',
    accent: '#FF52A0',
    highlight: '#FFA47F',
    success: {
      light: '#10B981',
      DEFAULT: '#059669',
      dark: '#047857',
    },
    error: {
      light: '#EF4444',
      DEFAULT: '#DC2626',
      dark: '#B91C1C',
    },
    warning: {
      light: '#F59E0B',
      DEFAULT: '#D97706',
      dark: '#B45309',
    },
    info: {
      light: '#3B82F6',
      DEFAULT: '#2563EB',
      dark: '#1D4ED8',
    },
  },
  spacing: {
    xs: '0.25rem', // 4px
    sm: '0.5rem', // 8px
    md: '1rem', // 16px
    lg: '1.5rem', // 24px
    xl: '2rem', // 32px
  },
  borderRadius: {
    sm: '0.125rem', // 2px
    md: '0.25rem', // 4px
    lg: '0.5rem', // 8px
  },
} as const;

/**
 * Type-safe design token definitions
 */
export type DesignTokens = typeof tokens;
