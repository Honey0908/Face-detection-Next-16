# Design System Documentation

## Overview

This design system provides a comprehensive set of reusable components, design tokens, and patterns for the Smart Office Lunch Tracking System. It follows the **Atomic Design** methodology and uses **Tailwind CSS** for styling.

### Principles

1. **Token-Based Design**: All colors, spacing, shadows, and other design properties are defined as tokens
2. **No Hardcoded Values**: Never use custom colors or magic numbers directly in component code
3. **Atomic Structure**: Components are organized from simple (atoms) to complex (organisms)
4. **Accessibility First**: All components include proper ARIA attributes and keyboard navigation
5. **Type Safety**: Full TypeScript support with comprehensive prop interfaces

---

## Color Palette

### Primary Colors

```css
Primary (#8100D1):    /* Main brand color */
  - DEFAULT: #8100D1
  - hover: #6A00B0

Secondary (#B500B2):  /* Secondary brand color */
  - DEFAULT: #B500B2
  - hover: #950092

Accent (#FF52A0):     /* Accent highlights */
  - DEFAULT: #FF52A0
  - hover: #E63B8A

Highlight (#FFA47F):  /* Highlight color */
  - DEFAULT: #FFA47F
  - hover: #FF8B5C
```

### Semantic Colors

```css
Success (Green):
  - light: #D1FAE5
  - DEFAULT: #10B981
  - dark: #047857

Error (Red):
  - light: #FEE2E2
  - DEFAULT: #EF4444
  - dark: #B91C1C

Warning (Orange):
  - light: #FEF3C7
  - DEFAULT: #F59E0B
  - dark: #B45309

Info (Blue):
  - light: #DBEAFE
  - DEFAULT: #3B82F6
  - dark: #1E40AF
```

### Usage Guidelines

- Use **primary** for main actions (primary buttons, links)
- Use **secondary** for supporting actions
- Use **accent** for attention-grabbing elements (badges, highlights)
- Use **highlight** for secondary highlights
- Use **semantic colors** for status indicators (success, error, warning, info)

---

## Component Library

### Atoms

Atoms are the smallest building blocks of the design system.

#### Button

```tsx
import { Button } from '@/components/atoms/Button'

// Variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="accent">Accent</Button>
<Button variant="highlight">Highlight</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// States
<Button disabled>Disabled</Button>
```

**Props:**

- `variant`: 'primary' | 'secondary' | 'accent' | 'highlight' | 'outline' | 'ghost' | 'link'
- `size`: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
- All native button HTML attributes

---

#### Input

```tsx
import { Input } from '@/components/atoms/Input'

// Basic usage
<Input type="text" placeholder="Enter text..." />

// With error state
<Input error placeholder="Invalid input" />

// Sizes
<Input size="sm" />
<Input size="md" />
<Input size="lg" />

// Disabled
<Input disabled />
```

**Props:**

- `size`: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
- `error`: boolean
- All native input HTML attributes

---

#### Label

```tsx
import { Label } from '@/components/atoms/Label'

<Label htmlFor="email">Email Address</Label>
<Label htmlFor="password" required>Password</Label>
```

**Props:**

- `required`: boolean (shows red asterisk)
- All native label HTML attributes

---

#### Badge

```tsx
import { Badge } from '@/components/atoms/Badge'

// Semantic variants
<Badge variant="success">Active</Badge>
<Badge variant="error">Error</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="info">Info</Badge>
<Badge variant="neutral">Neutral</Badge>

// Sizes
<Badge size="sm">Small</Badge>
<Badge size="md">Medium</Badge>
<Badge size="lg">Large</Badge>
```

**Props:**

- `variant`: 'success' | 'error' | 'warning' | 'info' | 'neutral'
- `size`: 'xs' | 'sm' | 'md' | 'lg' | 'xl'

---

#### Icon

```tsx
import { Icon } from '@/components/atoms/Icon'
import { Check, X, User } from 'lucide-react'

<Icon icon={Check} size="md" />
<Icon icon={User} size="lg" className="text-primary" />
```

**Props:**

- `icon`: LucideIcon (from lucide-react)
- `size`: 'xs' | 'sm' | 'md' | 'lg' | 'xl'

**Available Icons:** See [Lucide Icons](https://lucide.dev/icons/) for full library

---

#### Avatar

```tsx
import { Avatar } from '@/components/atoms/Avatar'

// With image
<Avatar src="/user.jpg" alt="John Doe" size="md" />

// With initials fallback
<Avatar initials="JD" size="lg" />

// Sizes
<Avatar initials="AB" size="xs" />
<Avatar initials="CD" size="sm" />
<Avatar initials="EF" size="md" />
<Avatar initials="GH" size="lg" />
<Avatar initials="IJ" size="xl" />
```

**Props:**

- `size`: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
- `initials`: string (shown when no image)
- All native img HTML attributes

---

#### Card

```tsx
import { Card } from '@/components/atoms/Card'

// Basic card
<Card>Content here</Card>

// With padding variants
<Card padding="none">No padding</Card>
<Card padding="sm">Small padding</Card>
<Card padding="md">Medium padding</Card>
<Card padding="lg">Large padding</Card>

// Hoverable card
<Card hover>
  <p>Hover for shadow effect</p>
</Card>
```

**Props:**

- `padding`: 'none' | 'sm' | 'md' | 'lg'
- `hover`: boolean (adds hover shadow effect)

---

### Molecules

Molecules are combinations of atoms that function together as a unit.

#### FormField

```tsx
import { FormField } from '@/components/molecules/FormField'

// Basic form field
<FormField
  label="Email"
  type="email"
  placeholder="john@example.com"
/>

// With required indicator
<FormField
  label="Password"
  type="password"
  required
/>

// With error message
<FormField
  label="Username"
  type="text"
  error="Username is already taken"
/>

// With helper text
<FormField
  label="Bio"
  type="text"
  helperText="Max 160 characters"
/>
```

**Props:**

- `label`: string (required)
- `error`: string (error message)
- `helperText`: string (helper text)
- `required`: boolean
- `size`: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
- All native input HTML attributes

---

#### SearchField

```tsx
import { SearchField } from '@/components/molecules/SearchField';
import { useState } from 'react';

function MyComponent() {
  const [search, setSearch] = useState('');

  return (
    <SearchField
      placeholder="Search employees..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      onClear={() => setSearch('')}
    />
  );
}
```

**Props:**

- `size`: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
- `onClear`: () => void (clear button handler)
- All native input HTML attributes (except `type`, which is always 'text')

---

#### StatCard

```tsx
import { StatCard } from '@/components/molecules/StatCard'
import { Users, TrendingUp } from 'lucide-react'

// Basic stat card
<StatCard
  title="Total Scans Today"
  value={234}
/>

// With icon
<StatCard
  title="Total Employees"
  value="456"
  icon={Users}
/>

// With trend indicator
<StatCard
  title="Monthly Scans"
  value={4560}
  icon={Users}
  trend={{
    value: '+12%',
    direction: 'up',
    positive: true
  }}
/>

// With description
<StatCard
  title="Average Daily Scans"
  value={234}
  description="Based on last 30 days"
/>
```

**Props:**

- `title`: string (required)
- `value`: string | number (required)
- `icon`: LucideIcon (optional)
- `trend`: { value: string, direction: 'up' | 'down', positive?: boolean } (optional)
- `description`: string (optional)

---

## Design Tokens

### Accessing Tokens in TypeScript

```tsx
import { tokens } from '@/lib/design/tokens';

// Access theme values
const primaryColor = tokens.theme.colors.primary;
const largeShadow = tokens.theme.boxShadow.lg;
```

### Using the `cn()` Utility

The `cn()` utility combines class names and handles conditional classes efficiently.

```tsx
import { cn } from '@/lib/utils';

function MyComponent({ active, size }) {
  return (
    <div
      className={cn(
        // Base classes
        'rounded-lg bg-white',

        // Conditional classes
        active && 'ring-2 ring-primary',

        // Size variants
        {
          'p-2 text-sm': size === 'sm',
          'p-4 text-base': size === 'md',
          'p-6 text-lg': size === 'lg',
        },
      )}
    >
      Content
    </div>
  );
}
```

---

## Component Template

Use this template when creating new components:

```tsx
import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface MyComponentProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * MyComponent description
 *
 * @example
 * <MyComponent variant="primary" size="md">
 *   Content
 * </MyComponent>
 */
export const MyComponent = forwardRef<HTMLDivElement, MyComponentProps>(
  (
    { variant = 'primary', size = 'md', className, children, ...props },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          'rounded-lg',

          // Variants
          {
            'bg-primary text-white': variant === 'primary',
            'bg-secondary text-white': variant === 'secondary',
          },

          // Sizes
          {
            'p-2 text-sm': size === 'sm',
            'p-4 text-base': size === 'md',
            'p-6 text-lg': size === 'lg',
          },

          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

MyComponent.displayName = 'MyComponent';
```

---

## Common Patterns

### Form with Validation

```tsx
'use client';

import { FormField } from '@/components/molecules/FormField';
import { Button } from '@/components/atoms/Button';
import { useState } from 'react';

export default function RegistrationForm() {
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validation logic
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField
        label="Employee ID"
        name="employeeId"
        required
        error={errors.employeeId}
      />

      <FormField label="Full Name" name="name" required error={errors.name} />

      <FormField label="Email" type="email" name="email" error={errors.email} />

      <Button type="submit" variant="primary" className="w-full">
        Register Employee
      </Button>
    </form>
  );
}
```

### Dashboard Stats Grid

```tsx
import { StatCard } from '@/components/molecules/StatCard';
import { Users, Utensils, TrendingUp, Calendar } from 'lucide-react';

export default function DashboardStats({ stats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Today's Scans"
        value={stats.todayCount}
        icon={Utensils}
        trend={{
          value: '+5%',
          direction: 'up',
          positive: true,
        }}
      />

      <StatCard
        title="Total Employees"
        value={stats.totalEmployees}
        icon={Users}
      />

      <StatCard title="This Month" value={stats.monthCount} icon={Calendar} />

      <StatCard
        title="Scan Rate"
        value={`${stats.scanRate}%`}
        icon={TrendingUp}
        description="Participation rate"
      />
    </div>
  );
}
```

### Searchable List

```tsx
'use client';

import { SearchField } from '@/components/molecules/SearchField';
import { Card } from '@/components/atoms/Card';
import { Avatar } from '@/components/atoms/Avatar';
import { Badge } from '@/components/atoms/Badge';
import { useState } from 'react';

export default function EmployeeList({ employees }) {
  const [search, setSearch] = useState('');

  const filtered = employees.filter((emp) =>
    emp.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <SearchField
        placeholder="Search employees..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onClear={() => setSearch('')}
      />

      <div className="space-y-2">
        {filtered.map((emp) => (
          <Card key={emp.id} hover padding="md">
            <div className="flex items-center gap-3">
              <Avatar src={emp.avatar} initials={emp.initials} size="md" />
              <div className="flex-1">
                <p className="font-medium">{emp.name}</p>
                <p className="text-sm text-gray-500">{emp.department}</p>
              </div>
              <Badge variant={emp.scannedToday ? 'success' : 'neutral'}>
                {emp.scannedToday ? 'Scanned' : 'Pending'}
              </Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

---

## Best Practices

### DO ✅

- Use design tokens for all styling values
- Use the `cn()` utility for conditional classes
- Include proper TypeScript types for all props
- Add JSDoc comments to components
- Use `forwardRef` for components that accept refs
- Add `displayName` to all components
- Include ARIA attributes for accessibility
- Test components with keyboard navigation

### DON'T ❌

- Hardcode color values in components
- Use inline styles (use Tailwind classes)
- Skip accessibility attributes
- Use `any` type in TypeScript
- Forget to handle error states
- Skip responsive design considerations
- Ignore focus states for interactive elements

---

## Enforcement

The design system includes automated enforcement to maintain consistency and prevent anti-patterns.

### ESLint Rules

Design system ESLint rules are defined in `.eslintrc.design-system.js`. These rules help enforce:

#### Prevent Hardcoded Colors

```javascript
// ❌ Bad
<div className="bg-[#8100D1]">...</div>
<p style={{ color: '#10B981' }}>...</p>

// ✅ Good
<div className="bg-primary">...</div>
<p className="text-success">...</p>
```

**Detection:**

- ESLint warns about hex color values in className
- ESLint warns about inline style objects with color properties
- Tailwind's built-in warnings for arbitrary values

#### Prevent Inline Styles

```javascript
// ❌ Bad
<Button style={{ backgroundColor: 'blue' }}>Click</Button>

// ✅ Good
<Button className="bg-primary">Click</Button>
```

**Rule:** `react/forbid-dom-props` prevents `style` prop usage

#### Enforce Component Patterns

**Display Names:**
All components must have `displayName` set for debugging:

```typescript
MyComponent.displayName = 'MyComponent';
```

**Accessibility:**

- `jsx-a11y/aria-props`: Ensures valid ARIA attributes
- `jsx-a11y/aria-role`: Ensures valid ARIA roles
- `jsx-a11y/alt-text`: Requires alt text on images

### Pre-Commit Hooks

To automatically enforce rules before committing code, set up Husky hooks:

#### Installation

```bash
pnpm add -D husky lint-staged
npx husky install
```

#### Configure in package.json

```json
{
  "lint-staged": {
    "src/components/**/*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{css,scss}": ["prettier --write"]
  }
}
```

#### Create pre-commit hook

```bash
npx husky add .husky/pre-commit "npx lint-staged"
```

Now Eslint and Prettier will run automatically on staged component files before each commit.

### Manual Verification

Run these commands before committing:

```bash
# Check for hardcoded colors (grep search)
grep -r "#[0-9A-Fa-f]\{6\}" src/components --include="*.tsx"

# Check for arbitrary Tailwind values
grep -r "\[.*px\]" src/components --include="*.tsx"

# Run TypeScript compiler
pnpm tsc --noEmit

# Run ESLint
pnpm eslint src/components

# Run Prettier
pnpm prettier --check src/components
```

### Continuous Integration

Add these checks to your CI pipeline (e.g., GitHub Actions):

```yaml
- name: Lint Components
  run: pnpm eslint src/components

- name: Type Check
  run: pnpm tsc --noEmit

- name: Check Formatting
  run: pnpm prettier --check .
```

---

## Maintenance

### Adding New Colors

1. Update `tailwind.config.ts` in `theme.extend.colors`
2. Add CSS variable to `src/app/globals.css`
3. Document the new color in this file

### Creating New Components

1. Follow the component template structure
2. Place in appropriate atomic level (atoms/molecules/organisms)
3. Export from `index.ts` in component folder
4. Add documentation to this file
5. Include usage examples

### Updating Existing Components

1. Maintain backward compatibility
2. Update TypeScript types if props change
3. Update documentation
4. Test in multiple contexts before deploying

---

## Resources

- **Tailwind CSS Documentation**: https://tailwindcss.com/docs
- **Lucide Icons**: https://lucide.dev/icons/
- **Atomic Design Methodology**: https://bradfrost.com/blog/post/atomic-web-design/
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/

---

**Last Updated**: February 2026
**Version**: 1.0.0
