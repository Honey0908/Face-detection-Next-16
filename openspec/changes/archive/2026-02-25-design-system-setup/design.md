## Context

The face detection application currently has no structured design system. Components are built ad-hoc with hardcoded colors, inconsistent spacing, and no reusable design patterns. The tech stack is Next.js 16 (App Router) with TypeScript, currently using CSS Modules in `globals.css`.

The application serves 300-500 employees daily with key interfaces:

- **Face scanning UI** (webcam, real-time detection feedback)
- **Admin dashboard** (statistics, employee management)
- **Employee registration flow** (multi-step face capture)

Constraints:

- Must integrate with existing Next.js 16 App Router architecture
- Performance-critical: Face scanning UI must remain under 300ms response time
- Need consistent branding with specific color palette: #8100D1, #B500B2, #FF52A0, #FFA47F
- No direct color/spacing values in component code (design token enforcement)

## Goals / Non-Goals

**Goals:**

- Establish Tailwind CSS-based design token system with custom theme configuration
- Create atomic component structure (atoms → molecules → organisms → templates → pages)
- Enable theme changes through single configuration file (tailwind.config.ts)
- Enforce design token usage (no hardcoded values in components)
- Provide clear component composition patterns and file organization
- Ensure type-safe design tokens through TypeScript

**Non-Goals:**

- Not migrating all existing components immediately (gradual migration is acceptable)
- Not building a visual component playground/Storybook (future enhancement)
- Not supporting multiple themes/dark mode in initial implementation
- Not creating animation/motion design tokens (can be added later)

## Decisions

### Decision 1: Tailwind CSS for Design Tokens

**Choice:** Use Tailwind CSS with custom theme configuration in `tailwind.config.ts`

**Rationale:**

- Tailwind's utility-first approach aligns with atomic design patterns
- Built-in design token system via theme configuration
- Type-safe with TypeScript support
- Zero runtime overhead (compiled at build time)
- Already compatible with Next.js 16
- Prevents hardcoded values through utility classes

**Alternatives Considered:**

- **CSS Variables only:** More manual setup, no utility classes, requires custom tooling for type safety
- **CSS-in-JS (styled-components, emotion):** Runtime overhead, conflicts with Server Components, adds bundle size
- **Vanilla Extract:** Good type safety but steeper learning curve, less ecosystem support

**Implementation:**

```typescript
// tailwind.config.ts
const config = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#8100D1',
          hover: '#6D00B3',
        },
        secondary: '#B500B2',
        accent: '#FF52A0',
        highlight: '#FFA47F',
      },
      spacing: {
        // Custom spacing scale
      },
      typography: {
        // Font families, sizes, weights
      },
    },
  },
};
```

### Decision 2: Atomic Design Folder Structure

**Choice:** Organize components using atomic design hierarchy in `/src/components`

**Rationale:**

- Scalable organization as component library grows
- Clear component dependencies and composition
- Matches industry best practices
- Makes component reusability explicit
- Easier onboarding for new developers

**Structure:**

```
src/
├── components/
│   ├── atoms/           # Basic building blocks (Button, Input, Icon)
│   ├── molecules/       # Simple combinations (SearchField, FormField)
│   ├── organisms/       # Complex UI sections (Header, ScannerCard)
│   ├── templates/       # Page layouts (DashboardTemplate)
│   └── pages/           # Specific page implementations (if needed outside app/)
├── lib/
│   └── design/          # Design utilities, constants, helpers
└── types/
    └── design.ts        # Design token TypeScript types
```

**Import Pattern:**

```typescript
// Explicit atomic imports
import { Button } from '@/components/atoms/Button';
import { SearchField } from '@/components/molecules/SearchField';
import { Header } from '@/components/organisms/Header';
```

### Decision 3: Design Token Configuration

**Choice:** Centralize all design tokens in `tailwind.config.ts` with TypeScript types exported from `lib/design/tokens.ts`

**Rationale:**

- Single source of truth for all design values
- Type-safe token references in code
- Easy to update entire theme from one file
- Compile-time validation prevents invalid token usage

**Token Categories:**

- **Colors:** Primary palette (#8100D1, #B500B2, #FF52A0, #FFA47F) + semantic colors (success, error, warning, info)
- **Spacing:** Consistent scale (4px base unit)
- **Typography:** Font families, sizes, weights, line heights
- **Shadows:** Elevation system (sm, md, lg, xl)
- **Borders:** Radius values (none, sm, md, lg, full)
- **Breakpoints:** Responsive design breakpoints (already in Tailwind defaults)

**Token Export for JS/TS:**

```typescript
// lib/design/tokens.ts
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '../../../tailwind.config';

export const tokens = resolveConfig(tailwindConfig).theme;
export type DesignTokens = typeof tokens;
```

### Decision 4: Enforcement Strategy

**Choice:** Use ESLint rules + TypeScript to prevent hardcoded values

**Rationale:**

- Automated enforcement in CI/CD
- Catches violations during development
- No manual code review needed
- Clear error messages guide developers to correct approach

**Implementation:**

- ESLint plugin to detect hardcoded color/spacing values in className strings
- TypeScript strict mode to prevent `any` types
- Pre-commit hooks to run linting
- Storybook or documentation showing approved token usage (future)

**Disallowed Patterns:**

```typescript
// ❌ Hardcoded values
<div style={{ color: '#FF0000' }} />
<div className="w-[23px]" /> // Arbitrary values

// ✅ Token-based
<div className="text-primary bg-secondary" />
<div className="w-16 space-y-4" />
```

### Decision 5: Component Template Pattern

**Choice:** Provide component templates with proper TypeScript, Client/Server directives, and token usage

**Rationale:**

- Consistency across all new components
- Reduces boilerplate
- Enforces Next.js 16 best practices (Server Components default)
- Makes token usage the default path

**Template Example:**

```typescript
// components/atoms/Button/Button.tsx
import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'font-semibold rounded-md transition-colors',
          {
            'bg-primary hover:bg-primary-hover text-white': variant === 'primary',
            'bg-secondary hover:bg-secondary/90 text-white': variant === 'secondary',
          },
          {
            'px-3 py-1.5 text-sm': size === 'sm',
            'px-4 py-2 text-base': size === 'md',
            'px-6 py-3 text-lg': size === 'lg',
          },
          className
        )}
        {...props}
      />
    )
  }
)
```

### Decision 6: Migration Strategy

**Choice:** Gradual migration of existing components, new components use design system from day one

**Rationale:**

- Minimizes risk during transition
- Allows iterative improvements
- New features get benefits immediately
- Existing features continue working

**Migration Order:**

1. Set up Tailwind config with design tokens
2. Create atomic folder structure
3. Build atom components (Button, Input, Icon, etc.)
4. Build molecules using atoms
5. Migrate critical paths (face scanner UI, admin dashboard)
6. Migrate remaining components as needed

## Risks / Trade-offs

**[Risk] Tailwind bundle size impact**  
→ **Mitigation:** Tailwind uses PurgeCSS to remove unused utilities. Configure content paths properly in tailwind.config.ts. Monitor bundle size with Next.js build analyzer.

**[Risk] Learning curve for developers unfamiliar with Tailwind**  
→ **Mitigation:** Provide component templates, document common patterns, leverage Tailwind's excellent documentation. Atomic structure means most developers work with pre-built components.

**[Risk] Over-reliance on utility classes leading to unreadable className strings**  
→ **Mitigation:** Extract complex combinations into component variants (see Button template). Use `cn()` utility for conditional classes. Create organisms/molecules for repeated patterns.

**[Risk] Breaking existing UI during migration**  
→ **Mitigation:** Gradual migration strategy. No forced timeline. Visual regression testing (future). Each migration is isolated to specific components.

**[Risk] Arbitrary Tailwind values defeating design token enforcement**  
→ **Mitigation:** ESLint rule to flag arbitrary values (`[value]` syntax). Code review checks. Education on proper token usage.

**[Trade-off] Tailwind requires build-time compilation**  
→ **Impact:** Minimal. Next.js already has build step. Development server HMR works seamlessly with Tailwind.

**[Trade-off] Atomic structure creates more files**  
→ **Impact:** Acceptable. Better organization and discoverability. Modern editors handle tree navigation well. Clear separation of concerns.

**[Trade-off] Limited to Tailwind's design token capabilities**  
→ **Impact:** Low. Tailwind's theme system covers 95% of needs. Can extend with plugins if needed. CSS variables can supplement for edge cases.
