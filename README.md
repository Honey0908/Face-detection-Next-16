This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Design System

This project includes a custom design system built with Tailwind CSS and follows atomic design principles.

### Components

- **Atoms**: Button, Input, Label, Badge, Icon, Avatar, Card
- **Molecules**: FormField, SearchField, StatCard

All components are TypeScript-first with full type safety and follow consistent design patterns.

### Usage

```tsx
import { Button, FormField, Badge } from '@/components';

function MyComponent() {
  return (
    <div>
      <Button variant="primary" size="lg">
        Click Me
      </Button>
      <FormField label="Email" type="email" required />
      <Badge variant="success">Active</Badge>
    </div>
  );
}
```

### Documentation

- **Design System Guide**: See [docs/design-system.md](docs/design-system.md) for comprehensive documentation
- **Component Template**: Use [docs/component-template.tsx](docs/component-template.tsx) when creating new components
- **Migration Guide**: See [docs/migration-guide.md](docs/migration-guide.md) for migrating existing code
- **Component Showcase**: Run the dev server and visit `/showcase` to see all components

### Design Tokens

All colors, spacing, and other design tokens are defined in `tailwind.config.ts` and can be accessed via Tailwind utilities:

```tsx
// ✅ Correct - using design tokens
<div className="bg-primary text-white p-md rounded-lg">

// ❌ Avoid - hardcoded values
<div className="bg-[#8100D1] text-white p-[16px] rounded-lg">
```

### Enforcement

ESLint rules are configured to enforce design system usage:

- No hardcoded color values (hex, rgb)
- No inline styles
- Required accessibility attributes

Run linting:

```bash
pnpm eslint 'src/**/*.{ts,tsx}'
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
