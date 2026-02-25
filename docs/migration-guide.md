# Design System Migration Guide

This guide helps you migrate existing code to use the new design system components and tokens.

## 🎯 Quick Migration Checklist

- [ ] Replace hardcoded colors with design tokens
- [ ] Replace native HTML elements with design system components
- [ ] Update button styling to use Button component
- [ ] Convert form inputs to FormField or Input components
- [ ] Replace custom cards with Card component
- [ ] Update badge/status indicators to use Badge component
- [ ] Migrate icons to lucide-react via Icon component
- [ ] Import from central `@/components` export

---

## 🔄 Common Migrations

### Buttons

**Before:**

```tsx
<button className="bg-[#8100D1] text-white px-6 py-3 rounded-lg hover:bg-[#6A00B0]">
  Click Me
</button>
```

**After:**

```tsx
import { Button } from '@/components';

<Button variant="primary">Click Me</Button>;
```

---

### Form Inputs

**Before:**

```tsx
<div>
  <label className="text-sm font-medium text-gray-700">
    Email <span className="text-red-500">*</span>
  </label>
  <input
    type="email"
    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#8100D1]"
  />
  {error && <p className="text-sm text-red-500">{error}</p>}
</div>
```

**After:**

```tsx
import { FormField } from '@/components';

<FormField label="Email" type="email" required error={error} />;
```

---

### Cards

**Before:**

```tsx
<div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
  <h3>Title</h3>
  <p>Content</p>
</div>
```

**After:**

```tsx
import { Card } from '@/components';

<Card padding="lg" hover>
  <h3>Title</h3>
  <p>Content</p>
</Card>;
```

---

### Badges

**Before:**

```tsx
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
  Active
</span>
```

**After:**

```tsx
import { Badge } from '@/components';

<Badge variant="success">Active</Badge>;
```

---

### Icons

**Before:**

```tsx
// Using various icon libraries inconsistently
import { FaUser } from 'react-icons/fa'
import SearchIcon from '../icons/search.svg'

<FaUser size={24} color="#8100D1" />
<SearchIcon width={20} height={20} />
```

**After:**

```tsx
import { Icon } from '@/components'
import { User, Search } from 'lucide-react'

<Icon icon={User} size="lg" className="text-primary" />
<Icon icon={Search} size="md" />
```

---

### Search Fields

**Before:**

```tsx
<div className="relative">
  <input
    type="text"
    placeholder="Search..."
    className="w-full pl-10 pr-10 py-2 border rounded-lg"
    value={search}
    onChange={(e) => setSearch(e.target.value)}
  />
  <SearchIcon className="absolute left-3 top-3 text-gray-400" />
  {search && (
    <button
      onClick={() => setSearch('')}
      className="absolute right-3 top-3 text-gray-400"
    >
      <XIcon />
    </button>
  )}
</div>
```

**After:**

```tsx
import { SearchField } from '@/components';

<SearchField
  placeholder="Search..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  onClear={() => setSearch('')}
/>;
```

---

### Dashboard Stats

**Before:**

```tsx
<div className="bg-white rounded-lg shadow p-6 border">
  <div className="flex justify-between items-start">
    <div>
      <p className="text-sm text-gray-600">Total Users</p>
      <p className="text-3xl font-bold mt-2">1,234</p>
      <div className="flex items-center mt-2 text-green-500">
        <TrendingUp size={16} />
        <span className="text-sm ml-1">+12%</span>
      </div>
    </div>
    <div className="bg-blue-100 p-3 rounded-lg">
      <Users className="text-blue-600" size={24} />
    </div>
  </div>
</div>
```

**After:**

```tsx
import { StatCard } from '@/components';
import { Users } from 'lucide-react';

<StatCard
  title="Total Users"
  value={1234}
  icon={Users}
  trend={{
    value: '+12%',
    direction: 'up',
    positive: true,
  }}
/>;
```

---

## 🎨 Color Token Migration

### Hardcoded Colors → Tailwind Classes

Replace all instances of hardcoded colors with Tailwind classes:

| Old (Hardcoded) | New (Token)        | Usage                |
| --------------- | ------------------ | -------------------- |
| `#8100D1`       | `bg-primary`       | Primary background   |
| `#6A00B0`       | `bg-primary-hover` | Primary hover state  |
| `#B500B2`       | `bg-secondary`     | Secondary background |
| `#FF52A0`       | `bg-accent`        | Accent background    |
| `#FFA47F`       | `bg-highlight`     | Highlight background |
| `#10B981`       | `bg-success`       | Success state        |
| `#EF4444`       | `bg-error`         | Error state          |
| `#F59E0B`       | `bg-warning`       | Warning state        |
| `#3B82F6`       | `bg-info`          | Info state           |

### Text Colors

Add `text-` prefix:

```tsx
// Before
<p style={{ color: '#8100D1' }}>Text</p>

// After
<p className="text-primary">Text</p>
```

### Border Colors

Add `border-` prefix:

```tsx
// Before
<div style={{ borderColor: '#8100D1' }}>Content</div>

// After
<div className="border border-primary">Content</div>
```

---

## 🔍 Finding Hardcoded Values

### Search for Hardcoded Hex Colors

```bash
# Find all hex color values in TypeScript/TSX files
grep -r "#[0-9A-Fa-f]\{6\}" src/ --include="*.tsx" --include="*.ts"

# Find RGB/RGBA values
grep -r "rgb\|rgba" src/ --include="*.tsx" --include="*.ts"
```

### Search for Inline Styles

```bash
# Find style props
grep -r "style={{" src/ --include="*.tsx"
```

### Search for Arbitrary Tailwind Values

```bash
# Find arbitrary values like w-[23px]
grep -r "\[.*px\]" src/ --include="*.tsx"
```

---

## 📝 Component Replacement Patterns

### Pattern 1: Simple Replacement

For basic HTML elements, directly replace with design system components:

```tsx
// Before
<button>Click</button>;

// After
import { Button } from '@/components';
<Button>Click</Button>;
```

### Pattern 2: Props Mapping

Map existing props to design system props:

```tsx
// Before
<button
  className={size === 'large' ? 'px-6 py-3' : 'px-4 py-2'}
  disabled={loading}
  onClick={handleClick}
>
  {label}
</button>;

// After
import { Button } from '@/components';
<Button
  size={size === 'large' ? 'lg' : 'md'}
  disabled={loading}
  onClick={handleClick}
>
  {label}
</Button>;
```

### Pattern 3: Composite Components

Replace complex custom components with molecules:

```tsx
// Before: Custom FormInput component
<FormInput
  label="Email"
  value={email}
  onChange={setEmail}
  error={errors.email}
  required
/>;

// After: Use FormField molecule
import { FormField } from '@/components';
<FormField
  label="Email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={errors.email}
  required
/>;
```

---

## 🧪 Testing After Migration

### Visual Verification

1. **Run the showcase page**: `pnpm run dev` → `/showcase`
2. **Compare old vs new**: Take screenshots before/after
3. **Check responsive design**: Test all breakpoints
4. **Verify interactions**: Click, hover, focus states

### Functionality Testing

1. **Forms**: Submit, validate, error handling
2. **Buttons**: Click events, disabled states
3. **Search**: Typing, clearing, filtering
4. **Cards**: Hover effects, click handlers

### Accessibility Testing

1. **Keyboard navigation**: Tab through all interactive elements
2. **Screen reader**: Use NVDA or VoiceOver
3. **Color contrast**: Check WCAG compliance
4. **ARIA attributes**: Verify with browser dev tools

---

## ⚡ Quick Wins

Start with these low-hanging fruits:

1. **Replace all `<button>` tags** with `<Button>` component
2. **Find/replace hex colors** with Tailwind classes
3. **Convert form inputs** to `<FormField>` molecules
4. **Update status badges** to use `<Badge>` component
5. **Standardize icons** with lucide-react via `<Icon>`

---

## 🚨 Common Pitfalls

### ❌ Don't Do This

```tsx
// Mixing design tokens with hardcoded values
<Button className="bg-[#8100D1]">Click</Button>

// Using arbitrary values when tokens exist
<div className="shadow-[0_4px_6px_rgba(0,0,0,0.1)]">Content</div>

// Skipping accessibility attributes
<Button onClick={handleClick} /> // No aria-label for icon-only

// Importing components individually
import { Button } from '@/components/atoms/Button'
```

### ✅ Do This Instead

```tsx
// Use design tokens
<Button variant="primary">Click</Button>

// Use token-based shadows
<div className="shadow-md">Content</div>

// Include accessibility
<Button onClick={handleClick} aria-label="Save changes">
  <Icon icon={Save} />
</Button>

// Use central export
import { Button } from '@/components'
```

---

## 🔄 Migration Priority Order

1. **Phase 1: Foundation** (Week 1)
   - Import design system dependencies
   - Update global styles
   - Configure TypeScript paths

2. **Phase 2: Atoms** (Week 2)
   - Replace buttons
   - Replace inputs
   - Replace basic text elements

3. **Phase 3: Molecules** (Week 3)
   - Convert form fields
   - Update search components
   - Migrate card components

4. **Phase 4: Complex Components** (Week 4)
   - Dashboard stats
   - Navigation components
   - Data tables

5. **Phase 5: Polish** (Week 5)
   - Remove old styles
   - Clean up unused code
   - Documentation updates
   - Testing & QA

---

## 📞 Need Help?

- **Documentation**: See `docs/design-system.md`
- **Examples**: Check `/showcase` page
- **Component API**: See `src/components/README.md`
- **Issues**: Check TypeScript errors in IDE

---

## ✅ Migration Checklist Template

Copy this for each file you migrate:

```markdown
## File: [filename]

- [ ] Replaced hardcoded colors
- [ ] Updated button elements
- [ ] Converted form inputs
- [ ] Migrated icons
- [ ] Updated card components
- [ ] Removed inline styles
- [ ] Added TypeScript types
- [ ] Tested functionality
- [ ] Verified accessibility
- [ ] Updated imports
```

---

**Happy Migrating! 🚀**
