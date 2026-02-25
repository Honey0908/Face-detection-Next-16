/**
 * Design System ESLint Rules
 * Enforces design system patterns and prevents hardcoded values
 */

module.exports = {
  plugins: ['no-hardcoded-colors'],
  rules: {
    // Prevent hardcoded color values
    'no-hardcoded-colors/no-hex-colors': 'warn',

    // Enforce component structure
    'react/function-component-definition': [
      'error',
      {
        namedComponents: 'arrow-function',
        unnamedComponents: 'arrow-function',
      },
    ],

    // Require TypeScript types for all props
    '@typescript-eslint/explicit-module-boundary-types': 'warn',

    // Enforce accessibility
    'jsx-a11y/aria-props': 'error',
    'jsx-a11y/aria-role': 'error',
    'jsx-a11y/alt-text': 'error',

    // Prevent usage of inline styles
    'react/forbid-dom-props': [
      'warn',
      {
        forbid: [
          {
            propName: 'style',
            message: 'Use Tailwind classes instead of inline styles',
          },
        ],
      },
    ],
  },

  overrides: [
    {
      // Design system components should use forwardRef
      files: ['src/components/**/*.tsx'],
      rules: {
        'react/display-name': 'error',
      },
    },
  ],
};
