# Design System

A comprehensive design system for the Smart Office Lunch Tracking System built with Tailwind CSS and Next.js 16.

## 🎨 Quick Start

### View the Showcase

Visit `/showcase` to see all components in action:

```bash
pnpm run dev
# Navigate to http://localhost:3000/showcase
```

### Using Components

```tsx
import { Button, FormField, StatCard } from '@/components';

export default function MyPage() {
  return (
    <div>
      <Button variant="primary">Click Me</Button>
      <FormField label="Email" type="email" required />
    </div>
  );
}
```

## 📚 Documentation

Full documentation is available in [docs/design-system.md](../docs/design-system.md)

## 🎯 Key Features

- **Token-Based Design**: All colors, spacing, and shadows defined as reusable tokens
- **TypeScript First**: Full type safety with comprehensive interfaces
- **Atomic Structure**: Organized from atoms → molecules → organisms
- **No Hardcoded Values**: Design tokens prevent inconsistent styling
- **Accessibility**: ARIA attributes and keyboard navigation built in
- **Tailwind CSS v4**: Latest Tailwind with custom theme configuration

## 🏗️ Component Structure

```
src/components/
├── atoms/           # Basic building blocks
│   ├── Button/
│   ├── Input/
│   ├── Label/
│   ├── Badge/
│   ├── Icon/
│   ├── Avatar/
│   └── Card/
├── molecules/       # Combinations of atoms
│   ├── FormField/   # Label + Input + Error
│   ├── SearchField/ # Input + Icon + Clear
│   └── StatCard/    # Card + Stats + Trend
└── index.ts         # Central export
```

## 🎨 Color Palette

| Color     | Hex       | Usage                        |
| --------- | --------- | ---------------------------- |
| Primary   | `#8100D1` | Main actions, brand elements |
| Secondary | `#B500B2` | Supporting actions           |
| Accent    | `#FF52A0` | Highlights, attention        |
| Highlight | `#FFA47F` | Secondary highlights         |
| Success   | `#10B981` | Success states               |
| Error     | `#EF4444` | Error states                 |
| Warning   | `#F59E0B` | Warning states               |
| Info      | `#3B82F6` | Informational states         |

## 🧩 Available Components

### Atoms

- **Button**: 7 variants × 3 sizes
- **Input**: 3 sizes + error states
- **Label**: Required indicator support
- **Badge**: 5 semantic variants + 3 sizes
- **Icon**: lucide-react integration
- **Avatar**: Image + initials fallback
- **Card**: Padding variants + hover effects

### Molecules

- **FormField**: Complete form input with label and error
- **SearchField**: Search input with clear button
- **StatCard**: Dashboard statistics display

## 🔧 Utilities

### cn() Helper

Combines class names with smart merging:

```tsx
import { cn } from '@/lib/utils';

<div
  className={cn(
    'base-class',
    isActive && 'active-class',
    className, // User-provided classes override
  )}
/>;
```

### Design Tokens

Access theme values in TypeScript:

```tsx
import { tokens } from '@/lib/design/tokens';

const primaryColor = tokens.theme.colors.primary;
```

## 📖 Examples

### Form Example

```tsx
import { FormField, Button } from '@/components';

function LoginForm() {
  return (
    <form className="space-y-4">
      <FormField label="Email" type="email" required />
      <FormField label="Password" type="password" required />
      <Button variant="primary" className="w-full">
        Sign In
      </Button>
    </form>
  );
}
```

### Dashboard Stats

```tsx
import { StatCard } from '@/components';
import { Users, Utensils } from 'lucide-react';

function Dashboard() {
  return (
    <div className="grid grid-cols-3 gap-4">
      <StatCard
        title="Today's Scans"
        value={234}
        icon={Utensils}
        trend={{ value: '+12%', direction: 'up', positive: true }}
      />
      <StatCard title="Total Employees" value={456} icon={Users} />
    </div>
  );
}
```

## 🚫 Rules

### DO ✅

- Use design tokens for all styling
- Import from `@/components` (central export)
- Follow atomic design hierarchy
- Include TypeScript types
- Use `cn()` for conditional classes

### DON'T ❌

- Hardcode color values (`#8100D1` directly)
- Skip ARIA attributes
- Use arbitrary Tailwind values unnecessarily
- Ignore responsive design
- Forget error states

## 🔍 Configuration Files

- **tailwind.config.ts**: Theme tokens definition
- **src/app/globals.css**: CSS variables + Tailwind imports
- **src/lib/design/tokens.ts**: TypeScript token access
- **src/types/design.ts**: Design system types

## 📦 Dependencies

- `tailwindcss`: v4.0.0 (CSS framework)
- `@tailwindcss/forms`: v0.5.11 (Form styling)
- `lucide-react`: v0.575.0 (Icon library)
- `clsx`: v2.1.1 (Class name utility)
- `tailwind-merge`: v3.5.0 (Smart class merging)

## 🚀 Extending

### Adding a New Color

1. Update `tailwind.config.ts`:

```ts
theme: {
  extend: {
    colors: {
      newColor: '#HEX',
    }
  }
}
```

2. Add CSS variable in `globals.css`:

```css
:root {
  --color-new: #HEX;
}
```

3. Document in `docs/design-system.md`

### Creating a New Component

1. Choose atomic level (atom/molecule/organism)
2. Create component directory
3. Use component template from docs
4. Export from `src/components/index.ts`
5. Add documentation + examples

## 📝 License

Part of the Smart Office Lunch Tracking System.

---

**Questions?** See [docs/design-system.md](../docs/design-system.md) for full documentation.
